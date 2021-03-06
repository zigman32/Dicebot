const commando = require('discord.js-commando');

class MyhelpCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'help',
            group: 'responce',
            memberName: 'help',
            description: 'Explains how to use the bot and what it\'s all about'
        });

    }

    async run(message, args) {
        var resultstring = "";

        const prefix = message.guild ? message.guild.commandPrefix : this.client.commandPrefix;

        resultstring+= "About the bot:\n";
        resultstring+= "Dicebot is a bot who's sole purpouse in life is to let you play the dice game!\n";
        resultstring+= "Every user starts with a basic dice, you can use !viewdice to check your dice.\n";
        resultstring+= "Challenge other users to dice battles by doing !dicevs @username\n";
        resultstring+= "You can buy better dice at the shop, accessed by using !shop\n";
        resultstring+= "To get the money needed to buy better dice, you can use !daily to claim some free money once per day (resetting at midnight EST)\n";
        resultstring+= "You can also dice against NPCs for money, such as Dicebot, or even emoji \n(Example: use !dicevs :bacon: to challenge bacon)\n";
        resultstring+= "Other features include: !roulette to spin a roulette and gain free prizes, including some items to help modify and customise your dice.\n";
        resultstring+= "Use !commands to see a list of all commands.\n";
        message.channel.send(resultstring);
    }
}

module.exports = MyhelpCommand;