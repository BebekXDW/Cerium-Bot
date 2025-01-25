const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get support or information for the bot'),
    async execute(interaction) {
        const supportLink = 'https://discord.gg/Gwnx87jgBv';

        const embed = {
            color: 0x021b3a,
            title: 'Bot Support',
            description: `Need help? Join the support server: [Click here](${supportLink})`,
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};
