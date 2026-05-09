"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { jobService } from "@/services/job-service";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Textarea } from "@/components/atoms/textarea";
import { 
  ArrowLeft, 
  Briefcase, 
  Calendar, 
  MapPin, 
  BrainCircuit,
  Loader2,
  CheckCircle2,
  Clock,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(id),
  });

  useEffect(() => {
    if (job) setEditedDescription(job.description || "");
  }, [job]);

  const updateMutation = useMutation({
    mutationFn: (newDescription: string) => jobService.update(id, { description: newDescription }),
    onSuccess: () => {
      toast.success("Vaga atualizada com sucesso!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
    onError: () => {
      toast.error("Erro ao atualizar vaga");
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => jobService.publish(id),
    onSuccess: () => {
      toast.success("Vaga publicada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["job", id] });
    },
    onError: () => {
      toast.error("Erro ao publicar vaga");
    }
  });

  const handlePublish = async () => {
    if (job.status === "ACTIVE") {
      toast.info("Esta vaga já está ativa.");
      return;
    }
    publishMutation.mutate();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-forest dark:text-neon" />
          <p className="text-muted-foreground animate-pulse">Carregando detalhes da vaga...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !job) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">Vaga não encontrada</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <Link href="/dashboard/jobs" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para Gestão
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-outfit tracking-tight">{job.title}</h1>
              <Badge className={job.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"}>
                {job.status === "ACTIVE" ? "Ativa" : "Rascunho"}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            {!isEditing ? (
              <Button variant="outline" className="flex-1 md:flex-none" onClick={() => setIsEditing(true)}>
                Editar Descrição
              </Button>
            ) : (
              <>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(false)} className="border-red-500/50 text-red-500">
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => updateMutation.mutate(editedDescription)}
                  disabled={updateMutation.isPending}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                >
                  {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  Salvar
                </Button>
              </>
            )}
            <Button 
              onClick={handlePublish}
              disabled={isEditing || publishMutation.isPending || job.status === "ACTIVE"}
              className="flex-1 md:flex-none bg-forest dark:bg-neon dark:text-chumbo font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {publishMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : (
                job.status === "ACTIVE" ? "Vaga Ativa" : "Divulgar Vaga"
              )}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2 text-forest dark:text-neon">
                  <Briefcase className="w-5 h-5" />
                  <span className="font-bold uppercase tracking-widest text-xs">Job Description</span>
                </div>
                {isEditing && <Badge variant="outline" className="animate-pulse border-forest dark:border-neon">Modo Edição</Badge>}
              </CardHeader>
              <CardContent className="p-0">
                {isEditing ? (
                  <Textarea 
                    className="min-h-[600px] border-none focus-visible:ring-0 p-6 text-lg leading-relaxed font-sans bg-transparent"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                  />
                ) : (
                  <div className="p-6 prose dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                    {job.description || "Nenhuma descrição fornecida."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Informações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Criada em</p>
                    <p className="text-muted-foreground">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Localização</p>
                    <p className="text-muted-foreground">{job.location || "Não informada"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <BrainCircuit className="w-4 h-4 text-forest dark:text-neon" />
                  <div>
                    <p className="font-medium">IA Status</p>
                    <p className="text-muted-foreground">JD Gerada & Analisada</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-forest/5 dark:bg-neon/5 border-none">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Status do Processo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Vaga Criada</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>JD Gerada com IA</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  <span>Aguardando Candidatos</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
