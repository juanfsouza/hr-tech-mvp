"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Textarea } from "@/components/atoms/textarea";
import { Skeleton } from "@/components/atoms/skeleton";
import { 
  Sparkles, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  BrainCircuit, 
  UserCircle2,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { jobService } from "@/services/job-service";
import { authService } from "@/services/auth-service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type WizardMode = "IDLE" | "IA_BRIEFING" | "GENERATING" | "REVIEW" | "MANUAL";

export function JobCreationWizard() {
  const router = useRouter();
  const [mode, setMode] = useState<WizardMode>("IDLE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [generatedJd, setGeneratedJd] = useState("");
  const [briefing, setBriefing] = useState({
    title: "",
    leader: "",
    reason: "",
    responsibilities: "",
  });

  // Mutação para criar a vaga inicial
  const createMutation = useMutation({
    mutationFn: (data: typeof briefing) => 
      jobService.create({ 
        title: data.title,
        responsibilities: [data.responsibilities],
      }),
  });

  // Mutação para gerar JD com IA
  const generateMutation = useMutation({
    mutationFn: (id: string) => jobService.generateJd(id),
    onSuccess: (data) => {
      setGeneratedJd(data.jd);
      setMode("REVIEW");
    },
    onError: () => {
      toast.error("Erro ao gerar descrição com IA");
      setMode("IA_BRIEFING");
    }
  });

  // Mutação para publicar a vaga
  const publishMutation = useMutation({
    mutationFn: (id: string) => jobService.publish(id),
    onSuccess: () => {
      toast.success("Vaga publicada com sucesso!");
      router.push("/dashboard");
    }
  });

  const handleStartIA = async () => {
    if (!briefing.title) {
      toast.error("Por favor, informe pelo menos o título da vaga.");
      return;
    }

    const user = authService.getUser();
    if (!user?.companyId) {
      toast.error("Empresa não identificada", {
        description: "Você precisa cadastrar sua empresa no Onboarding antes de criar vagas.",
      });
      router.push("/onboarding");
      return;
    }

    setMode("GENERATING");
    try {
      // 1. Criar a vaga
      const job = await createMutation.mutateAsync(briefing);
      setJobId(job.id);
      
      // 2. Chamar geração por IA
      generateMutation.mutate(job.id);
    } catch (error: any) {
      console.error("Erro ao iniciar criação da vaga:", error);
      toast.error("Erro ao iniciar criação da vaga", {
        description: error.response?.status === 401 
          ? "Sua sessão expirou. Por favor, faça login novamente." 
          : "Não foi possível conectar ao servidor.",
      });
      setMode("IA_BRIEFING"); // Volta para o estado anterior para permitir correção
    }
  };

  const handlePublish = () => {
    if (jobId) publishMutation.mutate(jobId);
  };

  if (mode === "IDLE") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card 
            className="cursor-pointer border-forest/20 hover:border-forest dark:border-neon/20 dark:hover:border-neon bg-card/50 transition-all h-full"
            onClick={() => setMode("IA_BRIEFING")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-forest dark:bg-neon flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-offwhite dark:text-chumbo" />
              </div>
              <CardTitle className="text-2xl font-outfit">Preciso de ajuda (IA)</CardTitle>
              <CardDescription className="text-lg">
                Nossa IA gera a Job Description, requisitos e o perfil ideal baseado na sua cultura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-forest dark:bg-neon dark:text-chumbo font-bold">
                Iniciar com IA
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card 
            className="cursor-pointer border-border hover:border-azure transition-all h-full"
            onClick={() => setMode("MANUAL")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-2xl bg-azure flex items-center justify-center mb-4 text-white">
                <FileText className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-outfit text-azure">Já tenho os dados</CardTitle>
              <CardDescription className="text-lg">
                Preencha os dados da vaga e candidatos manualmente se já tiver tudo pronto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-azure text-azure hover:bg-azure/10 font-bold">
                Cadastro Manual
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (mode === "IA_BRIEFING") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0">
            <div className="flex items-center gap-2 text-forest dark:text-neon mb-2">
              <BrainCircuit className="w-6 h-6" />
              <span className="font-bold uppercase tracking-widest text-sm">IA Assistida</span>
            </div>
            <CardTitle className="text-3xl font-outfit">Briefing da Vaga</CardTitle>
            <CardDescription className="text-lg">
              Conte para a IA o que você busca. Quanto mais detalhes, melhor o resultado.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Título da Vaga</Label>
                <Input placeholder="Ex: Engenheiro de Software Full Stack" value={briefing.title} onChange={e => setBriefing({...briefing, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Líder Direto</Label>
                <Input placeholder="Selecione do organograma..." value={briefing.leader} onChange={e => setBriefing({...briefing, leader: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Por que está abrindo esta vaga?</Label>
              <Textarea 
                placeholder="Ex: Expansão do time de pagamentos, substituição..." 
                value={briefing.reason}
                onChange={e => setBriefing({...briefing, reason: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>O que essa pessoa vai executar no dia a dia?</Label>
              <Textarea 
                placeholder="Descreva as principais responsabilidades..." 
                className="min-h-[120px]"
                value={briefing.responsibilities}
                onChange={e => setBriefing({...briefing, responsibilities: e.target.value})}
              />
            </div>
            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={() => setMode("IDLE")} className="flex-1 h-12">
                <ArrowLeft className="mr-2 w-5 h-5" /> Voltar
              </Button>
              <Button 
                onClick={handleStartIA}
                className="flex-[2] h-12 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo"
                disabled={!briefing.title || !briefing.responsibilities}
              >
                Gerar com IA
                <Sparkles className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (mode === "GENERATING") {
    return (
      <div className="space-y-8 py-10">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-neon/10 animate-pulse">
            <Loader2 className="w-12 h-12 text-neon animate-spin" />
          </div>
          <h2 className="text-3xl font-bold font-outfit">A IA está trabalhando...</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto italic">
            "Analisando o contexto da empresa, perfil do líder e mercado para gerar a melhor estratégia de recrutamento."
          </p>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="pt-8 space-y-3">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (mode === "REVIEW") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold font-outfit tracking-tight">Resultado da Análise IA</h2>
          </div>
          <Button variant="outline" onClick={() => setMode("IA_BRIEFING")}>Refinar Briefing</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-forest/20 dark:border-neon/20 overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle>Job Description Gerada</CardTitle>
                <CardDescription>Revise e edite a descrição antes de publicar.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 prose dark:prose-invert max-w-none text-foreground">
                <div dangerouslySetInnerHTML={{ __html: generatedJd.replace(/\n/g, '<br/>') }} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-forest/5 dark:bg-neon/5 border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserCircle2 className="w-5 h-5" /> Perfil Ideal (Psicometria)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Match DISC</span>
                    <span className="text-forest dark:text-neon">D-I (Dominante/Influente)</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full">
                    <div className="h-full bg-forest dark:bg-neon w-[85%]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>Eneagrama Sugerido</span>
                    <span className="text-forest dark:text-neon">Tipo 3 ou 8</span>
                  </div>
                </div>
                <div className="p-4 bg-background/50 rounded-xl text-xs text-muted-foreground italic">
                  "Este perfil foi sugerido com base no ritmo acelerado (Startup) e na necessidade de entregas rápidas mencionada no briefing."
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handlePublish}
              disabled={publishMutation.isPending}
              className="w-full h-14 text-xl font-bold bg-forest dark:bg-neon dark:text-chumbo shadow-xl shadow-forest/20 dark:shadow-neon/20"
            >
              {publishMutation.isPending ? <Loader2 className="animate-spin" /> : (
                <>
                  Publicar Vaga
                  <ChevronRight className="ml-2 w-6 h-6" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
