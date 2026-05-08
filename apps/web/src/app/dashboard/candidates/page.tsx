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

// MOCK DATA PARA DEMONSTRAÇÃO DO RELATÓRIO
const MOCK_CANDIDATES = [
  { 
    id: "1", 
    name: "Ana Oliveira", 
    role: "UX Designer", 
    matchScore: 94, 
    status: "Analista IA",
    analysis: {
      id: "m1",
      candidateId: "1",
      jobId: "j1",
      overallScore: 94,
      recommendation: "HIRE" as const,
      summary: "Ana demonstra uma altíssima compatibilidade com a cultura de inovação da empresa. Seu perfil DISC é predominantemente Influente, o que casa perfeitamente com a necessidade de colaboração do time de design.",
      details: {
        cultureMatch: 98,
        technicalSkills: 85,
        leadershipPotential: 70,
        softSkills: ["Empatia", "Comunicação Assertiva", "Criatividade"],
        risks: ["Pode ter dificuldade com processos muito burocráticos"]
      },
      createdAt: new Date().toISOString()
    }
  },
  { id: "2", name: "Ricardo Santos", role: "Frontend Developer", matchScore: 72, status: "Aguardando Testes" },
  { id: "3", name: "Mariana Costa", role: "Product Manager", matchScore: 85, status: "Analista IA" },
];

export default function CandidatesPage() {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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
          {MOCK_CANDIDATES.map((candidate) => (
            <Card key={candidate.id} className="border-border/50 bg-card/30 hover:bg-card/50 transition-all group">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-azure/10 flex items-center justify-center">
                    <UserCircle2 className="w-7 h-7 text-azure" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-none mb-1">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">{candidate.role}</p>
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
                          className={cn("h-full", candidate.matchScore > 80 ? "bg-neon" : "bg-azure")} 
                          style={{ width: `${candidate.matchScore}%` }} 
                        />
                      </div>
                      <span className="text-sm font-bold">{candidate.matchScore}%</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => candidate.analysis && setSelectedCandidate(candidate)}
                    variant={candidate.analysis ? "default" : "outline"}
                    disabled={!candidate.analysis}
                    className={cn(
                      "rounded-xl gap-2",
                      candidate.analysis ? "bg-forest dark:bg-neon dark:text-chumbo" : ""
                    )}
                  >
                    <BrainCircuit className="w-4 h-4" />
                    Ver Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* DIALOG DO RELATÓRIO */}
        <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
          <DialogContent className="max-w-5xl h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-neon/10 text-neon border-neon/20">Análise Claude 3.5 Sonnet</Badge>
                <span className="text-sm text-muted-foreground italic">Gerado em {selectedCandidate && new Date(selectedCandidate.analysis.createdAt).toLocaleDateString()}</span>
              </div>
              <DialogTitle className="text-3xl font-outfit flex items-center justify-between">
                Relatório de Match: {selectedCandidate?.name}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                  <Button variant="outline" size="sm"><ExternalLink className="w-4 h-4 mr-2" /> Compartilhar</Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {selectedCandidate?.analysis && (
              <div className="py-6">
                <MatchReportView analysis={selectedCandidate.analysis} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
