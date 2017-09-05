const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');


class DicebagCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'dicebag',
            aliases: ['db'],
            group: 'dice',
            memberName: 'dicebag',
            description: 'Check your dice bag, swap your active dice, or delete a dice',
            args: [
                {
                    key: 'action',
                    prompt: 'Do you want to swap, check, or delete a dice',
                    type: 'string',
                    default: ''

                    
                },
                {
                    key: 'diceid',
                    prompt: 'which dice do you want to check, swap, or delete',
                    type: 'integer',
                    default: ''

                    
                }
            ]
        });

    }

    async run(message, args) {
        

        const action = args.action;
        const diceid = args.diceid;
        var id = message.author.id;

        var ch = message.guild;
        
        if(!action)
        {
            message.channel.sendMessage("Commands avaible: View, swap, delete");
            return;
        }
        
        if(action == "view" || action == "check"){
            var resultstring = "";
            resultstring+= "List of dice in your dice bag: \n\n"
            var dicebag = misc.getDicebag(id,ch);

            for(var i = 0;i<dicebag.dice.length;i++){
                resultstring+= (i+1)+":"+mydice.toDice(dicebag.dice[i]).read()+"\n";
            }
            message.channel.sendMessage(resultstring);
        }
        if(action == "swap" || action == "switch")
        {
            if(!diceid)
            {
                message.channel.sendMessage("No dice selected");
                return;
            }
            var sdice = diceid-1;
            var dicebag = misc.getDicebag(id,ch);
            if(sdice >= dicebag.dice.length || sdice < 0)
            {
                message.channel.sendMessage("Invalid dice selected");
                return;
            }
            var dicea = misc.getormakedice(id,ch);
            var diceb = mydice.toDice(dicebag.dice[sdice]);
            console.log("dicea: "+dicea.read());
            console.log("diceb: "+diceb.read());
            
            misc.setdice(diceb,id,ch);
            dicebag.dice[sdice] = dicea;
            misc.setDiceBag(dicebag,id,ch);
            message.channel.sendMessage("Set active dice to: "+diceb.read());
            

            
        }
        if(action == "delete" || action == "trash")
        {
            if(!diceid)
            {
                message.channel.sendMessage("No dice selected");
                return;
            }
            var sdice = diceid-1;
            var dicebag = misc.getDicebag(id,ch);
            if(sdice >= dicebag.dice.length || sdice < 0)
            {
                message.channel.sendMessage("Invalid dice selected");
                return;
            }

            var value;
            message.channel.sendMessage("Deleteing dice: "+mydice.toDice(dicebag.dice[sdice]).read()+"\nAre you sure about that? (respond with ``confirm`` to confirm)");
            const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                maxMatches: 1,
                time: 30000
            });
            if(responses && responses.size === 1) value = responses.first().content; else{
                //message.channel.sendMessage("Time ran out");
                return;
            }
            const lc = value.toLowerCase();
            if(lc === 'confirm'){ 
                dicebag.dice.splice(sdice,1);
                misc.setDiceBag(dicebag,id,ch);
                currency.changeBalance(id,20,"dollar",ch);
                message.channel.sendMessage("*Takes your unwanted dice and drops it in a garbage compactor, and gives you 20 "+currency.textPlural()+" in exchange.*");
                return;
            }else{
                message.channel.sendMessage("Deletion canceled.");
                return;
            }

            
        }


    }
}

module.exports = DicebagCommand;