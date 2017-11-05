const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const mydice = require('./diceclass.js');
const Item = require('./item');
const Database = require('../../structures/database');



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
        //var db = message.guild;
        
        var db = this.client.provider.db;
        var id2 = member.id;
        var id1 = message.author.id;
        

        


        
        
        var tobj = await Database.getTrade(id2,id1,db);
        if(!tobj)
        {
            message.channel.sendMessage("No such trade exists.");
            return;
        }
        var date = new Date();
        if(tobj.exptime <= date.getTime()){
            message.channel.sendMessage("No such trade exists.");
            return;
        }

        

        var validateoffer = await AccepttradeCommand.validateGift(id2,tobj.offertype,tobj.offerval,db);
        if(validateoffer != true)
        {
            message.channel.sendMessage("Invalid offer: "+validateoffer);
            return;
        }
        var validatewant = await AccepttradeCommand.validateGift(id1,tobj.wanttype,tobj.wantval,db);
        if(validatewant != true)
        {
            message.channel.sendMessage("Invalid request: "+validatewant);
            return;
        }
        console.log("Validation successful");
        if(false && tobj.wanttype == "dice" && tobj.offertype == "dice")
        {
            
           
        }else{
            await AccepttradeCommand.giveToOtherUser(id2,id1,tobj.offertype,tobj.offerval,db);
            await AccepttradeCommand.giveToOtherUser(id1,id2,tobj.wanttype,tobj.wantval,db);
            message.channel.sendMessage("Trade successfull!");
            await Database.removeTrade(id2,id1,db);
            
        }
        
        
    }

    static async validateGift(sendid,sendtype,sendval,db){
        switch(sendtype)
        {
            case "dice":
                var duser = await Database.getOwnerOfDice(sendval,db);
                if(!duser || sendid != duser.uid)
                {
                    
    
                    return "User no longer owns that dice!";
                }
                var adice = await misc.getormakedice(sendid,db);
                if(adice.id == sendval)
                {    
                    return "You can't trade your active dice away!";
                }
                return true;
            case "money":
                var smoney = await currency.getMoney(sendid,db);
                if(smoney < sendval)
                {    
                    return "Not enough "+currency.textPlural();
                }
                return true;
            case "item":
                if(!(await misc.hasItem(sendval,sendid,db)))
                {   
                    return "Item not found!";
                }
                return true;
        }
    }

    static async giveToOtherUser(sendid,receiveid,sendtype,sendval,db){
        switch(sendtype)
        {
            case "dice":
                
                await Database.changeDiceOwner(sendval,receiveid,db);
                
                break;
            case "money":
                await currency.removeMoney(sendid,sendval,db);
                await currency.addMoney(receiveid,sendval,db);
                break;
            case "item":
                await misc.consumeItem(sendval,sendid,db);
                await misc.addToInventory(sendval,receiveid,db);
                break;
        }
        return true;


    }
}

module.exports = AccepttradeCommand;