# Cerium Bot | [Our website](https://bot.cerium.ovh/)

**WARNING OLD README BOT IS NOT FINNISHED THIS IS A V2 OF THE BOT**

Cerium Bot is an all-in-one customizable Discord bot designed to enhance server management and engagement. Built using [Discord.js v14](https://discord.js.org/#/docs/discord.js/v14/general/welcome), it provides a range of moderation, logging, and utility features, all powered by a database setup.

## Features
- **Custom Prefix:** Supports server-specific prefixes (default: `!`).
- **Moderation Tools:** Manage your server efficiently with mod roles and logging.
- **Database-Driven Configuration:** All server-specific settings are dynamically stored and retrieved from a MySQL database.
- **Real-Time Updates:** Keeps configurations updated across sessions.
- **Lightweight:** Easy setup and smooth operation.



## Requirements
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16.9.0 or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- MySQL database (e.g., [phpMyAdmin](https://www.phpmyadmin.net/))



## Setup

### 1. Download the github release

Downlad it [here](https://github.com/BebekXDW/CeriumBot/releases/).

### 2. Install Dependencies in the project folder
```bash
npm install discord.js mysql2
```
- **discord.js:** This is the main library for interacting with the Discord API.
- **mysql2:** This package is used for interacting with your MySQL database.

### 3. Configure the Bot
Create the `config.json` file in the root directory with the following structure:

```json
{
  "token": "bot token",
  "clientId": "bot client id",

  "database": {
    "host": "localhost (or server ip if not localy)",
    "user": "username",
    "password": "password",
    "name": "database name"
  }
}
```

Replace Every credential with your actual values.

### 4. Setup the Database
Run the following SQL to create the required `server_info` table in your MySQL database:

```sql
CREATE TABLE server_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guildId VARCHAR(255) NOT NULL,
  prefix VARCHAR(5) DEFAULT '!',
  joinDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Running the Bot
To deploy the commands:

```bash
node deploy-commands.js
```

To start the bot, use:

```bash
node index.js
```

## Contributing
Feel free to submit issues or pull requests to improve the project.

## License
This project is licensed under [(Licence link)](https://github.com/BebekXDW/CeriumBot/blob/main/LICENSE.md).

## Support
For questions or support, please reach out to us on [Discord](https://discord.gg/Gwnx87jgBv).
