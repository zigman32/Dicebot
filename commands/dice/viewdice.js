const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');
const item = require('./item');
const dicevs = require('./dicevs');
const Database = require('../../structures/database');

class ViewdiceCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'viewdice',
            aliases: ['diceview'],
            group: 'dice',
            memberName: 'viewdice',
            description: 'check\'s a user\'s dice',
            args: [
                {
                    key: 'member',
                    prompt: 'Who\'s dice do you want to view',
                    type: 'string',
                    default: ''

                    
                }
            ]
        });

    }

    async run(message, args) {
        

        const member = args.member;
        const use = member.user;
        var user = member.user;
        if(!user)
            user = message.author;

        var db = this.client.provider.db;
            

        
        var id = user.id;
        


        if(message.mentions.users.first() || member == false)
        {
            var diceownerid;
            if(member == false)
            {
                diceownerid = message.author.id;
            }else{
                diceownerid = message.mentions.users.first().id
            }
            
            var dice = await misc.getormakedice(id,db);
            //dice
            message.channel.send("That user has the following dice: \n"+dice.read());
            
            
            
        }
        else{
            if(misc.getEmoji(member) != false && await misc.hasItem("scope",id,db)){
                message.channel.sendMessage("Use a "+item.getItembyID("scope").name+"? (respond with yes to use)");
                var value;
                //var use = true;
                const responses = await message.channel.awaitMessages(msg2 => msg2.author.id === message.author.id, {
                    maxMatches: 1,
                    time: 30000
                });
                if(responses && responses.size === 1) value = responses.first().content; else{
                    
                }
                const lc = value.toLowerCase();
                if(lc === 'yes'){ 
                    var ostuff = dicevs.isValidOponent(member);

                    var dice = await misc.getormakedice(ostuff.id,db,ostuff.dtype);
                    await misc.consumeItem("scope",id,db);
                    message.channel.sendMessage("That user has the following dice: \n"+dice.read());
                    return;
                }else{
                    
                }
            }
            message.channel.sendMessage("That's not a valid user!");
        }
        
        
        
        

    }
}

module.exports = ViewdiceCommand;