const commando = require('discord.js-commando');
const Dice = require('./dice/diceclass.js');
const crypto = require('crypto');
const dsemoji = require('discord-emoji');
const Database = require('../structures/database');

class Misc {
    

    static getuniqueID(d){
        const secret = 'abcdefg';
        const hash = crypto.createHmac('sha256', secret)
                           .update(d.read())
                           .digest('hex');
        return hash;
    }

    static async daily(key,uid,db,extra = "0"){
        var ret = false;
        var lastday;

        var days = await Database.getDaily(uid,key,db);
        if(days.lastday == days.today)
        {
            return false;
        }else{
            Database.setDaily(uid,key,db,extra);
            return true;
        }
    }

    static async setDailyExtra(key,uid,extra,db){
        return await Database.updateDaily(uid,key,extra,db);
    }

    static async getDailyExtra(key,uid,db,extra = "0")
    {
        await Misc.daily(key,uid,db,extra);
        var res = await Database.getDaily(uid,key,db);
        return res.extra;
    }

    static async getHourly(type,uid,db){
        var res = await Database.getHourly(uid,type,db);
        return (res.lasttime-res.now)*1000;
    }

    static async setHourly(type,duration,uid,db){
        return await Database.setHourly(uid,duration*60*60,type,db);
    }

    static async upConsecutive(type,uid,db){
        await Database.upConsecutive(uid,type,db);
    }
    static async getConsecutive(type,uid,db){
        return await Database.getConsecutive(uid,type,db);
    }
    static async breakConsecutive(type,uid,db){
        await Database.breakConsecutive(uid,type,db);
    }
    

    static ritem(array){
        return array[Math.floor(Math.random()*array.length)];
    }
    static async getormakedice(id,db,dtype = "user"){
        


        if(dtype == "dicebot"){
            
            
            var dice = new Dice();
            dice.generate("emoji0");
            return dice;
        }
        if(dtype == "gun")
        {
            var dice = new Dice();
            dice.setFaces([{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"fire",value:20}]);
            return dice;
        }

        var dice = await Database.getActiveDice(id,db,dtype);
        
        return Dice.toDice(dice);
       
    }

    

    static addToDicebag(dice,id,db){
        Database.registerUserDice(dice,id,db);
    }

    static getCollection(id,db){
        return Database.getEmojiCollection(id,db);
        
    }

    
    static addToCollection(item,id,db){
        return Database.addToCollection(id,item,db);
    }

    static async getDicebag(id,db){
        return await Database.getAllDice(id,db);
    }

    static async getActiveDiceIndex(id,db){
        return await Database.getActiveDiceIndex(id,db);
    }

    static async getMaxDiceIndex(id,db){
        return await Database.getMaxDiceIndex(id,db);
    }

    static async setActiveDiceIndex(id,index,db){
        return await Database.updateActiveDiceIndex(id,index,db);
    }

    static async getDiceByIndex(userid,index,db){
        return Database.getDiceByIndex(userid,index,db);
    }

    static async deleteDiceByIndex(userid,index,db){
        return Database.deleteDiceByIndex(userid,index,db);
    }

    static async getRoulette(db){
        if(await Misc.daily("newroulette","server",db))
        {
            return false;
        }
        var res = await Database.getRoulette(db);
        var items = [];
        const Rouletteitem = require("./dice/rouletteclass");
        for(var i = 0;i<res.length;i++){
            items.push(new Rouletteitem(res[i].rouletteid,res[i].extra));
        }
        return items;
    }

    static async setRoulette(roulette,db){
        return await Database.setRoulette(roulette,db);
    }

    static async getInventory(id,db){
        return await Database.getAllItems(id,db);
    }
    

    

    static async addToInventory(item,uid,db,amount=1){
        return await Database.addItem(uid,item,amount,db);
    }

    static async hasItem(item,id,db){
        var res = await Database.getItemQuantity(id,item,db);
        if(res.amount > 0)
        {
            return true;
        
        }
        return false;
    }

    static async consumeItem(item,id,db,amount = 1){
        return await Database.looseItem(id,item,amount,db);
    }

    static getTrueName(id,ch,client){
        
        var user = client.users.get(id);
        var cusername = user.username;
        var cnickname = cusername;
        var cnick = ch.members.get(id).nickname;
        if(cnick != null)
        {
            cnickname = cnick;
        }
        return cnickname;
        
    }
    
    
    static getEmoji(string){
        for(var etype in dsemoji){
            for(var emoji in dsemoji[etype]){
                if(string == dsemoji[etype][emoji])
                {
                    
                    return {type: etype, name:emoji};
                }
            }
        }
        return false;
    }


}

module.exports = Misc;