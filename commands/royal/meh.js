const commando = require('discord.js-commando');
const misc = require('../misc.js');
const mydice = require('../dice/diceclass.js');
const currency = require('../../structures/currency.js');
const vs = require('../dice/dicevs.js');
const dsemoji = require('discord-emoji');
const item = require('../dice/item');
const database = require('../../structures/database');
const srandom = require('seeded-random');
const Discord = require('discord.js');

class MehCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'meh',
            aliases: ['test'],
            group: 'royal',
            memberName: 'meh',
            description: 'Test command DO NOT USE IF YOU VALUE YOUR ACCOUNT',

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





            return;

            console.log(something);
            var s1 = "🖤 🛑 🇿 🇾 🇽 🇼 🇻 🇺 🇹 🇸 🇷 🇶 🇵 🇴 🇳 🇲 🇱 🇰 🇯 🇮 🇭 🇬 🇫 🇪 🇩 🇨 🇧 🇦"
            var s2 = "black_heart octagonal_sign regional_indicator_z regional_indicator_y regional_indicator_x regional_indicator_w regional_indicator_v regional_indicator_u regional_indicator_t regional_indicator_s regional_indicator_r regional_indicator_q regional_indicator_p regional_indicator_o regional_indicator_n regional_indicator_m regional_indicator_l regional_indicator_k regional_indicator_j regional_indicator_i regional_indicator_h regional_indicator_g regional_indicator_f regional_indicator_e regional_indicator_d regional_indicator_c regional_indicator_b regional_indicator_a"
            var ss1 = s1.split(" ");
            var ss2 = s2.split(" ");
            for(var i = 0; i < ss1.length;i++){
                console.log("    \""+ss2[i]+"\": \""+ss1[i]+"\",");

            }//    "ring": "💍",
            
            return;

            var badguy = new mydice();
            badguy.generate("emoji4");
            
            //var difficulty5 = new mydice();
            //difficulty5.generate("emoji5");
            
            var twins = [];
            for(var j = 0;j<100;j++)
            {
                var peakuser = new mydice();
                peakuser.generate("rare3");
                peakuser.cheapaugment(20);
            
                
                var totalwins = 0;
                for(var i = 0;i<100;i++)
                {
                    var stuff  = vs.processBattle(peakuser,badguy);
                    if(stuff.results > 0)
                        totalwins++;
                }
                twins.push(totalwins);
            }
            twins.sort(function(a, b) {
                return a - b;
              });
            var rstring = "";
            for(var l = 0; l<twins.length;l++){
                if(twins[l] < 20)
                    rstring+="X ";
                else
                    rstring+= twins[l]+" ";
                if(l % 10 == 9)
                    rstring+= "\n";
            }
            message.channel.send(rstring);

            //message.channel.send("Dice1: "+peakuser.read()+"\nDice2: "+difficulty4.read()+"\n\nTotal wins: "+totalwins+"%");

            //message.channel.send(d.read()+"\n\n"+d2.read());
            
            //message.channel.send(d.read()+"\n\n"+d2.read());
            //message.channel.send(gr1);
            
            
            var resultstring = "";
            
            //message.channel.send(resultstring);
            
            
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