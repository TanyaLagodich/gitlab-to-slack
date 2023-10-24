const eventEmitter = require('../eventEmitter');
const SlackApi = require('../api/slack');

class SlackController {
    channel = {};

    constructor() {
        this.init();

        eventEmitter.on('asana-task-moved-to-code-review', async (task) => {
            await SlackApi.sendNewMessage({
                channel: 'C0623GY4DQU',
                text: `:information_source: "Code review"
                        Ссылка на MR в описании задачи -- ${task.name}
                        ${task.permalink_url }
                        mr - ${task.custom_fields[2].display_value}`
            });

            this.allMessages = await SlackApi.getAllMessages({ channel: this.channel.id });
        });



        eventEmitter.on('gitlab-unapproved-mr', async (mrUrl) => {
            const currentMessage = (this.allMessages.find(msg => msg.text.includes(mrUrl)));

            const threadMessages = await SlackApi.getMessageThread({
                channel: this.channel.id, ts: currentMessage.ts,
            });

            let promises = [];
            const botThreadMessage = threadMessages.find((msg) => msg.text === 'Молодец! Получил аппрув к своему мр!');
            if (botThreadMessage) {
                promises.push(SlackApi.removeMessage({ channel: this.channel.id, ts: botThreadMessage.ts }));
            }
            Promise.all([
                ...promises,
                await SlackApi.removeReaction({
                    channel: this.channel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
                }),
            ]);
        })

        eventEmitter.on('gitlab-approved-mr', async (mrUrl) => {
            const currentMessage = (this.allMessages.find(msg => msg.text.includes(mrUrl)));
            Promise.all([
                SlackApi.addReaction({
                    channel: this.channel.id, name: 'white_check_mark', timestamp: currentMessage.ts,
                }),
                SlackApi.addMessageToThread({
                    channel: this.channel.id, thread_ts: currentMessage.ts, text: 'Молодец! Получил аппрув к своему мр!',
                }),
            ]);
        });
    }

    async init() {
        const conversations = await SlackApi.getConversationList({ types: 'private_channel' });
        this.channel = conversations.find((conversation) => conversation.name === 'grp-front-mr');

        this.allMessages = await SlackApi.getAllMessages({ channel: this.channel.id });
    }
}

module.exports = SlackController;
