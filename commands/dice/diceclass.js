const misc = require('../misc.js');


class Dice {
    
    static hello(){
        console.log("Hello dice");
    }

    goodbye(){
        console.log("Goodbye dice");
    }
    static rint(val){
        return Math.floor(Math.random() * (val));
    }
    static rrange(min,max){
        return Math.random() * (max - min) + min;
    }

    static rrangewhole(min,max){//INCLUSIVE EITHER WAY
        return Math.floor(Math.random() * (1+max - min) + min);
    }
    

    static rweights(list, weight)
    {
        
        var total_weight = weight.reduce(function (prev, cur, i, arr) {
            return prev + cur;
        });
        
        var random_num = Dice.rrange(0, total_weight);
        var weight_sum = 0;
        
        for (var i = 0; i < list.length; i++) {
            weight_sum += weight[i];
            weight_sum = +weight_sum.toFixed(2);
            
            if (random_num <= weight_sum) {
                return list[i];
            }
        }
     
    }

    constructor(asize = 0, afaces = []) {
        this.size = asize;
        this.faces = afaces;
    }
    
    read(){

        var out = "";
        var i;
        for(var i = 0;i<this.size;i++)
        {
            out=out+Dice.readFace(this.faces[i]);
            if(i != this.size-1)
                out = out + ",";
        }
        return out;
    }

    static readFace(face){
        var resultstring = "";
        resultstring += face.type+" "+face.value;
        if(typeof face.mods === "undefined")
            face.mods = [];
        for(var i = 0;i<face.mods.length;i++)
        {
            resultstring += "("+face.mods[i]+")";
        }
        return resultstring;
    }

    roll(){
        var weights = [];
        for(var i = 0;i<this.size;i++)
        {
            var wi = 1;
            if(Dice.hasModifier(this.faces[i],"H"))
            {
               wi *= 2;
            }
            if(Dice.hasModifier(this.faces[i],"L"))
            {
               wi *= 0.5;
            }

            weights[i]=wi;
        }

        return Dice.rweights(this.faces,weights);


        var res = Dice.rint(this.size);
        return this.faces[res];
    }
    setFaces(obj){
        this.faces = obj;
        this.size = obj.length;
    }
    getBoosts(type){
        if (typeof this.boosts === "undefined"){
            this.boosts = {};
        }
        if (typeof this.boosts[type] === "undefined"){
            this.boosts[type] = 0;
        }
        return this.boosts[type];
    }
    augment(num,space = 0,max = 99999){

        if (typeof this.boosts === "undefined"){
            this.boosts = {};
        }
        
        var left;
        if(space != 0)
        {
            
            if (typeof this.boosts[space] === "undefined"){
                this.boosts[space] = 0;
            }
            
            var done = this.boosts[space];
            left = Math.min(num,max-done);
        }else
        {
            left = num;
        }
        for(var i = 0;i<left;i++)
        {
            var j = Dice.rint(this.size);
            this.faces[j].value = this.faces[j].value+1;
        }
        if(space != 0)
        {
            this.boosts[space] = this.boosts[space]+left;
        }
    }
    addEmoji(name,difficulty){

        difficulty = "level"+difficulty;
        if (typeof this.emojilist === "undefined"){
            this.emojilist = {};
        }
        if (typeof this.emojilist[difficulty] === "undefined"){
            this.emojilist[difficulty] = [];
        }

        if(this.emojilist[difficulty].includes(name))
        {
            return false;
        }

        this.emojilist[difficulty].push(name);

        console.log("LIST: "+this.emojilist[difficulty]);
        return true;


    }

    getEmojiCount(difficulty){
        difficulty = "level"+difficulty;
        if (typeof this.emojilist === "undefined"){
            this.emojilist = {};
        }
        if (typeof this.emojilist[difficulty] === "undefined"){
            this.emojilist[difficulty] = [];
        }
        return this.emojilist[difficulty].length;

    }


