const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Database configuration from config.json
const dbConfig = {
    host: config.database.host,      // Database host
    user: config.database.user,      // Database user
    password: config.database.password,  // Database password
    database: config.database.name       // Database name
};

// Function to get all guild IDs from the database
async function getGuildIds() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT guildId FROM server_info');
        await connection.end();
        return rows.map(row => row.guildId);
    } catch (error) {
        console.error('Error retrieving guild IDs:', error);
        throw error;
    }
}

// Prepare the commands from the SlashCommands folder
const commands = [];
const commandFiles = fs.readdirSync(path.join(__dirname, 'SlashCommands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./SlashCommands/${file}`);
    commands.push(command.data.toJSON());
}

(async () => {
    try {
        // Retrieve all guild IDs from the database
        const guildIds = await getGuildIds();

        // Set up the REST API client with the token from config.json
        const rest = new REST({ version: '9' }).setToken(config.token);

        console.log('\x1b[34m\x1b[2mStarted refreshing application (/) commands for all guilds.\x1b[0m');

        // Update commands for each guild
        for (const guildId of guildIds) {
            try {
                await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), { body: commands });
            } catch (error) {
                console.error(`\x1b[31m\x1b[1mFailed to reload commands for guild ${guildId}:\x1b[0m`, error);
            }
        }

        console.log('\x1b[32m\x1b[1mFinished refreshing application (/) commands for all guilds.\x1b[0m');

    } catch (error) {
        console.error('\x1b[31m\x1b[1mError deploying commands:\x1b[0m', error);
    }
})();
