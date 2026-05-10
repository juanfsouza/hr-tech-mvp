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
  Sparkles,
  Pencil,
  Eye,
  MapPin,
  X,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Job, jobService } from "@/services/job-service";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/dialog";
import { dashboardService } from "@/services/dashboard-service";

export default function DashboardPage() {
  const user = authService.getUser();
  const queryClient = useQueryClient();

  // Buscar estatísticas reais do dashboard
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardService.getStats(),
  });

  // Buscar vagas reais
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(undefined, 5),
  });

  const jobs = (jobsData as any)?.items || [];

  // Mutação para encerrar vaga
  const closeMutation = useMutation({
    mutationFn: (id: string) => jobService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Vaga encerrada com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao encerrar vaga.");
    }
  });

  const handleCloseJob = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    closeMutation.mutate(id);
  };

  const STATS = [
    {
      label: "Vagas Ativas",
      value: stats?.activeJobs.toString() || "0",
      growth: "+12%",
      icon: Briefcase,
      color: "text-forest dark:text-neon",
      bg: "bg-forest/10 dark:bg-neon/10"
    },
    {
      label: "Total de Candidatos",
      value: stats?.totalCandidates.toString() || "0",
      growth: "+8%",
      icon: Users,
      color: "text-azure",
      bg: "bg-azure/10"
    },
    {
      label: "Média de Match IA",
      value: `${stats?.avgMatch || 0}%`,
      growth: "+5%",
      icon: TrendingUp,
      color: "text-coral",
      bg: "bg-coral/10"
    },
    {
      label: "Testes Concluídos",
      value: stats?.testsCompleted.toString() || "0",
      growth: "+15%",
      icon: Brain,
      color: "text-primary",
      bg: "bg-primary/10"
    },
  ];
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-forest dark:text-neon font-outfit mb-2">Painel de Controle</h1>
            <p className="text-muted-foreground text-lg">Olá {user?.name || "Usuário"}, veja como estão seus processos seletivos hoje.</p>
          </div>
          {!user?.companyId && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-coral/10 border border-coral/20 p-4 rounded-2xl flex items-center gap-4 max-w-md"
            >
              <div className="bg-coral p-2 rounded-lg text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-coral">Onboarding Pendente</p>
                <p className="text-xs text-coral/80">Cadastre sua empresa para começar a criar vagas.</p>
              </div>
              <Link href="/onboarding">
                <Button size="sm" className="bg-coral hover:bg-coral/90 text-white">Configurar</Button>
              </Link>
            </motion.div>
          )}
          {user?.companyId && (
            <Link href="/dashboard/jobs/new">
              <Button className="bg-neon text-slate-900 dark:text-chumbo h-12 px-6 font-bold text-lg gap-2 shadow-lg shadow-neon/20 hover:bg-neon/90 transition-all">
                <Plus className="w-5 h-5" />
                Nova Vaga
              </Button>
            </Link>
          )}
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border border-slate-200 dark:border-none bg-white dark:bg-card/50 shadow-sm transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-3 rounded-xl", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <span className="text-xs font-bold text-forest dark:text-neon flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      {stat.growth}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Vagas Recentes</h2>
              <Link href="/dashboard/jobs">
                <Button variant="link" className="text-forest dark:text-neon font-bold">Ver todas</Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {isLoadingJobs ? (
                [1, 2, 3].map((i) => <div key={i} className="h-20 bg-slate-100 dark:bg-muted animate-pulse rounded-2xl" />)
              ) : (
                jobs.map((job: Job) => (
                  <Dialog key={job.id}>
                    <DialogTrigger asChild>
                      <Card className="border border-slate-200 dark:border-border/50 bg-white dark:bg-card/30 hover:bg-slate-50/50 dark:hover:bg-card/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-neon/5 active:scale-[0.98]">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-muted flex items-center justify-center group-hover:bg-forest/10 dark:group-hover:bg-neon/10 transition-colors">
                              <Briefcase className="w-6 h-6 text-slate-400 dark:text-muted-foreground group-hover:text-forest dark:group-hover:text-neon" />
                            </div>
                            <div className="">
                              <h4 className="font-bold text-start text-lg leading-none mb-1 text-slate-900 dark:text-white group-hover:text-forest dark:group-hover:text-neon transition-colors">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-3 ml-1 text-sm text-slate-500 dark:text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.candidatesCount || 0} candidatos</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <div className="text-right hidden md:block">
                              <p className="text-xs text-start text-slate-400 dark:text-muted-foreground mb-1 uppercase font-bold tracking-wider">Avg. Match</p>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-forest dark:bg-neon" style={{ width: `${job.candidatesCount! > 0 ? 85 : 0}%` }} />
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{job.candidatesCount! > 0 ? '85%' : '0%'}</span>
                              </div>
                            </div>

                            <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"} className={cn(
                              "relative overflow-hidden rounded-lg px-3 py-1 font-bold border-none",
                              job.status === "ACTIVE"
                                ? "bg-forest/20 text-forest dark:bg-neon/10 dark:text-neon shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500"
                            )}>
                              {/* Framer Motion Shine Effect */}
                              <motion.div
                                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "100%" }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 2,
                                  ease: "linear",
                                }}
                              />
                              <span className="relative z-10">{job.status}</span>
                            </Badge>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-muted transition-colors">
                                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-slate-200 dark:border-border/50">
                                <Link href={`/dashboard/jobs/${job.id}`}>
                                  <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-muted">
                                    <Pencil className="w-4 h-4" /> Editar Vaga
                                  </DropdownMenuItem>
                                </Link>
                                <Link href="/dashboard/candidates">
                                  <DropdownMenuItem className="gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-muted">
                                    <Users className="w-4 h-4" /> Ver Candidatos
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/5"
                                  onClick={(e) => handleCloseJob(e, job.id)}
                                >
                                  {closeMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <X className="w-4 h-4" />}
                                  Encerrar Vaga
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-card/95 backdrop-blur-2xl border-slate-200 dark:border-border/50 shadow-2xl scrollbar-hide">
                      <DialogHeader className="flex flex-col md:flex-row items-start justify-between border-b border-slate-200 dark:border-border/50 pb-6 mb-6 gap-4">
                        <div className="space-y-1">
                          <DialogTitle className="text-2xl md:text-3xl font-outfit font-bold text-slate-900 dark:text-white">{job.title}</DialogTitle>
                          <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-muted-foreground">
                            <span className="flex items-center gap-1.5 text-sm md:text-base"><MapPin className="w-4 h-4" /> {job.location || "Remoto"}</span>
                            <span className="flex items-center gap-1.5 text-sm md:text-base"><Clock className="w-4 h-4" /> Criada em {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className={cn(
                          "relative overflow-hidden text-sm px-4 py-1.5 rounded-full font-bold border-none",
                          job.status === "ACTIVE"
                            ? "bg-forest/20 text-forest dark:bg-neon/20 dark:text-neon"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500"
                        )}>
                          <motion.div
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          />
                          <span className="relative z-10">{job.status}</span>
                        </Badge>
                      </DialogHeader>

                      <div className="space-y-6 text-slate-900 dark:text-white">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Card className="bg-slate-50 dark:bg-muted/30 border-none p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-forest dark:text-neon" />
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Candidatos</p>
                            <p className="text-xl font-bold">{job.candidatesCount || 0}</p>
                          </Card>
                          <Card className="bg-slate-50 dark:bg-muted/30 border-none p-4 text-center">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-azure" />
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Match Médio</p>
                            <p className="text-xl font-bold">{job.candidatesCount! > 0 ? '85%' : '0%'}</p>
                          </Card>
                          <Card className="bg-slate-50 dark:bg-muted/30 border-none p-4 text-center">
                            <Brain className="w-6 h-6 mx-auto mb-2 text-coral" />
                            <p className="text-sm text-slate-500 dark:text-muted-foreground">Análise IA</p>
                            <p className="text-xl font-bold font-outfit">Pronta</p>
                          </Card>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Briefcase className="w-4 h-4 text-forest dark:text-neon" />
                            Resumo da Descrição
                          </h4>
                          <p className="text-slate-600 dark:text-muted-foreground leading-relaxed line-clamp-4">
                            {job.description || "Nenhuma descrição detalhada disponível para esta vaga."}
                          </p>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-border/50">
                          <Link href={`/dashboard/jobs/${job.id}`} className="flex-1">
                            <Button className="w-full bg-neon text-slate-900 dark:text-chumbo font-bold gap-2 hover:bg-neon/90 transition-all">
                              <Eye className="w-4 h-4" /> Ver Detalhes Completo
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1 gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 dark:text-white">
                            <Pencil className="w-4 h-4" /> Editar Vaga
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-outfit text-slate-900 dark:text-white">Atividade Recente</h2>
            <Card className="border border-slate-200 dark:border-none bg-white dark:bg-neon/5 shadow-sm">
              <CardContent className="p-6 space-y-6">
                {isLoadingStats ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 dark:bg-muted/50 animate-pulse rounded-xl" />)
                ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.slice(0, 5).map((log: any, i: number) => (
                    <div key={log.id} className="flex gap-4 relative">
                      {i !== Math.min(stats.recentActivity.length, 5) - 1 && <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-200 dark:bg-border/50" />}
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-background border border-slate-200 dark:border-border flex items-center justify-center shrink-0 z-10 shadow-sm transition-transform hover:scale-110">
                        <Users className="w-5 h-5 text-forest dark:text-neon" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 dark:text-white">
                          <span className="font-bold">{log.details}</span>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-muted-foreground mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-muted-foreground text-center py-4 italic">Nenhuma atividade recente encontrada.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
