const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Displays information about the bot'),
    async execute(interaction) {
        const bot = interaction.client;

        // Bot uptime
        const uptime = formatUptime(bot.uptime);

        // Bot's creation date
        const creationDate = bot.user.createdAt.toDateString();

        // Number of servers and users the bot is connected to
        const serverCount = bot.guilds.cache.size;
        const userCount = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        // Embed for better visual appeal
        const embed = {
            color: 0x1d3e69, // Discord blue color
            title: 'Some useful bot info:',
            thumbnail: {
                url: bot.user.displayAvatarURL(), // Bot's avatar
            },
            fields: [
                { 
                    name: '', 
                    value: `**Name:** ${bot.user.username}  \n**Tag:** #${bot.user.discriminator}  \n**Bot ID:** ${bot.user.id}`, 
                    inline: false 
                },
                { 
                    name: '', 
                    value: `**Servers:** ${serverCount}  \n**Users:** ${userCount}`, 
                    inline: false 
                },
                { name: 'Uptime', value: uptime, inline: false },
                { name: 'Creation Date', value: creationDate, inline: true },
            ],
            timestamp: new Date(),
            footer: {
                text: 'Thanks for using our bot!',
            },
        };

        await interaction.reply({ embeds: [embed] });
    },
};

// Utility function to format uptime
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
