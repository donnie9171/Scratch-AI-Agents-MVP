let MAX_TOKENS = 5000;
let REFILL_RATE = 10; // tokens per second

let tokenBucketTimeoutId = null;
window.currentTokenBucketInfo = null;

// Retrieve last estimated tokens from localStorage on startup
function getStoredTokenBucket() {
    if (!localStorage.getItem('tokenBucketEstimate')) {
        console.log('Initializing token bucket estimate in localStorage');
        storeTokenBucketEstimate({
            userId: 'unknown',
            tokensRemaining: MAX_TOKENS,
            lastRefill: Date.now(),
            maxTokens: MAX_TOKENS,
            refillRate: REFILL_RATE
        });
    }
    return JSON.parse(localStorage.getItem('tokenBucketEstimate'));
}

function storeTokenBucketEstimate(estimateObj) {
    try {
        localStorage.setItem('tokenBucketEstimate', JSON.stringify(estimateObj));
    } catch (e) {}
}

function updateTokenBucketBar(tokenBucket) {
    // On first call, sync from localStorage if available and newer
    const stored = getStoredTokenBucket();

    if (stored.maxTokens != MAX_TOKENS || stored.refillRate != REFILL_RATE) {
        tokenBucket = {
            userId: stored.userId || 'unknown',
            tokensRemaining: MAX_TOKENS,
            lastRefill: Date.now(),
            maxTokens: MAX_TOKENS,
            refillRate: REFILL_RATE
        };
    }

    if (stored && stored.lastRefill > tokenBucket.lastRefill) {
        tokenBucket = stored;
    }
    // Only update if this info is newer
    if (
        !window.currentTokenBucketInfo ||
        tokenBucket.lastRefill > window.currentTokenBucketInfo.lastRefill
    ) {
        window.currentTokenBucketInfo = tokenBucket;
    } else {
        return; // Ignore older updates
    }

    // Cancel previous animation
    if (tokenBucketTimeoutId) {
        clearTimeout(tokenBucketTimeoutId);
        tokenBucketTimeoutId = null;
    }

    const bar = document.getElementById('tokenBucketBar');
    if (!bar) return;
    const fill = bar.querySelector('.tokenBucketBar-fill');
    const text = bar.querySelector('.tokenBucketBar-text');
    if (!fill || !text) return;

    let tokens = tokenBucket.tokensRemaining;
    const maxTokens = tokenBucket.maxTokens;
    const refillRate = tokenBucket.refillRate;
    const lastRefill = tokenBucket.lastRefill;
    const tokensPerSecond = refillRate;

    function animateRefill() {
        const now = Date.now();
        const secondsSinceRefill = Math.floor((now - lastRefill) / 1000);
        let estimatedTokens = Math.min(
            maxTokens,
            tokens + secondsSinceRefill * tokensPerSecond
        );
        const percent = Math.max(0, Math.min(1, estimatedTokens / maxTokens));
        fill.style.width = (percent * 100) + '%';
        text.textContent = `Tokens: ${Math.floor(estimatedTokens)}/${maxTokens}`;
        // Store estimate in localStorage
        storeTokenBucketEstimate({
            userId: tokenBucket.userId,
            tokensRemaining: estimatedTokens,
            lastRefill,
            maxTokens,
            refillRate
        });
        if (estimatedTokens < maxTokens) {
            tokenBucketTimeoutId = setTimeout(animateRefill, 1000);
        }
    }

    animateRefill();
}

updateTokenBucketBar(getStoredTokenBucket());

window.updateTokenBucketBar = updateTokenBucketBar;
