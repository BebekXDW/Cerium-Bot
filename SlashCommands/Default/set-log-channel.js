const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { pool } = require('../../database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-log-channel')
        .setDescription('Sets a log channel for the server.')
        .addStringOption(option =>
            option
                .setName('log-type')
                .setDescription('The type of log to set.')
                .setRequired(true)
                .addChoices(
                    { name: 'Default Log', value: 'defaultLogId' },
                    { name: 'Text Log', value: 'textLogId' },
                    { name: 'Voice Log', value: 'voiceLogId' },
                    { name: 'Server Log', value: 'serverLogId' },
                    { name: 'Member Log', value: 'memberLogId' },
                    { name: 'Action Log', value: 'actionLogId' }
                )
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to set for the selected log type.')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const logType = interaction.options.getString('log-type');
        const logChannel = interaction.options.getChannel('channel');

        try {
            const connection = await pool.getConnection();

            // check if the guild already exists
            const [rows] = await connection.query(
                'SELECT * FROM server_logs WHERE guildId = ?',
                [guildId]
            );

            if (rows.length > 0) {
                // update the specific log channel
                await connection.query(
                    `UPDATE server_logs SET ${logType} = ? WHERE guildId = ?`,
                    [logChannel.id, guildId]
                );
            } else {
                // insert new entry with the specified log type
                const initialValues = {
                    defaultLogId: null,
                    textLogId: null,
                    voiceLogId: null,
                    serverLogId: null,
                    memberLogId: null,
                    actionLogId: null,
                };
                initialValues[logType] = logChannel.id;

                await connection.query(
                    'INSERT INTO server_logs (guildId, defaultLogId, textLogId, voiceLogId, serverLogId, memberLogId, actionLogId) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        guildId,
                        initialValues.defaultLogId,
                        initialValues.textLogId,
                        initialValues.voiceLogId,
                        initialValues.serverLogId,
                        initialValues.memberLogId,
                        initialValues.actionLogId,
                    ]
                );
            }

            connection.release();

            const embed = {
                color: 0x021b3a,
                title: 'Log Channel Set',
                description: `Successfully set <#${logChannel.id}> as the ${logType.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim()} channel.`,
                timestamp: new Date(),
            };

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error setting log channel:', error);
            await interaction.reply({
                content: 'An error occurred while setting the log channel. Please try again later.',
                ephemeral: true,
            });
        }
    },
};
