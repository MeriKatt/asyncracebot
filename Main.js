const fs = require('node:fs');
const path = require('node:path');
// Require the necassary discord.js classes
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
// Require enmap for mapping and database entries.
const Enmap = require('enmap');
// Create bot client.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Create settings enmap.
client.settings = new Enmap({
	name: 'settings',
	fetchAll: false,
	autoFetch: true,
	cloneLevel: 'deep',
	autoEnsure : {
		newRaceChannel: 'Async-Races',
		modChannel: 'async-mod',
		modRole: 'Moderator',
	},
});
// Create races enmap.
client.races = new Enmap('races');
// Create commands constants, link to bot client, and require various command files.
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	client.commands.set(command.data.name, command);
}
// Create event constants and require various command files.
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(client, ...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(client, ...args));
	}
}
// Login the bot.
client.login(token);