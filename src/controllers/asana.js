const crypto = require('crypto');
const eventEmitter = require('../eventEmitter');
const AsanaApi = require('../api/asana');

class AsanaController {
    secret = '';

    constructor() {
        AsanaApi.enableWebhook();
    }

    handleWebhook(req, res) {
        if (req.headers['x-hook-secret']) {
            AsanaController.handleNewWebhook(req, res);
        } else if (req.headers['x-hook-signature']) {
            AsanaController.handleExistingWebhook(req, res)
        }
    }

    static handleNewWebhook(req, res) {
        this.secret = req.headers['x-hook-secret'];
        res.setHeader('X-Hook-Secret', req.headers['x-hook-secret']);
        res.sendStatus(200);
    }

    static async handleExistingWebhook(req, res) {
        const computedSignature = crypto
            .createHmac('SHA256', this.secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (!AsanaController._verifySignature(req.headers['x-hook-signature'], computedSignature)) {
            console.log('FAIL');
            // Fail
            res.sendStatus(401);
        } else {
            console.log('SUCCESS');
            // Success
            res.sendStatus(200);
            console.log(`Events on ${Date()}:`);
            console.log(req.body.events[0])
            if (req.body.events[0]) {
                const { parent } = req.body.events[0];
                const task = await AsanaApi.getTaskByGid({ gid: parent.gid });
                if (task.memberships[0].section.name === 'code review') {
                    console.log('here it works??')
                    eventEmitter.emit('asana-task-moved-to-code-review', task);
                }
            }
        }
    }

    static _verifySignature(requestSignature, computedSignature) {
        return crypto.timingSafeEqual(Buffer.from(requestSignature), Buffer.from(computedSignature));
    }

}

module.exports = AsanaController;
