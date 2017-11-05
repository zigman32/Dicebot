
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

    constructor(name,price,description,execute,reputationreq = 0) {
        this.name = name;
        this.price = price;
        this.description = description;
        this.execute = execute;
        this.reputationreq = reputationreq;
    }

    read(){

        
        return "this is an item";
    }

    use(id,db,message,bonus = 0){
        this.execute(id,db,message,bonus);
    }

    
}

module.exports = ShopItem;