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
        //var ch = message.guild;
        var db = this.client.provider.db;
        

        var id = message.author.id;

        if(await misc.daily("payout",id,db)){
            var payout = 60+Math.floor(Math.random() * (25));
            
            //currency.changeBalance(id,payout,"dollar",ch);
            currency.addMoney(id,payout,db);
            message.channel.send("*You have gained "+payout+" dicebux!*");


        }else{

            message.channel.send("You already received your payout today, try again tomorow.");

        }


        
    }
}

module.exports = DailyCommand;