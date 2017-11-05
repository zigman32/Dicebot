const misc = require('../misc.js');
const Dice = require('./diceclass');
const Database = require('../../structures/database');


class Item {
    
    static getItembyID(itemid){

        if(itemid.includes("|"))
        {
            var chips = itemid.split("|");
            if(chips[0] == "addmod")
            {
                return new Item(itemid,"\""+chips[1]+"\" sticker","Adds the "+chips[1]+" mod to a random face on your dice.",20,async function(uid,db,message){
                    var dice = await misc.getormakedice(uid,db);
                    if(await dice.addMod(chips[1],db))
                    {   
                        message.channel.sendMessage("You apply the sticker to your dice, your dice's stats are now:\n"+dice.read());
                        return true;
                    }else{
                        message.channel.sendMessage("Your dice can't accept that mod!");
                        return false;
                    }
                });
            }
            if(chips[0] == "changetype")
            {
                return new Item(itemid,Item.capitalizeFirstLetter(chips[1])+" Soul","Changes all of one type on your dice to "+chips[1]+".",20,async function(uid,db,message){
                    var dice = await misc.getormakedice(uid,db);
                    var ctypes = [];
                    for(var i = 0;i<dice.faces.length;i++)
                    {
                        if(chips[1] != dice.faces[i].type && ctypes.indexOf(dice.faces[i].type) < 0)
                            ctypes.push(dice.faces[i].type);
                    }
                    if(ctypes.length == 0)
                    {
                        message.channel.sendMessage("All of your dice's sides are already "+chips[1]+" type.");
                        return false;
                    }
                    var changefrom = ctypes[Dice.rint(ctypes.length)];
                    var changeto = chips[1];
                    await Database.changeTypeAToB(dice.id,changefrom,changeto,db);
                    for(var i = 0;i<dice.faces.length;i++)//don't need to double get dice
                    {
                        if(changefrom == dice.faces[i].type)
                            dice.faces[i].type = changeto;
                    }
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                });
            }
        }


        switch(itemid){
        case "poprocks":
            return new Item(itemid,"Pop rocks","When aplicable, the result of your next roulette spin will pop out and be given as an item instead of used automatically.",50,function(uid,db,message){
                
                message.channel.sendMessage("These items will be used automatically when you spin the roulette.");
                return false;
            });            
            break;
        case "rouletteticket":
            return new Item(itemid,"Roulette Ticket","Lets you spin the roulette for free (use your ticket to spin!).",100, async function(uid,db,message){
                const roulette = require('./roulette');
                roulette.cleanSpin(uid,db,message);
                return true;
            }); 
            break;
        case "typescrambler":
            return new Item(itemid,"Rainbow","It's very pretty. Also changes your dice's types to random types.",100, async function(uid,db,message){
                var dice = await misc.getormakedice(uid,db);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    var ttype = Dice.rint(18);
                    if(Math.random() < 0.02)
                        ttype = 18;
                    dice.faces[i].type = Dice.typenumtoname(ttype);
                    await Database.setFaceToType(dice.id,(i+1),dice.faces[i].type,db);
                }
                message.channel.sendMessage("Eww, you got rainbow juice all over your dice!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "ultmutate":
            return new Item(itemid,Item.capitalizeFirstLetter(Dice.typenumtoname(18))+" Type Mutator","Changes a random side of your dice to the "+Dice.typenumtoname(18)+" type (at the cost of a small amount of score).",120, async function(uid,db,message){
                var dice = await misc.getormakedice(uid,db);

                var choices = [];
                for(var i = 0;i<dice.faces.length;i++){
                    if(dice.faces[i].type != Dice.typenumtoname(18))
                    {
                        choices.push(i);
                    }
                }
                if(choices.length <= 0){
                    message.channel.sendMessage("Lucky you! All of your dice's sides are already "+Dice.typenumtoname(18)+" type!");
                    return false;
                    
                }
                var tside = choices[Dice.rint(choices.length)];

                dice.faces[tside].type = Dice.typenumtoname(18);
                dice.faces[tside].value = Math.max(dice.faces[tside].value-4,0);
                await Database.setFaceToType(dice.id,tside+1,dice.faces[tside].type,db);
                await Database.setFaceToScore(dice.id,tside+1,dice.faces[tside].value,db);
                

                

                
                message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                return false;
            }); 
            break;
        case "diceaugment":
            return new Item(itemid,"Dice Augmentor","Adds one to the value of a random face on your dice.",120,async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                if(await dice.augment(1,db,"roulette",20)){
                    dice = await misc.getormakedice(uid,db);
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                    return true;
                }
                message.channel.sendMessage("Your dice can't be upgraded further from the roulette wheel...");
                return false;
            }); 
            break;
        case "diceaugment3":
            return new Item(itemid,"Big Dice Augmentor","Adds three to the value of a random face on your dice.",120, async function(uid,db,message){
                var dice = await misc.getormakedice(uid,db);
                if(await dice.augment(3,db,"roulette",20)){
                    dice = await misc.getormakedice(uid,db);
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                    return true;
                }
                message.channel.sendMessage("Your dice can't be upgraded further from the roulette wheel...");
                return false;
            }); 
            break;
        case "weightclear":
            return new Item(itemid,"Sandpaper","Removes all modifiers that change the weights on your dice.",120, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                var hmods = dice.removeModifier("H");//so we don't need to grab dice twice, also checks if any mods are removed
                var lmods = dice.removeModifier("L");
                
                if(!hmods && !lmods){
                    message.channel.sendMessage("Your dice has no H or L modifiers!");
                    return false;
                }
                await Database.removeAllMods(dice.id,db,"H");
                await Database.removeAllMods(dice.id,db,"L");
                
                message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "weightrandom":
            return new Item(itemid,"Spatial distorter","Distorts the fabric of spacetime itself to randomise the weights of your dice.",120, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                dice.removeModifier("H");
                dice.removeModifier("L");
                await Database.removeAllMods(dice.id,db,"H");
                await Database.removeAllMods(dice.id,db,"L");
                
                for(var i = 0;i<dice.faces.length;i++)
                {
                    var rng = Math.random()
                    if(rng<0.3)
                    {
                        dice.faces[i].mods.push("L");
                        await Database.addMod(dice.id,(i+1),"L",db);
                    }else if(rng<0.6)
                    {

                        dice.faces[i].mods.push("H");
                        await Database.addMod(dice.id,(i+1),"H",db);
                    }
                }
                
                message.channel.sendMessage("Success! You have distorted the fabric of spacetime!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "modclear":
            return new Item(itemid,"Bucket of white paint","Removes all mods from your dice.",120, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    dice.faces[i].mods = [];
                    
                }
                
                await Database.removeAllMods(dice.id,db);

                message.channel.sendMessage("You dump the bucket of paint on your dice!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "scope":
            return new Item(itemid,"Emoji Binoculars","Let's you spy on an emoji's dice.",100, async function(uid,db,message){
                
                message.channel.sendMessage("Usage: !viewdice :emojiname:");
                return false;
            }); 
            break;
        case "numberscramble":
            return new Item(itemid,"Numberwang","Scramble the numbers on your dice.",100, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                var dscore = 0;
                for(var i = 0;i<dice.faces.length;i++)
                {
                    dscore+= dice.faces[i].value;
                    
                }
                dice.assignFacesScore(dscore,dice.faces.length,0,4);
                
                for(var i = 0;i<dice.faces.length;i++)
                {
                    await Database.setFaceToScore(dice.id,i+1,dice.faces[i].value,db);
                    
                }
                message.channel.sendMessage("That's numberwang!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "numbershifter":
            return new Item(itemid,"Miniature Robin hood","Steals from your dice's highest valued dice's face and distributes it to the other faces.",100, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);//maybe more efficiently get dice id?
                var todist = await Database.removeHalfAndGetVal(dice.id,db);
                for(var i = 0;i<todist;i++)
                {
                    await Database.addOneToRandomFace(dice.id,db);
                }
                var dice = await misc.getormakedice(uid,db);
                
                message.channel.sendMessage("Robin hood steals some score from your richest side and gives some to everyone!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "removeside":
            return new Item(itemid,"Axe of fate","Remove a random face from your dice (can only be used once per dice).",100, async function(uid,db,message){
                
                var dice = await misc.getormakedice(uid,db);
                var axedcount = await Database.getAxeCount(dice.id,db);
                if(axedcount > 0){
                    message.channel.sendMessage("The Axe of fate cannot be used on the same dice twice.");
                    return false;
                }
                await Database.upAxeCount(dice.id,db);
                await Database.deleteRandomFace(dice.id,db);
                var dice = await misc.getormakedice(uid,db);
                
                message.channel.sendMessage("You swing the Axe of fate and chop one of your dice's sides clean off!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "emojireset":
            return new Item(itemid,"Time machine!","THE POWER OF TIME TRAVEL harnessed to let you refight an emoji immidiately.",100, async function(uid,db,message){
                
                if(await misc.getHourly("emojibattle1",uid,db)>0)
                {
                    
                    await misc.setHourly("emojibattle1",0,uid,db);
                    message.channel.sendMessage("You can now fight an emoji!");
                    return true;
                }
                message.channel.sendMessage("You're already capable of fighting an emoji!");
                return false;
            }); 
            break;
         case "precisioncloth":
            return new Item(itemid,"Laser Mod removal","Let's you remove all mods from a face of your choice.",100, async function(uid,db,message){
                var dice = await misc.getormakedice(uid,db);
                
                var rstring = "";
                rstring += "Select a face to remove mods from: \n\n";
                for(var i = 0;i<dice.faces.length;i++)
                {
                    rstring+=i+":"+Dice.readFace(dice.faces[i])+"\n";
                }
                rstring += "\nType in the name of a valid number to select a face, type anything else to cancel.";
                
                
                message.channel.sendMessage(rstring);

                
                var value;
                const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                    maxMatches: 1,
                    time: 60000//60 seconds
                });
                if(responses && responses.size === 1) value = responses.first().content; else{
                    //num = Dice.rint(dnum);
                    message.channel.sendMessage("Time ran out, canceling mod removal useage");
                    return false;
                    //console.log("Time ran out");
                }
                var num = parseInt(value)
                if(!isNaN(num) && num >= 0 && num < dice.faces.length){
                    console.log("MODS: "+dice.faces[Math.floor(num)].mods);
                    if(dice.faces[Math.floor(num)].mods.length == 0){
                        message.channel.sendMessage("There's no mods on that side! Canceling mod removal usage!");
                        return false;
                    }
                    dice.faces[Math.floor(num)].mods = [];
                    await Database.removeModsFromFace(dice.id,Math.floor(num)+1,db);
                    message.channel.sendMessage("Mods removed!\nYour dice's stats are now:\n"+dice.read());
                    return true;
                    
                    
                }else{
                    message.channel.sendMessage("Canceling mod removal usage.");
                    return false;
                    //console.log("Let's go again");
                }
                //-----------------------
                return false;
            }); 
            break;
        default:
            return new Item("garbage","Garbage","Eww, throw it away!",0, async function(uid,db,message){
                
                message.channel.sendMessage("You throw the garbage away.");
                return true;
            }); 
            break;

        }

    }

    constructor(id,name,description,sellprice,execute) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.sellprice = sellprice;
        this.execute = execute;
    }

    read(){

        
        return "this is a real item";
    }

    async use(id,db,message,bonus = 0){
        var s = await this.execute(id,db,message);
        return  s;
    }
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
}

module.exports = Item;