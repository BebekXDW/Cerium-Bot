const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the link to invite the bot to your server!'),
    async execute(interaction) {
        const inviteLink = 'https://discord.com/oauth2/authorize?client_id=1293591680808648775&permissions=8&integration_type=0&scope=bot';

        const embed = {
            color: 0x021b3a,
            title: 'Invite Me to Your Server!',
            description: `[Click here to invite me!](${inviteLink})`,
            timestamp: new Date(),
            footer: { text: 'Thanks for using our bot!' },
        };

        await interaction.reply({
            embeds: [embed],
            flags: MessageFlags.Ephemeral,
        });
    },
};
