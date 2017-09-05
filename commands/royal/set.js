const commando = require('discord.js-commando');

class SetCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'set',
            group: 'royal',
            memberName: 'set',
            description: 'set\'s anything to a string',
            args: [
                {
                    key: 'key',
                    prompt: 'set what?',
                    type: 'string'

                    
                },{
                    key: 'value',
                    prompt: 'to what?',
                    type: 'string'

                    
                }
            ]
        });

    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }
    async run(message, args) {
        const { key,value } = args;

        if(this.client.isOwner(message.author))
        {

            var ch = message.guild;
            
            ch.settings.set(key,value);
            var out;

            out = ch.settings.get(key,"null");
            
            

            message.channel.sendMessage(key+" has been updated to: "+out);

        }
    }
}

module.exports = SetCommand;