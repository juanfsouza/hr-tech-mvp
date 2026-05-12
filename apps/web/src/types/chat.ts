export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
}
