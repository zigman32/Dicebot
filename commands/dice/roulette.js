
const commando = require('discord.js-commando');
const currency = require('../../structures/currency.js');
const Srandom = require('seedrandom');
const Item = require("./item");
const misc = require('../misc.js');
const Dice = require('./diceclass');

//const Itembleh = require('./item');
const MAXSLOTS = 20;

class RouletteCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'roulette',
            aliases: ['roul','spin'],
            group: 'dice',
            memberName: 'roulette',
            description: 'Spin the dice roulette, giving a variety of rewards and prises.',
            args: [
                {
                    key: 'rtype',
                    prompt: 'Play or view?',
                    type: 'string',
                    default: 'view'

                    
                }
            ]
        });

    }
    
    async run(message, args) {
        
        //const MAXSLOTS = 20;
        var ch = message.guild;
        const action = args.rtype;
        var id = message.author.id;
        //var id = uid;//sometimes I forget which I use

        //console.log(item.getItembyID("poprocks").name);
        //return;
        
        
        //console.log(roulette);
        if(action == "view"){
            var d = new Date();
            d.setHours(0,0,0,0);
            //var todaystype = Math.floor((d.getTime()/1000/60/60/24)%18);
            
            var seed = d.getTime();
            var rng= Srandom(seed);
            var roulette = RouletteCommand.buildRoulette(MAXSLOTS,rng,ch,0);
            var resultstring = "";
            //var cost = RouletteCommand.
            var spinstoday = ch.settings.get("Roulette_spinstoday_"+id,0);
            if(misc.daily("spinstoday",id,ch))
            {
                spinstoday = 0;
                ch.settings.set("Roulette_spinstoday_"+id,0);
            }
            var cost = RouletteCommand.getSpinCosts(spinstoday);

            if(cost == false || currency.getReputation(id,ch) < cost.rep){
                resultstring+= "No more spins today without a roulette ticket.\n";
            }else{
                if(cost.money == 0 && cost.rep == 0)
                    resultstring+= "Cost to spin the roulette: FREE\n";
                else{
                    resultstring+= "Cost to spin the roulette: "+cost.money+" "+currency.textPlural()+"\n";
                    
                    
                }

            }
            
            

            resultstring+="Use !roulette spin to spin the roulette. Possible rewards are:\n\n\n"
            for(var i = 0;i<roulette.length;i++)
            {
                resultstring+=roulette[i].desc+"\n";
            }
            message.channel.sendMessage(resultstring);
            if(resultstring.length >= 2000)
            {
                message.channel.sendMessage("Error: Roulette is too large, contact the bot owner!");
                
            }
        }
        if(action == "use" || action == "spin"){

            var spinstoday = ch.settings.get("Roulette_spinstoday_"+id,0);

            
            //spinstoday = 0;
            //console.log("SPINS TODAY: "+spinstoday);
            if(misc.daily("spinstoday",id,ch))
            {
                spinstoday = 0;
                ch.settings.set("Roulette_spinstoday_"+id,0);
            }
            var cost = RouletteCommand.getSpinCosts(spinstoday);

            if(cost == false || currency.getReputation(id,ch) < cost.rep){
                message.channel.sendMessage("You can't spin again today!");
                return;

            }
            if(cost.money>currency.getBalance(id,"dollar",ch)){
                message.channel.sendMessage("You can't afford another spin!");
                return;
            }
            
            currency.changeBalance(id,-cost.money,"dollar",ch);

            //----------spin-------------
            RouletteCommand.cleanSpin(id,ch,message);
            ch.settings.set("Roulette_spinstoday_"+id,spinstoday+1);

            
        }
        

        
		
    }

    static async cleanSpin(id,ch,message){
        var d = new Date();
        d.setHours(0,0,0,0);
        var seed = d.getTime();
        var rng= Srandom(seed);

        var roulette = RouletteCommand.buildRoulette(MAXSLOTS,rng,ch,0);

        message.channel.sendMessage("Spinning...").then((msg)=>{
            setTimeout(async function(){msg.edit("Spinning....").then((msg)=>{     
            setTimeout(async function(){msg.edit("Spinning.....").then((msg)=>{    
            setTimeout(async function(){msg.edit("Spinning......").then((msg)=>{     
            setTimeout(async function(){RouletteCommand.spin(roulette,id,ch,message)},1000)});},1000)});},1000)});},1000)});

            
        //return RouletteCommand.spin(roulette,id,ch,message);

    }

    static async spin(roulette,id,ch,message){
        
        var spin = Dice.rint(roulette.length);
        var prize = roulette[spin];
        //console.log(roulette[spin]);
        var canpop = misc.hasItem("poprocks",id,ch) && prize.item != "";
        var poprockdialogue = "";
        if(canpop)
            poprockdialogue = "\nRespond with item to use your pop rocks and save the effect as an item"
        message.channel.sendMessage("You win: "+prize.desc+"\nWould you like to claim your prize?\n(Respond with yes or no to confirm or deny."+poprockdialogue+")")
        
        while(true)
        {    
            var value;
            var use = true;
            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                maxMatches: 1,
                time: 120000
            });
            if(responses && responses.size === 1) value = responses.first().content; else{
                
                message.channel.sendMessage("Prize refused!");
                return;
            }
            const lc = value.toLowerCase();
            if(lc === 'yes' || (lc === 'item'&&canpop) || lc === 'no'){ 
                if(lc === 'item')
                {
                    var theitem;
                    theitem = Item.getItembyID(prize.item);
                    misc.addToInventory(prize.item,id,ch);
                    misc.consumeItem("poprocks",id,ch);
                    message.channel.sendMessage("You gained 1 "+theitem.name);
                }else
                if(lc === 'yes'){
                    message.channel.sendMessage(prize.desc+"\n"+prize.effect(id,ch,prize.number));
                }else{
                    message.channel.sendMessage("Prize refused!");
                    return;
                }
                
                return;
            }else{
                message.channel.sendMessage("Invalid input, please try again.");
            }    

        }
        
        //console.log("prize or something");
    }

    static buildRoulette(MAXSLOTS,rng,ch,reputation){
        //var rng= Srandom(seed);
        //var todaysroulette = ch.settings.get("DICE_roulette",false);
        //if(todaysroulette == false || todaysroulette.exptime < new Date().getTime())
        //{
            var pool = RouletteCommand.roulettePool(reputation);

            var theroulette = [];

            var weights = [];
            for(var i = 0;i<pool.length;i++){
                weights.push(pool[i].weight);
            }

            for(var i = 0;i<MAXSLOTS;i++){
                var candidate = RouletteCommand.rweights(pool,weights,rng);
                
                var mydesc = candidate.desc;
                var itemval = candidate.item;
                //console.log(candidate.desc);
                var rnum = Math.floor(rng()*(candidate.max-candidate.min)+candidate.min);
                
                if(mydesc.includes("[n]"))
                {
                    //console.log("RNUM: "+rnum);
                    mydesc = mydesc.replace("[n]",""+rnum);
                }
                if(/\[m\d+]/.test(mydesc) )
                {
                    var level = /\[m(\d+)]/.exec(mydesc)[1];
                    var mymod = RouletteCommand.getRandomModifier(i,"level"+level,ch);
                    mydesc = mydesc.replace("[m"+level+"]",mymod);
                    rnum = mymod;//Need to change number to just extradata
                    itemval = itemval.replace("[m"+level+"]",mymod);
                }
                if(mydesc.includes("[t]")){
                    var ttype = Dice.typenumtoname(Math.floor(rng()*18));
                    mydesc = mydesc.replace("[t]",ttype);
                    itemval = itemval.replace("[t]",ttype);
                    rnum = ttype;
                    
                }
                if(rng()<0.2 && itemval != "")
                {
                    var name = Item.getItembyID(itemval).name;
                    var mynewdesc = "Gain item: "+name;
                    
                    theroulette.push({desc:mynewdesc, number:0, effect:function(uid,ch,number=0){
                        
                                misc.addToInventory(itemval,uid,ch);
                                return "A "+name+" was added to your inventory!";
                        
                    }, item:""});
                }else{
                    theroulette.push({desc:mydesc, number:rnum, effect:candidate.effect, item:itemval});
                }
                
            }
            
            return theroulette;
        
            
        
        return theroulette;

    }

    static roulettePool(reputation){
        var pool = [];
        pool.push({desc:"Gain [n] "+currency.textPlural(),effect:function(uid,ch,number=0){

            currency.changeBalance(uid,number,"dollar",ch);
            return "You gained "+number+" "+currency.textPlural();

        },weight:100,min:200,max:500,item:""});
        pool.push({desc:"Gain [n] "+currency.textPlural(),effect:function(uid,ch,number=0){

            currency.changeBalance(uid,number,"dollar",ch);
            return "You gained "+number+" "+currency.textPlural();

        },weight:10,min:2000,max:5000,item:""});

        pool.push({desc:"Gain [n] reputation",effect:function(uid,ch,number=0){
            
                        currency.addReputation(number,uid,ch);
                        return "You gained "+number+" reputation!";
            
        },weight:80,min:10,max:20,item:""});
        pool.push({desc:"Gain [n] reputation",effect:function(uid,ch,number=0){
            
                        currency.addReputation(number,uid,ch);
                        return "You gained "+number+" reputation!";
            
        },weight:8,min:100,max:200,item:""});
        pool.push({desc:"+1 to your active dice.",effect:function(uid,ch,number=0){
            
                        var dice = misc.getormakedice(uid,ch);
                        if(dice.augment(1,"roulette",20)){
                            misc.setdice(dice,uid,ch);
                            return "Your dice's stats are now:\n"+dice.read();
                        }
                        return "Your dice can't be upgraded further from the roulette wheel...";
            
        },weight:40,min:0,max:0,item:"diceaugment"});
        pool.push({desc:"+3 to your active dice.",effect:function(uid,ch,number=0){
            
                        var dice = misc.getormakedice(uid,ch);
                        if(dice.augment(3,"roulette",20)){
                            misc.setdice(dice,uid,ch);
                            return "Your dice's stats are now:\n"+dice.read();
                        }
                        return "Your dice can't be upgraded further from the roulette wheel...";
            
        },weight:6,min:0,max:0,item:"diceaugment3"});
        pool.push({desc:"Add the \"[m1]\" mod to your active dice.",effect:function(uid,ch,number=0){
            
                    var dice = misc.getormakedice(uid,ch);
                    if(dice.addMod(number))
                    {   
                        misc.setdice(dice,uid,ch);
                        return "Mod applied! Your dice's stats are now:\n"+dice.read();
                    }else{
                        return "Sorry! Your dice can't accept that mod!";
                        //return false;
                    }
            
        },weight:30,min:0,max:0,item:"addmod|[m1]"});
        pool.push({desc:"Add the \"[m2]\" mod to your active dice.",effect:function(uid,ch,number=0){
            
                    var dice = misc.getormakedice(uid,ch);
                    if(dice.addMod(number))
                    {   
                        misc.setdice(dice,uid,ch);
                        return "Mod applied! Your dice's stats are now:\n"+dice.read();
                    }else{
                        return "Sorry! Your dice can't accept that mod!";
                        //return false;
                    }
            
        },weight:20,min:0,max:0,item:"addmod|[m2]"});
        pool.push({desc:"Add the \"[m3]\" mod to your active dice.",effect:function(uid,ch,number=0){
            
                    var dice = misc.getormakedice(uid,ch);
                    if(dice.addMod(number))
                    {   
                        misc.setdice(dice,uid,ch);
                        return "Mod applied! Your dice's stats are now:\n"+dice.read();
                    }else{
                        return "Sorry! Your dice can't accept that mod!";
                        //return false;
                    }
            
        },weight:10,min:0,max:0,item:"addmod|[m3]"});
        pool.push({desc:"Add the \"[m4]\" mod to your active dice.",effect:function(uid,ch,number=0){
            
                    var dice = misc.getormakedice(uid,ch);
                    if(dice.addMod(number))
                    {   
                        misc.setdice(dice,uid,ch);
                        return "Mod applied! Your dice's stats are now:\n"+dice.read();
                    }else{
                        return "Sorry! Your dice can't accept that mod!";
                        //return false;
                    }
            
        },weight:5,min:0,max:0,item:"addmod|[m4]"});


        pool.push({desc:"Gain Item: Roulette Ticket",effect:function(uid,ch,number=0){
            
                    misc.addToInventory("rouletteticket",uid,ch,)
                    return "A Roulette Ticket was added to your inventory!"
            
        },weight:6,min:0,max:0,item:""});
        
        pool.push({desc:"Gain Item: Laser Mod removal",effect:function(uid,ch,number=0){
            
                    misc.addToInventory("precisioncloth",uid,ch,)
                    return "A Laser Mod removal was added to your inventory!"
            
        },weight:1,min:0,max:0,item:""});
        
        pool.push({desc:"Reset Emoji battle timer",effect:function(uid,ch,number=0){
            
            if(misc.getHourly("emojibattle1",uid,ch)>0)
            {
                
                misc.setHourly("emojibattle1",0,uid,ch);
                return "The timer has been reset! You can now battle another emoji!";
            }
            return "Sorry! You're already able to battle an emoji!";
                        
        },weight:15,min:0,max:0,item:"emojireset"});
        
        pool.push({desc:"Randomise the types on your dice",effect:function(uid,ch,number=0){
            
                var dice = misc.getormakedice(uid,ch);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    var ttype = Dice.rint(18);
                    if(Math.random() < 0.02)
                        ttype = 18;
                    dice.faces[i].type = Dice.typenumtoname(ttype);
                }
                misc.setdice(dice,uid,ch);
                return "Types randomized! Your dice's stats are now:\n"+dice.read();
                        
        },weight:20,min:0,max:0,item:"typescrambler"});
        
        pool.push({desc:"Clear all mods from your dice",effect:function(uid,ch,number=0){
            
                var dice = misc.getormakedice(uid,ch);
                for(var i = 0;i<dice.faces.length;i++)
                {
                    dice.faces[i].mods = [];
                    
                }
                
                misc.setdice(dice,uid,ch);
                return "Mods removed!\nYour dice's stats are now:\n"+dice.read();
                        
        },weight:6,min:0,max:0,item:"modclear"});
        
        pool.push({desc:"Move score from dice's highest valued face to other faces!",effect:function(uid,ch,number=0){
            
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

            misc.setdice(dice,uid,ch);
            return "Scores redistributed!\nYour dice's stats are now:\n"+dice.read();
            
                        
        },weight:10,min:0,max:0,item:"numbershifter"});
        
        pool.push({desc:"Gain Item: [n]x pop rocks",effect:function(uid,ch,number=0){
            
                misc.addToInventory("poprocks",uid,ch,number)
                return "You gained "+number+" Pop Rocks!";
            
        },weight:10,min:2,max:5,item:""});
        pool.push({desc:"Gain Item: [n]x Emoji Binoculars",effect:function(uid,ch,number=0){
            
                misc.addToInventory("scope",uid,ch,number)
                return "You gained "+number+" Emoji Binoculars!";
            
        },weight:10,min:5,max:10,item:""});
        
        pool.push({desc:"Change a type on your dice to [t].",effect:function(uid,ch,number=0){
            
            var dice = misc.getormakedice(uid,ch);
            var ctypes = [];
            for(var i = 0;i<dice.faces.length;i++)
            {
                if(number != dice.faces[i].type && ctypes.indexOf(dice.faces[i].type) < 0)
                    ctypes.push(dice.faces[i].type);
            }
            if(ctypes.length == 0)
            {
                message.channel.sendMessage("All of your dice's sides are already "+number+" type.");
                return false;
            }
            var ttype = ctypes[Dice.rint(ctypes.length)];
            for(var i = 0;i<dice.faces.length;i++)
            {
                if(ttype == dice.faces[i].type)
                    dice.faces[i].type = number;
            }
            misc.setdice(dice,uid,ch);
            return "Your dice's stats are now:\n"+dice.read();
            
        },weight:15,min:0,max:0,item:"changetype|[t]"});
        
        pool.push({desc:"Remove all weight modifiers",effect:function(uid,ch,number=0){
            
            var dice = misc.getormakedice(uid,ch);
            var hmods = dice.removeModifier("H");
            var lmods = dice.removeModifier("L");
            
            
            misc.setdice(dice,uid,ch);
            return "Weight modifiers cleared!\nYour dice's stats are now:\n"+dice.read();
            
        },weight:6,min:0,max:0,item:"weightclear"});
        
        pool.push({desc:"Randomise your dice's weights",effect:function(uid,ch,number=0){
            
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
            return "Weights rebalanced!\nYour dice's stats are now:\n"+dice.read();
            
            
        },weight:2,min:0,max:0,item:"weightrandom"});
        

        pool.push({desc:"Randomise your dice's scores",effect:function(uid,ch,number=0){
            
            var dice = misc.getormakedice(uid,ch);
            var dscore = 0;
            for(var i = 0;i<dice.faces.length;i++)
            {
                dscore+= dice.faces[i].value;
                
            }
            dice.assignFacesScore(dscore,dice.faces.length,0,4);
            misc.setdice(dice,uid,ch);
            
            
            return "Numbers scrambled!\nYour dice's stats are now:\n"+dice.read();
            
            
        },weight:6,min:0,max:0,item:"numberscramble"});
        
        pool.push({desc:"Remove a random face from your dice!!! (max: 1 face removed)",effect:function(uid,ch,number=0){
            
            var dice = misc.getormakedice(uid,ch);
            var used = dice.axeSide();
            if(!used)
            {
                return "Your dice already had a face removed!";
                return false;
            }
            misc.setdice(dice,uid,ch);
            return "Once of your dice's sides comes clean off!\nYour dice's stats are now:\n"+dice.read();
            
            
            
        },weight:1,min:0,max:0,item:"removeside"});
        
        pool.push({desc:"Mutate a face to "+Item.capitalizeFirstLetter(Dice.typenumtoname(18))+" type (at a minor penalty to score)!",effect:function(uid,ch,number=0){
            
                var dice = misc.getormakedice(uid,ch);

                var choices = [];
                for(var i = 0;i<dice.faces.length;i++){
                    if(dice.faces[i].type != Dice.typenumtoname(18))
                    {
                        choices.push(i);
                    }
                }
                if(choices.length <= 0){
                    return "Lucky you! All of your dice's sides are already "+Dice.typenumtoname(18)+" type!";
                    return false;
                    
                }
                //console.log(choices);
                var tside = choices[Dice.rint(choices.length)];
                dice.faces[tside].type = Dice.typenumtoname(18);
                dice.faces[tside].value = Math.max(dice.faces[tside].value-4,0);
                

                

                misc.setdice(dice,uid,ch);
                return "Your dice's stats are now:\n"+dice.read();
            
            
        },weight:1,min:0,max:0,item:"ultmutate"});
        

        return pool;
                    
    }





    static rweights(list, weight,rng)
    {
        //var rng= Srandom(seed);
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });
        
        var random_num = Math.floor(rng()*total_weight);
        var weight_sum = 0;
        
        for (var i = 0; i < list.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);
            
            if (random_num <= weight_sum) {
                return list[i];
            }
        }
     
    }

    static getRandomModifier(slot,type,ch){//kinda hacky
        var titem = ch.settings.get("ROULETTE_mod"+slot,false);
        var d = new Date();
        if(titem == false || titem.exptime < d.getTime())
        {
            var edate = new Date();
            edate.setHours(24,0,0,0);
            var amod = Dice.getRandomModifiers(type,0,-1)[0];
            ch.settings.set("ROULETTE_mod"+slot,{mod:amod,expdate:edate.getTime()});
            return amod;
        }
        return titem.mod;
    }

    static getSpinCosts(spins){
        switch(spins){
            case 0:
                return {money:0,rep:0};
                break;
            case 1:
                return {money:300,rep:100};
                break;
            case 2:
                return {money:1500,rep:500};
                break;
            case 3:
                return {money:5000,rep:1500};
                break;
            default:
                return false;
                break;
            
        }
    }
}

module.exports = RouletteCommand;