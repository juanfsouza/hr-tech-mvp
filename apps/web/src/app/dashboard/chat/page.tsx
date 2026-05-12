"use client";

import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { chatService } from "@/services/chat-service";
import { useChatStore, ChatMessage as StoreMessage } from "@/store/chat-store";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  BrainCircuit,
  TrendingUp,
  Users,
  Search,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  { icon: Search, label: "Top 3 candidatos para Dev", prompt: "Quem são os 3 melhores candidatos para a vaga de Desenvolvedor?" },
  { icon: BrainCircuit, label: "Resumo psicométrico", prompt: "Resuma o perfil psicométrico médio dos candidatos aprovados." },
  { icon: TrendingUp, label: "Insights de retenção", prompt: "Com base nos testes, quais candidatos têm melhor fit cultural?" },
];

export default function ChatAssistantPage() {
  const { messages, addMessage, updateLastMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: StoreMessage = { role: "user", content: text };
    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    const assistantMessage: StoreMessage = { role: "assistant", content: "" };
    addMessage(assistantMessage);

    let assistantContent = "";
    
    try {
      // Pegamos as mensagens atualizadas do store para o contexto
      const contextMessages = [...messages, userMessage];
      
      await chatService.streamMessage(contextMessages, (chunk) => {
        assistantContent += chunk;
        updateLastMessage(assistantContent);
      });
    } catch (error) {
      console.error("Erro no chat:", error);
      updateLastMessage("Desculpe, ocorreu um erro ao processar sua mensagem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] flex flex-col max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-forest dark:bg-neon flex items-center justify-center shadow-lg shadow-forest/20 dark:shadow-neon/20">
                <Sparkles className="w-6 h-6 text-offwhite dark:text-chumbo" />
              </div>
              <h1 className="text-3xl font-bold font-outfit">Assistente <span className="text-forest dark:text-neon">Inteligente</span></h1>
            </div>
            <p className="text-muted-foreground">Tire dúvidas sobre candidatos, vagas e perfis psicométricos.</p>
          </div>
          
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              onClick={clearMessages}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Conversa
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-hidden flex flex-col bg-card/30 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl">
          {/* Mensagens */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                <div className="space-y-2">
                  <Bot className="w-16 h-16 text-forest dark:text-neon mx-auto opacity-20" />
                  <h3 className="text-xl font-bold font-outfit">Como posso te ajudar hoje?</h3>
                  <p className="text-muted-foreground max-w-sm">Use as ações rápidas ou digite sua dúvida abaixo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSendMessage(action.prompt)}
                      className="p-4 bg-background/50 hover:bg-forest/10 dark:hover:bg-neon/10 border border-border/50 rounded-2xl transition-all text-left group"
                    >
                      <action.icon className="w-5 h-5 text-forest dark:text-neon mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold block leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1",
                    msg.role === "user" ? "bg-azure/10 text-azure" : "bg-forest/10 dark:bg-neon/10 text-forest dark:text-neon"
                  )}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-azure text-white rounded-tr-none"
                      : "bg-card border border-border/50 rounded-tl-none text-foreground shadow-sm"
                  )}>
                    {msg.content || <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-6 bg-background/50 border-t border-border/50">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
              className="flex gap-3"
            >
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte qualquer coisa sobre seus processos..."
                  className="h-14 pl-6 pr-12 text-lg rounded-2xl bg-background border-border/50 focus-visible:ring-forest dark:focus-visible:ring-neon"
                />
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-14 w-14 rounded-2xl bg-forest dark:bg-neon dark:text-chumbo shadow-lg shadow-forest/20 dark:shadow-neon/20"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
