const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays information about how long the bot has been online'),
    async execute(interaction) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        const embed = {
            color: 0x021b3a,
            title: 'Bot Uptime',
            description: `The bot has been online for:\n**${hours} hours, ${minutes} minutes, and ${seconds} seconds**.`,
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};
