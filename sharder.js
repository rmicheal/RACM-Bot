const { main } = require("./src/config/config.js");
const { ShardingManager } = require("discord.js");
const express = require('express')
const app = express();
const port = 6969

app.get('/', (req, res) => res.send('RACM-Bot by micheal.r'))

app.listen(port);

const manager = new ShardingManager("./src/index.js", {
  respawn: true,
  autoSpawn: true,
  token: main.token,
  totalShards: 1,
  shardList: "auto",
});

manager
  .spawn({ amount: manager.totalShards, delay: null, timeout: -1 })
  .then((shards) => {
    console.log(`[CLIENT] ${shards.size} shard(s) spawned.`);
  })
  .catch((err) => {
    console.log("[CLIENT] An error has occurred. Error:", err);
  });

manager.on("shardCreate", (shard) => {
  shard.on("ready", () => {
    console.log(`[CLIENT] Shard ${shard.id} connected to Discord's  bot gateway.`);
  });
});