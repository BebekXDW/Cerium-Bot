const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription(`Check the bot's latency`),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = interaction.client.ws.ping;

        const embed = {
            color: 0xff5733,
            title: 'Pong!',
            fields: [
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
            ],
            timestamp: new Date(),
        };

        await interaction.editReply({ content: null, embeds: [embed] });
    },
};
