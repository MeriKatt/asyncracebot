const guild = require('discord.js');

module.exports = {
	name: 'guildDelete',
	once: false,
	execute(client) {
		client.settings.delete(guild.id);
	},
};