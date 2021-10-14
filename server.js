const discord = require("discord.js");
const client = new discord.Client();
const fs = require("fs");
const express = require("express");
const app = express();
let reactions = require("./reactions");

app.get("/", (request, response) => {
  console.log(`Uptime Başarılı`);
  response.sendStatus(200);
});   
app.listen(3000);

const config = require("./config.json");
client.on("ready", () => {
  console.log("Sistem Aktif!");
});

client.on("ready", function() {
  reactions.forEach(e => {
    client.guilds.cache
      .get(e.sunucu)
      .channels.cache.get(e.kanal)
      .messages.fetch(e.mesaj)
      .then(mesaj => {
        mesaj.react(e.emojiid);
      });
  });
});

client.on("messageReactionAdd", (messageReaction, user) => {
  if (!user.bot) {
    let member = messageReaction.message.guild.member(user);
    reactions.forEach(async rs => {
      if (rs.mesaj === messageReaction.message.id) {
        if (messageReaction.emoji.id === rs.emojiid) {
          if (!member.roles.cache.has(rs.rol)) {
            member.roles.add(rs.rol);
          }
        }
      }
    });
  }
});

client.on("messageReactionRemove", (messageReaction, user) => {
  if (!user.bot) {
    let member = messageReaction.message.guild.member(user);
    reactions.forEach(async rs => {
      if (rs.mesaj === messageReaction.message.id) {
        if (messageReaction.emoji.id === rs.emojiid) {
          if (member.roles.cache.has(rs.rol)) {
            member.roles.remove(rs.rol);
          }
        }
      }
    });
  }
});

client.login(process.env.TOKEN || config.token);
