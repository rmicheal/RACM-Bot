require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');
const { EmbedBuilder } = require('discord.js')
const Bot = require('./structures/client');
const client = new Bot();
client.connect(process.env.TOKEN)

const configuration = new Configuration({
    organization: "org-PETJS1oINocD1iTL0zcKVNh7",
    apiKey: process.env.API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  const systemMessage =
    "You are a nice and helpfull ai chatbot. You like to chat and talk with others.";
  
  const ignoreMessagePrefix = process.env.IGNORE_MESSAGE_PREFIX || '-@';
  
  let chatChannels = process.env.CHANNEL_ID.split('-');
  
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!chatChannels.includes(message.channelId)) return;
    if (message.content.startsWith(ignoreMessagePrefix)) return;
  
    let conversationLog = [{ role: 'system', content: systemMessage }];
  
    // Fetch previous messages to use as context
    let prevMessages = await message.channel.messages.fetch({ limit: 8 }); // Last 8 messages will be used as context
    prevMessages.reverse();
  
    let initialReply = await message.reply(
      ':arrows_clockwise: Generating a response, please wait...'
    );
  
    prevMessages.forEach((msg) => {
      if (message.content.startsWith(ignoreMessagePrefix)) return;
      if (msg.author.id !== client.user.id && message.author.bot) return; // Ignore every bot but itself
  
      // If message author is the bot itself
      if (msg.author.id === client.user.id) {
        conversationLog.push({
          role: 'assistant',
          content: msg.content,
          name: msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, ''),
        });
      }
  
      // If the message is from a regular user
      else if (msg.author.id === message.author.id) {
        conversationLog.push({
          role: 'user',
          content: msg.content,
          name: message.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, ''),
        });
      }
    });
  
    // Generate a response
    openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: conversationLog,
        max_tokens: 256, // Limit token usage (optional)
      })
      .then((result) => {
        let gptReply = result.data.choices[0].message;
  
        if (gptReply.length > 2000) {
          gptReply = gptReply.slice(0, 1997) + '...';
        }
  
        initialReply.edit(gptReply);
      })
      .catch(async (error) => {
        // Edit the message with the error and delete after 5 seconds
        await initialReply.edit(
          `:x: There was an error, please try again later.\n${error}`
        );
  
        setTimeout(() => {
          initialReply.delete();
        }, 5000);
      });
  });