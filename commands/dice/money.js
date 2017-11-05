const commando = require('discord.js-commando');
const currency = require('../../structures/currency.js');

class SizeCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'money',
            aliases: ['currency','bux','bucks'],
            group: 'dice',
            memberName: 'money',
            description: 'How much money does a user have?',
            args: [
                {
                    key: 'member',
                    prompt: 'Who\'s money should you display?',
                    type: 'member',
                    default: ''

                    
                }
            ]
        });

    }

    async run(message, args) {
        
        const member = args.member || message.author;
		const user = member.user;

        //var ch = message.guild;
        var db = this.client.provider.db;
        
        var theyyou;
        if (args.member){
            theyyou = "They"
        }else{
            theyyou = "You"
        }
        var out;
        var outrep;
        out = await currency.getMoney(member.id,db);
        outrep = await currency.getReputation(member.id,db);
        //console.log("MEMBER ID: "+member.id);
        
        

        message.channel.sendMessage(theyyou+" have "+out+" "+currency.textPlural()+"\n"+theyyou+" have "+outrep+" reputation");


        
		
    }
}

module.exports = SizeCommand;