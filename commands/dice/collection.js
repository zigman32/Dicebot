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

        var db = this.client.provider.db;
        
        
            var resultstring = "";
            resultstring+= "List of emoji in your collection: \n\n"
            var collection = await misc.getCollection(id,db);

            for(var i = 0;i<collection.length;i++){
                resultstring+= ":"+collection[i]+":";
            }
            message.channel.send(resultstring);
        


    }
}

module.exports = CollectionCommand;