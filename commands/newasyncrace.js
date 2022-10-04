const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// Start exports
module.exports = {
	data: new SlashCommandBuilder()
		.setName('newasyncrace')
		.setDescription('Creates a new Async Race.')
		.addStringOption(option =>
			option.setName('seed')
				.setDescription('seed hash for the race')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('timelimit')
				.setDescription('Time limit on the seed once started in hours.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('seedgame')
				.setDescription('Name of the Game seed is for.')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('runtime')
				.setDescription('How long in days that the seed should run for.')
				.setRequired(false)),
	// Execute command handling
	async execute(client, interaction) {
		// Make sure the command is run in a server.
		if (!interaction.guild.id) {
			return;
		}
		// Ensure server settings exist, set variables for client, options, and Server settings, ensure user calling the command has the race organizer role.
		const cl = client;
		const options = interaction.options;
		cl.settings.get(interaction.guild.id);
		const guildConf = cl.settings.observe(interaction.guild.id);
		if (!interaction.member.roles.cache.has(guildConf.modRole)) {
			interaction.reply({ content: `You do not have the <@&${guildConf.modRole}> role`, ephemeral: true });
			return;
		}
		// Setup race entry
		const runtime = options.getInteger('runtime');
		const timeString = options.getString('timelimit');
		const time = Number(options.getString('timelimit')) * 60;
		const endDate = runtime > 0 ? runtime : 7;
		const races = cl.races.get(interaction.guild.id) ? cl.races.get(interaction.guild.id) : [];
		const length = races.length;
		if (length === 0) {
			cl.races.set(interaction.guild.id, races);
		}
		races[length] = {
			seed: options.getString('seed'),
			guild: interaction.guild.id,
			timeLimit: time,
			game: options.getString('seedgame'),
			racers: [],
			disqualified: [],
			endTime: endDate,
			done: false,
		};
		// Respond to the user.
		const racenumber = length;
		await cl.races.set(interaction.guild.id, races);
		interaction.reply({ content: 'New Seed posted!', ephemeral: true });
		// Post new race.
		const channel = client.channels.cache.get(guildConf.newRaceChannel);
		channel.send(`New ${options.getString('seedgame')} seed! Time Limit to complete once started is ${timeString} hours. Do /joinrace ${length} to join.`);
		// Auto timeout function to finish the race out and post rankings.
		setTimeout(() => {
			// Get racers and sort them by time.
			const usersArray = cl.races.get(interaction.guild.id, `${i}.racers`);
			usersArray.sort(function(a, b) {
				return (a.rawEndTime - a.startTime) - (b.rawEndTime - b.startTime);
			});
			// Create embed.
			const RankingsEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle(` Race ${i} rankings`)
				.addFields(
					{ name: 'Name - hours:minutes:seconds:milliseconds', value: 'hours:minutes:seconds:milliseconds' },
				);
			// Iterate through an array and add to rankings embed.
			const rankingsArray = [];
			let i = 0;
			usersArray.forEach(element => {
				if (element.endTime == 0) {
					usersArray.splice(i, 1);
				}
				else {
					rankingsArray[i] = ` <@${element.user}> - Time ${element.endTime}`;
					i += 1;
				}
			});
			i = 1;
			rankingsArray.forEach(element => {
				RankingsEmbed.addFields({ name: `${i})`, value: element });
				i += 1;
			});
			// Post embed
			client.channels.cache.get(guildConf.newRaceChannel).send({ embeds: [RankingsEmbed] });
			// Set Race as done.
			const update_races = cl.races.get(interaction.guild.id);
			update_races[racenumber].done = true;
			cl.races.set(interaction.guild.id, update_races);
		}, (cl.races.get(interaction.guild.id, `${racenumber}`).endTime * 24 * 3600 * 1000));
	},
};