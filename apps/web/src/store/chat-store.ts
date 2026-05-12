import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (message) => 
        set((state) => ({ messages: [...state.messages, message] })),
      updateLastMessage: (content) =>
        set((state) => {
          const newMessages = [...state.messages];
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1].content = content;
          }
          return { messages: newMessages };
        }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: '@SaaS:chat-history',
    }
  )
);
