import OpenRouterClient from '../lib/openrouter.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { 
      message, 
      systemPrompt = '', 
      model = 'openai/gpt-3.5-turbo',
      useReasoning = false
    } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'OpenRouter API key not configured'
      });
    }

    const client = new OpenRouterClient(apiKey);
    
    let result;
    if (useReasoning) {
      result = await client.chatWithReasoning(message, model, systemPrompt);
    } else {
      result = await client.simpleChat(message, model, systemPrompt);
    }

    return res.status(200).json({
      success: true,
      data: result,
      meta: {
        model,
        reasoning: useReasoning,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
      }
