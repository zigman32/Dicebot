const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const Database = require('../../structures/database');



class DicevsCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'dicevs',
            aliases: ['vsdice','🎲'],
            group: 'dice',
            memberName: 'dicevs',
            description: 'Challenge another user to a dice battle',
            args: [
                {
                    key: 'argoponent',
                    prompt: 'Who do you want to battle?',
                    type: 'string',
                    default: ''

                    
                }
            ]
        });

    }

    async run(message, args) {
        const { argoponent } = args;
        
        //---------------OBTAIN OPONENT AND USER INFO--------------
        var ch = message.guild;
        var db = this.client.provider.db;

        if(!argoponent)
        {
            message.channel.send("You didn't select an oponent...");
            return;
        }
        var id1 = message.author.id;
        var name1 = misc.getTrueName(id1,ch,this.client);
        var id2;
        var name2;

        var otype = "null";//what type of oponent is it (user,emoji,dicebot,etc)

        var dtype;
        if(message.mentions.users.first())
        {
            dtype = "user";
            id2 = message.mentions.users.first().id;
            name2 = misc.getTrueName(id2,ch,this.client);
            otype = "user";
        }else{
            var oinfo = DicevsCommand.isValidOponent(argoponent);
            if(oinfo == "null")
            {
                message.channel.send("That's not a valid oponent...");
                return;
            }//else{}
            
            dtype = oinfo.dtype;
            otype = oinfo.otype;
            id2 = oinfo.id;
            name2 = oinfo.name;
            
        }
        if(id2 == "354242075862237184")//vs dicebot
        {
            otype = "dicebot";
            name2 = "Dice Bot"
        }
        
        

        

        
        var dice1 = await misc.getormakedice(id1,db,"user");
        var dice2;
         
        if(dtype == "game_die")
            dice2 = dice1;
        else
            dice2 = await misc.getormakedice(id2,db,dtype);


        
        
        
        if(otype == "dicebot"){
            var timeleft = await misc.getHourly("dicebot1",id1,db)
            if(timeleft > 0)
            {
                message.channel.send("You have challenged me too recently. You will have to wait another "+Math.floor(timeleft/1000/60)+" minutes.");
                return;
            }
            //console.log("Setting hourly");
            await misc.setHourly("dicebot1",1,id1,db);
        }
        if(otype == "emoji1" || otype == "emoji2" || otype == "emoji3" || otype == "emoji4" || otype == "gun" || otype == "game_die"){
            var timeleft = await misc.getHourly("emojibattle1",id1,db);
            if( timeleft > 0)
            {
                message.channel.send("You can only challenge an emoji once every 3 hours. You will have to wait another "+Math.floor(timeleft/1000/60)+" minutes.");
                return;
            }
            await misc.setHourly("emojibattle1",3,id1,db);
        }
        var resultstring = "";

        resultstring = resultstring+this.getPreDialogue(id2,id1,name2,name1,otype,db);
        var battle = DicevsCommand.processBattle(dice1,dice2,name1,name2);
        resultstring = resultstring+battle.dialogue;
        
        if(battle.results > 0)//oponent 1 won
        {
            resultstring = resultstring+await this.getWinDialogue(id2,id1,name2,name1,otype,db);
        }
        if(battle.results < 0)//oponent 2 won
        {
            resultstring = resultstring+await this.getLooseDialogue(id2,id1,name2,name1,otype,db);
        }
        if(battle.results == 0)//tie
        {
            resultstring = resultstring+await this.getTieDialogue(id2,id1,name2,name1,otype,db);
        }
        resultstring = resultstring+await this.getPostDialogue(id2,id1,name2,name1,otype,db);
        

        
        resultstring = resultstring.replace(/Oponent/g,name2);
        
        
        
        message.channel.send(resultstring);
        
        

    }

    static isValidOponent(string){
        
        var emoji = misc.getEmoji(string);
        
        if(emoji != false)
        {   
            var type = emoji.type;
            var emojiname = emoji.name;
            var myotype = "emoji1";
            switch(type){
                case "activity":
                    myotype = "emoji2";
                    break;
                case "flags":
                    myotype = "emoji1";
                    break;
                case "food":
                    myotype = "emoji1";
                    break;
                case "nature":
                    myotype = "emoji2";
                    break;
                case "objects":
                    myotype = "emoji3";
                    break;
                case "people":
                    myotype = "emoji3";
                    break;
                case "symbols":
                    myotype = "emoji2";
                    break;
                case "travel":
                    myotype = "emoji1";//+(emoji.charCodeAt(0)%2);//either 1 or 0
                    break;  
            }

            var mydtype = myotype;

            if(emojiname == "gun")
            {
                myotype = "gun";
                mydtype = "gun";
            }
            /*if(emojiname == "gift")
            {
                otype = "gift";
                dtype = "emoji1";
            }*/
            if(emojiname == "game_die")
            {
                myotype = "game_die";
                mydtype = "game_die";
            }
            if(emojiname == "trophy")
            {
                myotype = "emoji4";
                mydtype = "emoji4";
            }
            if(emojiname == "medal" || emojiname == "military_medal")
            {
                myotype = "emoji3";
                mydtype = "emoji3";
            }
            if(emojiname == "first_place")
            {
                myotype = "emoji3";
                mydtype = "emoji3";
            }
            if(emojiname == "second_place")
            {
                myotype = "emoji2";
                mydtype = "emoji2";
            }
            if(emojiname == "third_place")
            {
                myotype = "emoji1";
                mydtype = "emoji1";
            }
            /*
            if(emojiname == "gem")
            {
                otype = "gem";
                dtype = "emoji1";
            }
            */

            switch(emojiname){//PROBABLY SHOULDVE DONE MOST OF THE ABOVE IN THIS SWITCH STATEMENT BUT OH WELL
                case "poop":
                    myotype = "emoji4";
                    mydtype = "emoji4_TYPE/3";
                    break;
                case "ghost":
                    myotype = "emoji4";
                    mydtype = "emoji4_TYPE/7";
                    break;
                case "thinking":
                case "eggplant":
                case "100":
                    myotype = "emoji4";
                    mydtype = "emoji4";
                    break;
                

            }
            
            


            

            
            return {name:string,id:emojiname,otype:myotype,dtype:mydtype};
        }
        
        return "null";
    }

    getPreDialogue(oid,uid,oname,uname,otype,db){
        var resultstring = "";
        switch(otype){
            /* case "dicebot":
                resultstring = resultstring+= oname + " :slight_smile:\n";
                resultstring = resultstring+= oname + " :handshake:\n";
                resultstring = resultstring+= oname + " :crossed_swords:\n\n";
                break; */
            case "gun":
                resultstring = resultstring+= "DRAW!\n\n";
                break;
            case "user":
            default:
                resultstring = resultstring+= "Begining battle...\n\n";
                break;
        
            
        }
        return resultstring;
    }

    async getWinDialogue(oid,uid,oname,uname,otype,db){
        var resultstring = "";

        var prizemoney;
        var difficulty;
        var toupgrade;
        var repgain;

        var oswitch = otype;

        switch(otype){
            case "emoji1":
                prizemoney = 200;
                difficulty = 1;
                repgain = 10;
                oswitch = "emoji";
                break;
            case "emoji2":
                prizemoney = 500;
                difficulty = 2;
                repgain = 20;
                oswitch = "emoji";
                break;
            case "emoji3":
                prizemoney = 1500;
                difficulty = 3;
                repgain = 30;
                oswitch = "emoji";
                break;
            case "emoji4":
                prizemoney = 4000;
                difficulty = 4;
                repgain = 50;
                oswitch = "emoji";
                break;
            case "gun":
                if("." == await Database.getFlag(uid,"beatgun",db)){
                    prizemoney = 6000;
                    repgain = 100;
                }else{
                    prizemoney = 600;
                    repgain =10;
                }
                await Database.setFlag(uid,"beatgun","yes",db);
                difficulty = 4;
                oswitch = "emoji";
                
                break;
            case "game_die":
                prizemoney = 150;
                repgain = 5;  
                difficulty = 1;
                oswitch = "emoji";
                break;
            
            
        }



        switch(oswitch){
            case "user":
                resultstring = resultstring+= "You win! Hooray!\n";
                break;
            case "emoji":
                resultstring = resultstring+= "Congratulations! You defeated Oponent!\n";

                //--------money-------------------
                //var prizemoney = 200;
                await currency.addMoney(uid,prizemoney,db);
                resultstring+= "They dropped "+prizemoney+" "+currency.textPlural()+"\n";
                
                resultstring = resultstring+= "You have gained "+repgain+" reputation!\n\n";
                await currency.addReputation(repgain,uid,db);
                
                //----------------diceupgrade----------------
                //var difficulty = 1;
                
                var ddice = await misc.getormakedice(uid,db);
                var boost = await ddice.addEmoji(oid,difficulty,db);
                
                
                if(boost)
                {
                    const MAXEACHDIFFICULTY = 10;
                    var myemojicount = await ddice.getEmojiCount(difficulty,db);
                    var upgradeinfo = mydice.toNextUpgrade(myemojicount,difficulty);
                    if(upgradeinfo.upgrade)
                    {
                        await ddice.augment(1,db,"emoji"+difficulty,MAXEACHDIFFICULTY);
                        resultstring+= ":sparkles:For defeating "+myemojicount+" unique level "+difficulty+" emojis, your dice has gained gained 1 point!:sparkles:\n";
                    
                    }
                    if(upgradeinfo.tonext != 0)
                        resultstring+= "Defeat "+upgradeinfo.tonext+" more level "+difficulty+" oponents to upgrade your dice again!\n";
                }

                
                //----------------consecutiveity-------------
                await misc.upConsecutive("emoji_"+oid,uid,db);
                var consecutive = await misc.getConsecutive("emoji_"+oid,uid,db);
                if(consecutive == 2){
                    var col = await misc.getCollection(uid,db);
                    if(!col.includes(oid))
                    {   
                        resultstring+= "Oponent has been added to your collection! (view your collection with the !collection command)\n";
                        await misc.addToCollection(oid,uid,db);
                    }
                }
                resultstring = resultstring+= "Streak: "+consecutive+"\n";

                //misc.setdice(ddice,uid,db);
                

                
                break;
            case "dicebot":
                resultstring = resultstring+= "Gratz on defeating me! Have some money!\n";
                resultstring = resultstring+=  "*Dice Bot has given you 70 "+currency.textPlural()+" as a reward for your victory*\n";
                await currency.addMoney(uid,70,db);
                var repgain = 3;
                resultstring = resultstring+= "You have gained "+repgain+" reputation!\n\n";
                await currency.addReputation(repgain,uid,db);

                //NO DOING THIS YET BECAUSE BUGGY AND ANNOYING
                /*
                misc.upConsecutive("dice_dicebotvictory",uid,db);

                var diceba = misc.getormakedice(uid,db);
                var con = misc.getConsecutive("dice_dicebotvictory",uid,db)
                if(con == 2)
                {
                    if(diceba.getBoosts("dicebot1")<1){
                        resultstring = resultstring+=  "*To celebrate your first time defeating Dice Bot twice in a row(with that particular dice), Dice Bot has upgraded your dice, making it slightly stronger.*\n\n";
                        var dicea = misc.getormakedice(uid,db);
                        dicea.augment(1,"dicebot1",2);
                        misc.setdice(dicea,uid,db);
                        db.settings.set("DICE_dicebotcons2_"+uid,true)
                    }

                }
                if(con == 3)
                {
                    if(diceba.getBoosts("dicebot1")<2){
                        resultstring = resultstring+=  oid + " :sunglasses:\n";
                        resultstring = resultstring+=  oid + " :sparkles:\n";
                        resultstring = resultstring+=  "*To celebrate your first time defeating Dice Bot three times in a row(with that particular dice), Dice Bot has blessed your dice again, enhancing it further.*\n\n";
                        var dicea = misc.getormakedice(uid,db);
                        dicea.augment(1,"dicebot1",2);
                        misc.setdice(dicea,uid,db);
                        db.settings.set("DICE_dicebotcons3_"+uid,true)
                    }
                    
                }

                
                */
                break;
            
        }
        return resultstring;
    }

    async getTieDialogue(oid,uid,oname,uname,otype,db){
        var resultstring = "";
        switch(otype){
            case "user":
                resultstring = resultstring+= "It was a tie! Nobody wins...\n";
                break;
            case "dicebot":
                resultstring = resultstring+= "A tie? Unusual....\n";
                var repgain = 1;
                resultstring = resultstring+= "You have gained "+repgain+" reputation!\n\n";
                await currency.addReputation(repgain,uid,db);
                
                
                break;
            case "emoji1":
            case "emoji2":
            case "emoji3":
            case "emoji4":
            case "game_die":
            case "gun":
                resultstring = resultstring+= "It was a tie! Nobody wins...\n";    
                var repgain = 3;
                resultstring = resultstring+= "You have gained "+repgain+" reputation!\n\n";
                await currency.addReputation(repgain,uid,db);
                
                break;
                
            
        }
        return resultstring;
    }

    async getLooseDialogue(oid,uid,oname,uname,otype,db){
        var resultstring = "";
        switch(otype){
            case "user":
                resultstring = resultstring+= "You lost...\n";
                break;
            case "dicebot":
                resultstring = resultstring+= "You lost... how dissapointing.\n\n";
                //misc.breakConsecutive("dice_dicebotvictory",uid,db);
                break;
            case "emoji1":
            case "emoji2":
            case "emoji3":
            case "emoji4":
            case "game_die":
            case "gun":
                await misc.breakConsecutive("emoji_"+oid,uid,db);
                resultstring = resultstring+= "You lost...\n";
                var repgain = 1;
                resultstring = resultstring+= "You have gained "+repgain+" reputation!\n\n";
                await currency.addReputation(repgain,uid,db);
                
                break;
            

            
            
        }
        return resultstring;
    }

    async getPostDialogue(oid,uid,oname,uname,otype,db){
        var resultstring = "";
        switch(otype){
            case "dicebot":
                resultstring = resultstring+= "Thank you for the entertainment!";
                break;
            case "emoji1":
            case "emoji2":
            case "emoji3":
            case "emoji4":
            case "game_die":
            case "gun":
                resultstring = resultstring+= "Thank you for playing!\n";
                break;
            case "user":
                if(await misc.daily("dice_pvpinitrep",uid,db))
                {
                    resultstring = resultstring+= "You have gained 1 reputation!\n";
                    await currency.addReputation(1,uid,db);
                }
                if(uid != oid){
                    if(await misc.daily("dice_pvpvictimrep",oid,db))
                    {
                        resultstring = resultstring+= "Oponent has gained 1 reputation!\n";
                        await currency.addReputation(1,oid,db);
                        
                    }
                }

            default:
                resultstring = resultstring+= "Thank you for playing!\n";
                break;
        
            
        }
        return resultstring;
    }


    static processBattle(dice1,dice2,name1,name2){
       
        var resultstring = "";
        
        var doq1 = true;
        var doq2 = true;
        
        
        var face1 = dice1.roll();
        var face2 = dice2.roll();
        var face1A = dice1.roll();
        var face2A = dice2.roll();
        resultstring+="Your dice: "+dice1.read()+"\n";
        resultstring+="Oponent's dice: "+dice2.read()+"\n";
        
        resultstring+="You rolled: " + mydice.readFace(face1);
        if(mydice.hasModifier(face1,"A") == 1 || mydice.hasModifier(face1,"D") == 1 || mydice.hasModifier(face1,"QA") == 1 || mydice.hasModifier(face1,"QD") == 1){
            resultstring+= "/"+mydice.readFace(face1A);
            
        }
        if((face1A.value > face1.value && mydice.hasModifier(face1,"A") == 1)  || (face1A.value < face1.value && mydice.hasModifier(face1,"D") == 1))
        {        
            face1=face1A;
            doq1 = false;
        }   
        resultstring+="\n"


        resultstring+="Oponent rolled: " + mydice.readFace(face2);
        if(mydice.hasModifier(face2,"A") == 1 || mydice.hasModifier(face2,"D") == 1 || mydice.hasModifier(face2,"QA") == 1 || mydice.hasModifier(face2,"QD") == 1){
            resultstring+= "/"+mydice.readFace(face2A);
            
            
        }
        if((face2A.value > face2.value && mydice.hasModifier(face2,"A") == 1)  || (face2A.value < face2.value && mydice.hasModifier(face2,"D") == 1))
        {
            face2=face2A;
            doq2 = false;
        }
        resultstring+="\n"


        //----------QUANTUM HANDLING CODE, DEEP STUFF (not really quantum)
        var q1 = false;
        var q2 = false;

        if((mydice.hasModifier(face1,"QA") || mydice.hasModifier(face1,"QD")) && doq1)
            q1 = true;
        if((mydice.hasModifier(face2,"QA") || mydice.hasModifier(face2,"QD")) && doq2)
            q2 = true;
        
        if(q1 == true && q2 == true)//TWO QUANTUMS CANCEL EACHOTHER OUT
        {
            q1 = false;
            q2 = false;
        }

        var tmult = DicevsCommand.applytypes(face1,face2);
        
        
        var score1 = tmult[0];
        var score2 = tmult[1];

        

        if(q1){
            
            var tmultA = DicevsCommand.applytypes(face1A,face2);
            
            var score1A = tmultA[0];
            var score2A = tmultA[1];

            if(((score1 <= score2 && score1A >= score2A) && !(score1A == score2A && score1 == score2) && mydice.hasModifier(face1,"QA")) || ((score1 >= score2 && score1A <= score2A)&& !(score1A == score2A && score1 == score2) && mydice.hasModifier(face1,"QD")))
            {
                
                face1 = face1A;
                score1 = score1A;
                score2 = score2A;
            }
        }

        if(q2){
            
            var tmultA = DicevsCommand.applytypes(face1,face2A);
            
            var score1A = tmultA[0];
            var score2A = tmultA[1];

            if(((score1 >= score2 && score1A <= score2A)&& !(score1A == score2A && score1 == score2) && mydice.hasModifier(face2,"QA")) || ((score1 <= score2 && score1A >= score2A)&& !(score1A == score2A && score1 == score2) && mydice.hasModifier(face2,"QD")))
            {
                
                face2 = face2A;
                score1 = score1A;
                score2 = score2A;
            }
        }
        
        
        
        resultstring = resultstring+="Final result:    Your score: " + score1+"  Oponent's score: "+score2+"\n\n";
        
        
        
        return { results: score1-score2 , dialogue: resultstring};
    }

    static applytypes(facea,faceb){
        var chart = [
        "11111½10½111111111½n",
        "21½½12½021111½212½½n",
        "12111½21½112½11111½n",
        "111½½½1½0112111112½n",
        "110212½1221½211111½n",
        "1½21½121½211112111½n",
        "1½½½111½½½1212112½½n",
        "0111111211111211½1½n",
        "11111211½½½1½12112½n",
        "11111½212½½2112½11½n",
        "1111221112½½111½11½n",
        "11½½22½1½½2½111½11½n",
        "11210111112½½11½11½n",
        "12121111½1111½1101½n",
        "11212111½½½211½211½n",
        "11111111½111111210½n",
        "1½11111211111211½½½n",
        "121½1111½½11111221½n",
        "2222222222222222221n",
        "11111111111111111111"];
        
        var val1 = 1;
        var val2 = 1;
            
        var inv = false;
        if((mydice.hasModifier(facea,"I") || mydice.hasModifier(faceb,"I")) && !(mydice.hasModifier(facea,"I") && mydice.hasModifier(faceb,"I")))
            inv = true;



        var WEAKNESSVAL = 1.5;
        var RESISTANCEVAL = .75;
        var IMMUNITYVAL = .5;

        if(inv){
            WEAKNESSVAL = .75;
            RESISTANCEVAL = 1.5;
            IMMUNITYVAL = 2;
        }

        var typea = mydice.typenametonum(facea.type);
        var typeb = mydice.typenametonum(faceb.type);        
        var score1 = facea.value;
        var score2 = faceb.value;

        
        
        score1+= DicevsCommand.rrange(-mydice.hasModifier(facea,"RNG"),mydice.hasModifier(facea,"RNG"));
        score2+= DicevsCommand.rrange(-mydice.hasModifier(faceb,"RNG"),mydice.hasModifier(faceb,"RNG"));
        


        score1+=mydice.hasModifier(facea,"TNUM",typeb);


        score2+=mydice.hasModifier(faceb,"TNUM",typea);
        
        

        var mtype1 = mydice.hasModifier(facea,"CON",typeb);
        var mtype2 = mydice.hasModifier(faceb,"CON",typea);

        if(mtype1 == "D" || mtype1 == "C" || mtype2 == "V" || mtype2 == "S"){
            if(mtype2 == "R" || mtype2 == "D" || mtype1 == "S" || mtype1 == "B")
            {
                //val1*=1
            }else{
                val1*=WEAKNESSVAL;
            }
            
            
        }else{

            if(mtype1 == "S" || mtype1 == "B" || mtype2 == "D" || mtype2 == "R"){
                if(mtype2 == "S" || mtype2 == "V" || mtype1 == "C" || mtype1 == "D")
                {
                    //val1*=1
                }else
                {
                    if(mtype1 == "S" ||  mtype2 == "D"){
                        val1*=RESISTANCEVAL;
                    }else{
                        val1*=IMMUNITYVAL;
                    }
                }
            }else{
                if(chart[typea][typeb] == '2')
                {
                    val1*=WEAKNESSVAL;
                }
                if(chart[typea][typeb] == '0')
                {
                    val1*=IMMUNITYVAL;
                }
                if(chart[typea][typeb] == '½' )
                {
                    val1*=RESISTANCEVAL;
                }
                if(chart[typea][typeb] == 'n' )
                {
                    val1*=0;
                }
                
            }
        }   
        
        if(mtype2 == "D" || mtype2 == "C" || mtype1 == "V" || mtype1 == "S"){
            if(mtype1 == "R" || mtype1 == "D" || mtype2 == "S" || mtype2 == "B")
            {
                //val2*=1
            }else{
                val2*=WEAKNESSVAL;
            }
            
            
        }else{

            if(mtype2 == "S" || mtype2 == "B" || mtype1 == "D" || mtype1 == "R"){
                if(mtype1 == "S" || mtype1 == "V" || mtype2 == "C" || mtype2 == "D")
                {
                    //val2*=1
                }else
                {
                    if(mtype2 == "S" ||  mtype1 == "D"){
                        val2*=RESISTANCEVAL;
                    }else{
                        val2*=IMMUNITYVAL;
                    }
                }
            }else{
                if(chart[typeb][typea] == '2')
                {
                    val2*=WEAKNESSVAL;
                }
                if(chart[typeb][typea] == '0')
                {
                    val2*=IMMUNITYVAL;
                }
                if(chart[typeb][typea] == '½' )
                {
                    val2*=RESISTANCEVAL;
                }
                if(chart[typeb][typea] == 'n' )
                {
                    val2*=0;
                }
            }
        } 
        
        if(mydice.hasModifier(facea,"AND") != -1)
        {
            var typeaAND = mydice.hasModifier(facea,"AND");
            if(chart[typeaAND][typeb] == '2')
            {
                val1*=WEAKNESSVAL;
            }
            if(chart[typeaAND][typeb] == '0')
            {
                val1*=IMMUNITYVAL;
            }
            if(chart[typeaAND][typeb] == '½' )
            {
                val1*=RESISTANCEVAL;
            }
            if(chart[typeaAND][typeb] == 'n' )
            {
                val1*=0;
            }
            if(chart[typeb][typeaAND] == '2')
            {
                val2*=WEAKNESSVAL;
            }
            if(chart[typeb][typeaAND] == '0')
            {
                val2*=IMMUNITYVAL;
            }
            if(chart[typeb][typeaAND] == '½' )
            {
                val2*=RESISTANCEVAL;
            }
            if(chart[typeb][typeaAND] == 'n' )
            {
                val2*=0;
            }
        }   


        if(mydice.hasModifier(faceb,"AND") != -1)
            {
                var typebAND = mydice.hasModifier(faceb,"AND");
                if(chart[typea][typebAND] == '2')
                {
                    val1*=WEAKNESSVAL;
                }
                if(chart[typea][typebAND] == '0')
                {
                    val1*=IMMUNITYVAL;
                }
                if(chart[typea][typebAND] == '½' )
                {
                    val1*=RESISTANCEVAL;
                }
                if(chart[typea][typebAND] == 'n' )
                {
                    val1*=0;
                }
                if(chart[typebAND][typea] == '2')
                {
                    val2*=WEAKNESSVAL;
                }
                if(chart[typebAND][typea] == '0')
                {
                    val2*=IMMUNITYVAL;
                }
                if(chart[typebAND][typea] == '½' )
                {
                    val2*=RESISTANCEVAL;
                }
                if(chart[typebAND][typea] == 'n' )
                {
                    val2*=0;
                }
                
            }

            if(mydice.hasModifier(facea,"AND") != -1 && mydice.hasModifier(faceb,"AND") != -1)
                {
                    var typeaAND = mydice.hasModifier(facea,"AND");
                    
                    var typebAND = mydice.hasModifier(faceb,"AND");
                    if(chart[typeaAND][typebAND] == '2')
                    {
                        val1*=WEAKNESSVAL;
                    }
                    if(chart[typeaAND][typebAND] == '0')
                    {
                        val1*=IMMUNITYVAL;
                    }
                    if(chart[typeaAND][typebAND] == '½' )
                    {
                        val1*=RESISTANCEVAL;
                    }
                    if(chart[typeaAND][typebAND] == 'n' )
                    {
                        val1*=0;
                    }
                    if(chart[typebAND][typeaAND] == '2')
                    {
                        val2*=WEAKNESSVAL;
                    }
                    if(chart[typebAND][typeaAND] == '0')
                    {
                        val2*=IMMUNITYVAL;
                    }
                    if(chart[typebAND][typeaAND] == '½' )
                    {
                        val2*=RESISTANCEVAL;
                    }
                    if(chart[typebAND][typeaAND] == 'n' )
                    {
                        val2*=0;
                    }
                }
        
                if(val1 == 0 && mydice.hasModifier(facea,"S"))//THIS IS CHEAP AND DEFINATELY GOING TO CAUSE PROBLEMS LATER!
                {
                    val1 = 1;
                }
                if(val2 == 0 && mydice.hasModifier(faceb,"S"))
                {
                    val2 = 1;
                }

        

        score1*=val1;
        score2*=val2;
        
        if(score1 == score2 && mydice.hasModifier(facea,"E") == 1)
            score1++;
        if(score1 == score2 && mydice.hasModifier(facea,"F") == 1)
            score1--;
        if(score1 == score2 && mydice.hasModifier(faceb,"E") == 1)
            score2++;
        if(score1 == score2 && mydice.hasModifier(faceb,"F") == 1)
            score2--;
        
        
        return [score1,score2];

    }

    static rrange(min,max){
         return Math.floor(Math.random() * (1+max - min) + min);
    } 
    
}

module.exports = DicevsCommand;