require('dotenv').config();
const Bot = require('./structures/client');
const client = new Bot();
client.connect(process.env.TOKEN)