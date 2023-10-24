require('dotenv').config();
const HttpApi = require('./httpApi');
const ASANA_API = 'https://app.asana.com/api/1.0/';

class AsanaApi extends HttpApi {
    constructor() {
        super({
            baseURL: ASANA_API,
            headers: {
                Authorization: `Bearer ${process.env.ASANA_ACCESS_TOKEN}`,
            },
        });
    }

    async enableWebhook() {
        await this.post({ endpoint: 'webhooks', data: {
            data: {
                filters: [
                    {
                        action: 'added',
                        resource_type: 'story',
                        resource_subtype: 'section_changed',
                    },
                    {
                        action: 'changed',
                        resource_type: 'story',
                        resource_subtype: 'section_changed',
                    }
                ],
                // TODO think how to get this gid by request
                resource: '1205772287381976',
                target: process.env.ASANA_TARGET,
            }
        }})
    }

    async getTaskByGid({ gid }) {
        const { data } =  await this.get({ endpoint: `tasks/${gid}` });
        return data.data;
    }
}

module.exports = new AsanaApi();
