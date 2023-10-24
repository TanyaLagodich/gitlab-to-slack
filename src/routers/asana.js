const { Router } = require('express');
const crypto = require('crypto');
const AsanaApi = require("../api/asana");
const AsanaController = require('../controllers/asana');

const asanaRouter = Router();
const asanaController = new AsanaController();

asanaRouter.post('/asana-webhook', asanaController.handleWebhook)

module.exports = asanaRouter;
