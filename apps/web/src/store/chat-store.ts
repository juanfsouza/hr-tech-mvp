import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatState } from '@/types/chat';

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

export type { ChatMessage, ChatState };
