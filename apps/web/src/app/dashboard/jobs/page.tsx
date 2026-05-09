"use client";

import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Plus, Briefcase, Users, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { cn } from "@/lib/utils";

export default function JobsPage() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-outfit tracking-tight text-slate-900 dark:text-white">Gestão de Vagas</h1>
            <p className="text-slate-500 dark:text-muted-foreground mt-2 text-lg">Crie e gerencie os processos seletivos da sua empresa.</p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button className="bg-neon text-slate-900 dark:text-chumbo font-bold h-12 px-6 shadow-lg shadow-neon/20 hover:bg-neon/90 transition-all">
              <Plus className="mr-2 w-5 h-5" /> Nova Vaga
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-forest dark:text-neon" />
          </div>
        ) : jobs?.items && jobs.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.items.map((job: any) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="hover:border-slate-300 dark:hover:border-neon/50 transition-all cursor-pointer bg-white dark:bg-card/50 border-slate-200 dark:border-border/50 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-neon/5 group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-neon/10 group-hover:bg-forest/10 dark:group-hover:bg-neon/20 transition-colors">
                        <Briefcase className="w-6 h-6 text-slate-400 dark:text-neon group-hover:text-forest dark:group-hover:text-neon" />
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

                        {/* Subtle Pulse for Active */}
                        {job.status === "ACTIVE" && (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-green-500/10"
                            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}

                        <span className="relative z-10 font-bold">{job.status}</span>
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 font-outfit text-xl text-slate-900 dark:text-white group-hover:text-forest dark:group-hover:text-neon transition-colors">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-sm text-slate-500 dark:text-muted-foreground h-10">
                      {job.description || "Gerencie esta vaga para atrair novos talentos."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 text-sm text-slate-400 dark:text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" /> 0 Candidatos
                      </div>
                      <div className="flex items-center gap-1">
                        <BrainCircuit className="w-4 h-4" /> IA Pronta
                      </div>
                    </div>
                    <Link href={`/dashboard/jobs/${job.id}`}>
                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 dark:text-white">Ver Detalhes</Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 py-20 text-center bg-transparent border-slate-200 dark:border-border/50">
            <CardContent className="space-y-4">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-muted">
                <Briefcase className="w-10 h-10 text-slate-400 dark:text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Nenhuma vaga ativa</h3>
              <p className="text-slate-500 dark:text-muted-foreground max-w-sm mx-auto">
                Você ainda não criou nenhuma vaga. Comece criando uma agora para atrair os melhores talentos.
              </p>
              <Link href="/dashboard/jobs/new">
                <Button variant="outline" className="mt-4 border-slate-200 hover:bg-slate-50">Criar Minha Primeira Vaga</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
