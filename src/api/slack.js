require('dotenv').config();
const axios = require('axios');
const SLACK_API = 'https://slack.com/api/';

class SlackApi {
    constructor() {
        this.api = axios.create({
            baseURL: SLACK_API,
            headers: {
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
            },
        });
    }

    async getConversationList({ types }) {
        try {
            const { data } = await this.api.get('conversations.list', {
                params: {
                    types,
                }
            })
            return data.channels;
        } catch (err) {
            console.log(err);
        }
    }

    async getAllMessages({ channel }) {
        try {
            const { data } = await this.api.get('conversations.history', {
                params: {
                    channel,
                }
            })
            return data.messages;
        } catch (err) {
            console.log(err);
        }
    }

    async addReaction({ channel, name, timestamp }) {
        try {
            const data = await this.api.post('reactions.add', {
                channel, name, timestamp,
            });
        } catch (err) {
            console.log(err);
        }
    }

    async removeReaction({ channel, name, timestamp }) {
        try {
            await this.api.post('reactions.remove', {
                channel, name, timestamp,
            });
        } catch (err) {
            console.log(err);
        }
    }

    async addMessageToThread({ channel, thread_ts, text }) {
        try {
            await this.api.post('chat.postMessage', { channel, thread_ts, text });
        } catch (err) {
            console.log(err);
        }
    }

    async getMessageThread({ channel, ts }) {
        try {
            const { data } = await this.api.get('conversations.replies', {
                params: {
                    channel,
                    ts,
                },
            });
            return data.messages;
        } catch (err) {
            console.error(err);
        }
    }

    async removeMessage({ channel, ts }) {
        try {
            await this.api.post('chat.delete', {
                channel, ts,
            });
        } catch (err) {
            console.error(err);
        }
    }

}

module.exports = new SlackApi();
