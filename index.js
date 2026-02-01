const { EmbedBuilder } = require('discord.js')
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Online!'));
app.listen(8000);
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
bot.once('ready', (readyClient) => {
    console.log(`Bot is online! Loggen in as ${readyClient.user.tag}`)
    try {
        bot.application.commands.set([
            {
                name: 'hi',
                description: 'Bot respond with Hoa'
            }
        ]);
        console.log("Loading commands successfull!")

    } catch (error) {
        console.log("And error occured! Error:", error)
    }
});




bot.on('messageCreate', async (msg) => {
    if (msg.author.bot) return
    if (msg.content.toLowerCase().includes("hi")) {
        msg.reply("Hello!")
        msg.react("👋🏼")
    }
    if (msg.content.toLowerCase().includes("w/l")) {
        msg.react("👍🏼")
        msg.react("👎🏼")

    }
    if (msg.content.toLowerCase().includes("w/f/l")) {
        msg.react("👍🏼")
        msg.react("⚖️")
        msg.react("👎🏼")
    }
    if (msg.content.startsWith("!clear")) {
        const args = msg.content.split(' ')
        const amount = parseInt(args[1])
        if (msg.member.permissions.has('ManageMessages')) {
            await msg.channel.bulkDelete(amount + 1)
            const clearEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle("deleteMessage")
                .setDescription(`Deleted ${amount} messages`)
                .setTimestamp()
                .setThumbnail("https://i.postimg.cc/SK7JwpcQ/download.png")
                .setFooter({ text: `Requested by ${msg.author.username}` })
            msg.channel.send({ embeds: [clearEmbed] })
                .then(m => setTimeout(() => m.delete(), 5000));
        } else {

        }
    }
    if (msg.content.startsWith("!userinfo")) {
        // ১. টার্গেট মেম্বার নির্ধারণ
        const target = msg.mentions.members.first() || msg.member;

        // ২. তথ্যগুলো বের করা (যদি না থাকে তবে "তথ্য নেই" দেখাবে)
        const createdAt = target.user?.createdAt ? target.user.createdAt.toLocaleDateString() : "তথ্য নেই";
        const joinedAt = target?.joinedAt ? target.joinedAt.toLocaleDateString() : "তথ্য নেই";

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
bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'hi') {
        await interaction.reply('Hoa')
    }
});

// টোকেনটি প্রসেস এনভায়রনমেন্ট থেকে কল করো
const token = process.env.TOKEN


app.get('/', (req, res) => res.send('Online!'));
app.listen(8000);

bot.login(process.env.TOKEN).catch(err => {
    console.log("Asol Error Eta:");
    console.error(err);
});



