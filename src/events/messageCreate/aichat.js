const axios = require('axios');

async function generateAIResponse(content, author) {
    try {
      const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
        prompt: `Author: ${author}\n\n${content}`,
        max_tokens: 256,
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
  
      return response.data.choices[0].text;
    } catch (error) {
      console.error('Error making OpenAI API request:', error);
      return 'An error occurred while generating the response.';
    }
  }

module.exports = async (client, message) => {
        if (message.author.bot) return;
      
        const content = message.content;
        const response = await generateAIResponse(content, message.author.name);
        message.channel.send(response);
}