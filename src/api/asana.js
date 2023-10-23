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

    async getTaskByGid({ gid }) {
        const { data } =  await this.get({ endpoint: `tasks/${gid}` });
        console.log('data', data);
        return data.data;
    }
}

module.exports = new AsanaApi();
