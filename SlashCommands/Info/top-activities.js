const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top-activities')
        .setDescription('Displays the most popular activities in the server'),
    async execute(interaction) {
        const guild = interaction.guild;
        const members = await guild.members.fetch();
        const activities = {};

        members.forEach(member => {
            if (member.presence && member.presence.activities.length > 0) {
                member.presence.activities.forEach(activity => {
                    activities[activity.name] = (activities[activity.name] || 0) + 1;
                });
            }
        });

        const sortedActivities = Object.entries(activities)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const activityList = sortedActivities
            .map(([name, count]) => `**${name}**: ${count} member(s)`)
            .join('\n') || 'No notable activities found.';

        const embed = {
            color: 0x021b3a,
            title: 'Top Activities',
            description: activityList,
            timestamp: new Date(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};
