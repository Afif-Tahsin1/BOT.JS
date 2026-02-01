const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

// 1. Web Server Setup
app.get('/', (req, res) => res.send('Bot is strictly online!'));

app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});

// 2. Bot Client Setup (Added GuildMembers and Presences for your commands)
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// 3. Ready Event
bot.once('ready', async () => {
    console.log(`Bot is online! Logged in as ${bot.user.tag}`);
    try {
        await bot.application.commands.set([
            {
                name: 'hi',
                description: 'Bot reply with Hoa'
            }
        ]);
        console.log("Slash commands loaded successfully!");
    } catch (error) {
        console.log("Error loading commands:", error);
    }
});

// 4. Message Commands
bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    // Hi Command
    if (msg.content.toLowerCase().includes("hi")) {
        msg.reply("Hello!");
        msg.react("👋🏼");
    }

    // Reaction Commands
    if (msg.content.toLowerCase().includes("w/l")) {
        msg.react("👍🏼");
        msg.react("👎🏼");
    }
    if (msg.content.toLowerCase().includes("w/f/l")) {
        msg.react("👍🏼");
        msg.react("⚖️");
        msg.react("👎🏼");
    }

    // Clear Command
    if (msg.content.startsWith("!clear")) {
        const args = msg.content.split(' ');
        const amount = parseInt(args[1]);
        
        if (!msg.member.permissions.has('ManageMessages')) return;
        if (isNaN(amount) || amount <= 0) return msg.reply("Please provide a valid number.");

        await msg.channel.bulkDelete(Math.min(amount + 1, 100));
        
        const clearEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("Messages Deleted")
            .setDescription(`Deleted ${amount} messages`)
            .setTimestamp()
            .setThumbnail("https://i.postimg.cc/SK7JwpcQ/download.png")
            .setFooter({ text: `Requested by ${msg.author.username}` });

        msg.channel.send({ embeds: [clearEmbed] })
            .then(m => setTimeout(() => m.delete(), 5000));
    }

    // UserInfo Command
    if (msg.content.startsWith("!userinfo")) {
        const target = msg.mentions.members.first() || msg.member;
        const createdAt = target.user.createdAt ? target.user.createdAt.toLocaleDateString() : "N/A";
        const joinedAt = target.joinedAt ? target.joinedAt.toLocaleDateString() : "N/A";

        const infoEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`👤 User profile: ${target.user.username}`)
            .setThumbnail(target.user.displayAvatarURL())
            .addFields(
                { name: '🆔 ID', value: target.user.id, inline: true },
                { name: '🗓️ Account created', value: createdAt, inline: false },
                { name: '📥 Joined server', value: joinedAt, inline: false },
                { name: '🤖 Bot?', value: target.user.bot ? "Yes" : "No", inline: true }
            )
            .setTimestamp();

        msg.reply({ embeds: [infoEmbed] });
    }
});

// 5. Interaction Handling (Slash Commands)
bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'hi') {
        await interaction.reply('Hoa');
    }
});

// 6. Login (The very last thing)
const token = process.env.TOKEN;
if (token) {
    console.log("🔑 Token found, attempting to login...");
    bot.login(token).catch(err => console.error("Login failed:", err));
} else {
    console.log("⚠️ Error: TOKEN is missing in Environment Variables!");
}
