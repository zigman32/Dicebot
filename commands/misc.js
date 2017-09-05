const commando = require('discord.js-commando');
const mydice = require('./dice/diceclass.js')
const crypto = require('crypto');
const dsemoji = require('discord-emoji');

class Misc {
    

    static getuniqueID(d){
        const secret = 'abcdefg';
        const hash = crypto.createHmac('sha256', secret)
                           .update(d.read())
                           .digest('hex');
        return hash;
    }

    static daily(string,uid,ch){
        var ret = false;
        var lastday;
        lastday = ch.settings.get("DAILY_"+string+"_"+uid,-1);
        
        if(lastday == -1)
        {
            console.log("new daily id ");
            ch.settings.set("DAILY_"+string+"_"+uid,-1);
        }
        
        var today = new Date();
        var dd = today.getDate();
        if(dd != lastday)
        {
            ret = true;
        }
        ch.settings.set("DAILY_"+string+"_"+uid,dd);

        
        return ret;
    }

    static getHourly(type,uid,ch){
        var timetill = ch.settings.get("HOURLY_"+type+"_"+uid,0);
        var d = new Date();
        return timetill - d.getTime();
    }

    static setHourly(type,duration,uid,ch){
        var d = new Date();
        ch.settings.set("HOURLY_"+type+"_"+uid,d.getTime()+1000*60*60*duration)
    }

    static upConsecutive(type,uid,ch){
        var cconsec = ch.settings.get("CONSECUTIVE_"+type+"_"+uid,0);
        ch.settings.set("CONSECUTIVE_"+type+"_"+uid,cconsec+1);
        
        
    }
    static getConsecutive(type,uid,ch){
        return ch.settings.get("CONSECUTIVE_"+type+"_"+uid,0);
    }
    static breakConsecutive(type,uid,ch){
        ch.settings.set("CONSECUTIVE_"+type+"_"+uid,0);
    }
    

    static ritem(array){
        return array[Math.floor(Math.random()*array.length)];
    }
    static getormakedice(id,ch,dtype = "user"){
        var dbdice = new mydice();

        if(dtype == "dicebot"){
            var dice = new mydice();
            dice.generate("emoji0");
            
            
            return dice;
        }
        if(dtype == "gun")
        {
            var dice = new mydice();
            dice.setFaces([{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"gun",value:1},{
            type:"fire",value:20}]);
            return dice;
        }
        
        dbdice = ch.settings.get("DICE_dice1_"+id,"null");
        if(dbdice == "null")
        {
            var dbdice = new mydice();
            
            dbdice.generate(dtype);
            ch.settings.set("DICE_dice1_"+id,dbdice);
            dbdice = ch.settings.get("DICE_dice1_"+id,"null");
            
        }
        
        var dice = new mydice();
        for(var k in dbdice) dice[k]=dbdice[k];
        return dice;
    }

    static setdice(dice,id,ch){
        var dbdice = new mydice();
        
        
        ch.settings.set("DICE_dice1_"+id,dice);
        
    }

    static addToDicebag(dice,id,ch){
        var dicebag = Misc.getDicebag(id,ch);
        dicebag.dice.push(dice);
        Misc.setDiceBag(dicebag,id,ch);
    }

    static getCollection(id,ch){
        return ch.settings.get("DICE_collection_"+id,{items:[]});
    }

    static setCollection(collection,id,ch){
        ch.settings.set("DICE_collection_"+id,collection)
    }

    static addToCollection(item,id,ch){
        var collection = Misc.getCollection(id,ch);
        collection.items.push(item);
        Misc.setCollection(collection,id,ch);
    }

    static getDicebag(id,ch){
        return ch.settings.get("DICE_dicebag_"+id,{dice:[]});
    }

    static setDiceBag(bag,id,ch){
        ch.settings.set("DICE_dicebag_"+id,bag)
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