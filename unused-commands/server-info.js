const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Displays information about this server'),
    async execute(interaction) {
        const guild = interaction.guild;

        const embed = {
            color: 0x021b3a,
            title: 'Server Information',
            thumbnail: { url: guild.iconURL() },
            fields: [
                { 
                    name: '', 
                    value: `**Server Name:** ${guild.name}  \n**Server ID:** ${guild.id}  \n**Owner:** <@${guild.ownerId}>`, 
                    inline: false 
                },
                { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Creation Date', value: `${guild.createdAt.toDateString()}`, inline: false },
            ],
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};
