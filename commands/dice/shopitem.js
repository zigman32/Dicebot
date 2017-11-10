const Database = require('../../structures/database');
const misc = require('../misc.js');

class ShopItem {
    
    static hello(){
        console.log("Hello item");
    }

    goodbye(){
        console.log("Goodbye item");
    }
    rint(val){
        return Math.floor(Math.random() * (val));
    }

    constructor(name,price,description,execute,reputationreq = 0,basestockmin = 0, basestockmax = 0) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.execute = execute;
        this.reputationreq = reputationreq;
        this.basestockmin = basestockmin;
        this.basestockmax = basestockmax;
    }

    read(){

        
        return "this is an item";
    }

    use(id,db,message,bonus = 0){
        this.execute(id,db,message,bonus);
    }

    async stockLeft(uid,db){
        if(this.basestockmax != 0){
            if(await misc.daily("STOCK_"+this.name,uid,db))
            {
                var left = ShopItem.rrangewhole(this.basestockmin,this.basestockmax);
                await misc.setDailyExtra("STOCK_"+this.name,uid,left,db);
                return left;
            }else{
                return await misc.getDailyExtra("STOCK_"+this.name,uid,db);
            }
        }else{
            return -1;
        }
    }
    async reduceStock(uid,db,amount = 1){
        var left = await this.stockLeft(uid,db);
        if(left != -1){
            left-= amount;
            await misc.setDailyExtra("STOCK_"+this.name,uid,left,db);
        }
        
    }

    static rrangewhole(min,max){//INCLUSIVE EITHER WAY
        return Math.floor(Math.random() * (1+max - min) + min);
    }
}

module.exports = ShopItem;