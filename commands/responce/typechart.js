const commando = require('discord.js-commando');

class TypechartCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'typechart',
            group: 'responce',
            memberName: 'typechart',
            description: 'View the pokemon type chart!',
            
        });

    }

    async run(message, args) {
        message.channel.sendMessage("https://img.pokemondb.net/images/typechart.png");
    }
}

module.exports = TypechartCommand;