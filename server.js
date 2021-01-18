const discord = require("discord.js");
const client = new discord.Client();
const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http");
let reactions = require("./reactions");

app.get("/", (request, response) => {
  console.log(`Uptime Başarılı`);
  response.sendStatus(200);
  app.listen(3000)
});


const config = require("./config.json");
client.commands = new discord.Collection();
client.aliases = new discord.Collection();
fs.readdir("./commands", (err, files) => {
  if (err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if (jsfile.length <= 0) {
    return console.log("[LOGS] couldnt find commands.");
  }

  jsfile.forEach((f, i) => {
    let pull = require(`./commands/${f}`);
    client.commands.set(pull.config.name, pull);
    pull.config.aliases.forEach(alias => {
      client.aliases.set(alias, pull.config.name);
    });
  });
});

client.on("ready", () => {
  console.log("Sistem Aktif!");
});

client.on("message", message => {
  if (message.author.bot || message.channel.type === "dm") return;
  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if (!message.content.startsWith(prefix)) return;
  let commandfile =
    client.commands.get(cmd.slice(prefix.length)) ||
    client.commands.get(client.aliases.get(cmd.slice(prefix.length)));
  if (commandfile) commandfile.run(client, message, args);
});

client.on("ready", function() {
  reactions.forEach(e => {
    client.guilds.cache.get(e.sunucu).channels.cache.get(e.kanal).messages.fetch(e.mesaj).then(mesaj => {
        mesaj.react(e.emojiid);
      });
  });
});

client.on("messageReactionAdd", (messageReaction, user)=> {
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
