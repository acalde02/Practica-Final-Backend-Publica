const { IncomingWebhook } = require('@slack/webhook')
const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

const loggerStream = {
    write: message => {
        // Verificar si el mensaje contiene un código de estado >= 500
        const match = message.match(/HTTP\/\d\.\d"\s(5\d{2})/); // e.g., "HTTP/1.1" 500
        if (match) {
            webhook.send({ text: message });
        }
    }
}

module.exports = loggerStream