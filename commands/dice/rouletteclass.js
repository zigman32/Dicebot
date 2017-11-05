const misc = require('../misc.js');
const Database = require('../../structures/database');
const Dice = require('./diceclass')
const Item = require('./item')
const Currency = require('../../structures/Currency');
/*
TODO:

ultmutate
randomtype

*/
class RouletteItem {
    
    constructor(id,extra){
        this.id = id;
        this.extra = extra;
    }

    static rrangewhole(min,max){//INCLUSIVE EITHER WAY
        return Math.floor(Math.random() * (1+max - min) + min);
    }

    generate(rarity = 1){
        
            var pool = [];
            pool.push( {id:"gaincurrency",weight:100,extra:RouletteItem.rrangewhole(200,500),item:""});
            pool.push( {id:"gaincurrency",weight:100,extra:RouletteItem.rrangewhole(2000,5000),item:""});
            pool.push( {id:"gainreputation",weight:80,extra:RouletteItem.rrangewhole(10,20),item:""});
            pool.push( {id:"gainreputation",weight:8,extra:RouletteItem.rrangewhole(100,200),item:""});
            pool.push( {id:"diceplus1",weight:40,extra:0,item:"diceaugment"});
            pool.push( {id:"diceplus3",weight:6,extra:0,item:"diceaugment3"});
            pool.push( {id:"addmod",weight:30,extra:Dice.getRandomModifiers("level1",0,-1)[0],item:"addmod|#"});
            pool.push( {id:"addmod",weight:20,extra:Dice.getRandomModifiers("level2",0,-1)[0],item:"addmod|#"});
            pool.push( {id:"addmod",weight:10,extra:Dice.getRandomModifiers("level3",0,-1)[0],item:"addmod|#"});
            pool.push( {id:"addmod",weight:5,extra:Dice.getRandomModifiers("level4",0,-1)[0],item:"addmod|#"});
            pool.push( {id:"gainticket",weight:6,extra:0,item:""});    
            pool.push( {id:"gaindicecloth",weight:1,extra:0,item:""});
            pool.push( {id:"resetemoji",weight:15,extra:0,item:"emojireset"});
            pool.push( {id:"randomtype",weight:20,extra:0,item:"typescrambler",});
            pool.push( {id:"clearmod",weight:6,extra:0,item:"modclear"});
            pool.push( {id:"robinhood",weight:10,extra:0,item:"numbershifter"});
            pool.push( {id:"gainrocks",weight:10,extra:RouletteItem.rrangewhole(2,5),item:""});
            pool.push( {id:"gainscope",weight:10,extra:RouletteItem.rrangewhole(5,10),item:""});
            pool.push( {id:"changetype",weight:15,extra:Dice.typenumtoname(RouletteItem.rrangewhole(0,17)),item:"changetype|#"});
            pool.push( {id:"clearweight",weight:6,extra:0,item:"weightclear"});
            pool.push( {id:"randomiseweights",weight:2,extra:0,item:"weightrandom"});
            pool.push( {id:"randomisescores",weight:6,extra:0,item:"numberscramble"}); 
            pool.push( {id:"removeface",weight:1,extra:0,item:"removeside"});          
            pool.push( {id:"ultmutate",weight:1,extra:0,item:"ultmutate"});

            var weights = [];
            for(var i = 0;i<pool.length;i++){
                weights.push(pool[i].weight);
            }


            var candidate = RouletteItem.rweights(pool,weights);
            if(candidate.item != "" && Math.random()<0.2){
                this.id = "gainitem";
                this.extra = candidate.item.replace("#",candidate.extra);
            }else
            {
                this.id = candidate.id;
                this.extra = candidate.extra;
            }
            this.id = candidate.id;
            this.extra = candidate.extra;
            //return candidatel;
    }

