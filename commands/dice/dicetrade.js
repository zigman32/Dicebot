const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const Item = require('./item')


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
            ]
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
        var twanttype = "";
        var twantval;
        var toffertype = "";
        var tofferval;
        var tofferstring;
        var twantstring;
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
        {
            if(offer == "dice"){
                var db1 = misc.getDicebag(id1,ch);
                if(db1.dice.length == 0)
                {
                    message.channel.sendMessage("You have no replacement dice, trade canceled.");
                    return;
                }
                toffertype = "dice";
                var d1 = misc.getormakedice(id1,ch);
                tofferval = misc.getuniqueID(d1)
                tofferstring = "Offering: "+d1.read();
            }
            if(want == "dice"){
                var db1 = misc.getDicebag(id1,ch);
                if(db1.dice.length == 0)
                {
                    message.channel.sendMessage("You have no replacement dice, trade canceled.");
                    return;
                }
                twanttype = "dice";
                var d2 = misc.getormakedice(id2,ch);
                twantval = misc.getuniqueID(d2);
                twantstring = "In exchange for: "+d2.read()
            }
            
            if(/\$\d+/.test(offer)){
                toffertype = "money";
                console.log("Before");
                tofferval = parseInt(/\$(\d+)/.exec(offer)[1]);
                console.log("after");
                if(twantval < 0)
                {
                    message.channel.sendMessage("You can't trade negative money! Trade canceled.");
                    return;
                }
                if(currency.getBalance(id1,"dollar",ch)<tofferval){
                    message.channel.sendMessage("You can't afford that trade! Trade canceled.");
                    return;
                }
                tofferstring = "Offering: "+tofferval+" "+currency.textPlural();
            }

            if(/\$\d+/.test(want)){
                twanttype = "money";
                
                twantval = parseInt(/\$(\d+)/.exec(want)[1]);
                if(twantval < 0)
                {
                    message.channel.sendMessage("You can't trade negative money! Trade canceled.");
                    return;
                }
                if(currency.getBalance(id2,"dollar",ch)<tofferval){
                    message.channel.sendMessage("They can't afford that trade! Trade canceled.");
                    return;
                }
                twantstring = "In exchange for: "+twantval+" "+currency.textPlural();
            }

            if(offer[0] == "i"){
                
                var inventory = misc.getInventory(id1,ch);
                var itemname = offer.substring(1);


                var index = 1;
                for (var key in inventory.items) {
                    if (inventory.items.hasOwnProperty(key)) {
                        var element = inventory.items[key];
                        var item = Item.getItembyID(key);
    
                        if(element > 0 && (item.name.toLowerCase() == itemname.toLowerCase() || index == parseInt(itemname)))
                        {
                            
                            toffertype = "item";
                            tofferval = key;
                            tofferstring = "Offering: "+item.name;
                            
                            break;
                        }
                        if(element > 0)
                            index++;
                        
                    }
                }
            }

            if(want[0] == "i"){

                var inventory = misc.getInventory(id2,ch);
                var itemname = want.substring(1);


                var index = 1;
                for (var key in inventory.items) {
                    if (inventory.items.hasOwnProperty(key)) {
                        var element = inventory.items[key];
                        var item = Item.getItembyID(key);
    
                        if(element > 0 && (item.name.toLowerCase() == itemname.toLowerCase() || index == parseInt(itemname)))
                        {
                            
                            twanttype = "item";
                            twantval = key;
                            twantstring = "In exchange for: "+item.name;
                            
                            break;
                        }
                        if(element > 0)
                            index++;
                        
                    }
                }
            }
            if(toffertype == "" || twanttype == ""){
                message.channel.sendMessage("Invalid trade!");
                return;
            }

            message.channel.sendMessage(tofferstring+"\n"+twantstring+"\n type ``confirm`` to confirm")
            var value;
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
                ch.settings.set("DICE_trade_"+id1+"_"+id2,{offertype: toffertype, offerval: tofferval, wanttype: twanttype, wantval: twantval, expire: exp});
                message.channel.sendMessage("confirmed, "+member+" use !accept "+message.author+" to accept the trade");
                return;
            }else{
                message.channel.sendMessage("Trade canceled.");
                return;
            }
        } 
    }
}

module.exports = DicetradeCommand;