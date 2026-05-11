import { api } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatService = {
  async streamMessage(messages: ChatMessage[], onChunk: (text: string) => void, jobId?: string) {
    const token = localStorage.getItem('@SaaS:token');
    
    const response = await fetch(`${api.defaults.baseURL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ messages, jobId })
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let isDone = false;

    while (!isDone) {
      const { value, done } = await reader.read();
      isDone = done;
      if (value) {
        const chunk = decoder.decode(value);
        // O NestJS SSE envia no formato "data: {...}\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.text) onChunk(data.text);
            } catch (e) {
              // Ignorar erros de parse parciais
            }
          }
        }
      }
    }
  }
};