    generate(dicetype = "user"){

        var SIDES;
        var DEFAULTSCORE;
        var BONUSRANGE;
        var NUMTYPES;
        var MINSCORE;
        var modlevel;
        var modnum; //Default is 1, this is number of times modchance is rolled
        var iter = 1;
        var ultmutatechance = 0;//chance to mutate a type to the ultimate type. 

        if(dicetype.includes("user"))
        {
            SIDES = 6;
            DEFAULTSCORE = 21;
            BONUSRANGE = 0;
            NUMTYPES = 2;
            MINSCORE = 0;
            modlevel = [100,0,0,0,0];
            modnum = [100,0,0,0];
            iter = 2;
            
        }
        if(dicetype.includes("emoji0"))
        {
            SIDES = Dice.rint(3)+4;
            DEFAULTSCORE = 19; //for 6 sides, if more or less, result is adjusted accordingly
            BONUSRANGE = 0;
            NUMTYPES = Dice.rint(4)+1;
            modlevel = [65,30,5,0,0];//First value is odds of no modifiers, second is level 1 etc
            modnum = [80,15,5,0];
            iter = 2;
        }
        if(dicetype.includes("emoji1"))
        {
            SIDES = Dice.rint(3)+4;
            DEFAULTSCORE = 24;
            BONUSRANGE = 5;
            NUMTYPES = Dice.rint(4)+1;
            MINSCORE = 0;
            modlevel = [65,30,5,0,0];//First value is odds of no modifiers, second is level 1 etc
            modnum = [80,15,5,0];
            iter = 3;
        }
        if(dicetype.includes("emoji2"))
        {
            SIDES = Dice.rint(3)+4;
            DEFAULTSCORE = 29;
            BONUSRANGE = 10;
            NUMTYPES = Dice.rint(4)+1;
            MINSCORE = 0;
            modlevel = [30,40,25,5,0];//First value is odds of no modifiers, second is level 1 etc
            modnum = [80,15,5,0];
            iter = 4;
        }
        if(dicetype.includes("emoji3"))
        {
            SIDES = Dice.rint(3)+4;
            DEFAULTSCORE = 50;
            BONUSRANGE = 20;
            NUMTYPES = Dice.rint(4)+1;
            MINSCORE = 0;
            modlevel = [20,0,40,30,10];//First value is odds of no modifiers, second is level 1 etc
            modnum = [40,30,20,10];
            iter = 6;
            ultmutatechance = 0.03;
        }
        if(dicetype.includes("emoji4"))
        {
            SIDES = Dice.rint(3)+4;
            DEFAULTSCORE = 80;
            BONUSRANGE = 30;
            NUMTYPES = Dice.rint(4)+1;
            MINSCORE = 0;
            modlevel = [0,5,5,20,80];//YEAH THEY DON'T ADD UP TO 100 DEAL WITH IT
            modnum = [20,25,30,35];
            iter = 9;
            ultmutatechance = 0.06;
        }
        if(dicetype.includes("rare0"))//common
        {
            SIDES = 6;
            DEFAULTSCORE = 18;
            BONUSRANGE = 6;
            NUMTYPES = 2;
            if(Math.random() < 0.2)
                NUMTYPES++;
            MINSCORE = 0;
            modlevel = [90,10,0,0,0];
            modnum = [100,0,0,0];
            iter = 2;
        }
        if(dicetype.includes("rare1"))//rare
        {
            SIDES = 6;
            DEFAULTSCORE = 22;
            if(Math.random() < 0.01)
            {
                SIDES--;
                DEFAULTSCORE-=4;
            }
            if(Math.random() < 0.01)
            {
                SIDES++;
                DEFAULTSCORE+=4;
            }
            BONUSRANGE = 6;
            NUMTYPES = 2;
            if(Math.random() < 0.2)
                NUMTYPES++;
            if(Math.random() < 0.1)
                NUMTYPES--;
            
            MINSCORE = 2;
            modlevel = [80,15,5,0,0];
            modnum = [95,5,0,0];
            iter = 2;
        }
        if(dicetype.includes("rare2"))//super rare (100 favor)
        {
            SIDES = 6;
            DEFAULTSCORE = 26;
            if(Math.random() < 0.01)
            {
                SIDES--;
                DEFAULTSCORE-=5;
            }
            if(Math.random() < 0.01)
            {
                SIDES++;
                DEFAULTSCORE+=5;
            }
            BONUSRANGE = 8;
            NUMTYPES = 2;
            if(Math.random() < 0.2)
                NUMTYPES++;
            if(Math.random() < 0.1)
                NUMTYPES--;
            
            MINSCORE = 3;
            modlevel = [50,20,20,10,0];
            modnum = [80,10,10,0];
            iter = 2;
        }
        if(dicetype.includes("rare3"))//ultra rare (300/500 favor)
        {
            SIDES = 6;
            DEFAULTSCORE = 30;
            if(Math.random() < 0.01)
            {
                SIDES--;
                DEFAULTSCORE-=6;
            }
            if(Math.random() < 0.01)
            {
                SIDES++;
                DEFAULTSCORE+=6;
            }
            BONUSRANGE = 10;
            NUMTYPES = 2;
            if(Math.random() < 0.2)
                NUMTYPES++;
            if(Math.random() < 0.1)
                NUMTYPES--;
            
            MINSCORE = 4;
            modlevel = [20,20,20,20,20];
            modnum = [60,20,10,10];
            iter = 2;
        }
        if(dicetype.includes("rare4"))//RADIANT (??? favor)
        {
            SIDES = 6;
            DEFAULTSCORE = 45;
            BONUSRANGE = 5;
            NUMTYPES = 2;
            if(Math.random() < 0.2)
                NUMTYPES++;
            if(Math.random() < 0.1)
                NUMTYPES--;
            
            MINSCORE = 6;
            modlevel = [0,0,25,25,50];
            modnum = [25,25,25,25];
            iter = 2;
            ultmutatechance = 0.05;
        }
        
            

        if(dicetype.includes("TYPE/"))
        {
            var types = dicetype.split("/");
            types.splice(0,1);
            NUMTYPES = types; //THIS IS DEFINATELY CANCER
        }
        DEFAULTSCORE = Math.floor(DEFAULTSCORE*(SIDES/6));
        BONUSRANGE = Math.floor(BONUSRANGE*(SIDES/6));
        
        

        
        
        
        this.boosts = [];

        var score = DEFAULTSCORE+Dice.rint(BONUSRANGE);

        this.initFaces(SIDES);
        this.assignFacesScore(score,SIDES,MINSCORE,iter);
        this.assignFacesType(NUMTYPES,SIDES);
        this.assignMods(modlevel,modnum,SIDES);
        this.finalMutations(dicetype,ultmutatechance,SIDES);
        
        
        this.size = SIDES;
		
        
    }

    

