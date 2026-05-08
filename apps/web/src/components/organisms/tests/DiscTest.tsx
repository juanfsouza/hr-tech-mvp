"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { Plus, Minus, ChevronRight, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscItem {
  id: string;
  text: string;
  dimension: string;
}

interface DiscBlock {
  id: string;
  blockNumber: number;
  items: DiscItem[];
}

interface DiscTestProps {
  questions: DiscBlock[];
  onComplete: (responses: any) => void;
  onSaveProgress: (questionId: string, answer: string) => Promise<void>;
}

export function DiscTest({ questions, onComplete, onSaveProgress }: DiscTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<{ [blockId: string]: { most: string | null; least: string | null } }>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentBlock = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = async (itemId: string, type: 'most' | 'least') => {
    const currentSelection = selections[currentBlock.id] || { most: null, least: null };
    
    // Evitar selecionar o mesmo item para most e least
    if (type === 'most' && currentSelection.least === itemId) return;
    if (type === 'least' && currentSelection.most === itemId) return;

    const newSelection = {
      ...currentSelection,
      [type]: itemId
    };

    setSelections({
      ...selections,
      [currentBlock.id]: newSelection
    });

    // Se ambos forem selecionados, salvar progresso
    if (newSelection.most && newSelection.least) {
      setIsSaving(true);
      await onSaveProgress(currentBlock.id, JSON.stringify(newSelection));
      setIsSaving(false);
    }
  };

  const nextBlock = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete(selections);
    }
  };

  const currentBlockSelection = selections[currentBlock.id] || { most: null, least: null };
  const canContinue = currentBlockSelection.most && currentBlockSelection.least;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-end text-sm mb-2">
          <span className="font-bold text-forest dark:text-neon uppercase tracking-tighter">Teste DISC</span>
          <span className="text-muted-foreground font-medium">Bloco {currentIndex + 1} de {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentBlock.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-forest/5 dark:bg-neon/5 p-4 rounded-xl border border-forest/10 dark:border-neon/10 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-forest dark:text-neon shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground italic">
              Selecione o item que <strong>MAIS</strong> combina com você e o que <strong>MENOS</strong> combina neste bloco.
            </p>
          </div>

          <div className="space-y-4">
            {currentBlock.items.map((item) => (
              <Card 
                key={item.id} 
                className={cn(
                  "transition-all border-2",
                  currentBlockSelection.most === item.id ? "border-forest dark:border-neon bg-forest/5 dark:bg-neon/5 shadow-md" : 
                  currentBlockSelection.least === item.id ? "border-destructive/30 bg-destructive/5" : "border-border"
                )}
              >
                <CardContent className="p-0 flex items-center justify-between">
                  <p className="p-6 flex-1 font-medium text-lg leading-tight">{item.text}</p>
                  
                  <div className="flex border-l border-border h-full">
                    <button
                      onClick={() => handleSelect(item.id, 'most')}
                      className={cn(
                        "w-16 h-full flex flex-col items-center justify-center gap-1 border-r border-border hover:bg-forest/10 transition-colors py-4",
                        currentBlockSelection.most === item.id ? "bg-forest text-offwhite dark:bg-neon dark:text-chumbo" : "text-muted-foreground"
                      )}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mais</span>
                    </button>
                    <button
                      onClick={() => handleSelect(item.id, 'least')}
                      className={cn(
                        "w-16 h-full flex flex-col items-center justify-center gap-1 hover:bg-destructive/10 transition-colors py-4",
                        currentBlockSelection.least === item.id ? "bg-destructive text-white" : "text-muted-foreground"
                      )}
                    >
                      <Minus className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Menos</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end pt-4">
        <Button 
          disabled={!canContinue || isSaving}
          onClick={nextBlock}
          size="lg"
          className="h-14 px-10 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo group"
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
            <>
              {currentIndex === questions.length - 1 ? "Finalizar Teste" : "Próximo Bloco"}
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
