const commando = require('discord.js-commando');

class HelloCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'hello',
            group: 'responce',
            memberName: 'hello',
            description: 'Says hello'
        });

    }

    async run(message, args) {
        message.channel.sendMessage("Hi there "+message.author+"!");
    }
}

module.exports = HelloCommand;