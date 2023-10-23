const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = 80;
const SlackApi = require('./api/slack');
const AsanaApi = require('./api/asana');

const GITLAB_EVENTS = require("./constants/GITLAB_EVENTS");

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


let secret = '';

// TODO work on this function, refactor it and refactor logic sending message in slack
app.post('/asana-webhook', async (req, res) => {
    console.log('webhook', req.body.events);
    if (req.headers["x-hook-secret"]) {
        console.log("This is a new webhook");
        secret = req.headers["x-hook-secret"];

        res.setHeader("X-Hook-Secret", secret);
        res.sendStatus(200);
    } else if (req.headers["x-hook-signature"]) {
        console.log('this is an existed webhook');
        const computedSignature = crypto
            .createHmac("SHA256", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        console.log({ computedSignature });
        if (
            !crypto.timingSafeEqual(
                Buffer.from(req.headers["x-hook-signature"]),
                Buffer.from(computedSignature)
            )
        ) {
            console.log('FAIL');
            // Fail
            res.sendStatus(401);
        } else {
            console.log('SUCCESS');
            // Success
            res.sendStatus(200);
            console.log(`Events on ${Date()}:`);
            console.log(req.body.events);
            if (req.body.events[0]) {
                const { parent } = req.body.events[0];
                const task = await AsanaApi.getTaskByGid({ gid: parent.gid });
                console.log('task', { task }, task.custom_fields[2].display_value);
                if (task.memberships[0].section.name === 'code review') {
                    await SlackApi.sendNewMessage({
                        channel: 'C0623GY4DQU',
                        text: `:information_source: "Code review"
Ссылка на MR в описании задачи -- ${task.name}
                ${task.permalink_url }
                mr - ${task.custom_fields[2].display_value}`
                    });
                }
            }
        }
    } else {
        console.error("Something went wrong!");
    }
})

app.post('/gitlab-webhook', async (req, res) => {
    // console.log('Received a webhook from GitLab:', req.body);
    // console.log(req.body.object_attributes);

    // console.log(req.body.event_type, req.body.object_attributes)
    if (req.body.event_type === GITLAB_EVENTS.MERGE_REQUEST) {
        const mergeRequestUrl = req.body.object_attributes.url;
        const conversations = await SlackApi.getConversationList({ types: 'private_channel' });
        const currentChannel = conversations.find((conversation) => conversation.name === 'grp-front-mr');
        const messages = await SlackApi.getAllMessages({ channel: currentChannel.id });

        const currentMessage = (messages.find(msg => msg.text.includes(mergeRequestUrl)));

        const action = req.body.object_attributes.action;

        if (action === 'unapproved') {
            const threadMessages = await SlackApi.getMessageThread({
                channel: currentChannel.id, ts: currentMessage.ts,
            });
            // TODO change searching from text to bot type
            const promises = [];
            const botThreadMessage = threadMessages.find((msg) => msg.text === 'Молодец! Получил аппрув к своему мр!');
            if (botThreadMessage) {
                promises.push(SlackApi.removeMessage({ channel: currentChannel.id, ts: botThreadMessage.ts }));
            }
            Promise.all([
                ...promises,
                await SlackApi.removeReaction({
                    channel: currentChannel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
                }),
            ]);
        } else {
            Promise.all([
                SlackApi.addReaction({
                    channel: currentChannel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
                }),
                SlackApi.addMessageToThread({
                    channel: currentChannel.id, thread_ts: currentMessage.ts, text: 'Молодец! Получил аппрув к своему мр!',
                }),
            ]);
        }
    }
    // if (req.body.event_name === GITLAB_EVENTS.PUSH) {
    //     axios.post('https://hooks.slack.com/services/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', {
    //         text: 'Works!!!!',
    //     });
    // }
    // здесь вы можете добавить логику для обработки уведомления
    // axios.post('https://hooks.slack.com/services/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', {
    //     text: 'Works!!!!',
    // });
    res.sendStatus(200); // отправляем ответ GitLab, чтобы показать, что запрос был успешно обработан
});

app.listen(PORT, async () => {
    console.log(`Server is running at ${PORT}`);
});


// asana steps
// 1) post  to enable webhook
// https://app.asana.com/api/1.0/webhooks
// send data
// answer with correct headers
