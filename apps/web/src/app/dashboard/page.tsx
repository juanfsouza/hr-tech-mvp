"use client";

import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import Link from "next/link";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Clock, 
  ArrowUpRight,
  MoreVertical,
  CheckCircle2,
  Brain,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job-service";
import { candidateService } from "@/services/candidate-service";

export default function DashboardPage() {
  // Buscar vagas reais
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(undefined, 5),
  });

  // Buscar candidatos para estatísticas
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  const jobs = (jobsData as any)?.items || [];
  const activeJobsCount = jobs.filter((j: any) => j.status === "ACTIVE" || j.status === "Aberto").length;
  const candidatesCount = candidates?.length || 0;

  const STATS = [
    { label: "Vagas Ativas", value: activeJobsCount.toString(), icon: Briefcase, color: "text-forest dark:text-neon", bg: "bg-forest/10 dark:bg-neon/10" },
    { label: "Candidatos em Processo", value: candidatesCount.toString(), icon: Users, color: "text-azure", bg: "bg-azure/10" },
    { label: "Média de Match IA", value: "88%", icon: TrendingUp, color: "text-coral", bg: "bg-coral/10" },
    { label: "Testes Concluídos", value: "32", icon: Brain, color: "text-primary", bg: "bg-primary/10" },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Painel de Controle</h1>
            <p className="text-muted-foreground text-lg">Olá Juan, veja como estão seus processos seletivos hoje.</p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button className="bg-forest dark:bg-neon dark:text-chumbo h-12 px-6 font-bold text-lg gap-2 shadow-lg shadow-forest/20 dark:shadow-neon/20">
              <Plus className="w-5 h-5" />
              Nova Vaga
            </Button>
          </Link>
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
              {isLoadingJobs ? (
                [1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)
              ) : (
                jobs.map((job: any) => (
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
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job._count?.candidates || 0} candidatos</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">Avg. Match</p>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-neon" style={{ width: `85%` }} />
                            </div>
                            <span className="text-sm font-bold">85%</span>
                          </div>
                        </div>
                        <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"} className={cn(
                          "rounded-lg px-3 py-1 font-bold",
                          job.status === "ACTIVE" ? "bg-forest/10 text-forest dark:bg-neon/10 dark:text-neon border-transparent" : ""
                        )}>
                          {job.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
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

