const { Router } = require('express');
const GitlabController = require('../controllers/gitlab');

const gitlabRouter = Router();
const gitlabController = new GitlabController();


gitlabRouter.post('/gitlab-webhook', gitlabController.handleWebhook);

module.exports = gitlabRouter;
