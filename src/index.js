const express = require('express');
const app = express();
const PORT = 80;
const asanaRouter = require('./routers/asana');
const gitlabRouter = require('./routers/gitlab');
const SlackController = require('./controllers/slack');

new SlackController();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('', asanaRouter);
app.use('', gitlabRouter);

app.listen(PORT, async () => {
    console.log(`Server is running at ${PORT}`);
});


// asana steps
// 1) post  to enable webhook
// https://app.asana.com/api/1.0/webhooks
// send data
// answer with correct headers
