const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');


class ModifiersCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'modifiers',
            aliases: ['mods','mod'],
            group: 'dice',
            memberName: 'modifiers',
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
        


        
        var resultstring = "";
        resultstring+= "(H): Heavy. Twice as likely to be rolled.\n";
        resultstring+= "(L): Light. Half as likely to be rolled.\n";
        resultstring+= "(C_XXX): Conquer XXX type. always deal super effective damage.\n";
        resultstring+= "(B_XXX): Blunted against XXX type. always deal damage as if oponent is immune.\n";
        resultstring+= "(R_XXX): Resiliance against XXX type. Treat type XXX as if you're immune.\n";
        resultstring+= "(V_XXX): Vulnrable XXX type. They always deal super effective damage to you.\n";
        resultstring+= "(D_XXX): Destroy XXX type. Always deal super effective damage and receive resisted damage.\n";
        resultstring+= "(S_XXX): Submit XXX type. Always deal resisted damage and receive super effective damage.\n";
        resultstring+= "(A): Advantage. Roll a second time and choose the higher numeric valued face.\n";
        resultstring+= "(D): Disadvantage. Roll a second time and choose the lower numeric valued face.\n";
        resultstring+= "(QA): Quantum Advantage. Roll a second time and choose the Face which leads to a better result.\n";
        resultstring+= "(QD): Quantum Disadvantage. Roll a second time and choose the Face which leads to a worse result.\n";
        resultstring+= "(XXX+n): Deal n more damage against type XXX.\n";
        resultstring+= "(+-n): randomly add or subtract up to n points from the face.\n";
        resultstring+= "(E): Edge. Gain an extra point in ties.\n";
        resultstring+= "(F): Fall. Loose an extra point in ties.\n";
        resultstring+= "(I): Inversion. Inverts type matchups.\n";
        resultstring+= "(S): ???.\n";
        resultstring+= "(&XXX): Add XXX type. Adds XXX type to your dice, performing additional type calculations.\n";
        
        
        
        
        
        message.channel.sendMessage(resultstring);
        

    }
}

module.exports = ModifiersCommand;