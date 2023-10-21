require('dotenv').config();
const HttpApi = require('./httpApi');
const SLACK_API = 'https://slack.com/api/';

class SlackApi extends HttpApi {
    constructor() {
        super({
            baseURL: SLACK_API,
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        });
    }

    async getConversationList({ types }) {
        // TODO add error handler
        const { data } = await this.get({ endpoint: 'conversations.list', params: { types } });
        return data.channels;
    }

    async getAllMessages({ channel }) {
        const { data } = await this.get({ endpoint: 'conversations.history', params: { channel } });
        return data.messages;
    }

    async addReaction({ channel, name, timestamp }) {
        await this.post({ endpoint: 'reactions.add', data: { channel, name, timestamp }});
    }

    async removeReaction({ channel, name, timestamp }) {
        await this.post({ endpoint: 'reactions.remove', data: { channel, name, timestamp } });
    }

    async addMessageToThread({ channel, thread_ts, text }) {
        await this.post({ endpoint: 'chat.postMessage', data: { channel, thread_ts, text } });
    }

    async getMessageThread({ channel, ts }) {
        const { data } = await this.get({ endpoint: 'conversations.replies', params: { channel, ts } });
        return data.messages;
    }

    async removeMessage({ channel, ts }) {
        await this.post({ endpoint: 'chat.delete', data: { channel, ts } });
    }

}

module.exports = new SlackApi();
