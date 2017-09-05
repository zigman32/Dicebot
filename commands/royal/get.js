const commando = require('discord.js-commando');

class GetCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'get',
            group: 'royal',
            memberName: 'get',
            description: 'get\'s anything to a string',
            args: [
                {
                    key: 'key',
                    prompt: 'get what?',
                    type: 'string'

                    
                }
            ]
        });

    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    static hasModifier(face,type = -1){

    }

    async run(message, args) {
        const { key,value } = args;

        if(this.client.isOwner(message.author))
        {

            var ch = message.guild;
            
            var out;

            out = ch.settings.get(key,"null");
            

            message.channel.sendMessage(key+" has value: "+out);

        }
    }
}

module.exports = GetCommand;