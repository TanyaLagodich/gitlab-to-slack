const express = require('express');
const app = express();
const PORT = 80;
const axios = require('axios');

const ngrok = require('ngrok');

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/gitlab-webhook', (req, res) => {
    console.log('Received a webhook from GitLab:', req.body);
    // здесь вы можете добавить логику для обработки уведомления
    axios.post('https://hooks.slack.com/services/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', {
        text: 'Works!!!!',
    });
    res.sendStatus(200); // отправляем ответ GitLab, чтобы показать, что запрос был успешно обработан
});

app.listen(PORT, async () => {
    console.log(`Server is running at ${PORT}`);
});
