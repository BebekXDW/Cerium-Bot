const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { pool } = require('./database.js');

const configPath = './config.json';
let config = require(configPath);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

// load slash commands from subfolders

function loadSlashCommands(dir = path.join(__dirname, 'SlashCommands')) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            loadSlashCommands(fullPath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command?.data?.name && command?.execute) {
                    client.slashCommands.set(command.data.name, command);
                } else {
                    console.warn(`Skipping invalid slash command file: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error loading slash command file: ${fullPath}`, err);
            }
        }
    }
}

loadSlashCommands();


// load prefix commands from sub folders
 
function loadPrefixCommands(dir = path.join(__dirname, 'PrefixCommands')) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            loadPrefixCommands(fullPath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command?.name && command?.execute) {
                    client.prefixCommands.set(command.name, command);
                } else {
                    console.warn(`Skipping invalid prefix command file: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error loading prefix command file: ${fullPath}`, err);
            }
        }
    }
}

loadPrefixCommands();


// when client is ready
client.once('ready', async () => {
    console.log(`\x1b[34m\x1b[1mLogged in as ${client.user.tag}!\x1b[0m`);
    client.user.setPresence({ activities: [{ name: '/help | by @bebek.xdw' }], status: 'online' });

    try {
        const connection = await pool.getConnection();
        console.log('\x1b[32m\x1b[1mConnected to the database!\x1b[0m');

        const guilds = client.guilds.cache;
        let newGuildCount = 0;

        for (const guild of guilds.values()) {
            const [rows] = await connection.query('SELECT * FROM server_info WHERE guildId = ?', [guild.id]);
            if (rows.length === 0) {
                const defaultPrefix = config.prefix || '!';
                await connection.query('INSERT INTO server_info (guildId, prefix) VALUES (?, ?)', [guild.id, defaultPrefix]);
                newGuildCount++;
            }
        }

        console.log(`\x1b[34m\x1b[2mTracked ${guilds.size} guilds in the database. Added ${newGuildCount} new guild(s).\x1b[0m`);
        connection.release();
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    }
});

// handle adding guilds
client.on('guildCreate', async guild => {
    try {
        const connection = await pool.getConnection();
        const defaultPrefix = config.prefix || '!';
        await connection.query('INSERT INTO server_info (guildId, prefix) VALUES (?, ?)', [guild.id, defaultPrefix]);
        console.log(`Added new guild to database: ${guild.id}`);
        connection.release();
    } catch (error) {
        console.error('\x1b[31m\x1b[1mError adding new guild to MySQL:\x1b[0m', error);
    }
});

// handle slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('\x1b[31m\x1b[1mError executing slash command:\x1b[0m', error);
        await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
    }
});

// handle prefix commands
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    let prefix;

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT prefix FROM server_info WHERE guildId = ?', [message.guild.id]);

        if (rows.length > 0) {
            prefix = rows[0].prefix;
        } else {
            console.error('\x1b[31m\x1b[1mGuild not found in database.\x1b[0m');
            connection.release();
            return;
        }

        connection.release();
    } catch (error) {
        console.error('\x1b[31m\x1b[1mError fetching prefix from MySQL:\x1b[0m', error);
        return;
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`\x1b[31m\x1b[1mError executing prefix command: ${commandName}\x1b[0m`, error);
        message.reply('An error occurred while executing this command.');
    }
});

client.login(config.token);
