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
                    default: '-1'

                    
                }
            ]
        });

    }

    async run(message, args) {
        

        const action = args.action;
        const diceid = args.diceid;
        var id = message.author.id;

        //var ch = message.guild;
        var db = this.client.provider.db;
        
        if(!action)
        {
            message.channel.sendMessage("Commands avaible: View, swap, delete");
            return;
        }
        
        var test = misc.getormakedice(id,db);//IF THIS IS THE USER'S FIRST DICE INTERACTION

        if(action == "view" || action == "check"){
            if(diceid < 0)
            {
                message.channel.sendMessage("Please specify which dice you want to view (0 for 1-10, 1 for 11-20, etc)");
                return;
            }

            var spot = diceid;
            
            var dicemin = spot*10;
            var dicemax = spot*10+10;


            var resultstring = "";
            resultstring+= "List of dice in your dice bag: (From "+(dicemin+1)+" to "+dicemax+") \n"
            var dicebag = await misc.getDicebag(id,db);
            var activeDice = await misc.getActiveDiceIndex(id,db);
            //console.log("DICEBAG: "+dicebag);
            resultstring+= "Active dice: "+activeDice/*+" ( "+dicebag[activeDice-1].read()+" )"*/+"\n\n"

            for(var i = dicemin;i<dicebag.length && i<dicemax ;i++){
                var astring = "";
                if(i+1 == activeDice){
                    astring = "**";
                }
                resultstring+= (i+1)+":"+dicebag[i].read(astring)+"\n";
            }
            message.channel.send(resultstring);
        }
        if(action == "swap" || action == "switch")
        {
            if(!diceid)
            {
                message.channel.sendMessage("No dice selected");
                return;
            }
            var maxdice = await misc.getMaxDiceIndex(id,db);
            if(maxdice < diceid)
            

            //var sdice = diceid-1;
            if(maxdice < diceid || diceid < 1)
            {
                message.channel.sendMessage("Invalid dice selected");
                return;
            }
            await misc.setActiveDiceIndex(id,diceid,db);



            var diceb = await misc.getormakedice(id,db);
            message.channel.sendMessage("Set active dice to: "+diceb.read());
            

            
        }
        if(action == "delete" || action == "trash")
        {
            if(!diceid)
            {
                message.channel.sendMessage("No dice selected");
                return;
            }
            var maxdice = await misc.getMaxDiceIndex(id,db);
            if(maxdice < diceid)
            

            //var sdice = diceid-1;
            if(maxdice < diceid || diceid < 1)
            {
                message.channel.sendMessage("Invalid dice selected");
                return;
            }
            
            var adiceid = await misc.getActiveDiceIndex(id,db);
            if(adiceid == diceid){
                message.channel.sendMessage("You can't delete your active dice!");
                return;
            }


            var deldice = await misc.getDiceByIndex(id,diceid,db);
            message.channel.sendMessage("Deleteing dice: "+deldice.read()+"\nAre you sure about that? (respond with ``confirm`` to confirm)");
            //return;
            var value;
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
                misc.deleteDiceByIndex(id,diceid,db);
                currency.addMoney(id,20,db);
                message.channel.send("You sold your dice for 20 "+currency.textPlural()+"");
                return;
            }else{
                message.channel.sendMessage("Deletion canceled.");
                return;
            }

            
        }


    }
}

module.exports = DicebagCommand;