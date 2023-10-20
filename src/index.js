const express = require('express');
const app = express();
const PORT = 80;
const SlackApi = require('./api/slack');
const axios = require('axios');

const GITLAB_EVENTS = require("./constants/GITLAB_EVENTS");

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

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
        console.log({ currentMessage })

        if (action === 'unapproved') {
            const threadMessages = await SlackApi.getMessageThread({
                channel: currentChannel.id, ts: currentMessage.ts,
            });
            console.log({ threadMessages });
            // TODO change searching from text to bot type
            const botThreadMessage = threadMessages.find((msg) => msg.text === 'Молодец! Получил аппрув к своему мр!');
            if (botThreadMessage) {
                await SlackApi.removeMessage({ channel: currentChannel.id, ts: botThreadMessage.ts });
            }
            await SlackApi.removeReaction({
                channel: currentChannel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
            });
        } else {
            await SlackApi.addReaction({
                channel: currentChannel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
            })
            await SlackApi.addMessageToThread({
                channel: currentChannel.id, thread_ts: currentMessage.ts, text: 'Молодец! Получил аппрув к своему мр!',
            })
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


// get al private chanel and find needed one
// https://slack.com/api/conversations.list?types=private_channel

// get all message from group with id channel=C0623GY4DQU
//https://slack.com/api/conversations.history?channel=C0623GY4DQU

// post add msg to thread, channel, ts parent message text
// https://slack.com/api/chat.postMessage?channel=C0623GY4DQU&thread_ts=1697784163.714119&text=Approve

// post add reaction to a msg channel, name of emoji, timestamp - ts of msg
// https://slack.com/api/reactions.add?channel=C0623GY4DQU&name=thumbsup&timestamp=1697784163.714119
