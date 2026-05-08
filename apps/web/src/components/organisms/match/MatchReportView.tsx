"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { MatchAnalysis } from "@/services/match-service";
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  BrainCircuit, 
  Target, 
  Sparkles,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchReportViewProps {
  analysis: MatchAnalysis;
}

export function MatchReportView({ analysis }: MatchReportViewProps) {
  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "HIRE": return { icon: CheckCircle2, label: "Recomendado", color: "text-forest dark:text-neon", bg: "bg-forest/10 dark:bg-neon/10" };
      case "RECONSIDER": return { icon: AlertCircle, label: "Reavaliar", color: "text-azure", bg: "bg-azure/10" };
      default: return { icon: XCircle, label: "Não Recomendado", color: "text-destructive", bg: "bg-destructive/10" };
    }
  };

  const rec = getRecommendationStyle(analysis.recommendation);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Score Circle */}
        <Card className="md:col-span-1 border-none bg-card/30 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon/10 rounded-full blur-3xl" />
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
              <motion.circle
                className="text-forest dark:text-neon stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
                initial={{ strokeDasharray: "0 251" }}
                animate={{ strokeDasharray: `${(analysis.overallScore / 100) * 251} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-bold font-outfit">{analysis.overallScore}%</span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Match Score</span>
            </div>
          </div>
          <Badge className={cn("mt-2 rounded-lg px-4 py-1 font-bold", rec.bg, rec.color)}>
            <rec.icon className="w-3 h-3 mr-2" />
            {rec.label}
          </Badge>
        </Card>

        {/* AI Summary */}
        <Card className="md:col-span-2 border-none bg-forest/5 dark:bg-neon/5 p-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-forest dark:text-neon">
              <Sparkles className="w-5 h-5" />
              Análise Qualitativa IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed italic text-chumbo/80 dark:text-offwhite/80">
              "{analysis.summary}"
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dimensions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 font-outfit">
              <Target className="w-5 h-5 text-azure" /> Dimensões de Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <DimensionRow label="Match Cultural" score={analysis.details.cultureMatch} color="bg-forest dark:bg-neon" />
            <DimensionRow label="Habilidades Técnicas" score={analysis.details.technicalSkills} color="bg-azure" />
            <DimensionRow label="Potencial de Liderança" score={analysis.details.leadershipPotential} color="bg-coral" />
          </CardContent>
        </Card>

        {/* Soft Skills & Risks */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Soft Skills Identificadas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {analysis.details.softSkills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-background border-border">
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>

          {analysis.details.risks && analysis.details.risks.length > 0 && (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Pontos de Atenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {analysis.details.risks.map((risk) => (
                  <p key={risk} className="text-sm text-destructive/80 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    {risk}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DimensionRow({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}
