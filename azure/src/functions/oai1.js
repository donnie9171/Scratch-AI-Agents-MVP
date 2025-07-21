const { app } = require('@azure/functions');
const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");

// Config
const TABLE_NAME = "TokenBuckets";
const MAX_TOKENS = 500; // e.g., 30,000 tokens per minute
const REFILL_RATE = 10; // tokens per second

// Helper: get user ID (customize as needed)
function getUserId(request) {
  // Use get() method for HeadersList
  return request.headers.get("x-api-key") || request.headers.get("x-forwarded-for") || "anonymous";
}

// Helper: refill bucket
function refillTokens(bucket) {
  const now = Date.now();
  const secondsPassed = Math.floor((now - bucket.lastRefill) / 1000);
  if (secondsPassed > 0) {
    // REFILL_RATE is now tokens per second
    bucket.tokens = Math.min(
      MAX_TOKENS,
      bucket.tokens + secondsPassed * REFILL_RATE
    );
    bucket.lastRefill = now;
  }
  return bucket;
}

app.http('oai1', {
methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        // Table client
        const connectionString = process.env.TABLE_STORAGE_CONNECTION_STRING;
        const tableClient = TableClient.fromConnectionString(connectionString, TABLE_NAME);

        // Identify user
        const userId = getUserId(request);

        // Fetch or create bucket
        let bucket;
        try {
        bucket = await tableClient.getEntity("TokenBucket", userId);
        } catch (e) {
        // Not found, create new
        bucket = {
            partitionKey: "TokenBucket",
            rowKey: userId,
            tokens: MAX_TOKENS,
            lastRefill: Date.now()
        };
        await tableClient.createEntity(bucket);
        }

        // Refill tokens
        bucket = refillTokens(bucket);

        context.log(`Current tokens for ${userId}: ${bucket.tokens}`);

        // Check bucket
        if (bucket.tokens < 0) {
        return { status: 429, body: 'Rate limit exceeded. Not enough tokens.' };
        }

        // Parse request
    let body;

    try {
      body = await request.json();
    } catch (e) {
      return { status: 400, body: 'Invalid JSON body.' };
    }
    const { endpoint, payload } = body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!endpoint || !payload) {
      return { status: 400, body: 'Missing endpoint or payload.' };
    }
    if (!apiKey) {
      return { status: 500, body: 'API key not configured.' };
    }

    // Proxy to OpenAI
    let response, result;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      result = await response.json();
    } catch (err) {
      context.log('OpenAI relay error:', err);
      return { status: 500, body: 'Error relaying to OpenAI API.' };
    }

    // Get tokens used (OpenAI returns usage in response)
    let tokensUsed = 0;
    if (result && result.usage && result.usage.total_tokens) {
      tokensUsed = result.usage.total_tokens;
    } else {
      tokensUsed = 100; // fallback estimate
    }


    // Check bucket
    if (bucket.tokens < tokensUsed) {
      return { status: 429, body: 'Rate limit exceeded. Not enough tokens.' };
    }
    bucket.tokens -= tokensUsed;

    // Save bucket
    await tableClient.updateEntity(bucket, "Replace");

    context.log('OpenAI response:', JSON.stringify(result, null, 2));
    return {
      status: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...result,
        tokenBucket: {
          userId,
          tokensRemaining: bucket.tokens,
          lastRefill: bucket.lastRefill,
          maxTokens: MAX_TOKENS,
          refillRate: REFILL_RATE
        }
      })
    };
    }
});