    initFaces(SIDES){
        for(var i = 0;i<SIDES;i++)
            {
                this.faces[i] = {value:0,type: -1, mods: []};
            }
    }

    assignFacesScore(score,SIDES,minscore = 0,iter = 1){
        for(var i = 0;i<SIDES;i++){
            this.faces[i].value = 0;
        }
        
        var iterscore = Math.floor(score/iter);
        var iterremainder = score%iter;
        for(var i = 0;i<iter;i++){
            if(i == iter-1)
                iterscore+=iterremainder;
            this.iterateFacesScore(iterscore,SIDES);
        }
        for(var i = 0;i<SIDES;i++){
            this.faces[i].value = Math.max(this.faces[i].value,minscore);
        }

    }

    iterateFacesScore(score,SIDES){
        var dividors = [];
        for(var i = 0;i<SIDES+1;i++)
        {
            dividors[i] = Dice.rint(score+1);
        }
        dividors[0]=0;
        dividors[SIDES] = score;

        dividors.sort(function(a, b) {
            return a - b;
          });
        for(var i = 0;i<SIDES;i++){
            this.faces[i].value += dividors[i+1]-dividors[i];
        }
    }

    assignFacesType(NUMTYPES,SIDES){
        var typecandidates = [];
        if(NUMTYPES.constructor === Array)
        {
            for(var i = 0;i<NUMTYPES.length;i++)
            {
                if(NUMTYPES[i] == "?")
                    NUMTYPES[i] = Dice.rint(18)
                else
                    NUMTYPES[i] = parseInt(NUMTYPES[i]);
            }
            typecandidates = NUMTYPES;
            NUMTYPES = NUMTYPES.length;
        }
        else{
            for(var i = 0;i<NUMTYPES;i++)
            {
                typecandidates[i] = Dice.rint(18);
            }
        }
        for(var i = 0;i<SIDES;i++){    
            this.faces[i].type = Dice.typenumtoname(typecandidates[Dice.rint(NUMTYPES)]);
        }
    }

    
    
    assignMods(modchance,modnum,SIDES){

        for(var k = 0;k<SIDES;k++)
        {

            var modlevel = 0;
            var modamount = Dice.rweights([1,2,3,4],modnum);
            for(var i = 0;i<modamount;i++)
            {
                modlevel = Dice.rweights([0,1,2,3,4],modchance);
                var mods = Dice.getRandomModifiers(modlevel,0.25);
                for(var j = 0;j<mods.length;j++)
                { 
                    this.faces[k].mods.push(mods[j]);
                }
            }
            
        }
    }

