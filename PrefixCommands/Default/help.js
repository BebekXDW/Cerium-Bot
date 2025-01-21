const { EmbedBuilder } = require('discord.js');
const { getConnection } = require('../../database.js');

// get prefix from database
async function getPrefix(guildId) {
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute('SELECT prefix FROM server_info WHERE guildId = ?', [guildId]);
        return rows[0] ? rows[0].prefix : '!';
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
    name: 'help',
    description: 'Shows all available prefix commands and what they do.',
    folder: 'Default',
    ShownInHelp: 'Yes',
    async execute(message) {
        const { client } = message;

        // get values from the database
        const prefix = await getPrefix(message.guild.id);
        const guildId = message.guild.id;

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

        // message embed
        const helpEmbed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Here is some useful info:')
            .setDescription(`**Server ID:** ||${guildId}||\n**Server Prefix:** \`${prefix}\`\n**Website:** -In Progress-\n\nSome basic prefix commands:`);

        // add command categories to the embed
        for (const [category, commands] of Object.entries(commandCategories)) {
            helpEmbed.addFields({ name: category, value: commands.join('\n') || 'No commands available.' });
        }

        // send the embed
        try {
            await message.channel.send({
                embeds: [helpEmbed],
            });
        } catch (error) {
            console.error('Error sending help message:', error);
            await message.channel.send('There was an error with the help command.');
        }
    },
};
