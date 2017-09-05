const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');


class GiveCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'give',
            aliases: ['givemoney'],
            group: 'dice',
            memberName: 'give',
            description: 'Give some of your money to another user',
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to give your money too',
                    type: 'member'
                },
                {
                    key: 'amount',
                    prompt: 'How much money should you give?',
                    type: 'integer'
                }
            ]
        });

    }
    
    async run(message, args) {
        const amount = args.amount;
        const member = args.member;
        const use = member.user;
        var user = member.user;
        var ch = message.guild;
        var id2 = user.id;
        var id1 = message.author.id;
        

        

        if(amount < 0)
        {
            message.channel.sendMessage("You can't give negative money to someone!");
            return;
        }
        var awealth = currency.getBalance(id1,"dollar",ch);
        if(awealth < amount){
            message.channel.sendMessage("You don't have that much money!");
        }else
        {
            currency.changeBalance(id1,-amount,"dollar",ch);
            currency.changeBalance(id2,amount,"dollar",ch);
            var bwealth = currency.getBalance(id2,"dollar",ch);

            message.channel.sendMessage("*You generously decide to give "+amount+" of your money to "+misc.getTrueName(id2,ch,this.client)+" who now has "+bwealth+" dicebux.*");
            
        }
        


        
    }
}

module.exports = GiveCommand;