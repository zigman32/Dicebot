const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const Item = require('./item')
const Database = require('../../structures/database')

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
        //var db = message.guild;
        var db = this.client.provider.db;
        var id2 = member.id;
        var id1 = message.author.id;
        
        var twanttype = "";
        var twantval;
        var toffertype = "";
        var tofferval;
        var tofferstring;
        var twantstring;
        if(false){
            var value;
            var d1 = await misc.getormakedice(id1,db);
            var d2 = await misc.getormakedice(id2,db);
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
                await Database.setTrade(id1,id2,exp,"dice",d1.id,"dice",d2.id);
                //db.settings.set("DICE_trade_"+id1+"_"+id2,{offertype: "dice", offerval: misc.getuniqueID(d1), wanttype: "dice", wantval: misc.getuniqueID(d2), expire: exp});
                message.channel.sendMessage("confirmed, "+member+", please use !accept "+message.author+" to accept the trade");
                return;
            }else{
                message.channel.sendMessage("Trade canceled.");
                return;
            }
        }else
        {
            if(/d\d+/.test(offer)){
                var diceid = parseInt(/d(\d+)/.exec(offer)[1]);
                var maxdice = await misc.getMaxDiceIndex(id1,db);
                
    
                //var sdice = diceid-1;
                if(maxdice < diceid || diceid < 1)
                {
                    message.channel.sendMessage("Invalid dice selected");
                    return;
                }
                
                var adiceid = await misc.getActiveDiceIndex(id1,db);
                if(adiceid == diceid){
                    message.channel.sendMessage("You can't trade your active dice!");
                    return;
                }
    
    
                var d1 = await misc.getDiceByIndex(id1,diceid,db);
                
                
                
                tofferval = d1.id;
                toffertype = "dice";
                tofferstring = "Offering: "+d1.read();
            }
            if(/d\d+/.test(want)){
                console.log("Test passed");
                var diceid = parseInt(/d(\d+)/.exec(want)[1]);
                //-----------------
                var maxdice = await misc.getMaxDiceIndex(id2,db);
                
    
                //var sdice = diceid-1;
                if(maxdice < diceid || diceid < 1)
                {
                    message.channel.sendMessage("Invalid dice selected");
                    return;
                }
                
                var adiceid = await misc.getActiveDiceIndex(id2,db);
                if(adiceid == diceid){
                    message.channel.sendMessage("You can't trade your active dice!");
                    return;
                }
    
    
                var d1 = await misc.getDiceByIndex(id2,diceid,db);
                
                //-----------------
                
                twantval = d1.id;
                twanttype = "dice";
                twantstring = "In exchange for: "+d1.read();
            }
            
            if(/\$\d+/.test(offer)){
                toffertype = "money";
                
                tofferval = parseInt(/\$(\d+)/.exec(offer)[1]);
                
                if(tofferval < 0)
                {
                    message.channel.sendMessage("You can't trade negative money! Trade canceled.");
                    return;
                }
                if(await currency.getMoney(id1,db)<tofferval){
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
                if(await currency.getMoney(id2,db)<twantval){
                    message.channel.sendMessage("They can't afford that trade! Trade canceled.");
                    return;
                }
                twantstring = "In exchange for: "+twantval+" "+currency.textPlural();
            }

            if(offer[0] == "i"){
                
                var itemid = offer.substring(1);


                var inventory = await misc.getInventory(id1,db);
                
                var index = 1;
                var i;
                for( i = 0;i<inventory.length;i++){
                    if(inventory[i].amount > 0)
                    {
                        var item = Item.getItembyID(inventory[i].id);
                        if(index == parseInt(itemid) || item.name.toLowerCase() == itemid.toLowerCase()){
                            
                            toffertype = "item";
                            tofferval = inventory[i].id;
                            tofferstring = "Offering: "+item.name;
                            break;
                        }
                        index++;
                        
                    }
                    
                }
                if(i == inventory.length){
                    message.channel.sendMessage("You don't have that item!");
                    return;
                }
                
                
            }

            if(want[0] == "i"){

                var itemid = want.substring(1);


                var inventory = await misc.getInventory(id2,db);
                
                var index = 1;
                var i;
                for( i = 0;i<inventory.length;i++){
                    if(inventory[i].amount > 0)
                    {
                        var item = Item.getItembyID(inventory[i].id);
                        if(index == parseInt(itemid) || item.name.toLowerCase() == itemid.toLowerCase()){
                            
                            twanttype = "item";
                            twantval = inventory[i].id;
                            twantstring = "In exchange for: "+item.name;
                            break;
                        }
                        index++;
                        
                    }
                    
                }
                if(i == inventory.length){
                    message.channel.sendMessage("They don't have that item!");
                    return;
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
                await Database.setTrade(id1,id2,exp,toffertype,tofferval,twanttype,twantval,db);
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