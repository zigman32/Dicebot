const commando = require('discord.js-commando');

class MyhelpCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'help',
            group: 'responce',
            memberName: 'help',
            description: 'Says hello'
        });

    }

    async run(message, args) {
        var resultstring = "";

        resultstring+= "List of commands:";

        message.channel.send(resultstring);
    }
}

module.exports = MyhelpCommand;