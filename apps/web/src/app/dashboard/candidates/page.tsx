"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidateService, Candidate } from "@/services/candidate-service";
import { matchService } from "@/services/match-service";
import { jobService, Job } from "@/services/job-service";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/atoms/dialog";
import { MatchReportView } from "@/components/organisms/match/MatchReportView";
import { Input } from "@/components/atoms/input";
import { testService } from "@/services/test-service";
import { CandidateModal } from "@/components/organisms/candidates/CandidateModal";
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
  Briefcase,
  Plus,
  ClipboardCopy,
  Trash2,
  Edit,
  CheckCircle2
} from "lucide-react";

export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);

  // Buscar candidatos, vagas e sessões
  const { data: candidatesData, isLoading: isLoadingCandidates, refetch: refetchCandidates } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => jobService.list(),
  });

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["company-test-sessions"],
    queryFn: () => testService.listSessions(),
    refetchInterval: 10000,
  });

  // Buscar detalhes do match ao abrir o modal
  const { data: fullMatch, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["match", selectedCandidate?.matchId],
    queryFn: () => matchService.getMatch(selectedCandidate!.matchId!),
    enabled: !!selectedCandidate?.matchId,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (candidate: Candidate) => {
    try {
      const { portalUrl } = await testService.createSession({
        candidateId: candidate.id,
        expiryHours: 72
      });
      navigator.clipboard.writeText(portalUrl);
      setCopiedId(candidate.id);
      toast.success(`Link de teste real copiado para ${candidate.name}!`);
      setTimeout(() => setCopiedId(null), 2000);
      refetchSessions();
    } catch (error) {
      toast.error("Erro ao gerar link de teste.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este candidato?")) return;
    try {
      await candidateService.delete(id);
      toast.success("Candidato removido.");
      refetchCandidates();
    } catch (error) {
      toast.error("Erro ao remover candidato.");
    }
  };

  const handleEdit = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingCandidate(null);
    setModalOpen(true);
  };

  // Agrupar candidatos por vaga
  const groupedCandidates = useMemo(() => {
    const candidates = candidatesData?.items || [];
    const jobs = (jobsData as { items: Job[] })?.items || [];

    const groups: Record<string, { job: Job | null; candidates: Candidate[] }> = {
      unlinked: { job: null, candidates: [] }
    };

    jobs.forEach((job) => {
      groups[job.id] = { job, candidates: [] };
    });

    candidates.forEach((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return;

      if (candidate.jobId && groups[candidate.jobId]) {
        groups[candidate.jobId].candidates.push(candidate);
      } else {
        groups.unlinked.candidates.push(candidate);
      }
    });

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
      toast.error("Erro ao gerar PDF.");
    }
  };

  const handleShare = (candidate: Candidate | null) => {
    if (!candidate) return;
    const text = `Relatório de Match IA: ${candidate.name}\nScore: ${candidate.matchScore || 0}%\nLink: ${window.location.origin}/dashboard/candidates`;
    navigator.clipboard.writeText(text);
    toast.success("Resumo copiado!");
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
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar talentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleCreate} className="bg-forest dark:bg-neon dark:text-chumbo font-bold shadow-lg shadow-neon/20">
              <Plus className="w-4 h-4 mr-2" /> Novo Candidato
            </Button>
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
                  className="w-full mx-auto border border-gray-500/10 bg-card/40 backdrop-blur-xl flex items-center justify-between p-8 hover:bg-forest/5 rounded-xl group transition-all"
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
                  <div className="grid gap-3">
                    {data.candidates.map((candidate) => {
                      const session = sessions?.find((s: any) => s.candidateId === candidate.id);
                      const isCompleted = session?.status === 'COMPLETED' || !!candidate.matchId;

                      return (
                        <Card key={candidate.id} className="bg-card/30 dark:bg-card/10 border-border/40 hover:border-neon/30 transition-all overflow-hidden group">
                          <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

                            <div className="flex flex-wrap items-center gap-4 lg:gap-8 lg:ml-auto">
                              <div className="flex flex-col items-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status do Teste</p>
                                {isCompleted ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" /> CONCLUÍDO
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-slate-400 border-slate-200">PENDENTE</Badge>
                                )}
                              </div>

                              <div className="flex flex-col items-center min-w-[120px]">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Fit Cultural</p>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full transition-all duration-500",
                                        (candidate.matchScore || 0) > 70 ? "bg-neon shadow-[0_0_8px_rgba(196,255,87,0.5)]" : "bg-azure"
                                      )}
                                      style={{ width: `${candidate.matchScore || 0}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-bold">{candidate.matchScore || 0}%</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isCompleted && (
                                  <Button
                                    onClick={() => handleCopyLink(candidate)}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      "h-9 gap-2 transition-all",
                                      copiedId === candidate.id 
                                        ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" 
                                        : "border-azure/20 text-azure hover:bg-azure/5"
                                    )}
                                  >
                                    {copiedId === candidate.id ? (
                                      <>
                                        <CheckCircle2 className="w-4 h-4" /> Copiado
                                      </>
                                    ) : (
                                      <>
                                        <ClipboardCopy className="w-4 h-4" /> Link
                                      </>
                                    )}
                                  </Button>
                                )}
                                <Button
                                  onClick={() => candidate.matchId && setSelectedCandidate(candidate)}
                                  variant="default"
                                  disabled={!candidate.matchId}
                                  size="sm"
                                  className={cn(
                                    "h-9 gap-2 rounded-xl transition-all",
                                    candidate.matchId ? "bg-forest dark:bg-neon dark:text-chumbo border-none" : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <BrainCircuit className="w-4 h-4" /> Análise
                                </Button>
                                <div className="flex border-l border-border/50 pl-2 gap-1">
                                  <Button onClick={() => handleEdit(candidate)} variant="ghost" size="icon" className="w-8 h-8 hover:text-azure">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={() => handleDelete(candidate.id)} variant="ghost" size="icon" className="w-8 h-8 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
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

        {/* MODAL DE CADASTRO/EDIÇÃO */}
        <CandidateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          candidate={editingCandidate}
          jobs={jobsData?.items || []}
          onSuccess={refetchCandidates}
        />

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
