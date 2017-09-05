const Discord = require('discord.js');
const token = require('./token.js');



const commando = require('discord.js-commando');

const bot = new commando.Client({
  unknownCommandResponse: false,
  owner: '168194300423831553'
});

const path = require('path');
const sql = require('sqlite');
const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
bot.setProvider(
	sql.open(path.join(__dirname, 'database.sqlite3')).then(db => new commando.SQLiteProvider(db))
).catch(console.error);






bot.registry.registerGroup('responce','Responce');
bot.registry.registerGroup('royal','Royal');
bot.registry.registerGroup('dice','Dice');

bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + "/commands");



bot.login(token.token())


