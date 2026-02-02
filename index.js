const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, Role } = require('discord.js');
require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8000;

// ১. ডিকশনারি (বট রিস্টার্ট হওয়া পর্যন্ত ডাটা সেভ থাকবে)
const wChannel = {};
const roles = {}

// Express Server Setup
app.get('/', (req, res) => res.send('Bot is strictly online!'));
app.listen(PORT, () => console.log(`Express server is running on port ${PORT}`));

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// ২. রেডি ইভেন্ট এবং স্ল্যাশ কমান্ড কনফিগারেশন
bot.once('clientReady', async () => {
    console.log(`Bot is online! Logged in as ${bot.user.tag}`);
    try {
        await bot.application.commands.set([
            {
                name: 'hi',
                description: 'বট বলবে Hoa'
            },
            {
                name: 'setwelcome',
                description: 'ওয়েলকাম মেসেজের জন্য চ্যানেল সেট করো',
                options: [
                    {
                        name: 'target',
                        description: 'চ্যানেলটি সিলেক্ট করো',
                        type: 7, // CHANNEL type
                        channel_types: [0], // শুধু TEXT channel
                        required: true
                    }
                ]
            },
            {
                name: 'setrole',
                description: 'Set a role for every member',
                options: [
                    {
                        name: 'target',
                        description: 'চ্যানেলটি সিলেক্ট করো',
                        type: 8, // CHANNEL type
                        required: true
                    }
                ]
            }
        ]);
        console.log("Slash commands loaded successfully!");
    } catch (error) {
        console.error("Error loading commands:", error);
    }
});

// ৩. স্ল্যাশ কমান্ড হ্যান্ডলিং (Interaction)
bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // /hi কমান্ড
    if (interaction.commandName === 'hi') {
        await interaction.reply('Hoa');
    }

    // /setwelcome কমান্ড
    if (interaction.commandName === 'setwelcome') {
        const sChannel = interaction.options.getChannel('target');
        const serverid = interaction.guild.id;

        // ডিকশনারি আপডেট: { 'ServerID': 'ChannelID' }
        wChannel[serverid] = sChannel.id;

        await interaction.reply({ 
            content: `সাফল্যের সাথে ওয়েলকাম চ্যানেল ${sChannel} এ সেট করা হয়েছে!`, 
            ephemeral: true 
        });
    }
    if (interaction.commandName === 'setrole') {
        const role = interaction.options.getRole('target')
        const serverid = interaction.guild.id;
        // ডিকশনারি আপডেট: { 'ServerID': 'ChannelID' }
        roles[interaction.guild.id] = role

        await interaction.reply({ 
            content:"Setted role for every starter player!",
            ephemeral : true
            
        });
    }
});

// ৪. অটো ওয়েলকাম সিস্টেম
bot.on('guildMemberAdd', async (member) => {
    const server_id = member.guild.id
    const rolesid = Role[server_id]
    if (!rolesid) return; 

    if (rolesid) {
        member.roles.add()
    }
    
});

// ৫. মেসেজ কমান্ডস (!userinfo, !clear, Reactions)
bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    // Hi/Hello
    if (msg.content.toLowerCase().includes("hi")) {
        msg.reply("Hello!");
        msg.react("👋🏼");
    }

    // Reaction Commands
    if (msg.content.toLowerCase().includes("w/l")) {
        msg.react("👍🏼"); msg.react("👎🏼");
    }

    // !clear কমান্ড
    if (msg.content.startsWith("!clear")) {
        const args = msg.content.split(' ');
        const amount = parseInt(args[1]);
        if (!msg.member.permissions.has('ManageMessages')) return;
        if (isNaN(amount) || amount <= 0) return msg.reply("Please provide a valid number.");

        await msg.channel.bulkDelete(Math.min(amount + 1, 100));
        msg.channel.send(`Deleted ${amount} messages`).then(m => setTimeout(() => m.delete(), 5000));
    }

    // !userinfo কমান্ড
    if (msg.content.startsWith("!userinfo")) {
        const target = msg.mentions.members.first() || msg.member;
        const infoEmbed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle(`👤 User profile: ${target.user.username}`)
            .setThumbnail(target.user.displayAvatarURL())
            .addFields(
                { name: '🆔 ID', value: target.user.id, inline: true },
                { name: '🤖 Bot?', value: target.user.bot ? "Yes" : "No", inline: true }
            )
            .setTimestamp();
        msg.reply({ embeds: [infoEmbed] });
    }
});

// ৬. লগইন
const token = process.env.TOKEN;
if (token) {
    bot.login(token).catch(err => console.error("Login failed:", err));
}
