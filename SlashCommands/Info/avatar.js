const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Displays the avatar of a specified user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to display the avatar for')
                .setRequired(false)),
    async execute(interaction) {
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
    },
};
