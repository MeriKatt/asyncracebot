const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
// start exports.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('initserver')
		.setDescription('Initialize server specific settings')
		.addStringOption(option =>
			option.setName('asyncmodchannel')
				.setDescription('Channel id for async race moderation')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('asyncorganizerrole')
				.setDescription('role for race organizers')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('asyncchannel')
				.setDescription('Channel id for async races to be posted along with results')
				.setRequired(true)),
	// Execute function.
	async execute(client, interaction) {
		// Initialize constants.
		const cl = client;
		const options = interaction.options;
		// Create server settings and grab.
		cl.settings.get(interaction.guild.id);
		const guildConf = cl.settings.observe(interaction.guild.id);
		// Check if calling user has Administrator permissions. Do not want random users changing settings.
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
			// Set server settings for bot.
			guildConf.newRaceChannel = options.getString('asyncchannel');
			guildConf.modChannel = options.getString('asyncmodchannel');
			guildConf.modRole = options.getString('asyncorganizerrole');
			// Create Embed stating server settings and reply to users.
			const configEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Server Configuration')
				.addFields(
					{ name: 'Organizer Role', value: `<@&${guildConf.modRole}>` },
					{ name: 'Mod Channel', value: `<#${guildConf.modChannel}>` },
					{ name: 'New Races Channel', value: `<#${guildConf.newRaceChannel}>` },
				);
			interaction.reply({ embeds: [configEmbed] });
		}
	},
};