    finalMutations(dtype,ultmutatechance,SIDES){
        for(var i = 0;i<SIDES;i++)
        {
            this.removeDuplicateModifiers(this.faces[i]);     
            if(Math.random()<ultmutatechance)
            {
                this.faces[i].value = Math.max(this.faces[i].value-5,1);
                this.faces[i].type = "ultimate";
            }
            
            
        }
    }

    removeDuplicateModifiers(face){
        for(var i = 0;i<face.mods.length;i++)
        {
            var removeadv = false;
            var removeid = false;
            var removeand = false;
            switch(face.mods[i]){
                case "A":
                case "D":
                case "QA":
                case "QD":
                    removeadv = true;
                    break;
                case "E":
                case "F":
                case "I":
                case "S":
                case "H":
                case "L":
                    removeid = true;
                    break;
                default:
                    if(face.mods[i].charAt(1) == '_')
                        removeid = true;
                    if(face.mods[i].charAt(0) == '&')
                        removeand = true;
            }

            for(var j = i+1; j<face.mods.length;j++){
                if((removeid == true && face.mods[i] == face.mods[j])||(removeand == true && face.mods[j].charAt(0) == '&')||
                    (removeadv == true && (face.mods[j] == "A" ||face.mods[j] == "D" ||face.mods[j] == "QA" ||face.mods[j] == "QD")))
                {
                    face.mods.splice(j,1);
                    j--;
                }
            }
        }
    }
    
    static toDice(object){
        var dice = new Dice();
        for(var k in object) dice[k]=object[k];
        return dice;
    }

    static getRandomModifiers(level = 1,badchance = 0.25){


        
        var modlist;
        var weights;
        var tdist =[];

        switch(level){
            case 0:
                return [];
            case 1:
                modlist =   ["TNUM","C_","EDGE","RNG","HEAVY","LIGHT"];
                weights =   [    50,  10,    10,   20,      5,      5]; 
                tdist = [100,0,0,0];
                break;
            case 2:
                modlist =   ["TNUM","C_","R_","EDGE","RNG","HEAVY","LIGHT","INV"];
                weights =   [    30,   8,   7,     5,   20,     10,     10,   10]; 
                tdist = [80,20,0,0]
                break;
            case 3:
                modlist =   ["TNUM","C_","R_","D_","EDGE","ADV","RNG","HEAVY","LIGHT","AND","INV"];
                weights =   [    25,   5,   5,    5,   5,    10,   10,     10,     10,   10,    5];
                tdist = [67,26,7,0];

                break;
            case 4:
                modlist =   ["TNUM","C_","R_","D_","ADV","QA","RNG","HEAVY","LIGHT","AND","INV"];
                weights =   [    15,   5,   5,  10,   20,   5,   10,     10,     10,   10,    5];
                tdist = [0,67,26,7];
                break;

        }
        var mod = Dice.rweights(modlist,weights);
        var mods = [];
        var num = 1;
        if(mod == "TNUM")
        {
            num = Dice.rweights([1,2,3,4],tdist);
        }
        if((mod == "C_" || mod == "R_" || mod == "D_") && (level == 4))
        {
            num = Dice.rweights([1,2],[80,20]);
        }

        for(var i = 0; i<num;i++)
        {
            var type = Dice.typenametonick(Dice.typenumtoname(Dice.rint(18)));            
            var bad = false;
            if(Math.random < badchance)
                bad = true;
            
            switch(mod){
                case "TNUM":
                    var gb = (bad?"-":"+");
                    
                    switch(level){
                        case 1:
                            var val = (Dice.rint(3)+1);
                            mods.push(type+gb+val);
                            break;
                        case 2:
                            var val = (Dice.rint(3)+2);
                            mods.push(type+gb+val);
                            break;
                        case 3:
                            var val = (Dice.rint(4)+3);
                            mods.push(type+gb+val);
                            break;
                        case 4:
                            var val = (Dice.rint(6)+5);
                            mods.push(type+gb+val);
                            break;
                        default:
                            var val = (Dice.rint(3)+1);
                            mods.push(type+gb+val);
                            
                    }
                    break;
                case "C_":
                    var gb = (bad?"V":"C");
                    mods.push(gb+"_"+type);
                    break;
                case "R_":
                    var gb = (bad?"B":"R");
                    mods.push(gb+"_"+type);
                    break;
                case "D_":
                    var gb = (bad?"S":"D");
                    mods.push(gb+"_"+type);
                    break;
                case "EDGE":
                    var gb = (bad?"F":"E");
                    mods.push(gb);
                    break;
                case "ADV":
                    var gb = (bad?"D":"A");
                    mods.push(gb);
                    break;
                case "QA":
                    mods.push("QA");//QUANTUM DISADVANTAGE DOES NOT EXIST UNDER NORMAL CIRCUMSTANCES
                    break;
                case "RNG":
                    switch(level){
                        case 1:
                            var val = (Dice.rint(2)+1);
                            mods.push("+-"+val);
                            break;
                        case 2:
                            var val = (Dice.rint(4)+1);
                            mods.push("+-"+val);
                            break;
                        case 3:
                            var val = (Dice.rint(5)+3);
                            mods.push("+-"+val);
                            break;
                        case 4:
                            var val = (Dice.rint(8)+5);
                            mods.push("+-"+val);
                            break;
                        default:
                            var val = (Dice.rint(3)+1);
                            mods.push("+-"+val);
                            
                    }
                    break;
                case "HEAVY":
                    mods.push("H");
                    break;
                case "LIGHT":
                    mods.push("L");
                    break;
                case "AND":
                    mods.push("&"+type);
                    break;
                case "INV":
                    mods.push("I");
                    break;
                

            }
        }
        return mods;
    }

