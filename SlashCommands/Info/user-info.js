const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Displays information about a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to display information for')
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser('target') || interaction.user;
        const member = interaction.guild ? await interaction.guild.members.fetch(user.id) : null;

        // get user's presence status and activity
        const presence = member ? member.presence : null;
        const status = presence ? presence.status : 'Offline';
        const activities = presence?.activities || [];
        const activity = activities.length > 0 ? activities[0].name : 'None';

        const embed = {
            color: 0x021b3a,
            title: `User Information`,
            thumbnail: { url: user.displayAvatarURL() },
            fields: [
                { 
                    name: '', 
                    value: `**Username:** ${user.username}  \n**Tag:** #${user.discriminator}  \n**ID:** ${user.id}`, 
                    inline: false 
                },
                { name: 'Status', value: `${capitalize(status)}`, inline: true },
                { name: 'Activity', value: `${activity}`, inline: true },
                { name: 'Roles', value: `${member ? member.roles.cache.map(role => role.name).join(', ') || 'None' : 'N/A'}`, inline: false },
                { 
                    name: '', 
                    value: `**Account Created:** ${user.createdAt.toDateString()}  \n**Server Joined:** ${member?.joinedAt.toDateString() || 'N/A'}`, 
                    inline: false 
                },
            ],
            timestamp: new Date(),
        };

        await interaction.editReply({ embeds: [embed] });
    },
};
// capitalise the firs letter of every string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
