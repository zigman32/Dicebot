const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');

class DailyCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'daily',
            aliases: ['payout','payday'],
            group: 'dice',
            memberName: 'daily',
            description: 'Gives you some free money once a day'
        });

    }

    async run(message, args) {
        var ch = message.guild;

        var id = message.author.id;

        if(misc.daily("payout",id,ch)){
            var payout = 60+Math.floor(Math.random() * (25));
            
            currency.changeBalance(id,payout,"dollar",ch);
            message.channel.sendMessage("*You have gained "+payout+" dicebux!*");


        }else{

            message.channel.sendMessage("You already received your payout today, try again tomorow.");

        }


        
    }
}

module.exports = DailyCommand;