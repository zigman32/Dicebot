const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');


class CollectionCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'collection',
            aliases: ['col'],
            group: 'dice',
            memberName: 'collection',
            description: 'View your collection of emojis.'
            
        });

    }

    async run(message, args) {
        

        var id = message.author.id;

        var ch = message.guild;
        
        
            var resultstring = "";
            resultstring+= "List of emoji in your collection: \n\n"
            var collection = misc.getCollection(id,ch);

            for(var i = 0;i<collection.items.length;i++){
                resultstring+= collection.items[i];
            }
            message.channel.sendMessage(resultstring);
        


    }
}

module.exports = CollectionCommand;