const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/chatgpt/chat - Enviar mensagem para ChatGPT
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const response = await openai.chat.completions.create({
      model: process.env.CHATGPT_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente útil para uma loja online. Ajude clientes com informações sobre produtos, pedidos e suporte.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS) || 2000,
    });

    const reply = response.choices[0].message.content;

    res.json({
      success: true,
      message: message,
      reply: reply,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erro ao chamar ChatGPT:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar a mensagem'
    });
  }
});

// POST /api/chatgpt/chat-stream - Enviar mensagem com streaming (resposta em tempo real)
router.post('/chat-stream', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: process.env.CHATGPT_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente útil para uma loja online.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: parseInt(process.env.CHATGPT_MAX_TOKENS) || 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0].delta.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.choices[0].delta.content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error('Erro ao chamar ChatGPT (stream):', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;