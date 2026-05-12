"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Textarea } from "@/components/atoms/textarea";
import { Label } from "@/components/atoms/label";
import { Badge } from "@/components/atoms/badge";
import { Input } from "@/components/atoms/input";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Rocket, ShieldCheck, RefreshCcw, X, Plus, Sparkles, ArrowLeft, CheckCircle, Wand2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { aiService } from "@/services/ai-service";
import { companyService } from "@/services/company-service";
import { useMutation } from "@tanstack/react-query";

const COMPANY_PROFILES = [
  { id: "startup", label: "Startup", icon: Rocket, desc: "Alto crescimento e ritmo acelerado." },
  { id: "consolidated", label: "Consolidada", icon: ShieldCheck, desc: "Processos estáveis e maduros." },
  { id: "restructuring", label: "Reestruturação", icon: RefreshCcw, desc: "Em transição ou nova fase." },
];

export function CompanyContextStep() {
  const { companyData, organogram, personalityResults, updateCompanyData, prevStep } = useOnboardingStore();
  const [profile, setProfile] = useState<string | null>(companyData.profile || null);
  const [narrative, setNarrative] = useState(companyData.narrative || "");
  const [tags, setTags] = useState<string[]>(companyData.values || []);
  const [tagInput, setTagInput] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const router = useRouter();

  const generateMutation = useMutation({
    mutationFn: () => aiService.generateCompanyContext(companyData.name, profile!, tags),
    onSuccess: (text) => {
      setNarrative(text);
      toast.success("Narrativa gerada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar narrativa com IA.");
    }
  });

  const wordCount = useMemo(() => {
    return narrative.trim().split(/\s+/).filter((w: string | any[]) => w.length > 0).length;
  }, [narrative]);

  const isComplete = profile && wordCount >= 100 && tags.length >= 3;

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const removeTag = (t: string) => setTags(tags.filter(tag => tag !== t));

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      // 1. Sincronizar Organograma e Resultados Psicométricos
      await companyService.syncOrganogram(
        companyData.id!,
        organogram,
        personalityResults
      );

      // 2. Salvar Contexto da Empresa
      await companyService.updateOnboarding(companyData.id!, {
        companyContext: narrative,
        perfilRitmo: profile || undefined,
        valores: tags,
        isComplete: true
      });

      toast.success("Onboarding concluído com sucesso!", {
        description: "Sua conta está configurada. Redirecionando para o Dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      // Error silent
    } finally {
      toast.error("Erro ao salvar dados do onboarding.");
      setIsFinishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <Card className="border-none shadow-none bg-transparent p-5">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-outfit text-forest dark:text-neon flex items-center gap-2">
            Contexto e Ritmo
          </CardTitle>
          <CardDescription className="text-lg">
            Esta é a etapa final. Quanto mais contexto você der, melhor será o match da IA.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 space-y-8">
          {/* Perfil da Empresa */}
          <div className="space-y-4">
            <Label className="text-lg">Qual o perfil atual da sua empresa?</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COMPANY_PROFILES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfile(p.id)}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-2xl border-2 transition-all text-center gap-3",
                    profile === p.id
                      ? "border-forest dark:border-neon bg-forest/5 dark:bg-neon/5"
                      : "border-muted hover:border-muted-foreground/50 bg-card/30"
                  )}
                >
                  <p.icon className={cn("w-8 h-8", profile === p.id ? "text-forest dark:text-neon" : "text-muted-foreground")} />
                  <div>
                    <p className="font-bold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Narrativa com Word Counter */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-lg">Descreva o momento atual da sua empresa</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 rounded-xl border-forest/30 dark:border-neon/30 text-forest dark:text-neon hover:bg-forest/10 dark:hover:bg-neon/10 gap-2 font-bold transition-all"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending || !profile}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wand2 className="w-4 h-4" />
                  )}
                  {narrative ? "Melhorar com IA" : "Gerar com IA"}
                </Button>
                <span className={cn(
                  "text-sm font-bold px-2 py-1 rounded-md transition-colors",
                  wordCount < 100 ? "text-destructive bg-destructive/10" : "text-forest dark:text-neon bg-forest/10 dark:bg-neon/10"
                )}>
                  {wordCount} / 100 palavras
                </span>
              </div>
            </div>
            <Textarea
              placeholder="Ex: Estamos em um momento de expansão acelerada após a última rodada de investimentos. Buscamos pessoas que tenham perfil de dono e consigam lidar com a ambiguidade..."
              className="min-h-[150px] text-lg resize-none p-4"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
            />
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full", wordCount >= 100 ? "bg-forest dark:bg-neon" : "bg-destructive")}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((wordCount / 100) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Valores da Empresa */}
          <div className="space-y-4">
            <Label className="text-lg">Valores e Cultura (Mínimo 3)</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="pl-3 pr-1 py-1 text-sm gap-1 bg-azure/10 text-azure border-azure/20">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-destructive transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: Transparência"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
              />
              <Button onClick={addTag} variant="outline" size="icon" className="shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-8">
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={handleFinish}
              className={cn(
                "flex-[2] h-12 text-lg font-bold transition-all",
                isComplete
                  ? "bg-forest dark:bg-neon dark:text-chumbo shadow-lg shadow-forest/20 dark:shadow-neon/20"
                  : "bg-muted text-muted-foreground grayscale"
              )}
              disabled={!isComplete || isFinishing}
            >
              {isFinishing ? (
                <>
                  <CheckCircle className="mr-2 w-5 h-5 animate-pulse" />
                  Finalizando...
                </>
              ) : (
                <>
                  Concluir Onboarding
                  <Sparkles className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
