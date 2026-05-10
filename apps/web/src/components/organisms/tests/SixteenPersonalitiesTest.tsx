"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Progress } from "@/components/atoms/progress";
import { Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  dimension: string;
  id: string;
  text: string;
  isReversed: boolean;
}

interface SixteenPersonalitiesTestProps {
  questions: Question[];
  initialResponses?: Record<string, string>;
  onComplete: (responses: any) => void;
  onSaveProgress: (questionId: string, answer: string) => Promise<void>;
}

const LIKERT_OPTIONS = [
  { value: "1", label: "Discordo Totalmente", color: "bg-red-600", size: "w-12 h-12" },
  { value: "2", label: "Discordo", color: "bg-red-300/50", size: "w-10 h-10" },
  { value: "3", label: "Neutro", color: "bg-gray-300", size: "w-8 h-8" },
  { value: "4", label: "Concordo", color: "bg-green-300/50", size: "w-10 h-10" },
  { value: "5", label: "Concordo Totalmente", color: "bg-green-500", size: "w-12 h-12" },
];

export function SixteenPersonalitiesTest({
  questions,
  initialResponses = {},
  onComplete,
  onSaveProgress
}: SixteenPersonalitiesTestProps) {
  const [responses, setResponses] = useState<{ [id: string]: string }>(initialResponses);
  const [currentIndex, setCurrentIndex] = useState(() => {
    const answeredCount = Object.keys(initialResponses).length;
    return Math.min(answeredCount, questions.length - 1);
  });
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = async (value: string) => {
    const newResponses = {
      ...responses,
      [currentQuestion.id]: value
    };

    const answerObj = {
      value,
      dimension: currentQuestion.dimension,
      isReversed: currentQuestion.isReversed,
    };

    if (currentIndex < questions.length - 1) {
      setIsSaving(true);
      await onSaveProgress(currentQuestion.id, JSON.stringify(answerObj));
      setIsSaving(false);

      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    } else {
      setIsSaving(true);
      onComplete({ ...responses, [currentQuestion.id]: JSON.stringify(answerObj) });
    }
  };

  const getOptionColor = (option: typeof LIKERT_OPTIONS[0], isSelected: boolean) => {
    if (isSelected) {
      switch (option.value) {
        case "1": return "bg-red-600";
        case "2": return "bg-red-300/50";
        case "3": return "bg-gray-300";
        case "4": return "bg-green-300/50";
        case "5": return "bg-green-500";
        default: return "";
      }
    }

    // Classes de hover literais para o Tailwind
    switch (option.value) {
      case "1": return "hover:bg-red-600/10";
      case "2": return "hover:bg-red-300/20";
      case "3": return "hover:bg-gray-300/20";
      case "4": return "hover:bg-green-300/20";
      case "5": return "hover:bg-green-500/10";
      default: return "hover:bg-neon/5";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-10">
      <div className="space-y-4">
        <div className="flex justify-between items-end text-sm mb-2">
          <span className="font-bold text-foreground dark:text-neon uppercase tracking-tighter">Inventário de Personalidade</span>
          <span className="text-muted-foreground font-medium">Questão {currentIndex + 1} de {questions.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-12"
        >
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-medium font-outfit leading-tight max-w-2xl mx-auto">
              "{currentQuestion.text}"
            </h2>
          </div>

          <div className="flex flex-col items-center gap-10 pb-12">
            <div className="flex items-center justify-between w-full max-w-xl relative px-4">
              {/* Linha de fundo conectando os círculos */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-muted-foreground/20 -translate-y-1/2 z-0" />

              {LIKERT_OPTIONS.map((option) => (
                <div key={option.value} className="flex flex-col items-center gap-3 z-10 relative">
                  <button
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "rounded-full transition-all duration-200 border-4 bg-transparent",
                      option.size,
                      getOptionColor(option, responses[currentQuestion.id] === option.value),
                      responses[currentQuestion.id] === option.value
                        ? "border-white scale-125 shadow-lg"
                        : "border-muted-foreground/40 hover:border-neon"
                    )}
                    aria-label={option.label}
                  />
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-tight absolute -bottom-12 w-24 text-center leading-tight transition-all",
                    responses[currentQuestion.id] === option.value
                      ? "text-neon opacity-100 scale-110"
                      : "text-muted-foreground/60 opacity-100"
                  )}>
                    {option.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between w-full max-w-xl px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-4">
              <span>Discordo</span>
              <span>Concordo</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center pt-12">
        <Button
          className="bg-neon shadow-none text-chumbo font-bold"
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0 || isSaving}
        >
          Questão Anterior
        </Button>

        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-neon" />
            Sincronizando...
          </div>
        )}
      </div>
    </div>
  );
}
