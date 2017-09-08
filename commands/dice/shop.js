const commando = require('discord.js-commando');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const shopitem = require('./shopitem.js');
const Dice = require('./diceclass.js');


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
        var ch = message.guild;
        var id = message.author.id;
        

        var awealth = currency.getBalance(id,"dollar",ch);

        var basicitems = ShopCommand.loadItems();
        var specialitems = ShopCommand.loadSpecialItems();
        var items = basicitems.concat(specialitems);
        var reputation = currency.getReputation(id,ch);

        
        
      

        if(!item){

            var resultstring = "";
            resultstring = resultstring+"Here's a list of items for sale: \n";
            resultstring = resultstring+"Current reputation: "+currency.getReputation(id,ch)+"\n\n";
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
            
            message.channel.sendMessage(resultstring);



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
                    
                    var awealth = currency.getBalance(id,"dollar",ch);
                    if(awealth < items[i].price){
                        message.channel.sendMessage("You can't afford that item. You need "+items[i].price+" "+currency.textPlural());
                    }else
                    {
                        currency.changeBalance(id,-items[i].price,"dollar",ch);
                        items[i].use(id,ch,message);
                    }


                    break;
                }
            }
            if(i == items.length)
            {
                message.channel.sendMessage("I don't have that item: "+item);
            }
        }
        

        
        
       

        
    }

    static loadItems(){
        var titems = [];
        titems.push(new shopitem("Basic Dice Box",100,"Adds a new basic dice to your dice bag.",function(id,ch,message,bonus){
            
            //-----------basic dice box code---------------

            var newdice = new Dice();
            newdice.generate();

            misc.addToDicebag(newdice,id,ch);

            message.channel.sendMessage("*You open your box and receive a dice with the following stats:* \n\n"+newdice.read()+"\n it has been placed in your dice bag!");
            


            //-----------end basic dice box code
        }));
        titems.push(new shopitem("Basic Dice Pack",200,"Gives you a choice of 3 basic dice. Choose 1 to add to your bag.",async function(id,ch,message,bonus){
        
            //-----------basic dice pack code---------------

            const dnum = 3;
            var darr = [];
            
            var resultstring = "";
            resultstring+= "You open your dice pack, and it contains the following dice: \n\n";
            for(var i = 0; i < dnum; i++)
            {
                var dice = new Dice();
                dice.generate("user");
                darr.push(dice);
                resultstring+= (i+1)+": "+dice.read()+"\n";
            }
            resultstring+= "\n type in a number within 1 minute to choose a dice. Otherise one will be chosen at random.\n"
            message.channel.sendMessage(resultstring);

            resultstring = "";
            var value;
            var num;
            var again;
            
            
            do{
                again = false;
                console.log("Begining of loop");
                const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                    maxMatches: 1,
                    time: 60000//60 seconds
                });
                if(responses && responses.size === 1) value = responses.first().content; else{
                    num = Dice.rint(dnum);
                    resultstring += "Time ran out, choosing dice number "+(num+1)+"\n";
                    console.log("Time ran out");
                    break;
                }
                var num = parseInt(value)
                if(!isNaN(num) && num > 0 && num <= dnum){ 
                    
                    console.log("We did good today");
                    num--;
                    
                }else{
                    message.channel.sendMessage("Invalid choice, please try again.");
                    again = true;
                    console.log("Let's go again");
                }
            }while(again);
            console.log("Out of the loop!");

            message.channel.sendMessage(resultstring+"Dice number "+(num+1)+" ("+darr[num].read()+") was added to your dicebag!");

            misc.addToDicebag(darr[num],id,ch);


            //-----------end basic dice pack code
        }));

        titems.push(new shopitem("Beginer\'s Dice Pack",400,"Gives you a choice of 3 common dice with a chance of a rare dice. Choose 1 to add to your bag.",async function(id,ch,message,bonus){
            
                //-----------Beginer's dice pack code---------------
    
                const dnum = 3;
                var darr = [];
                
                var resultstring = "";

                var rareodds = 0.1;

                resultstring+= "You open your dice pack, and it contains the following dice: \n\n";
                for(var i = 0; i < dnum; i++)
                {
                    var dice = new Dice();
                    if(Math.random() < rareodds)
                    {
                        dice.generate("rare1");
                        resultstring+= (i+1)+": "+dice.read()+"(:sparkles:Rare Dice!:sparkles:)\n";
                    }else
                    {
                        dice.generate("rare0");
                        resultstring+= (i+1)+": "+dice.read()+"\n";
                    }
                    darr.push(dice);
                }
                resultstring+= "\n type in a number within 1 minute to choose a dice. Otherise one will be chosen at random.\n"
                message.channel.sendMessage(resultstring);
    
                resultstring = "";
                var value;
                var num;
                var again;
                
                
                do{
                    again = false;
                    console.log("Begining of loop");
                    const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                        maxMatches: 1,
                        time: 60000//60 seconds
                    });
                    if(responses && responses.size === 1) value = responses.first().content; else{
                        num = Dice.rint(dnum);
                        resultstring += "Time ran out, choosing dice number "+(num+1)+"\n";
                        console.log("Time ran out");
                        break;
                    }
                    var num = parseInt(value)
                    if(!isNaN(num) && num > 0 && num <= dnum){ 
                        
                        console.log("We did good today");
                        num--;
                        
                    }else{
                        message.channel.sendMessage("Invalid choice, please try again.");
                        again = true;
                        console.log("Let's go again");
                    }
                }while(again);
                console.log("Out of the loop!");
    
                message.channel.sendMessage(resultstring+"Dice number "+(num+1)+" ("+darr[num].read()+") was added to your dicebag!");
    
                misc.addToDicebag(darr[num],id,ch);
    
    
                //-----------end basic dice pack code
            },50));

            titems.push(new shopitem("Intermidiate Dice Pack",1000,"Gives you a choice of 3 common dice with a increased chance of a rare dice and a chance at super rare dice. Choose 1 to add to your bag.",async function(id,ch,message,bonus){
                
                    //-----------intermidiate dice pack code---------------
        
                    const dnum = 3;
                    var darr = [];
                    
                    var resultstring = "";
                    var superrareodds = 0.1;
                    var rareodds = 0.3;
    
                    resultstring+= "You open your dice pack, and it contains the following dice: \n\n";
                    for(var i = 0; i < dnum; i++)
                    {
                        var dice = new Dice();
                        if(Math.random() < superrareodds)
                        {
                            dice.generate("rare2");
                            resultstring+= (i+1)+": "+dice.read()+"(:sparkling_heart::sparkles: SUPER RARE DICE! :sparkles::sparkling_heart:)\n";
                        }else if(Math.random() < rareodds)
                        {
                            dice.generate("rare1");
                            resultstring+= (i+1)+": "+dice.read()+"(:sparkles:Rare Dice!:sparkles:)\n";
                        }else
                        {
                            dice.generate("rare0");
                            resultstring+= (i+1)+": "+dice.read()+"\n";
                        }
                        darr.push(dice);
                    }
                    resultstring+= "\n type in a number within 1 minute to choose a dice. Otherise one will be chosen at random.\n"
                    message.channel.sendMessage(resultstring);
        
                    resultstring = "";
                    var value;
                    var num;
                    var again;
                    
                    
                    do{
                        again = false;
                        console.log("Begining of loop");
                        const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                            maxMatches: 1,
                            time: 60000//60 seconds
                        });
                        if(responses && responses.size === 1) value = responses.first().content; else{
                            num = Dice.rint(dnum);
                            resultstring += "Time ran out, choosing dice number "+(num+1)+"\n";
                            console.log("Time ran out");
                            break;
                        }
                        var num = parseInt(value)
                        if(!isNaN(num) && num > 0 && num <= dnum){ 
                            
                            console.log("We did good today");
                            num--;
                            
                        }else{
                            message.channel.sendMessage("Invalid choice, please try again.");
                            again = true;
                            console.log("Let's go again");
                        }
                    }while(again);
                    console.log("Out of the loop!");
        
                    message.channel.sendMessage(resultstring+"Dice number "+(num+1)+" ("+darr[num].read()+") was added to your dicebag!");
        
                    misc.addToDicebag(darr[num],id,ch);
        
        
                    //-----------end basic dice pack code
                },200));

                titems.push(new shopitem("Advanced Dice Pack",1000,"Gives you a choice of 3 rare dice with a increased chance of a super rare dice and a low chance at ultra rare dice. Choose 1 to add to your bag.",async function(id,ch,message,bonus){
                    
                        //-----------intermidiate dice pack code---------------
            
                        const dnum = 3;
                        var darr = [];
                        
                        var resultstring = "";
                        var ultrarareodds = 0.05;
                        var superrareodds = 0.2;
        
                        resultstring+= "You open your dice pack, and it contains the following dice: \n\n";
                        for(var i = 0; i < dnum; i++)
                        {
                            var dice = new Dice();
                            if(Math.random() < ultrarareodds)
                            {
                                dice.generate("rare3");
                                resultstring+= (i+1)+": "+dice.read()+"(:star2: :sparkling_heart::sparkles: **ULTRA RARE DICE!** :sparkles::sparkling_heart::star2: )\n";
                            }else if(Math.random() < superrareodds)
                            {
                                dice.generate("rare2");
                                resultstring+= (i+1)+": "+dice.read()+"(:sparkling_heart::sparkles: SUPER RARE DICE! :sparkles::sparkling_heart:)\n";
                            }else
                            {
                                dice.generate("rare1");
                                resultstring+= (i+1)+": "+dice.read()+"(:sparkles:Rare Dice!:sparkles:)\n";
                            }
                            darr.push(dice);
                        }
                        resultstring+= "\n type in a number within 1 minute to choose a dice. Otherise one will be chosen at random.\n"
                        message.channel.sendMessage(resultstring);
            
                        resultstring = "";
                        var value;
                        var num;
                        var again;
                        
                        
                        do{
                            again = false;
                            console.log("Begining of loop");
                            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                                maxMatches: 1,
                                time: 60000//60 seconds
                            });
                            if(responses && responses.size === 1) value = responses.first().content; else{
                                num = Dice.rint(dnum);
                                resultstring += "Time ran out, choosing dice number "+(num+1)+"\n";
                                console.log("Time ran out");
                                break;
                            }
                            var num = parseInt(value)
                            if(!isNaN(num) && num > 0 && num <= dnum){ 
                                
                                console.log("We did good today");
                                num--;
                                
                            }else{
                                message.channel.sendMessage("Invalid choice, please try again.");
                                again = true;
                                console.log("Let's go again");
                            }
                        }while(again);
                        console.log("Out of the loop!");
            
                        message.channel.sendMessage(resultstring+"Dice number "+(num+1)+" ("+darr[num].read()+") was added to your dicebag!");
            
                        misc.addToDicebag(darr[num],id,ch);
            
            
                        //-----------end basic dice pack code
                    },800));
    
        
        return titems;
    }

    
    


    static loadSpecialItems(){
        var titems = [];
       
        var d = new Date();
        d.setHours(0,0,0,0);
        var todaystype = Math.floor((d.getTime()/1000/60/60/24)%18);


        
        titems.push(new shopitem("Basic "+ShopCommand.capitalizeFirstLetter(Dice.typenumtoname(todaystype))+" Box",300,"Adds a new basic dice to your dice bag (nearly) guaranteed to have the "+Dice.typenumtoname(todaystype)+" type. The type changes every day.",function(id,ch,message){
            
            //-----------typed dice box code---------------

            var newdice = new Dice();
            
            var othertype = Dice.rint(18);
            newdice.generate("user_TYPE/"+todaystype+"/"+othertype);


            misc.addToDicebag(newdice,id,ch);

            message.channel.sendMessage("*You open your box and receive a dice with the following stats:* \n\n"+newdice.read()+"\n it has been placed in your dice bag!");
            


            //-----------end typed dice box code
        }));
        return titems;
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

module.exports = ShopCommand;