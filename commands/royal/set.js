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

                    
                }
            ]
        });

    }
    
    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }
    async run(message, args) {
        const { key } = args;

        if(this.client.isOwner(message.author))
        {

            var ch = message.guild;
            
            this.client.provider.db.run(key).then(function(res){
                for(var col in res) {
                    var value = res[col]
                
                    message.channel.send(col+":"+value);
                }
            }).catch(errd => message.channel.send(""+errd));

        }
    }
}

module.exports = SetCommand;