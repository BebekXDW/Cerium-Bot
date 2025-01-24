const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getConnection } = require('../database.js');

// get prefix from database
async function getPrefix(guildId) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT prefix FROM server_info WHERE guildId = ?', [guildId]);
        return rows[0] ? rows[0].prefix : '```error```';
    } catch (error) {
        console.error('Error retrieving prefix:', error);
        return '!';
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available prefix commands and what they do.'),
    async execute(interaction) {
        const { client } = interaction;

        // get values from the database
        const prefix = await getPrefix(interaction.guild.id);
        const guildId = interaction.guild.id;

        // create map to hold commands by category
        const commandCategories = {};

        // organize commands by their folder and check for 'shownHelp'
        client.prefixCommands.forEach(command => {
            if (command.ShownInHelp !== 'No') {
                const folderName = command.folder || 'General';
                if (!commandCategories[folderName]) {
                    commandCategories[folderName] = [];
                }
                commandCategories[folderName].push(
                    `\`${prefix}${command.name}\` - ${command.description || 'No description available.'}`
                );
            }
        });

        const helpEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle(`Here is some useful info:`)
            .setDescription(`**Server ID:** ||${guildId}||\n**Server Prefix:** \`${prefix}\`\n **Website:** -In Progress-\n\nSome basic prefix commands:`);

        // add command categories to the embed
        for (const [category, commands] of Object.entries(commandCategories)) {
            helpEmbed.addFields({ name: category, value: commands.join('\n') || 'No commands available.' });
        }

        // send the messsage as ephemeral
        try {
            await interaction.reply({
                embeds: [helpEmbed],
                flags: MessageFlags.Ephemeral,
            });
        } catch (error) {
            console.error('Error sending ephemeral reply:', error);
            await interaction.reply({
                content: 'There was an error with the help command.',
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};
