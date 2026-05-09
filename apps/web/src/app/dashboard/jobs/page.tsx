"use client";

import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Plus, Briefcase, Users, BrainCircuit, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/templates/DashboardLayout";

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
          <h1 className="text-4xl font-bold font-outfit tracking-tight">Gestão de Vagas</h1>
          <p className="text-muted-foreground mt-2">Crie e gerencie os processos seletivos da sua empresa.</p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button className="bg-forest dark:bg-neon dark:text-chumbo font-bold h-12">
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
              <Card className="hover:border-forest/50 dark:hover:border-neon/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-2 rounded-lg bg-forest/10 dark:bg-neon/10">
                      <Briefcase className="w-6 h-6 text-forest dark:text-neon" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                      job.status === "ACTIVE" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                    )}>
                      {job.status}
                    </span>
                  </div>
                  <CardTitle className="mt-4 font-outfit text-xl">{job.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> 0 Candidatos
                    </div>
                    <div className="flex items-center gap-1">
                      <BrainCircuit className="w-4 h-4" /> IA Pronta
                    </div>
                  </div>
                  <Link href={`/dashboard/jobs/${job.id}`}>
                    <Button variant="outline" className="w-full">Ver Detalhes</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 py-20 text-center bg-transparent">
          <CardContent className="space-y-4">
            <div className="inline-flex p-4 rounded-full bg-muted">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">Nenhuma vaga ativa</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Você ainda não criou nenhuma vaga. Comece criando uma agora para atrair os melhores talentos.
            </p>
            <Link href="/dashboard/jobs/new">
              <Button variant="outline" className="mt-4">Criar Minha Primeira Vaga</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}

// Helper local para evitar erro de import
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
