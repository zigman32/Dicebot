const commando = require('discord.js-commando');
const misc = require('../misc.js');
const mydice = require('../dice/diceclass.js');
const currency = require('../../structures/currency.js');
const vs = require('../dice/dicevs.js');
const dsemoji = require('discord-emoji');


class MehCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'meh',
            aliases: ['test'],
            group: 'royal',
            memberName: 'meh',
            description: 'Does whatever',

            args: [
                {
                    key: 'text',
                    prompt: 'something',
                    type: 'string',
                    default: ''
                }
            ]
        });

    }
    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(message, args) {

        if(this.client.isOwner(message.author))
        {   


            
            
            const { text } = args;
            var ch = message.guild;
            var something = text;
            var user = message.author;
            var id = user.id;

            var meta = (something == "meta");

           
            //currency.addReputation(1000,id,ch);
            currency.changeBalance(id,10000,"dollar",ch);
            var resultstring = "";
            for(var i = 0;i<10;i++)

            {   var d = new mydice();
                d.generate(something);
                resultstring+=d.read()+"\n"
            }
            message.channel.send(resultstring);            
            
        }
    }
}

module.exports = MehCommand;