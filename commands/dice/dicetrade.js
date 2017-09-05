const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');


class DicetradeCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'dicetrade',
            aliases: ['trade'],
            group: 'dice',
            memberName: 'dicetrade',
            description: 'Trade dice with another user',
            args: [
                {
                    key: 'member',
                    prompt: 'Who do you want to trade with',
                    type: 'member'
                },
                {
                    key: 'offer',
                    prompt: 'What are you offering?',
                    type: 'string'
                },
                {
                    key: 'want',
                    prompt: 'What do you want in return?',
                    type: 'string'
                }
            ],throttling: {
                usages: 1,
                duration: 400
            }
        });

    }
    
    async run(message, args) {
        const offer = args.offer;
        const member = args.member;
        const want = args.want;
        var user = member.user;
        var ch = message.guild;
        var id2 = member.id;
        var id1 = message.author.id;
        
        /**
         * 
         * How it works:
         * 
         * player 1 offers their active dice in exchange for either player 2's active dice or money (MAYBE NEED TO BE CONFIRMED!)
         * if either player changes their active dice, the trade is canceled (MAYBE NOT WITH DICE VALIDATION)
         * player two accepts the deal with a specific user
         * double check that both dice are the same as the deal proposed, if not, abort
         * offer expires after 5 minutes
         * 
         * either player can cancel the trade
         */
        
        if(offer == "dice" && want == "dice"){
            var value;
            var d1 = misc.getormakedice(id1,ch);
            var d2 = misc.getormakedice(id2,ch);
            message.channel.sendMessage("Offering dice: "+d1.read()+"\nIn exchange for dice: "+d2.read()+"\nRespond with ``confirm`` to confirm, or anything else to cancel.");

            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                maxMatches: 1,
                time: 30000
            });
            if(responses && responses.size === 1) value = responses.first().content; else{
                //message.channel.sendMessage("Time ran out");
                return;
            }
            const lc = value.toLowerCase();
            if(lc === 'confirm'){ 
                var dat = new Date();
                var exp = dat.getTime()+1000*60*5;//5 minutes
                ch.settings.set("DICE_trade_"+id1+"_"+id2,{offertype: "dice", offerval: misc.getuniqueID(d1), wanttype: "dice", wantval: misc.getuniqueID(d2), expire: exp});
                message.channel.sendMessage("confirmed, "+member+", please use !accept "+message.author+" to accept the trade");
                return;
            }else{
                message.channel.sendMessage("Trade canceled.");
                return;
            }
        }else
        if(offer == "dice" && want[0] == "$"){
            var value;
            var price = parseInt(want.replace('$',''));
            if(isNaN(price)){
                message.channel.sendMessage("Invalid trade");
                return;
            }
            var db1 = misc.getDicebag(id1,ch);
            if(db1.dice.length == 0)
            {
                message.channel.sendMessage("You have no replacement dice, trade canceled.");
                return;
            }
            
            var d1 = misc.getormakedice(id1,ch);
            var d2 = misc.getormakedice(id2,ch);
            message.channel.sendMessage("Offering dice: "+d1.read()+"\nIn exchange for: $"+price+"\nRespond with ``confirm`` to confirm, or anything else to cancel.");

            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                maxMatches: 1,
                time: 30000
            });
            if(responses && responses.size === 1) value = responses.first().content; else{
                return;
            }
            const lc = value.toLowerCase();
            if(lc === 'confirm'){ 
                var dat = new Date();
                var exp = dat.getTime()+1000*60*5;//5 minutes
                ch.settings.set("DICE_trade_"+id1+"_"+id2,{offertype: "dice", offerval: misc.getuniqueID(d1), wanttype: "money", wantval: price, expire: exp});
                message.channel.sendMessage("confirmed, "+member+" use !accept "+message.author+" to accept the trade");
                return;
            }else{
                message.channel.sendMessage("Trade canceled.");
                return;
            }
        }else
        {
            message.channel.sendMessage("Invalid trade");
        }


        
    }
}

module.exports = DicetradeCommand;