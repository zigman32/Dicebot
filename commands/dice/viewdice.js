const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');


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
                    type: 'member',
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

        var ch = message.guild;

        
        var id = user.id;
        


        
        var dice = misc.getormakedice(id,ch);
        
        
        message.channel.sendMessage("That user has the following dice: \n"+dice.read());
        

    }
}

module.exports = ViewdiceCommand;