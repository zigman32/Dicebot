const commando = require('discord.js-commando');

class Currency {
	

	static changeBalance(user, amount, type, ch) {
        var out = Currency.getBalance(user,type,ch);

        var balance = out + amount;
        ch.settings.set("CURRENCY_"+type+"_"+user,balance);
	}
	static addReputation(amount,user,ch){
		Currency.changeBalance(user,amount,"reputation",ch);
	}

	static getReputation(user,ch){
		return Currency.getBalance(user,"reputation",ch);
	}
	
	static addBalance(user, amount) {
		Currency.changeBalance(user, amount);
	}

	static removeBalance(user, amount) {
		Currency.changeBalance(user, -amount);
	}

	static getBalance(user,type,ch) {
		var out = ch.settings.get("CURRENCY_"+type+"_"+user,"null");
        if(out == "null")
        {
            //console.log("Hello my friend");
            
            ch.settings.set("CURRENCY_"+type+"_"+user,0);
			out = 0;
			//out = ch.settings.get("DICE_dice_"+id,"null");
            
        }

		return parseInt(out);
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