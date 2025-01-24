const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('about')
        .setDescription('Displays information about the bot'),
    async execute(interaction) {
        const bot = interaction.client;
        const uptime = formatUptime(bot.uptime);
        const creationDate = bot.user.createdAt.toDateString();
        const serverCount = bot.guilds.cache.size;
        const userCount = bot.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const embed = {
            color: 0x021b3a,
            title: 'Some useful bot info:',
            thumbnail: {
                url: bot.user.displayAvatarURL(),
            },
            fields: [
                { name: 'About:', value: "Cerium Bot is an all-in-one, free and easy to use discord bot\nwhich helps with everything! from advanced moderation to\nfun user commands, Cerium bot is built for every server", inline: false },
                { 
                    name: '', 
                    value: `**Name:** ${bot.user.username}  \n**Tag:** #${bot.user.discriminator}  \n**Bot ID:** ${bot.user.id}`, 
                    inline: false 
                },
                { 
                    name: '', 
                    value: `**Servers:** ${serverCount}  \n**Total Users:** ${userCount}`, 
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

// format uptime of the bot
function formatUptime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}



