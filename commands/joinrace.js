const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require('discord.js');
// Start exports.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinrace')
		.setDescription('Join a Async Race.')
		.addStringOption(option =>
			option.setName('racenumber')
				.setDescription('Race number to join')
				.setRequired(true)),
	async execute(client, interaction) {
		// Setup Constants.
		const cl = client;
		const options = interaction.options;
		const user = interaction.user.id;
		const time = new Date().getTime();
		const racenumber = options.getString('racenumber');
		let racer = cl.races.get(interaction.guild.id, `${racenumber}.racers`);
		const disqualified = cl.races.get(interaction.guild.id, `${racenumber}.disqualified`);
		// Check if racer is already joined.
		if (racer.some(e => e.user === user)) {
			await interaction.reply({ content: 'You have already signed up for that race.', ephemeral: true });
		}
		// Check if racer is disqualified or Race is done. if not then add user to race.
		else if (!disqualified.includes(user) && !cl.races.get(interaction.guild.id, `${racenumber}`).done == true) {
			racer[racer.length] = {
				user: user,
				startTime: time,
				maxTime: time + cl.races.get(interaction.guild.id, `${racenumber}`).timeLimit,
				endTime: 0,
				videoProof: '',
				rawEndTime: 0,
			};
			// Add racer to race.
			cl.races.set(interaction.guild.id, racer, `${racenumber}.racers`);
			// Create embed to tell them race seed with race number and game confirmation. Inform of /finish command.
			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(`Race ${racenumber} for ${cl.races.get(interaction.guild.id, `${racenumber}`).game}`)
				.addFields(
					{ name: 'Seed', value: inlineCode(`${cl.races.get(interaction.guild.id, `${racenumber}`).seed}`) },
					{ name: 'finish command', value: `/finish ${racenumber}` },
				);
				// Send embed to racer as ephemeral message.
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
		// Check if racer is disqualified and inform them of status if so.
		else if (disqualified.includes(user)) {
			await interaction.reply({ content: 'You have been disqualified from that race already.', ephemeral: true });
		}
		// Race is done. Inform Racer.
		else {
			await interaction.reply({ content: 'That race has already finished.', ephemeral: true });
		}
		// Setup timeout function to disqualify racer if they donot finish within time limit.
		setTimeout(() => {
			if (racer.some(e => e.endTime == 0)) {
				racer = racer.filter(function(obj) {
					return obj.user !== user;
				});
				cl.races.update(interaction.guild.id, disqualified[disqualified.length] = user, `${racenumber}.disqualified`);
				interaction.user.send(`You have been disqualified from the race ${racenumber} due to not finishing in time.`);
			}
		}, 1000 * 60 * cl.races.get(interaction.guild.id, `${racenumber}`).timeLimit);
	},
};