"use client";

import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  CheckCircle2,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  { label: "Vagas Ativas", value: "12", icon: Briefcase, color: "text-forest dark:text-neon", bg: "bg-forest/10 dark:bg-neon/10" },
  { label: "Candidatos em Processo", value: "48", icon: Users, color: "text-azure", bg: "bg-azure/10" },
  { label: "Média de Match IA", value: "84%", icon: TrendingUp, color: "text-coral", bg: "bg-coral/10" },
  { label: "Testes Concluídos", value: "124", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
];

const RECENT_JOBS = [
  { id: 1, title: "Desenvolvedor Full Stack Sênior", candidates: 14, matchAvg: 88, status: "Aberto", date: "2 dias atrás" },
  { id: 2, title: "Gerente de Produto (PM)", candidates: 8, matchAvg: 75, status: "Aberto", date: "5 dias atrás" },
  { id: 3, title: "Designer de Produto (UX/UI)", candidates: 22, matchAvg: 92, status: "Em Análise", date: "1 semana atrás" },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Painel de Controle</h1>
            <p className="text-muted-foreground text-lg">Olá Juan, veja como estão seus processos seletivos hoje.</p>
          </div>
          <Button className="bg-forest dark:bg-neon dark:text-chumbo h-12 px-6 font-bold text-lg gap-2 shadow-lg shadow-forest/20 dark:shadow-neon/20">
            <Plus className="w-5 h-5" />
            Nova Vaga
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none bg-card/50 backdrop-blur-md shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <span className="text-xs font-bold text-forest dark:text-neon flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      +12%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-bold font-outfit">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-outfit">Vagas Recentes</h2>
              <Button variant="link" className="text-forest dark:text-neon font-bold">Ver todas</Button>
            </div>
            <div className="grid gap-4">
              {RECENT_JOBS.map((job) => (
                <Card key={job.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-colors group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg leading-none mb-1 group-hover:text-forest dark:group-hover:text-neon transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.candidates} candidatos</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Avg. Match</p>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-neon" style={{ width: `${job.matchAvg}%` }} />
                          </div>
                          <span className="text-sm font-bold">{job.matchAvg}%</span>
                        </div>
                      </div>
                      <Badge variant={job.status === "Aberto" ? "default" : "secondary"} className={cn(
                        "rounded-lg px-3 py-1 font-bold",
                        job.status === "Aberto" ? "bg-forest/10 text-forest dark:bg-neon/10 dark:text-neon border-transparent" : ""
                      )}>
                        {job.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-outfit">Atividade Recente</h2>
            <Card className="border-none bg-forest/5 dark:bg-neon/5">
              <CardContent className="p-6 space-y-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== 2 && <div className="absolute left-5 top-10 bottom-0 w-px bg-border/50" />}
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 className="w-5 h-5 text-forest dark:text-neon" />
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold">João Paulo</span> concluiu os testes psicométricos para <span className="font-bold">UX Designer</span>.
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Hoje, 14:30</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card className="border-none bg-azure/10 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-2">
                <Sparkles className="w-4 h-4 text-azure opacity-50" />
              </div>
              <CardContent className="p-6">
                <h4 className="font-bold text-azure mb-2">Dica da IA</h4>
                <p className="text-sm text-azure/80 italic">
                  "Você tem 3 candidatos com match acima de 90% para a vaga de Sênior Dev. Recomendo agendar as entrevistas técnicas ainda esta semana."
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
