const misc = require('../misc.js');
const Dice = require('./diceclass');


class Item {
    
    static getItembyID(itemid){

        if(itemid.includes("|"))
        {
            var chips = itemid.split("|");
            if(chips[0] == "addmod")
            {
                return new Item(itemid,"\""+chips[1]+"\" sticker","Adds the "+chips[1]+" mod to a random face on your dice.",20,async function(uid,ch,message){
                    var dice = misc.getormakedice(uid,ch);
                    if(dice.addMod(chips[1]))
                    {   
                        misc.setdice(dice,uid,ch);
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
                return new Item(itemid,"Change type: \""+chips[1]+"\"","Changes all of one type on your dice to "+chips[1]+".",20,async function(uid,ch,message){
                    var dice = misc.getormakedice(uid,ch);
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
                    var ttype = ctypes[Dice.rint(ctypes.length)];
                    for(var i = 0;i<dice.faces.length;i++)
                    {
                        if(ttype == dice.faces[i].type)
                            dice.faces[i].type = chips[1];
                    }
                    misc.setdice(dice,uid,ch);
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                });
            }
        }


        switch(itemid){
        case "poprocks":
            return new Item(itemid,"Pop rocks","When aplicable, the result of your next roulette spin will pop out and be given as an item instead of used automatically.",50,function(uid,ch,message){
                
                message.channel.sendMessage("These items will be used automatically when you spin the roulette.");
                return false;
            });            
            break;
        case "rouletteticket":
            return new Item(itemid,"Roulette Ticket","Lets you spin the roulette for free (use your ticket to spin!).",100, async function(uid,ch,message){
                const roulette = require('./roulette');
                roulette.cleanSpin(uid,ch,message);
                return true;
            }); 
            break;
        case "typescrambler":
            return new Item(itemid,"Rainbow","It's very pretty. Also changes your dice's types to random types.",100, async function(uid,ch,message){
                var dice = misc.getormakedice(uid,ch);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    var ttype = Dice.rint(18);
                    if(Math.random() < 0.02)
                        ttype = 18;
                    dice.faces[i].type = Dice.typenumtoname(ttype);
                }
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("Eww, you got rainbow juice all over your dice!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "ultmutate":
            return new Item(itemid,Item.capitalizeFirstLetter(Dice.typenumtoname(18))+" Type Mutator","Changes a random side of your dice to the "+Dice.typenumtoname(18)+" type (at the cost of a small amount of score).",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);

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
                //console.log(choices);
                var tside = choices[Dice.rint(choices.length)];
                dice.faces[tside].type = Dice.typenumtoname(18);
                dice.faces[tside].value = Math.max(dice.faces[tside].value-4,0);
                

                

                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                return false;
            }); 
            break;
        case "diceaugment":
            return new Item(itemid,"Dice Augmentor","Adds one to the value of a random face on your dice.",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                if(dice.augment(1,"roulette",20)){
                    misc.setdice(dice,uid,ch);
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                    return true;
                }
                message.channel.sendMessage("Your dice can't be upgraded further from the roulette wheel...");
                return false;
            }); 
            break;
        case "diceaugment3":
            return new Item(itemid,"Big Dice Augmentor","Adds three to the value of a random face on your dice.",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                if(dice.augment(3,"roulette",20)){
                    misc.setdice(dice,uid,ch);
                    message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                    return true;
                }
                message.channel.sendMessage("Your dice can't be upgraded further from the roulette wheel...");
                return false;
            }); 
            break;
        case "weightclear":
            return new Item(itemid,"Sandpaper","Removes all modifiers that change the weights on your dice.",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                var hmods = dice.removeModifier("H");
                var lmods = dice.removeModifier("L");
                
                if(!hmods && !lmods){
                    message.channel.sendMessage("Your dice has no H or L modifiers!");
                    return false;
                }
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("Your dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "weightrandom":
            return new Item(itemid,"Spatial distorter","Distorts the fabric of spacetime itself to randomise the weights of your dice.",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                dice.removeModifier("H");
                dice.removeModifier("L");
                for(var i = 0;i<dice.faces.length;i++)
                {
                    if(Math.random()<0.3)
                    {
                        dice.faces[i].mods.push("L");
                    }else if(Math.random()<0.4)
                    {
                        dice.faces[i].mods.push("H");
                    }
                }
                
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("Success! You have distorted the fabric of spacetime!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "modclear":
            return new Item(itemid,"Bucket of white paint","Removes all mods from your dice.",120, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    dice.faces[i].mods = [];
                    
                }
                
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("You dump the bucket of paint on your dice!\nYour dice's stats are now:\n"+dice.read());
                return true;
            }); 
            break;
        case "scope":
            return new Item(itemid,"Emoji Binoculars","Let's you spy on an emoji's dice.",100, function(uid,ch,message){
                
                message.channel.sendMessage("Usage: !viewdice :emojiname:");
                return false;
            }); 
            break;
        case "numberscramble":
            return new Item(itemid,"Numberwang","Scramble the numbers on your dice.",100, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                var dscore = 0;
                for(var i = 0;i<dice.faces.length;i++)
                {
                    dscore+= dice.faces[i].value;
                    
                }
                dice.assignFacesScore(dscore,dice.faces.length,0,4);
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("That's numberwang!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "numbershifter":
            return new Item(itemid,"Miniature Robin hood","Steals from your dice's highest valued dice's face and distributes it to the other faces.",100, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                var maxdscore = 0;
                var maxdscoreindex = 0;
                for(var i = 0;i<dice.faces.length;i++)
                {

                    if(maxdscore< dice.faces[i].value)
                    {
                        maxdscore = dice.faces[i].value;
                        maxdscoreindex = i;
                    }
                    
                }
                var robbed = Math.ceil(dice.faces[maxdscoreindex].value/2);
                dice.faces[maxdscoreindex].value-=robbed;

                for(var i = 0;i<robbed;i++)
                {
                    dice.faces[Dice.rint(dice.faces.length)].value++;
                }

                //dice.assignFacesScore(dscore,dice.faces.length,0,4);
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("Robin hood redistributes the wealth!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "removeside":
            return new Item(itemid,"Axe of fate","Remove a random face from your dice (can only be used once per dice).",100, function(uid,ch,message){
                
                var dice = misc.getormakedice(uid,ch);
                var used = dice.axeSide();
                if(!used)
                {
                    message.channel.sendMessage("The Axe of fate cannot be used on the same dice twice.");
                    return false;
                }
                misc.setdice(dice,uid,ch);
                message.channel.sendMessage("You swing the Axe of fate and chop one of your dice's sides clean off!\nYour dice's stats are now:\n"+dice.read());
                
                return true;
            }); 
            break;
        case "emojireset":
            return new Item(itemid,"Time machine!","THE POWER OF TIME TRAVEL harnessed to let you refight an emoji immidiately.",100, function(uid,ch,message){
                
                if(misc.getHourly("emojibattle1",uid,ch)>0)
                {
                    
                    misc.setHourly("emojibattle1",0,uid,ch);
                    message.channel.sendMessage("You can now fight an emoji!");
                    return true;
                }
                message.channel.sendMessage("You're already capable of fighting an emoji!");
                return false;
            }); 
            break;
         case "precisioncloth":
            return new Item(itemid,"Laser Mod removal","Let's you remove all mods from a face of your choice.",100, async function(uid,ch,message){
                var dice = misc.getormakedice(uid,ch);
                
                var rstring = "";
                rstring += "Select a face to remove mods from: \n\n";
                for(var i = 0;i<dice.faces.length;i++)
                {
                    rstring+=i+":"+Dice.readFace(dice.faces[i])+"\n";
                }
                rstring += "\nType in the name of a valid number to select a face, type anything else to cancel.";
                
                
                message.channel.sendMessage(rstring);

                //-----------------------
                //again = false;
                //console.log("Begining of loop");
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
                    
                    dice.faces[Math.floor(num)].mods = [];
                    message.channel.sendMessage("Mods removed!\nYour dice's stats are now:\n"+dice.read());
                    misc.setdice(dice,uid,ch);
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
            return new Item("garbage","Garbage","Eww, throw it away!",0, function(uid,ch,message){
                
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

    async use(id,ch,message,bonus = 0){
        var s = this.execute(id,ch,message);
        console.log("AND THE WINNER IS: "+s);
        return  s;
    }
    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
}

module.exports = Item;