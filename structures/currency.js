const commando = require('discord.js-commando');
const Database = require('./database');

class Currency {
	

	static changeBalance(user, amount, type, ch) {
        var out = Currency.getBalance(user,type,ch);

        var balance = out + amount;
        ch.settings.set("CURRENCY_"+type+"_"+user,balance);
	}
	static async addMoney(user,amount,db){
		return Database.changeMoney(user,amount,db);
	}

	static async removeMoney(user,amount,db){
		return Database.changeMoney(user,-amount,db);
	}
	
	static async getMoney(user,db){
		var coin = Database.getMoney(user,db);
		//console.log("Coin: "+coin);
		return coin;
	}
	
	static addReputation(amount,user,db){
		return Database.changeReputation(user,amount,db);
	}

	static getReputation(user,db){
		return Database.getReputation(user,db);
	}

	

	static convert(amount, text = false) {
		if (isNaN(amount)) amount = parseInt(amount);
		if (!text) return `${amount.toLocaleString()} ${Math.abs(amount) === 1 ? Currency.singular : Currency.plural}`;

		return `${amount.toLocaleString()} ${Math.abs(amount) === 1 ? Currency.textSingular : Currency.textPlural}`;
	}



	static textSingular() {
		return 'Dicebuck';
	}

	static textPlural() {
		return 'Dicebux';
	}
}

module.exports = Currency;