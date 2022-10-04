module.exports = {
	name: 'interactionCreate',
	async execute(client, interaction) {
		// Make sure interaction is a chat command.
		if (!interaction.isChatInputCommand()) return;
		// grab command.
		const command = interaction.client.commands.get(interaction.commandName);
		// return out if no command.
		if (!command) return;
		// try to run command or throw error.
		try {
			await command.execute(client, interaction);
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};