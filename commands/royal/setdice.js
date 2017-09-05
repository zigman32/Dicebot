const commando = require('discord.js-commando');

class SetdiceCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'setdice',
            group: 'royal',
            memberName: 'setdice',
            description: 'set\'s anything to a string',
            args: [
                {
                    key: 'theuser',
                    prompt: 'which user',
                    type: 'user'

                    
                },{
                    key: 'dicestring',
                    prompt: 'what dice?',
                    type: 'string'

                    
                }
            ]
        });

    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }
    async run(message, args) {
        const { theuser,dicestring } = args;

        
    }
}

module.exports = SetdiceCommand;