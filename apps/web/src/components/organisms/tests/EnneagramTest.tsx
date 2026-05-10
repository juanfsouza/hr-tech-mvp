"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { ChevronRight, Loader2, Info, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnneagramQuestion {
  typeA: number;
  typeB: number;
  id: string;
  statementA: string;
  statementB: string;
}

interface EnneagramTestProps {
  questions: EnneagramQuestion[];
  onComplete: (responses: any) => void;
  onSaveProgress: (questionId: string, answer: string) => Promise<void>;
}

export function EnneagramTest({ questions, onComplete, onSaveProgress }: EnneagramTestProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<{ [id: string]: 'A' | 'B' }>({});
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = async (choice: 'A' | 'B') => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: choice
    };

    const answerObj = {
      choice,
      typeA: currentQuestion.typeA,
      typeB: currentQuestion.typeB,
    };

    if (currentIndex < questions.length - 1) {
      setIsSaving(true);
      await onSaveProgress(currentQuestion.id, JSON.stringify(answerObj));
      setIsSaving(false);

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 400);
    } else {
      setIsSaving(true);
      const finalResponses = { ...responses, [currentQuestion.id]: JSON.stringify(answerObj) };
      onComplete(finalResponses);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-end text-sm mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neon uppercase tracking-tighter">Teste de Eneagrama</span>
          </div>
          <span className="text-muted-foreground font-medium">Questão {currentIndex + 1} de {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-neon/5 p-4 rounded-xl border border-neon/10 mb-2 flex items-start gap-3">
            <Info className="w-5 h-5 text-neon shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Leia as duas afirmações abaixo e escolha aquela que <strong>melhor descreve</strong> o seu comportamento habitual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* Opção A */}
            <Card
              onClick={() => handleSelect('A')}
              className={cn(
                "cursor-pointer transition-all border-2 h-full flex flex-col hover:scale-[1.02] active:scale-[0.98]",
                responses[currentQuestion.id] === 'A'
                  ? "border-neon bg-neon/5 shadow-lg"
                  : "border-border hover:border-neon/40"
              )}
            >
              <CardContent className="p-8 flex flex-col items-center text-center justify-center min-h-[180px] gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs",
                  responses[currentQuestion.id] === 'A' ? "bg-neon border-neon text-chumbo" : "border-border text-muted-foreground"
                )}>
                  A
                </div>
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.statementA}</p>
              </CardContent>
            </Card>

            {/* Divisor Visual */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-background border-2 border-border rounded-full items-center justify-center z-10 text-muted-foreground">
              <ArrowRightLeft className="w-4 h-4" />
            </div>

            {/* Opção B */}
            <Card
              onClick={() => handleSelect('B')}
              className={cn(
                "cursor-pointer transition-all border-2 h-full flex flex-col hover:scale-[1.02] active:scale-[0.98]",
                responses[currentQuestion.id] === 'B'
                  ? "border-neon bg-neon/5 shadow-lg"
                  : "border-border hover:border-neon/40"
              )}
            >
              <CardContent className="p-8 flex flex-col items-center text-center justify-center min-h-[180px] gap-4">
                <div className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs",
                  responses[currentQuestion.id] === 'B' ? "bg-neon border-neon text-chumbo" : "border-border text-muted-foreground"
                )}>
                  B
                </div>
                <p className="text-lg font-medium leading-relaxed">{currentQuestion.statementB}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0 || isSaving}
        >
          Voltar
        </Button>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Salvando...
          </div>
        )}
      </div>
    </div>
  );
}
