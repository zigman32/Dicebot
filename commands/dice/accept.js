const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const mydice = require('./diceclass.js');



class AccepttradeCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'accepttrade',
            aliases: ['accept'],
            group: 'dice',
            memberName: 'accepttrade',
            description: 'Accept a trade offer from another user',
            args: [
                {
                    key: 'member',
                    prompt: 'Who\'s trade do you want to accept?',
                    type: 'member'
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
        
        var d1 = misc.getormakedice(id1,ch);
        var d2 = misc.getormakedice(id2,ch);
        
        var tobj = ch.settings.get("DICE_trade_"+id2+"_"+id1,false);
        if(!tobj)
        {
            message.channel.sendMessage("No such trade exists.");
            return;
        }
        var date = new Date();
        if(tobj.expire <= date.getTime()){
            message.channel.sendMessage("No such trade exists.");
            return;
        }

        if(tobj.offertype == "dice")
        {
            if(misc.getuniqueID(d2) != tobj.offerval)
            {
                console.log(" d2: "+misc.getuniqueID(d2));
                console.log(" d1: "+misc.getuniqueID(d1));
                
                console.log("val: "+tobj.offerval);

                message.channel.sendMessage("The person who proposed the trade changed their dice, trade canceled.");
                return;
            }
        }
        if(tobj.wanttype == "dice")
        {
            if(misc.getuniqueID(d1) != tobj.wantval)
            {
                message.channel.sendMessage("You changed your dice, trade canceled.");
                return;
            }
        }
        if(tobj.wanttype == "money")
            {
                if(currency.getBalance(id1,"dollar",ch) < tobj.wantval || tobj.wantval < 0)
                {
                    message.channel.sendMessage("You don't have enough money, trade canceled.");
                    return;
                }
            }
        if(tobj.wanttype == "dice" && tobj.offertype == "dice")
        {
            misc.setdice(d1,id2,ch);
            misc.setdice(d2,id1,ch);
        
            message.channel.sendMessage("Trade successfull!");
        }
        if(tobj.wanttype == "money" && tobj.offertype == "dice")
        {
            var db2 = misc.getDicebag(id2,ch);
            if(db2.dice.length == 0)
            {
                message.channel.sendMessage("The other party has no replacement dice, trade canceled.");
                return;
            }
            
            misc.addToDicebag(d2,id1,ch);
            currency.changeBalance(id1,-tobj.wantval,"dollar",ch);
            currency.changeBalance(id2,tobj.wantval,"dollar",ch);
            var setd2 = mydice.toDice(db2.dice[0]);
            db2.dice.splice(0,1);
            misc.setdice(setd2,id2,ch);
            message.channel.sendMessage("Trade successfull! The other party's dice has been set to "+setd2.read());
            
            
        }
        
    }
}

module.exports = AccepttradeCommand;