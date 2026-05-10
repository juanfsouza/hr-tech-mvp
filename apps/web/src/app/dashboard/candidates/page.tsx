"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { MatchReportView } from "@/components/organisms/match/MatchReportView";
import {
  Users,
  Search,
  Filter,
  BrainCircuit,
  UserCircle2,
  FileText,
  ExternalLink,
  Loader2,
  ChevronDown,
  ChevronUp,
  Mail,
  Briefcase
} from "lucide-react";
import { Input } from "@/components/atoms/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/dialog";

import { useQuery } from "@tanstack/react-query";
import { candidateService, Candidate } from "@/services/candidate-service";
import { matchService, MatchAnalysis } from "@/services/match-service";
import { jobService, Job } from "@/services/job-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  // Buscar candidatos e vagas
  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(),
  });

  // Buscar detalhes do match ao abrir o modal
  const { data: fullMatch, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["match", selectedCandidate?.matchId],
    queryFn: () => matchService.getMatch(selectedCandidate!.matchId!),
    enabled: !!selectedCandidate?.matchId,
  });

  // Agrupar candidatos por vaga
  const groupedCandidates = useMemo(() => {
    const candidates = candidatesData?.items || [];
    const jobs = (jobsData as { items: Job[] })?.items || [];

    const groups: Record<string, { job: Job | null; candidates: Candidate[] }> = {
      unlinked: { job: null, candidates: [] }
    };

    // Indexar vagas por ID para busca rápida
    jobs.forEach((job) => {
      groups[job.id] = { job, candidates: [] };
    });

    candidates.forEach((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return;

      // Se o candidato tem jobId e esse job existe na lista da empresa
      if (candidate.jobId && groups[candidate.jobId]) {
        groups[candidate.jobId].candidates.push(candidate);
      } else {
        groups.unlinked.candidates.push(candidate);
      }
    });

    // Filtra apenas grupos que tenham candidatos (para não poluir a tela)
    return Object.entries(groups).filter(([_, data]) => data.candidates.length > 0);
  }, [candidatesData, jobsData, searchTerm]);

  const toggleJob = (jobId: string): void => {
    setExpandedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
  };

  const handleExportPDF = async () => {
    if (!selectedCandidate?.matchId) {
      toast.error("Nenhuma análise de match disponível para exportar.");
      return;
    }

    try {
      toast.loading("Gerando PDF...", { id: "pdf-gen" });
      await matchService.downloadPdf(selectedCandidate.matchId, selectedCandidate.name);
      toast.success("Download concluído!", { id: "pdf-gen" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar PDF. Tente novamente.", { id: "pdf-gen" });
    }
  };

  const handleShare = (candidate: Candidate | null) => {
    if (!candidate) return;
    const text = `Relatório de Match IA: ${candidate.name}\nScore de Match: ${candidate.matchScore || 0}%\nStatus: ${candidate.status}\nLink: ${window.location.origin}/dashboard/candidates`;

    navigator.clipboard.writeText(text);
    toast.success("Resumo copiado! Agora você pode colar no WhatsApp ou E-mail.");
  };

  const isLoading = isLoadingCandidates || isLoadingJobs;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Talentos</h1>
            <p className="text-muted-foreground text-lg">Gerencie os candidatos e visualize as análises de match por vaga.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
          </div>
        </header>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : groupedCandidates.length > 0 ? (
            groupedCandidates.map(([jobId, data]) => (
              <div key={jobId} className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full drop-shadow-lg shadow-lg flex items-center justify-between p-8 hover:bg-forest/10 rounded-xl group transition-all"
                  onClick={() => toggleJob(jobId)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      data.job ? "bg-azure/10 text-azure" : "bg-slate-200 text-slate-500"
                    )}>
                      {data.job ? <Briefcase className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-lg leading-tight">
                        {data.job?.title || "Candidatos sem vaga vinculada"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {data.candidates.length} {data.candidates.length === 1 ? "candidato" : "candidatos"}
                      </p>
                    </div>
                  </div>
                  {expandedJobs[jobId] ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </Button>

                {!expandedJobs[jobId] && (
                  <div className="grid gap-3 pl-2 md:pl-4">
                    {data.candidates.map((candidate) => (
                      <Card key={candidate.id} className="drop-shadow-lg shadow-lg border-border/50 bg-card/30 hover:bg-card/50 transition-all group overflow-hidden">
                        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-azure/10 flex items-center justify-center shrink-0">
                              <UserCircle2 className="w-7 h-7 text-azure" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-lg leading-none mb-1 truncate">{candidate.name}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3.5 h-3.5" />
                                <span className="truncate">{candidate.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 md:gap-8 ml-auto md:ml-0">
                            <div className="text-center hidden sm:block">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status</p>
                              <Badge variant="secondary" className="bg-muted/50 text-[10px] uppercase">{candidate.status}</Badge>
                            </div>

                            <div className="text-center min-w-[100px]">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Match IA</p>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-neon shadow-[0_0_8px_rgba(196,255,87,0.5)]"
                                    style={{ width: `${candidate.matchScore || 0}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold">{candidate.matchScore || 0}%</span>
                              </div>
                            </div>

                            <Button
                              onClick={() => candidate.matchId && setSelectedCandidate(candidate)}
                              variant={candidate.matchId ? "default" : "outline"}
                              disabled={!candidate.matchId}
                              size="sm"
                              className={cn(
                                "rounded-xl gap-2 h-9 px-4 transition-all",
                                candidate.matchId ? "bg-neon hover:bg-neon/80 text-chumbo border-none shadow-lg shadow-neon/10" : ""
                              )}
                            >
                              <BrainCircuit className="w-4 h-4" />
                              <span className="hidden xs:inline">Ver Relatório</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Card className="p-12 text-center border-dashed bg-transparent">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold mb-1">Nenhum candidato encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar sua busca ou filtros para encontrar o que procura.</p>
            </Card>
          )}
        </div>

        {/* DIALOG DO RELATÓRIO */}
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] md:h-auto max-h-[95vh] overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 p-0 flex flex-col">
            <DialogHeader className="p-6 pb-2 border-b border-border/50 shrink-0">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-neon/10 text-neon border-neon/20">Análise Claude 3.5 Sonnet</Badge>
                <span className="text-sm text-muted-foreground italic">
                  Gerado em {selectedCandidate && new Date().toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DialogTitle className="text-2xl md:text-3xl font-outfit">
                  Relatório de Match: <span className="text-azure">{selectedCandidate?.name}</span>
                </DialogTitle>
                <div className="flex gap-2">
                  <Button onClick={handleExportPDF} variant="outline" size="sm" className="flex-1 md:flex-none gap-2 rounded-xl border-azure/20 text-azure hover:bg-azure/10">
                    <FileText className="w-4 h-4" /> Exportar PDF
                  </Button>
                  <Button onClick={() => handleShare(selectedCandidate)} variant="outline" size="sm" className="flex-1 md:flex-none gap-2 rounded-xl border-neon/20 text-azure hover:text-chumbo bg-azure/5 border-azure/20 dark:text-neon hover:bg-neon/5">
                    <ExternalLink className="w-4 h-4" /> Compartilhar
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
              {isLoadingMatch ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-neon" />
                  <p className="text-muted-foreground animate-pulse">Consultando oráculo de IA...</p>
                </div>
              ) : fullMatch ? (
                <MatchReportView analysis={fullMatch} />
              ) : (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground italic">Não foi possível carregar os detalhes do relatório.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
