const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-lookup')
    .setDescription('Displays information about a user using their Discord user ID')
    .addStringOption((option) =>
      option
        .setName('user_id')
        .setDescription('The Discord user ID to look up')
        .setRequired(true)
    ),
  async execute(interaction) {
    const userId = interaction.options.getString('user_id');
    const user = await interaction.client.users.fetch(userId).catch(() => null); // Fetch user by ID

    if (!user) {
      return interaction.reply({ content: 'User not found, please make sure the ID is correct.', ephemeral: true });
    }

    // check if the user is in the server
    const member = interaction.guild ? await interaction.guild.members.fetch(user.id).catch(() => null) : null;
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
      ],
      timestamp: new Date(),
    };

    // if the user is in the server add more details
    if (member) {
      embed.fields.push(
        {
          name: 'Roles',
          value: `${member ? member.roles.cache.map(role => role.name).join(', ') || 'None' : 'N/A'}`,
          inline: false,
        },
        {
          name: '',
          value: `**Account Created:** ${user.createdAt.toDateString()}  \n**Server Joined:** ${member?.joinedAt.toDateString() || 'N/A'}`,
          inline: false,
        }
      );
    } else {
      embed.fields.push({
        name: '',
        value: `**Account Created:** ${user.createdAt.toDateString()}  \n**Server Joined:** User is not a member of this server`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
