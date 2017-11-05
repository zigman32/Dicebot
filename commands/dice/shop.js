const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const shopitem = require('./shopitem.js');
const Dice = require('./diceclass.js');
const Srandom = require('seedrandom');


class ShopCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'shop',
            aliases: ['buy'],
            group: 'dice',
            memberName: 'shop',
            description: 'Buy something from the shop',
            args: [
                {
                    key: 'item',
                    prompt: 'What do you want to buy',
                    type: 'string',
                    default: ''
                }
            ]
        });

    }
    
    async run(message, args) {
        const item = args.item;
        //var db = message.guild;
        var id = message.author.id;
        var db = this.client.provider.db;
        
        
        var awealth = await currency.getMoney(id,db);
        
        
        var basicitems = ShopCommand.loadItems();
        var specialitems = ShopCommand.loadSpecialItems();
        var items = basicitems.concat(specialitems);
        var reputation = await currency.getReputation(id,db);

        
        
      

        if(!item){

            var resultstring = "";
            resultstring = resultstring+"Here's a list of items for sale: \n";
            resultstring = resultstring+"Current reputation: "+reputation+"\n\n";
            for(var i = 0;i<basicitems.length;i++){
                if(reputation >= basicitems[i].reputationreq)
                    resultstring = resultstring+basicitems[i].name+" ("+basicitems[i].price+" "+currency.textPlural()+"): "+basicitems[i].description+"\n\n";
                else
                    resultstring = resultstring+"?????("+basicitems[i].reputationreq+" reputation required)\n\n";
            }
            resultstring = resultstring+"\nSpecial items: (Changes daily)\n\n";
            for(var i = 0;i<specialitems.length;i++){
                if(reputation >= specialitems[i].reputationreq)
                    resultstring = resultstring+specialitems[i].name+" ("+specialitems[i].price+" "+currency.textPlural()+"): "+specialitems[i].description+"\n\n";
                else
                    resultstring = resultstring+"?????("+specialitems[i].reputationreq+" reputation required)\n\n";
                
            }
            
            message.channel.send(resultstring);



        }else{
            var i;
            var bonus = 0;

            if(item.toLowerCase().includes("typed basic dice box"))
            {
                item = "typed basic dice box";
            }
            for(i = 0;i<items.length;i++){
                if(items[i].name.toLowerCase() == item.toLowerCase() && reputation >= items[i].reputationreq)
                {
                    
                    //var awealth = currency.getBalance(id,"dollar",db);
                    if(awealth < items[i].price){
                        message.channel.send("You can't afford that item. You need "+items[i].price+" "+currency.textPlural());
                    }else
                    {
                        currency.removeMoney(id,items[i].price,db);
                        items[i].use(id,db,message);
                    }


                    break;
                }
            }
            if(i == items.length)
            {
                message.channel.send("I don't have that item: "+item);
            }
        }
        

        
        
       

        
    }

    static loadItems(){
        var titems = [];
        titems.push(new shopitem("Basic Dice Box",100,"Adds a new basic dice to your dice bag.",async function(id,db,message,bonus){
            
            

            var newdice = new Dice();
            newdice.generate();

            await misc.addToDicebag(newdice,id,db);

            message.channel.send("*You open your box and receive a dice with the following stats:* \n\n"+newdice.read()+"\n it has been placed in your dice bag!");
            


            
        }));
        titems.push(new shopitem("Basic Dice Pack",150,"Gives you a choice of 3 basic dice. Choose 1 to add to your bag.",async function(id,db,message,bonus){

            ShopCommand.genericPack(["user"],[100],3,id,db,message);

        }));

        titems.push(new shopitem("Beginer\'s Dice Pack",400,"Gives you a choice of 3 common dice with a chance of a rare dice. Choose 1 to add to your bag.",async function(id,db,message,bonus){
               
            ShopCommand.genericPack(["rare0","rare1"],[90,10],3,id,db,message);
                
        },50));

        titems.push(new shopitem("Intermidiate Dice Pack",1000,"Gives you a choice of 3 common dice with a increased chance of a rare dice and a chance at super rare dice. Choose 1 to add to your bag.",async function(id,db,message,bonus){
            
            ShopCommand.genericPack(["rare0","rare1","rare2"],[60,30,10],3,id,db,message);
              
        },200));

        titems.push(new shopitem("Advanced Dice Pack",3000,"Gives you a choice of 3 rare dice with a increased chance of a super rare dice and a low chance at ultra rare dice. Choose 1 to add to your bag.",async function(id,db,message,bonus){
                             
            ShopCommand.genericPack(["rare1","rare2","rare3"],[75,20,5],3,id,db,message);
                                  
        },800));
    
        
        return titems;
    }

    
    


    static loadSpecialItems(){
        var titems = [];
       
        var d = new Date();
        d.setHours(0,0,0,0);
        //var todaystype = Math.floor((d.getTime()/1000/60/60/24)%18);
        
        var rng= Srandom(d.getTime());
        var todaystype = Math.floor(rng()*18);

        titems.push(new shopitem("Basic "+ShopCommand.capitalizeFirstLetter(Dice.typenumtoname(todaystype))+" Box",200,"Adds a new basic dice to your dice bag (nearly) guaranteed to have the "+Dice.typenumtoname(todaystype)+" type. The type changes every day.",function(id,db,message){
            
            var newdice = new Dice();
            var othertype = Dice.rint(18);
            newdice.generate("user_TYPE/"+todaystype+"/"+othertype);
            misc.addToDicebag(newdice,id,db);
            message.channel.send("*You open your box and receive a dice with the following stats:* \n\n"+newdice.read()+"\n it has been placed in your dice bag!");
            
        }));
        //------------------------
        var odds = 0.33;
        if(rng()<odds)
        {
            var biastype;
            if(rng() < 0.02)
                biastype = 18;//ultimate type
            else
                biastype = Math.floor(rng()*18);

            var biasname = Dice.typenumtoname(biastype);
            titems.push(new shopitem(ShopCommand.capitalizeFirstLetter(biasname)+" Hate Pack",550,"Do you hate "+ShopCommand.capitalizeFirstLetter(biasname)+" types? Then this is the pack for you.",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["rare0","rare0_TYPEBIAS1/"+biastype,"rare1_TYPEBIAS2/"+biastype,"rare2_TYPEBIAS2/"+biastype],[30,50,15,5],3,id,db,message);
                                    
            },180));


        }
        //-----------------
        //------------------------
        var odds = 0.1;
        if(rng()<odds)
        {
            
            titems.push(new shopitem("Glowing Pack",5000,"Mostly commons and rares in here, but if you get lucky...",async function(id,db,message,bonus){
                ShopCommand.genericPack(["rare0","rare1","rare4"],[87,10,3],3,id,db,message);                   
            },2000));
        }
        //-----------------
        var odds = 0.2;
        if(rng()<odds)
        {  
            titems.push(new shopitem("Survivor pack",1300,"There are some things you just can't defeat. At least, untill you buy this pack.",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["rare0","rare1","rare2","rare0_STURDY1","rare1_STURDY1","rare2_STURDY1","rare0_STURDY_ALL","rare1_STURDY_ALL","rare2_STURDY_ALL"],[80*12,20*12,5*12,80*6,20*6,5*6,80*1,20*1,5*1],3,id,db,message);               
            },200));
        }
        //-----------------
        var odds = 0.3;
        if(rng()<odds)
        {  
            titems.push(new shopitem("Slim pack",300,"Damn, these dice are SLIM.",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["slim1","slim2"],[95,5],3,id,db,message);               
            },100));
        }

        var odds = 0.1;
        if(rng()<odds)//TODO
        {  
            titems.push(new shopitem("Advantageous Pack",5000,"Give yourself that little bit of extra advantage.",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["rare0_adv1","rare1_adv1","rare2_adv1","rare3_adv1"],[30,57,10,3],3,id,db,message);               
            },1400));
        }

        var odds = 0.05;
        if(rng()<odds)
        {  
            titems.push(new shopitem("Ultimate type pack",8000,"Are you sick of loosing type matchups?",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["rare0_ult1","rare1_ult1","rare2_ult1","rare3_ult1"],[30,57,10,3],3,id,db,message);               
            },2000));
        }

        var odds = 0.1;
        if(rng()<odds)
        {  
            titems.push(new shopitem("Weighted dice pack",1200,"These dice seem a bit... lopsided. That's probably a good thing though... right?",async function(id,db,message,bonus){
                             
                ShopCommand.genericPack(["rare0_wgt1","rare1_wgt1","rare2_wgt1"],[63,30,7],3,id,db,message);               
            },600));
        }
        







        return titems;
    }


    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static async genericPack(rarities,weights,dnum,id,db,message){
        //const dnum = 3;
        var darr = [];
        
        var resultstring = "";




        resultstring+= "You open your dice pack, and it contains the following dice: \n\n";
        var raredialogue;
        

        for(var i = 0; i < dnum; i++)
        {
            var rare = Dice.rweights(rarities,weights);
            raredialogue = "";
            if(rare.includes("rare0"))
            {
                raredialogue = "";
            }
            if(rare.includes("rare1"))
            {
                raredialogue = "(:sparkles:Rare Dice!:sparkles:)";
            }
            if(rare.includes("rare2"))
            {
               raredialogue = "(:sparkling_heart::sparkles: SUPER RARE DICE! :sparkles::sparkling_heart:)";
                    
            }
            if(rare.includes("rare3"))
            {
                raredialogue = "(:star2::sparkling_heart::sparkles: **ULTRA RARE DICE!** :sparkles::sparkling_heart::star2:)";
                    
            }
            if(rare.includes("rare4"))
            {
                raredialogue = ":sunny::star2::sunny: **RADIANT!** :sunny::star2::sunny: ";
            }
            
            
            

            var dice = new Dice();
            dice.generate(rare);
            resultstring+= (i+1)+": "+dice.read()+raredialogue+"\n";
            darr.push(dice);
        }
        resultstring+= "\n type in a number within 1 minute to choose a dice. Otherise one will be chosen at random.\n"
        message.channel.send(resultstring);

        resultstring = "";
        var value;
        var num;
        var again;
        //console.log("HELLO!");
        
        do{
            again = false;
            //console.log("Begining of loop");
            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                maxMatches: 1,
                time: 60000//60 seconds
            });
            if(responses && responses.size === 1) value = responses.first().content; else{
                num = Dice.rint(dnum);
                resultstring += "Time ran out, choosing dice number "+(num+1)+"\n";
                //console.log("Time ran out");
                break;
            }
            var num = parseInt(value)
            if(!isNaN(num) && num > 0 && num <= dnum){ 
                
                //console.log("We did good today");
                num--;
                
            }else{
                message.channel.send("Invalid choice, please try again.");
                again = true;
                //console.log("Let's go again");
            }
        
        }while(again);
        //console.log("Out of the loop!");

        message.channel.send(resultstring+"Dice number "+(num+1)+" ("+darr[num].read()+") was added to your dicebag!");

        misc.addToDicebag(darr[num],id,db);


        //-----------end basic dice pack code
        
    }
}

module.exports = ShopCommand;