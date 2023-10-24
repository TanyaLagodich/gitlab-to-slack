const GITLAB_EVENTS = require("../constants/gitlab_events");
const eventEmitter = require('../eventEmitter');

class GitlabController {
    async handleWebhook(req, res) {
        if (req.body.event_type === GITLAB_EVENTS.MERGE_REQUEST) {
            const mrUrl = req.body.object_attributes.url;
            const action = req.body.object_attributes.action;

            if (action === 'unapproved') {
                eventEmitter.emit('gitlab-unapproved-mr', mrUrl);
            } else {
                eventEmitter.emit('gitlab-approved-mr', mrUrl);
            }
        }
        res.sendStatus(200);
    }
}

module.exports = GitlabController;
