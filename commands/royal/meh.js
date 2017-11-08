const commando = require('discord.js-commando');
const misc = require('../misc.js');
const mydice = require('../dice/diceclass.js');
const currency = require('../../structures/currency.js');
const vs = require('../dice/dicevs.js');
const dsemoji = require('discord-emoji');
const item = require('../dice/item');
const database = require('../../structures/database');
const srandom = require('seeded-random');


class MehCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'meh',
            aliases: ['test'],
            group: 'royal',
            memberName: 'meh',
            description: 'Does whatever',

            args: [
                {
                    key: 'text',
                    prompt: 'something',
                    type: 'string',
                    default: ''
                }
            ]
        });

    }
    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(message, args) {

        if(this.client.isOwner(message.author))
        {   


            commando.Client
            
            const { text } = args;
            var ch = message.guild;
            var something = text;
            var user = message.author;
            var id = user.id;
            var db = this.client.provider.db;


            var meta = (something == "meta");

            message.channel.sendMessage("RAND THING: "+srandom.decimal("seedA"));
            message.channel.sendMessage("RAND THING: "+srandom.decimal("seedA"));
            
            //await misc.addToInventory("scope",id,db,93);
            //await misc.addToInventory("rouletteticket",id,db,93);
            //await misc.addToInventory("poprocks",id,db,93);
            
            //misc.consumeItem("poprocks",id,db);
            /*var has = await misc.hasItem("poprocks",id,db)
            console.log("HAS: "+has);
            if(has)
            {
                message.channel.sendMessage("HAS ITEM");
            }else{
                
                message.channel.sendMessage("NO ITEM");
            }*/
            //currency.changeBalance(id,-5600,"dollar")
            /*var dice = new mydice();
            dice.generate("emoji4");
            database.registerUserDice(dice,"11",db);*/
            //await misc.addToCollection("100",id,db);
            /*var d = await misc.getormakedice(id,db);
            await d.addEmoji("sleepierst",3,db);
            var c = await d.getEmojiCount(2,db);
            
            message.channel.send("Emoji Count: "+c);*/
            /*var timeleft = await misc.getHourly("dicebot1",id,db)
            if(timeleft > 0)
            {
                message.channel.send("You have challenged me too recently. You will have to wait another "+Math.floor(timeleft/1000/60)+" minutes.");
                return;
            }
            
            await misc.setHourly("dicebot1",1,id,db);
            message.channel.send("CHallenging");
            */

            //console.log("ENDGAME: "+d.faces[1].value);
            //console.log(d);
            //message.channel.send(d.read());

            //console.log(Object.getOwnPropertyNames(this.client.provider.db));
            //this.client.provider.db.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {})
            //misc.addToInventory(something,id,ch,10);
            //this.client.provider.db.get("SELECT COUNT(*) FROM scores;").then(res => console.log(res) );
            
            
        }
    }
}

module.exports = MehCommand;