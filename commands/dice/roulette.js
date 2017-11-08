
const commando = require('discord.js-commando');
const currency = require('../../structures/currency.js');
const Item = require("./item");
const misc = require('../misc.js');
const Dice = require('./diceclass');
const RouletteItem = require("./rouletteclass");

//const Itembleh = require('./item');
const MAXSLOTS = 10;

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
        //var ch = message.guild;
        const action = args.rtype;
        var id = message.author.id;
        var db = this.client.provider.db;
        
        
        if(action == "view"){
            var d = new Date();
            d.setHours(0,0,0,0);
            
            var seed = d.getTime();
            var roulette = await RouletteCommand.getRoulette(MAXSLOTS,db);

            
            //console.log("roulette: "+roulette[2]);
            
            var resultstring = "";
            var spinstoday = parseInt(await misc.getDailyExtra("roulettespins",id,db));
            
            var cost = RouletteCommand.getSpinCosts(spinstoday);

            if(cost == false || await currency.getReputation(id,db) < cost.rep){
                resultstring+= "No more spins today without a roulette ticket.\n";
            }else{
                if(cost.money == 0 && cost.rep == 0)
                    resultstring+= "Cost to spin the roulette: FREE\n";
                else{
                    resultstring+= "Cost to spin the roulette: "+cost.money+" "+currency.textPlural()+"\n";
                    
                    
                }

            }
            
            

            resultstring+="Use !roulette spin to spin the roulette. The cost to spin increases with each consecutive spin today. Possible rewards are:\n\n\n"
            for(var i = 0;i<roulette.length;i++)
            {
                
                resultstring+=roulette[i].toSpinnable().desc+"\n";
            }
            message.channel.sendMessage(resultstring);
            if(resultstring.length >= 2000)
            {
                message.channel.sendMessage("Error: Roulette is too large, contact the bot owner!");
                
            }
        }
        if(action == "use" || action == "spin"){

            var spinstoday = parseInt(await misc.getDailyExtra("roulettespins",id,db));
            
            
            
            var cost = RouletteCommand.getSpinCosts(spinstoday);

            if(cost == false || await currency.getReputation(id,db) < cost.rep){
                message.channel.sendMessage("You can't spin again today!");
                return;

            }
            if(cost.money> await currency.getMoney(id,db)){
                message.channel.sendMessage("You can't afford another spin!");
                return;
            }
            
            await currency.removeMoney(id,cost.money,db);

            //----------spin-------------
            RouletteCommand.cleanSpin(id,db,message);
            misc.setDailyExtra("roulettespins",id,spinstoday+1,db);

            
        }
    }

    static async cleanSpin(id,db,message){
        //var d = new Date();
        //d.setHours(0,0,0,0);
        
        var roulette = await RouletteCommand.getRoulette(MAXSLOTS,db);
        

        message.channel.sendMessage("Spinning...").then((msg)=>{
            setTimeout(async function(){msg.edit("Spinning....").then((msg)=>{     
            setTimeout(async function(){msg.edit("Spinning.....").then((msg)=>{    
            setTimeout(async function(){msg.edit("Spinning......").then((msg)=>{     
            setTimeout(async function(){RouletteCommand.spin(roulette,id,db,message)},1000)});},1000)});},1000)});},1000)});

            
        //return RouletteCommand.spin(roulette,id,ch,message);

    }

    static async spin(roulette,id,db,message){
        
        var spin = Dice.rint(roulette.length);
        spin = 1;
        var prize = roulette[spin].toSpinnable();
        //console.log(roulette[spin]);
        var canpop = await misc.hasItem("poprocks",id,db) && prize.item != "";
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
                    await misc.addToInventory(prize.item,id,db);
                    await misc.consumeItem("poprocks",id,db);
                    message.channel.sendMessage("You gained 1 "+theitem.name);
                }else
                if(lc === 'yes'){
                    message.channel.sendMessage(await prize.effect(id,db,prize.extra));
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

    static newRoulette(MAXSLOTS,level = 1){
        var roulette = [];
        for(var i = 0;i<MAXSLOTS;i++){
            var ritem = new RouletteItem();
            ritem.generate();
            roulette.push(ritem);
        }
        return roulette;
    }

    static async getRoulette(MAXSLOTS,db){
        //var todaysroulette = ch.settings.get("DICE_roulette",false);
        //if(todaysroulette == false || todaysroulette.exptime < new Date().getTime())
        //{
            
            var roulette = await misc.getRoulette(db);
            
            if(roulette == false){
                roulette = RouletteCommand.newRoulette(MAXSLOTS);
                await misc.setRoulette(roulette,db)
            }
            
            return roulette;
            

        
            

    }





    /*static rweights(list, weight,rng)
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
     
    }*/

    /*static getRandomModifier(slot,type,ch){//kinda hacky
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
    }*/

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