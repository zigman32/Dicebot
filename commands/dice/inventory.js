const commando = require('discord.js-commando');
const mydice = require('./diceclass.js');
const misc = require('../misc.js');
const currency = require('../../structures/currency.js');
const Item = require('./item')


class InventoryCommand extends commando.Command {
    constructor(client){
        super(client, {
            name: 'inventory',
            aliases: ['inv','i','items'],
            group: 'dice',
            memberName: 'inventory',
            description: 'Check your dice bag, swap your active dice, or delete a dice',
            args: [
                {
                    key: 'action',
                    prompt: 'Do you want to check your inventory, or use an item',
                    type: 'string',
                    default: ''

                    
                },
                {
                    key: 'itemsid',
                    prompt: 'which items do you want to see?',
                    type: 'string',
                    default: ''

                    
                }
            ]
        });

    }

    async run(message, args) {
        

        const action = args.action;
        const itemid = args.itemsid;
        var id = message.author.id;

        var ch = message.guild;
        
        if(!action)
        {
            message.channel.sendMessage("Commands avaible: View, use, sell");
            return;
        }
        
        if(action == "view" || action == "check"){
            
            var resultstring = "";
            resultstring+= "Your inventory:\n\n"
            var inventory = misc.getInventory(id,ch);

            var index = 1;
            for (var key in inventory.items) {
                if (inventory.items.hasOwnProperty(key)) {
                    var element = inventory.items[key];
                    var item = Item.getItembyID(key);
                    if(element > 0)
                    {
                            resultstring+= index+": "+item.name+": "+item.description+"  x"+element+"\n";
                            index++;
                    }
                }
            }
            message.channel.sendMessage(resultstring);
        }
        if(action == "use" || action == "u")
        {
            if(!itemid)
            {
                message.channel.sendMessage("No item selected");
                return;
            }
            var inventory = misc.getInventory(id,ch);
            
            var index = 1;
            for (var key in inventory.items) {
                if (inventory.items.hasOwnProperty(key)) {
                    var element = inventory.items[key];
                    var item = Item.getItembyID(key);

                    if(element > 0 && (item.name.toLowerCase() == itemid.toLowerCase() || index == parseInt(itemid)))
                    {
                        var s = item.use(id,ch,message).then(function(result) {
                            if(result)
                            {
                                console.log("ITEM BEING USED");
                                //console.log(s);
                                inventory.items[key]--;
                                misc.setInventory(inventory,id,ch);
                            }
                            return result;});
                        
                        //message.channel.sendMessage("Using item: "+item.name);
                        return;
                    }
                    if(element > 0)
                        index++;
                    
                }
            }
            message.channel.sendMessage("You don't have any items with that name!");
            return;

            
            

            
        }
        if(action == "delete" || action == "sell")
        {
            if(!itemid)
            {
                message.channel.sendMessage("No item selected");
                return;
            }
            var inventory = misc.getInventory(id,ch);
            

            for (var key in inventory.items) {
                if (inventory.items.hasOwnProperty(key)) {
                    var element = inventory.items[key];
                    var item = Item.getItembyID(key);

                    if(element > 0 && item.name.toLowerCase() == itemid.toLowerCase())
                    {
                        if(item.sellprice <=0)
                        {
                            message.channel.sendMessage("You can't sell that item!");
                            return;
                        }
                        inventory.items[key]--;
                        currency.changeBalance(id,item.sellprice,"dollar",ch);
                        message.channel.sendMessage("You sold your item for "+item.sellprice+" "+currency.textPlural());
                        return;
                    }
                    
                }
            }
            message.channel.sendMessage("You don't have any items with that name!");
            return;

            
        }


    }
}

module.exports = InventoryCommand;