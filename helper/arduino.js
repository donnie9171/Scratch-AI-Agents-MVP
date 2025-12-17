import { setupSerialConnection } from 'simple-web-serial';

const connection = setupSerialConnection({
    requestAccessOnPageLoad: true
});


window.connection = connection;