    toSpinnable(){
        switch(this.id)
        {
            case "gaincurrency":
                    return {desc:"Gain "+this.extra+" "+Currency.textPlural(),effect: async function(uid,db,extra=0){
            
                        await Currency.addMoney(uid,extra,db);
                        return "You gained "+extra+" "+Currency.textPlural();
            
                    },weight:100,extra:this.extra,item:""};
                    
            case "gainreputation":
                    return {desc:"Gain "+this.extra+" reputation",effect: async function(uid,db,extra=0){
                        
                                    await Currency.addReputation(extra,uid,db);
                                    return "You gained "+extra+" reputation!";
                        
                    },weight:80,extra:this.extra,item:""};
            case "diceplus1":
                    return {desc:"+1 to your active dice.",effect: async function(uid,db,extra=0){
                        
                                    var dice = await misc.getormakedice(uid,db);
                                   
                                    if(await dice.augment(1,db,"roulette",20)){
                                        dice = await misc.getormakedice(uid,db);
                                        return "Your dice's stats are now:\n"+dice.read();
                                    }
                                    return "Your dice can't be upgraded further from the roulette wheel...";
                        
                    },weight:40,extra:this.extra,item:"diceaugment"};
            case "diceplus3":
                    return {desc:"+3 to your active dice.",effect: async function(uid,db,extra=0){
                        
                                    var dice = await misc.getormakedice(uid,db);
                                    if(await dice.augment(3,db,"roulette",20)){
                                        dice = await misc.getormakedice(uid,db);
                                        
                                        return "Your dice's stats are now:\n"+dice.read();
                                    }
                                    return "Your dice can't be upgraded further from the roulette wheel...";
                        
                    },weight:6,extra:this.extra,item:"diceaugment3"};
            case "addmod":
                    return {desc:"Add the \""+this.extra+"\" mod to your active dice.",effect: async function(uid,db,extra=0){
                            
                       
                                var dice = await misc.getormakedice(uid,db);
                                if(await dice.addMod(extra,db))
                                {   
                                    return "Mod applied! Your dice's stats are now:\n"+dice.read();
                                }else{
                                    return "Sorry! Your dice can't accept that mod!";
                                    //return false;
                                }
                        
                    },weight:30,extra:this.extra,item:"addmod|"+this.extra};
            
            case "gainticket":
                    return {desc:"Gain Item: Roulette Ticket",effect: async function(uid,db,extra=0){
                        
                                await misc.addToInventory("rouletteticket",uid,db,)
                                return "A Roulette Ticket was added to your inventory!"
                        
                    },weight:6,extra:this.extra,item:""};
            case "gaindicecloth":
                    return {desc:"Gain Item: Laser Mod removal",effect: async function(uid,db,extra=0){
                        
                            await misc.addToInventory("precisioncloth",uid,db,)
                            return "A Laser Mod removal was added to your inventory!"
                        
                    },weight:1,extra:this.extra,item:""};
            case "gainitem":
                    var itemname = Item.getItembyID(this.extra).name;
                    return {desc:"Gain Item: "+itemname+"",effect: async function(uid,db,extra=0){
                        
                            await misc.addToInventory(extra,uid,db,);
                            var itemname = Item.getItembyID(extra).name;
                            return "A "+itemname+" was added to your inventory!"
                        
                    },weight:0,extra:this.extra,item:""};
            case "resetemoji":
                    return {desc:"Reset Emoji battle timer",effect: async function(uid,db,extra=0){
                        
                        if(await misc.getHourly("emojibattle1",uid,db)>0)
                        {
                            
                            await misc.setHourly("emojibattle1",0,uid,db);
                            return "The timer has been reset! You can now battle another emoji!";
                        }
                        return "Sorry! You're already able to battle an emoji!";
                                    
                    },weight:15,extra:this.extra,item:"emojireset"};
            case "randomtype":
                    return {desc:"Randomise the types on your dice",effect: async function(uid,db,extra=0){
                        
                        var dice = await misc.getormakedice(uid,db);
                        for(var i = 0;i<dice.faces.length;i++)
                        {
                            var ttype = Dice.rint(18);
                            if(Math.random() < 0.02)
                                ttype = 18;
                            dice.faces[i].type = Dice.typenumtoname(ttype);
                            await Database.setFaceToType(dice.id,(i+1),dice.faces[i].type,db);
                        }
                        return "Types randomized! Your dice's stats are now:\n"+dice.read();
                                    
                    },weight:20,extra:this.extra,item:"typescrambler"};
            case "clearmod":
                    return {desc:"Clear all mods from your dice",effect: async function(uid,db,extra=0){
                        var dice = await misc.getormakedice(uid,db);
                        for(var i = 0;i<dice.faces.length;i++)
                        {
                            dice.faces[i].mods = [];
                            
                        }
                        
                        await Database.removeAllMods(dice.id,db);
                        return "Mods removed!\nYour dice's stats are now:\n"+dice.read();
                                    
                    },weight:6,extra:this.extra,item:"modclear"};
            case "robinhood":
                    return {desc:"Move score from dice's highest valued face to other faces!",effect: async function(uid,db,extra=0){
                        
                        var dice = await misc.getormakedice(uid,db);
                        var todist = await Database.removeHalfAndGetVal(dice.id,db);
                        for(var i = 0;i<todist;i++)
                        {
                            await Database.addOneToRandomFace(dice.id,db);
                        }
                        var dice = await misc.getormakedice(uid,db);
                        return "Scores redistributed!\nYour dice's stats are now:\n"+dice.read();
                        
                                    
                    },weight:10,extra:this.extra,item:"numbershifter"};
            case "gainrocks":
                    return {desc:"Gain Item: "+this.extra+"x pop rocks",effect: async function(uid,db,extra=0){
                        
                            await misc.addToInventory("poprocks",uid,db,extra)
                            return "You gained "+extra+" Pop Rocks!";
                        
                    },weight:10,extra:this.extra,min:2,max:5,item:""};
            case "gainscope":
                    return {desc:"Gain Item: "+this.extra+"x Emoji Binoculars",effect: async function(uid,db,extra=0){
                        
                            await misc.addToInventory("scope",uid,db,extra)
                            return "You gained "+extra+" Emoji Binoculars!";
                        
                    },weight:10,extra:this.extra,min:5,max:10,item:""};
            case "changetype":
                    return {desc:"Change a type on your dice to "+this.extra+".",effect: async function(uid,db,extra=0){
                        var dice = await misc.getormakedice(uid,db);
                        var ctypes = [];
                        for(var i = 0;i<dice.faces.length;i++)
                        {
                            if(extra != dice.faces[i].type && ctypes.indexOf(dice.faces[i].type) < 0)
                                ctypes.push(dice.faces[i].type);
                        }
                        if(ctypes.length == 0)
                        {
                            
                            return "All of your dice's sides are already "+extra+" type.";
                            return false;
                        }
                        var changefrom = ctypes[Dice.rint(ctypes.length)];
                        var changeto = extra;
                        await Database.changeTypeAToB(dice.id,changefrom,changeto,db);
                        for(var i = 0;i<dice.faces.length;i++)//don't need to double get dice
                        {
                            if(changefrom == dice.faces[i].type)
                                dice.faces[i].type = changeto;
                        }
                        return "Your dice's stats are now:\n"+dice.read();
                        
                    },weight:15,extra:this.extra,item:"changetype|"+this.extra};
            case "clearweight":
                    return {desc:"Remove all weight modifiers",effect: async function(uid,db,extra=0){
                        
                        var dice = await misc.getormakedice(uid,db);
                        var hmods = dice.removeModifier("H");
                        var lmods = dice.removeModifier("L");
                        
                        await Database.removeAllMods(dice.id,db,"H");
                        await Database.removeAllMods(dice.id,db,"L");
                        
                        
                        //misc.setdice(dice,uid,db);
                        return "Weight modifiers cleared!\nYour dice's stats are now:\n"+dice.read();
                        
                    },weight:6,extra:this.extra,item:"weightclear"};
            case "randomiseweights":
                    return {desc:"Randomise your dice's weights",effect: async function(uid,db,extra=0){
                        
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
                        return "Weights rebalanced!\nYour dice's stats are now:\n"+dice.read();
                        
                        
                    },weight:2,extra:this.extra,item:"weightrandom"};
                    
            case "randomisescores":
                    return {desc:"Randomise your dice's scores (Preserving the total score)",effect: async function(uid,db,extra=0){
                        
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
                    
                        
                        return "Numbers scrambled!\nYour dice's stats are now:\n"+dice.read();
                        
                        
                    },weight:6,extra:this.extra,item:"numberscramble"};
            case "removeface":
                    return {desc:"Remove a random face from your dice!!! (max: 1 face removed)",effect: async function(uid,db,extra=0){
                        var dice = await misc.getormakedice(uid,db);
                        var axedcount = await Database.getAxeCount(dice.id,db);
                        if(axedcount > 0){
                            return "Your dice already had a face removed!";
                            
                        }
                        await Database.upAxeCount(dice.id,db);
                        await Database.deleteRandomFace(dice.id,db);
                        var dice = await misc.getormakedice(uid,db);
                        return "Once of your dice's sides comes clean off!\nYour dice's stats are now:\n"+dice.read();
                        

                        
                        
                    },weight:1,extra:this.extra,item:"removeside"};
            case "ultmutate":
                    return {desc:"Mutate a face to "+Item.capitalizeFirstLetter(Dice.typenumtoname(18))+" type (at a minor penalty to score)!",effect: async function(uid,db,extra=0){
                        
                        var dice = await misc.getormakedice(uid,db);
                        
                                        var choices = [];
                                        for(var i = 0;i<dice.faces.length;i++){
                                            if(dice.faces[i].type != Dice.typenumtoname(18))
                                            {
                                                choices.push(i);
                                            }
                                        }
                                        if(choices.length <= 0){
                                            return "All of your dice's sides are already "+Dice.typenumtoname(18)+" type!";
                                            return false;
                                            
                                        }
                                        var tside = choices[Dice.rint(choices.length)];
                        
                                        dice.faces[tside].type = Dice.typenumtoname(18);
                                        dice.faces[tside].value = Math.max(dice.faces[tside].value-4,0);
                                        await Database.setFaceToType(dice.id,tside+1,dice.faces[tside].type,db);
                                        await Database.setFaceToScore(dice.id,tside+1,dice.faces[tside].value,db);
                                        
                        
                                        
                        
                                        
                            return "Your dice's stats are now:\n"+dice.read();
                        
                        
                    },weight:1,extra:this.extra,item:"ultmutate"};
            }
    }


    static rweights(list, weight)
    {
        
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });
        
        var random_num = Dice.rrange(0, total_weight);
        var weight_sum = 0;
        
        for (var i = 0; i < list.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);
            
            if (random_num <= weight_sum) {
                return list[i];
            }
        }
     
    }
    
}

module.exports = RouletteItem;