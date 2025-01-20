const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const configPath = './config.json';
let config = require(configPath);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.slashCommands = new Collection();
client.prefixCommands = new Collection();

// Load slash commands from the SlashCommands folder
const slashCommandFiles = fs.readdirSync(path.join(__dirname, 'SlashCommands')).filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
    const command = require(`./SlashCommands/${file}`);
    client.slashCommands.set(command.data.name, command);
}

// Load prefix commands from all subdirectories in PrefixCommands
function loadPrefixCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            loadPrefixCommands(filePath);
        } else if (file.isFile() && file.name.endsWith('.js')) {
            const command = require(filePath);
            client.prefixCommands.set(command.name, command);
        }
    }
}
loadPrefixCommands(path.join(__dirname, 'PrefixCommands'));

// Watch for changes in config.json and reload it dynamically
fs.watchFile(configPath, () => {
    delete require.cache[require.resolve(configPath)];
    config = require(configPath);
    console.log(`Config reloaded. New prefix: ${config.prefix}`);
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ activities: [{ name: '/help | by @bebek.xdw' }], status: 'online' });

    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name,
        });
        

        console.log('Connected to MySQL database!');

        const guilds = client.guilds.cache;
        let newGuildCount = 0;

        for (const guild of guilds.values()) {
            const guildId = guild.id;
            const [rows] = await connection.query('SELECT * FROM server_info WHERE guildId = ?', [guildId]);

            if (rows.length === 0) {
                const defaultPrefix = '!';
                await connection.query('INSERT INTO server_info (guildId, prefix) VALUES (?, ?)', [guildId, defaultPrefix]);
                newGuildCount++;
            }
        }

        console.log(`Tracked ${guilds.size} guilds in the database. Added ${newGuildCount} new guild(s).`);
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

client.on('guildCreate', async guild => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name,
        });
        

        const defaultPrefix = config.prefix;
        await connection.query('INSERT INTO server_info (guildId, prefix) VALUES (?, ?)', [guild.id, defaultPrefix]);

        console.log(`Added new guild to database: ${guild.id}`);
    } catch (error) {
        console.error('Error adding new guild to MySQL:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error('Error executing slash command:', error);
        await interaction.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    let connection;
    let prefix;
    try {
        connection = await mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            password: config.database.password,
            database: config.database.name,
        });
        

        const [rows] = await connection.query('SELECT prefix FROM server_info WHERE guildId = ?', [message.guild.id]);
        if (rows.length > 0) {
            prefix = rows[0].prefix;
        } else {
            console.error('Guild not found in database.');
            return;
        }
    } catch (error) {
        console.error('Error connecting to MySQL:', error);
        return;
    } finally {
        if (connection) {
            await connection.end();
        }
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.prefixCommands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Error executing prefix command: ${commandName}`, error);
        message.reply('An error occurred while executing this command.');
    }
});

client.login(config.token);
