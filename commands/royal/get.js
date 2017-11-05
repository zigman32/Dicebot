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
        const { key } = args;

        if(this.client.isOwner(message.author))
        {

            var ch = message.guild;
            
            

            this.client.provider.db.get(key).then(function(res){
                for(var col in res) {
                    var value = res[col]
                
                    message.channel.send(col+":"+value);
                }
            }).catch(err => message.channel.send(err));
            

        }
    }
}

module.exports = GetCommand;