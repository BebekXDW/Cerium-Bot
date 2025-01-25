const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Provides various information')

    // user info base
    .addSubcommand((subcommand) =>
      subcommand
        .setName('user')
        .setDescription('Displays information about a user')
        .addUserOption((option) =>
          option.setName('target').setDescription('The user to display information for').setRequired(false)
        )
    )
    // top Activities base
    .addSubcommand((subcommand) =>
      subcommand.setName('top-activities').setDescription('Displays the most popular activities in the server')
    )
    // server info base
    .addSubcommand((subcommand) =>
      subcommand.setName('server').setDescription('Displays information about the server')
    )
    // avatar base
    .addSubcommand((subcommand) =>
      subcommand
        .setName('avatar')
        .setDescription('Displays the avatar of a specified user')
        .addUserOption((option) =>
          option.setName('target').setDescription('The user to display the avatar for').setRequired(false)
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();


    // user info cammand
    if (subcommand === 'user') {
      const user = interaction.options.getUser('target') || interaction.user;
      const member = interaction.guild ? await interaction.guild.members.fetch(user.id) : null;
      const presence = member ? member.presence : null;
      const status = presence ? presence.status : 'Offline';
      const activities = presence?.activities || [];
      const activity = activities.length > 0 ? activities[0].name : 'None';

      const embed = {
        color: 0x021b3a,
        title: `User Information`,
        thumbnail: { url: user.displayAvatarURL() },
        fields: [
          { name: '', value: `**Username:** ${user.username}  \n**Tag:** #${user.discriminator}  \n**ID:** ${user.id}`, inline: false },
          { name: 'Status', value: `${capitalize(status)}`, inline: true },
          { name: 'Activity', value: `${activity}`, inline: true },
          { name: 'Roles', value: `${member ? member.roles.cache.map(role => role.name).join(', ') || 'None' : 'N/A'}`, inline: false },
          { name: '', value: `**Account Created:** ${user.createdAt.toDateString()}  \n**Server Joined:** ${member?.joinedAt.toDateString() || 'N/A'}`, inline: false },
        ],
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });

    // top activities command
    } else if (subcommand === 'top-activities') {
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

    // server info command
    } else if (subcommand === 'server') {
      const guild = interaction.guild;

      const embed = {
        color: 0x021b3a,
        title: 'Server Information',
        thumbnail: { url: guild.iconURL() },
        fields: [
          { name: '', value: `**Server Name:** ${guild.name}  \n**Server ID:** ${guild.id}  \n**Owner:** <@${guild.ownerId}>`, inline: false },
          { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
          { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
          { name: 'Creation Date', value: `${guild.createdAt.toDateString()}`, inline: false },
        ],
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });

    // avatar command
    } else if (subcommand === 'avatar') {
      const user = interaction.options.getUser('target') || interaction.user;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

      const embed = {
        color: 0x021b3a,
        title: `${user.username}'s Avatar`,
        image: { url: avatarURL },
        footer: { text: `Requested by ${interaction.user.tag}` },
        timestamp: new Date(),
      };

      await interaction.reply({ embeds: [embed] });
    }
  },
};

// Capitalize the first letter of every string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
