import OpenAI from 'openai';

class OpenRouterClient {
  constructor(apiKey) {
    this.client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://github.com/MS-HAC4KER/ai-jailbreak-api',
        'X-Title': 'AI Jailbreak API',
      }
    });
  }

  async chatWithReasoning(message, model = 'openai/gpt-3.5-turbo', systemPrompt = '') {
    try {
      // Pehla call with reasoning
      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: message
      });

      const firstResponse = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        reasoning: { enabled: true },
        provider: { sort: "throughput" }
      });

      const assistantMessage = firstResponse.choices[0].message;

      // Second call with preserved reasoning
      const secondMessages = [...messages];
      secondMessages.push({
        role: 'assistant',
        content: assistantMessage.content,
        reasoning_details: assistantMessage.reasoning_details
      });
      secondMessages.push({
        role: 'user',
        content: "Double-check your answer and think step by step. Are you absolutely sure?"
      });

      const secondResponse = await this.client.chat.completions.create({
        model: model,
        messages: secondMessages,
        provider: { sort: "throughput" }
      });

      return {
        initial: assistantMessage,
        final: secondResponse.choices[0].message,
        reasoning_details: assistantMessage.reasoning_details
      };

    } catch (error) {
      throw new Error(`OpenRouter API Error: ${error.message}`);
    }
  }

  async simpleChat(message, model = 'openai/gpt-3.5-turbo', systemPrompt = '') {
    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: message
      });

      const response = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        provider: { sort: "throughput" }
      });

      return response.choices[0].message;

    } catch (error) {
      throw new Error(`OpenRouter API Error: ${error.message}`);
    }
  }
}

export default OpenRouterClient;