    static hasModifier(face,mod,type = -1){
        //return 0 if no modifier exists, return >0 if modifier exists and has no numeric value (numeric values may be added later)
        //return X if modifier exists and has numeric value X
        //-1 is not used because some modifiers can have negative values, but none should have zero values
        //except for that one part where I use -1

        if(typeof face.mods === "undefined")
        {
            face.mods = [];
        }

        
        switch(mod){
            case "A":
                if(face.mods.includes("A"))
                    return 1;
                else
                    return 0;
                break;
            case "D":
                if(face.mods.includes("D"))
                    return 1;
                else
                    return 0;
                break;
            case "QA":
                if(face.mods.includes("QA"))
                    return 1;
                else
                    return 0;
                break;
            case "QD":
                if(face.mods.includes("QD"))
                    return 1;
                else
                    return 0;
                break;
            case "TNUM"://ICE+3 also does -3
                var typename = Dice.typenametonick(Dice.typenumtoname(type));
                var typescore = 0;
                for(var i = 0;i<face.mods.length;i++)
                {
                    
                    var re = new RegExp(typename+"([\+-][0-9]+)");
                    var ex = re.exec(face.mods[i])
                    if(ex !== null)
                    {
                        var ascore = face.mods[i].match(re)[1];
                        typescore += parseInt(ascore);
                        
                    }
                    
                }
                
                return typescore;
                break;
            case "CON"://*_ICE
                var typename = Dice.typenametonick(Dice.typenumtoname(type));
                for(var i = 0;i<face.mods.length;i++)
                {
                    
                    var re = new RegExp("([A-Za-z])_"+typename);
                    var ex = re.exec(face.mods[i])
                    if(ex !== null)
                    {
                        return face.mods[i].match(re)[1];
                        
                    }
                    
                }
                return 0;
                break;
            case "S"://Sturdy
                if(face.mods.includes("S"))
                    return 1;
                else
                    return 0;
                break;
            case "E":
                if(face.mods.includes("E"))
                    return 1;
                else
                    return 0;
                break;
            case "F":
                if(face.mods.includes("F"))
                    return 1;
                else
                    return 0;
                break;
            case "AND"://&ICE
                for(var i = 0;i<face.mods.length;i++)
                {
                    var re = new RegExp("&([A-Za-z][A-Za-z][A-Za-z])");
                    var ex = re.exec(face.mods[i])
                    if(ex !== null)
                    {
                        return Dice.typenametonum(Dice.typenicktoname(face.mods[i].match(re)[1]));
                    }
                    
                }
                return -1;//THIS IS GONNA BE A BITCH AT SOME POINT
                break;
            case "I"://Inversion.
                if(face.mods.includes("I"))
                    return 1;
                else
                    return 0;
                break;
            case "RNG": //(+-2), means either RANGE or RNG
                var typescore = 0;
                for(var i = 0;i<face.mods.length;i++)
                {
                    
                    var re = new RegExp("\\+-([0-9]+)");
                    var ex = re.exec(face.mods[i])
                    if(ex !== null)
                    {
                        typescore+= parseInt(face.mods[i].match(re)[1]);
                    }
                    
                }
                return typescore;
                break;
            case "H":
                if(face.mods.includes("H"))
                    return 1;
                else
                    return 0;
                break;
            case "L":
                if(face.mods.includes("L"))
                    return 1;
                else
                    return 0;
                break;
            default:
                return 0;
            
        }


    }
    static typenametonum(string){
        switch(string) {
            case "normal":
            return 0;
            break;
            case "fighting":
            return 1;
            break;
            case "flying":
            return 2;
            break;
            case "poison":
            return 3;
            break;
            case "ground":
            return 4;
            break;
            case "rock":
            return 5;
            break;
            case "bug":
            return 6;
            break;
            case "ghost":
            return 7;
            break;
            case "steel":
            return 8;
            break;
            case "fire":
            return 9;
            break;
            case "water":
            return 10;
            break;
            case "grass":
            return 11;
            break;
            case "electric":
            return 12;
            break;
            case "psychic":
            return 13;
            break;
            case "ice":
            return 14;
            break;
            case "dragon":
            return 15;
            break;
            case "dark":
            return 16;
            break;
            case "fairy":
            return 17;
            break;
            case "ultimate":
            return 18;
            break;
            case "gun":
            return 19;
            break;
            
            default:
                return -1;
        }
    }

