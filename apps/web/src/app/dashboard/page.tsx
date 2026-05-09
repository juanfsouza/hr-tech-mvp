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
import { jobService } from "@/services/job-service";
import { candidateService } from "@/services/candidate-service";
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

export default function DashboardPage() {
  const user = authService.getUser();
  const queryClient = useQueryClient();

  // Buscar vagas reais
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(undefined, 5),
  });

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

  // Buscar candidatos para estatísticas
  const { data: candidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  const jobs = (jobsData as any)?.items || [];
  const activeJobsCount = jobs.filter((j: any) => j.status === "ACTIVE" || j.status === "Aberto").length;
  const candidatesItems = (candidates as any)?.items || [];
  const candidatesCount = candidatesItems.length;

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
              <Button className="bg-forest dark:bg-neon dark:text-chumbo h-12 px-6 font-bold text-lg gap-2 shadow-lg shadow-forest/20 dark:shadow-neon/20">
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
                  <Dialog key={job.id}>
                    <DialogTrigger asChild>
                      <Card className="border-border/50 bg-card/30 hover:bg-card/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-forest/5 dark:hover:shadow-neon/5 active:scale-[0.98]">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-forest/10 dark:group-hover:bg-neon/10 transition-colors">
                              <Briefcase className="w-6 h-6 text-muted-foreground group-hover:text-forest dark:group-hover:text-neon" />
                            </div>
                            <div className="">
                              <h4 className="font-bold text-start text-lg leading-none mb-1 group-hover:text-forest dark:group-hover:text-neon transition-colors">
                                {job.title}
                              </h4>
                              <div className="flex items-center gap-3 ml-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {job.candidatesCount || 0} candidatos</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <div className="text-right hidden md:block">
                              <p className="text-xs text-start text-muted-foreground mb-1 uppercase font-bold tracking-wider">Avg. Match</p>
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-neon" style={{ width: `85%` }} />
                                </div>
                                <span className="text-sm font-bold">85%</span>
                              </div>
                            </div>

                            <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"} className={cn(
                              "relative overflow-hidden rounded-lg px-3 py-1 font-bold",
                              job.status === "ACTIVE" ? "bg-forest/10 text-forest dark:bg-neon/10 dark:text-neon border-transparent shadow-[0_0_15px_rgba(34,197,94,0.1)]" : ""
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
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-xl">
                                <Link href={`/dashboard/jobs/${job.id}`}>
                                  <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <Pencil className="w-4 h-4" /> Editar Vaga
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                  <Users className="w-4 h-4" /> Ver Candidatos
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
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

                    <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-border/50 shadow-2xl scrollbar-hide">
                      <DialogHeader className="flex flex-col md:flex-row items-start justify-between border-b border-border/50 pb-6 mb-6 gap-4">
                        <div className="space-y-1">
                          <DialogTitle className="text-2xl md:text-3xl font-outfit font-bold">{job.title}</DialogTitle>
                          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1.5 text-sm md:text-base"><MapPin className="w-4 h-4" /> {job.location || "Remoto"}</span>
                            <span className="flex items-center gap-1.5 text-sm md:text-base"><Clock className="w-4 h-4" /> Criada em {new Date(job.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className={cn(
                          "relative overflow-hidden text-sm px-4 py-1.5 rounded-full font-bold",
                          job.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
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

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Card className="bg-muted/30 border-none p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-forest dark:text-neon" />
                            <p className="text-sm text-muted-foreground">Candidatos</p>
                            <p className="text-xl font-bold">{job.candidatesCount || 0}</p>
                          </Card>
                          <Card className="bg-muted/30 border-none p-4 text-center">
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-azure" />
                            <p className="text-sm text-muted-foreground">Match Médio</p>
                            <p className="text-xl font-bold">85%</p>
                          </Card>
                          <Card className="bg-muted/30 border-none p-4 text-center">
                            <Brain className="w-6 h-6 mx-auto mb-2 text-coral" />
                            <p className="text-sm text-muted-foreground">Análise IA</p>
                            <p className="text-xl font-bold">Pronta</p>
                          </Card>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-bold flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-forest dark:text-neon" />
                            Resumo da Descrição
                          </h4>
                          <p className="text-muted-foreground leading-relaxed line-clamp-4">
                            {job.description || "Nenhuma descrição detalhada disponível para esta vaga."}
                          </p>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border/50">
                          <Link href={`/dashboard/jobs/${job.id}`} className="flex-1">
                            <Button className="w-full bg-forest dark:bg-neon dark:text-chumbo font-bold gap-2">
                              <Eye className="w-4 h-4" /> Ver Detalhes Completo
                            </Button>
                          </Link>
                          <Button variant="outline" className="flex-1 gap-2">
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
            <h2 className="text-2xl font-bold font-outfit">Atividade Recente</h2>
            <Card className="border-none bg-forest/5 dark:bg-neon/5">
              <CardContent className="p-6 space-y-6">
                {isLoadingCandidates ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted/50 animate-pulse rounded-xl" />)
                ) : candidatesItems.length > 0 ? (
                  candidatesItems.slice(0, 3).map((candidate: any, i: number) => (
                    <div key={candidate.id} className="flex gap-4 relative">
                      {i !== Math.min(candidatesItems.length, 3) - 1 && <div className="absolute left-5 top-10 bottom-0 w-px bg-border/50" />}
                      <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center shrink-0 z-10 shadow-sm">
                        <Users className="w-5 h-5 text-forest dark:text-neon" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-bold">{candidate.name}</span> se inscreveu para uma vaga.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date().toLocaleDateString() === new Date(candidate.createdAt || new Date()).toLocaleDateString() ? 'Hoje' : new Date(candidate.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">Nenhuma atividade recente encontrada.</p>
                )}
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

