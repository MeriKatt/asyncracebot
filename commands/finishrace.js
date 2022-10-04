const { SlashCommandBuilder } = require('discord.js');
// Start Exports.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('finish')
		.setDescription('Signal that you are done with a async race.')
		.addStringOption(option =>
			option.setName('racenumber')
				.setDescription('Race number to finish')
				.setRequired(true)),
	async execute(client, interaction) {
		// Setup constants.
		const cl = client;
		const options = interaction.options;
		const user = interaction.user.id;
		const time = new Date().getTime();
		const racenumber = options.getString('racenumber');
		let racer = cl.races.get(interaction.guild.id, `${racenumber}.racers`);
		const disqualified = cl.races.get(interaction.guild.id, `${racenumber}.disqualified`);
		// if racer is in race.
		if (racer.some(e => e.user === user)) {
			let i = 0;
			for (i = 0; i < racer.length; i++) {
				// Check if racer is racer and that they have not finished yet.
				if (racer[i].user === user && racer[i].endTime === 0) {
					// Setup times and set racers end time.
					const start = racer[i].startTime;
					const end = time;
					const ending = (end - start);
					let endtime = 0;
					endtime = `${Math.round(ending / 1000 / 60 / 60)}:${Math.round(ending / 1000 / 60)}:${Math.round(ending / 1000)}:${ending % 60}`;
					racer[i].endTime = endtime;
					racer[i].rawEndTime = end;
					cl.races.set(interaction.guild.id, racer, `${racenumber}.racers`);
				}
			}
			// Thank racer for participating and inform them of video requirement.
			await interaction.reply({ content: 'Thank you for racing! Please submit video recording to youtube as an unlisted video and then do /submitvideo with the race number and video link', ephemeral: true });
		}
		else {
			// Racer has already finished.
			await interaction.reply({ content: 'You have been already finished this race.', ephemeral: true });
		}
		setTimeout(() => {
			if (racer.some(e => e.videoProof)) {
				racer = racer.filter(function(obj) {
					return obj.user !== user;
				});
				disqualified[disqualified.length] = user;
				cl.races.set(interaction.guild.id, disqualified, `${racenumber}.disqualified`);
				interaction.user.send(`You have been disqualified from the race ${racenumber} due to not uploading video proof in time. Please contact a race organizer if you believe this to be in error.`);
			}
			// 3 hours.
		}, 3 * 3600 * 1000);
	},
};