    static typenametonick(string){
        switch(string) {
            case "normal":
            return "NOR";
            break;
            case "fighting":
            return "FGT";
            break;
            case "flying":
            return "FLY";
            break;
            case "poison":
            return "PSN";
            break;
            case "ground":
            return "GRO";
            break;
            case "rock":
            return "ROC";
            break;
            case "bug":
            return "BUG";
            break;
            case "ghost":
            return "GHO";
            break;
            case "steel":
            return "STE";
            break;
            case "fire":
            return "FIR";
            break;
            case "water":
            return "WTR";
            break;
            case "grass":
            return "GRA";
            break;
            case "electric":
            return "ELE";
            break;
            case "psychic":
            return "PSY";
            break;
            case "ice":
            return "ICE";
            break;
            case "dragon":
            return "DRA";
            break;
            case "dark":
            return "DRK";
            break;
            case "fairy":
            return "FAI";
            break;
            case "ultimate":
            return "ULT";
            break;
            case "gun":
            return "GUN";
            break;
            
            default:
                return -1;
        }
    }

    static typenicktoname(string){
        switch(string) {
            case "NOR":
            return "normal";
            break;
            case "FGT":
            return "fighting";
            break;
            case "FLY":
            return "flying";
            break;
            case "PSN":
            return "poison";
            break;
            case "GRO":
            return "ground";
            break;
            case "ROC":
            return "rock";
            break;
            case "BUG":
            return "bug";
            break;
            case "GHO":
            return "ghost";
            break;
            case "STE":
            return "steel";
            break;
            case "FIR":
            return "fire";
            break;
            case "WTR":
            return "water";
            break;
            case "GRA":
            return "grass";
            break;
            case "ELE":
            return "electric";
            break;
            case "PSY":
            return "psychic";
            break;
            case "ICE":
            return "ice";
            break;
            case "DRA":
            return "dragon";
            break;
            case "DRK":
            return "dark";
            break;
            case "FAI":
            return "fairy";
            break;
            case "ULT":
            return "ultimate";
            break;
            case "GUN":
            return "gun";
            break;
            
            default:
                return "oopa";
        }
    }

    static typenumtoname(int){
        switch(int){
            case 0:
            return "normal";
            break;
            case 1:
            return "fighting";
            break;
            case 2:
            return "flying";
            break;
            case 3:
            return "poison";
            break;
            case 4:
            return "ground";
            break;
            case 5:
            return "rock";
            break;
            case 6:
            return "bug";
            break;
            case 7:
            return "ghost";
            break;
            case 8:
            return "steel";
            break;
            case 9:
            return "fire";
            break;
            case 10:
            return "water";
            break;
            case 11:
            return "grass";
            break;
            case 12:
            return "electric";
            break;
            case 13:
            return "psychic";
            break;
            case 14:
            return "ice";
            break;
            case 15:
            return "dragon";
            break;
            case 16:
            return "dark";
            break;
            case 17:
            return "fairy";
            break;
            case 18:
            return "ultimate";
            break;
            case 19:
            return "gun";
            break;
            
            default:
            return "oops";
            
        }      
    }

    

    readfromstring(string)
    {
        
        var res = string.split(",");
        this.faces = [];
        for(var i = 0;i<res.length;i++)
        {
            this.faces[i] = new Object();
            var gres = res[i].split(" ");
            
            this.faces[i].type = gres[0];
            
            this.faces[i].value = parseInt(gres[1]);
            
            
        }
        this.size = res.length;
        
    }

    
}

module.exports = Dice;