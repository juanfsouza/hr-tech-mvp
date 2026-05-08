"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { MatchReportView } from "@/components/organisms/match/MatchReportView";
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  BrainCircuit, 
  UserCircle2,
  FileText,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/atoms/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/atoms/dialog";

import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateService } from "@/services/candidate-service";
import { matchService } from "@/services/match-service";

export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Buscar candidatos reais do banco
  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  // Buscar detalhes do match ao abrir o modal
  const { data: fullMatch, isLoading: isLoadingMatch } = useQuery({
    queryKey: ["match", selectedCandidate?.matchId],
    queryFn: () => matchService.getMatch(selectedCandidate.matchId),
    enabled: !!selectedCandidate?.matchId,
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold font-outfit mb-2">Candidatos</h1>
            <p className="text-muted-foreground text-lg">Gerencie os talentos e visualize as análises de match.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar candidato..." />
            </div>
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filtros</Button>
          </div>
        </header>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            candidates?.map((candidate) => (
              <Card key={candidate.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-all group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-azure/10 flex items-center justify-center">
                      <UserCircle2 className="w-7 h-7 text-azure" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none mb-1">{candidate.name}</h4>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status</p>
                      <Badge variant="secondary" className="bg-muted/50">{candidate.status}</Badge>
                    </div>

                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Match IA</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full", (candidate.matchScore || 0) > 80 ? "bg-neon" : "bg-azure")} 
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
                      className={cn(
                        "rounded-xl gap-2",
                        candidate.matchId ? "bg-forest dark:bg-neon dark:text-chumbo" : ""
                      )}
                    >
                      <BrainCircuit className="w-4 h-4" />
                      Ver Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* DIALOG DO RELATÓRIO */}
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] md:h-auto max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50 p-0 md:p-6">
            <div className="p-6 md:p-0">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <Badge className="bg-neon/10 text-neon border-neon/20">Análise Claude 3.5 Sonnet</Badge>
                  <span className="text-sm text-muted-foreground italic">Gerado em {selectedCandidate && new Date().toLocaleDateString()}</span>
                </div>
                <DialogTitle className="text-2xl md:text-3xl font-outfit flex flex-col md:flex-row md:items-center justify-between gap-4">
                  Relatório de Match: {selectedCandidate?.name}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none"><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                    <Button variant="outline" size="sm" className="flex-1 md:flex-none"><ExternalLink className="w-4 h-4 mr-2" /> Partilhar</Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {isLoadingMatch ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin mx-auto text-forest dark:text-neon" />
                  <p className="text-muted-foreground">Analisando dados com IA...</p>
                </div>
              ) : fullMatch && (
                <div className="py-6">
                  <MatchReportView analysis={fullMatch} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
