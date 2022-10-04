const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Start exports.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('submitvideo')
		.setDescription('Submit video proof for async race.')
		.addStringOption(option =>
			option.setName('racenumber')
				.setDescription('Race number to provide video for.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('videolink')
				.setDescription('link to video for race')
				.setRequired(true)),
	async execute(client, interaction) {
		// Initialize Constants.
		const cl = client;
		const options = interaction.options;
		const user = interaction.user.id;
		const racer = cl.races.get(interaction.guild.id, `${options.getString('racenumber')}.racers`);
		let i = 0;
		let time = 0;
		// Check user is same as entry, get their entry, and update video for their entry or tell them they've already done so.
		if (racer.some(e => e.user === user)) {
			for (i = 0; i < racer.length; i++) {
				if (racer[i].user === user) {
					racer[i].videoProof = options.getString('videolink');
					cl.races.set(interaction.guild.id, racer, `${options.getString('racenumber')}.racers`);
					// Update time with racer's end time for use in the mod channel embed.
					time = racer[i].endTime;
				}
			}
			await interaction.reply({ content: 'Thank you for submitting your video for this race.', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'You have been already provided video proof for this race.', ephemeral: true });
		}
		// Fetch channel and server to send embed of submission to.
		const guildConf = cl.settings.get(interaction.guild.id);
		const modchannel = client.channels.cache.get(guildConf.modChannel);
		// Create embed.
		const submitEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Video Submission for ${options.getString('racenumber')}`)
			.addFields(
				{ name: 'User', value: `${interaction.user}` },
				{ name: 'Time', value: `${time}` },
				{ name: 'Video Link', value: `${options.getString('videolink')}` },
			);
		// Send Embed.
		modchannel.send({ embeds: [submitEmbed] });
	},
};