"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { testService } from "@/services/test-service";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Loader2, Brain, CheckCircle2, ShieldCheck, Clock, ArrowRight, Timer, House, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { AnimatedThemeToggler } from "@/components/atoms/AnimatedThemeToggler";

import { DiscTest } from "@/components/organisms/tests/DiscTest";
import { EnneagramTest } from "@/components/organisms/tests/EnneagramTest";
import { SixteenPersonalitiesTest } from "@/components/organisms/tests/SixteenPersonalitiesTest";

export default function CandidatePortal() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [view, setView] = useState<"INTRO" | "TESTING" | "COMPLETED">("INTRO");

  const { data: session, isLoading, isError, refetch } = useQuery({
    queryKey: ["test-session", token],
    queryFn: () => testService.getSession(token),
    retry: false,
  });

  const { data: questionsData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["questions", session?.currentTest],
    queryFn: () => testService.getQuestions(session!.currentTest!),
    enabled: !!session?.currentTest && view === "TESTING",
  });

  const handleSaveProgress = async (questionId: string, answer: string) => {
    if (!session?.currentTest) return;
    try {
      await testService.saveProgress(token, {
        testType: session.currentTest,
        questionId,
        answer
      });
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  const handleCompleteTest = async () => {
    if (!session?.currentTest) return;
    try {
      const result = await testService.completeTest(token, session.currentTest);
      if (result.allCompleted) {
        setView("COMPLETED");
      } else {
        toast.success("Teste concluído! Vamos para o próximo.");
        refetch();
      }
    } catch (error) {
      toast.error("Erro ao finalizar teste. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-neon mx-auto" />
          <p className="text-muted-foreground animate-pulse font-outfit text-neon/80">Carregando sua sessão de teste...</p>
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Link Inválido ou Expirado</CardTitle>
            <CardDescription>
              Este link de teste não é mais válido. Entre em contato com o RH da empresa que o convidou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">Voltar ao Início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.status === "COMPLETED" || view === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-xl w-full text-center p-8 border-forest dark:border-neon shadow-2xl">
            <div className="w-20 h-20 bg-neon/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-neon" />
            </div>
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-3xl font-outfit">Testes Concluídos!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Suas respostas foram enviadas com sucesso para a equipe de recrutamento.
              </CardDescription>
            </CardHeader>
            <p className="text-muted-foreground mb-8">
              Você pode fechar esta janela agora. Obrigado por participar do nosso processo seletivo!
            </p>
            <div className="text-sm font-bold text-neon uppercase tracking-widest">
              RH TECH Intelligence
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-neon flex items-center justify-center">
              <Brain className="w-6 h-6 text-chumbo" />
            </div>
            <span className="font-outfit font-bold text-xl uppercase tracking-tighter">RH TECH <span className="text-forest dark:text-neon">PORTAL</span></span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Expira em: {new Date(session.expiresAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Privacidade protegida</span>
            </div>
            <div className="pl-2 ml-2 border-l border-border">
              <AnimatedThemeToggler />
            </div>
          </div>
        </header>

        <main>
          <AnimatePresence mode="wait">
            {view === "INTRO" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold font-outfit tracking-tight">Seja bem-vindo(a)</h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Você foi convidado para realizar uma avaliação psicométrica. Não existem respostas certas ou erradas; o objetivo é conhecer melhor o seu perfil comportamental.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                  <Card className="bg-card/50 border-none shadow-sm">
                    <CardContent className="p-6 text-center space-y-2">
                      <Timer className="flex items-center justify-center mx-auto mb-2 w-4 h-4 text-forest dark:text-neon" />
                      <h3 className="font-bold">Tempo Estimado</h3>
                      <p className="text-sm text-muted-foreground">15 - 20 minutos</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-none shadow-sm">
                    <CardContent className="p-6 text-center space-y-2">
                      <House className="flex items-center justify-center mx-auto mb-2 w-4 h-4 text-forest dark:text-neon" />
                      <h3 className="font-bold">Ambiente</h3>
                      <p className="text-sm text-muted-foreground">Busque um local calmo e sem distrações</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-none shadow-sm">
                    <CardContent className="p-6 text-center space-y-2">
                      <LockKeyhole className="flex items-center justify-center mx-auto mb-2 w-4 h-4 text-forest dark:text-neon" />
                      <h3 className="font-bold">Sua Privacidade</h3>
                      <p className="text-sm text-muted-foreground">Seus dados são protegidos por LGPD</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center pt-10">
                  <Button
                    size="lg"
                    onClick={() => setView("TESTING")}
                    className="h-16 px-12 text-xl font-bold bg-neon text-chumbo shadow-2xl shadow-neon/20 rounded-2xl group border-none"
                  >
                    Iniciar Avaliação
                    <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {view === "TESTING" && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                {isLoadingQuestions ? (
                  <div className="py-20 text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-neon" />
                    <p className="text-muted-foreground">Carregando questões...</p>
                  </div>
                ) : (
                  <>
                    {session?.currentTest === "DISC" && questionsData && (
                      <DiscTest
                        questions={questionsData.questions}
                        onSaveProgress={handleSaveProgress}
                        onComplete={handleCompleteTest}
                      />
                    )}

                    {session?.currentTest === "ENNEAGRAM" && questionsData && (
                      <EnneagramTest
                        questions={questionsData.questions}
                        onSaveProgress={handleSaveProgress}
                        onComplete={handleCompleteTest}
                      />
                    )}

                    {session?.currentTest === "SIXTEEN_PERSONALITIES" && questionsData && (
                      <SixteenPersonalitiesTest
                        questions={questionsData.questions}
                        onSaveProgress={handleSaveProgress}
                        onComplete={handleCompleteTest}
                      />
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
