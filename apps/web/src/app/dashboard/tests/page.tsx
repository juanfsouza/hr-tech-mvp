"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { TestLinkModal } from "@/components/organisms/tests/TestLinkModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import {
  Search,
  BrainCircuit,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  Clock,
  UserPlus,
  Mail,
  Loader2,
  ExternalLink,
  QrCode,
  Users
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { candidateService, Candidate } from "@/services/candidate-service";
import { testService } from "@/services/test-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/atoms/dialog";

export default function TestsPortalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [generatedLink, setGeneratedLink] = useState<{
    token: string;
    portalUrl: string;
    expiresAt: string;
  } | null>(null);

  // Buscar candidatos
  const { data: candidatesData, isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidateService.list(),
  });

  const candidates = candidatesData?.items || [];

  // Filtrar candidatos
  const filteredCandidates = useMemo(() => {
    return candidates.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [candidates, searchTerm]);

  // Mutação para criar link de teste
  const createSessionMutation = useMutation({
    mutationFn: (candidateId: string) => testService.createSession({ candidateId, expiryHours: 72 }),
    onSuccess: (data) => {
      setGeneratedLink(data);
      toast.success("Link de teste gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar link de teste. Tente novamente.");
    }
  });

  const handleGenerateLink = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    createSessionMutation.mutate(candidate.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 ">
          <div>
            <h1 className="text-4xl font-bold font-outfit text-forest dark:text-neon mb-2">Portal de Testes</h1>
            <p className="text-muted-foreground text-lg">Selecione um candidato para gerar um link de avaliação psicométrica.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-10 h-12 rounded-xl"
              placeholder="Buscar candidato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-none bg-white dark:bg-card/30 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5 text-azure" /> Candidatos Disponíveis
              </CardTitle>
              <CardDescription>
                Listagem de candidatos cadastrados na sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-neon" />
                  </div>
                ) : filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-azure/10 flex items-center justify-center font-bold text-azure shrink-0">
                          {candidate.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-azure transition-colors">{candidate.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" /> {candidate.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGenerateLink(candidate)}
                        className="rounded-xl gap-2 border-azure/20 hover:bg-azure/10 text-azure"
                        disabled={createSessionMutation.isPending && selectedCandidate?.id === candidate.id}
                      >
                        {createSessionMutation.isPending && selectedCandidate?.id === candidate.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LinkIcon className="w-4 h-4" />
                        )}
                        Gerar Link
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/20" />
                    <p className="text-muted-foreground">Nenhum candidato encontrado com "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none bg-forest/5 dark:bg-neon/5 shadow-inner">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-forest dark:text-neon">
                  <BrainCircuit className="w-5 h-5" /> Sobre os Testes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-background/50 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-forest dark:text-neon" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Avaliação Completa</p>
                    <p className="text-xs text-muted-foreground">Inclui DISC, Eneagrama e 16 Personalidades (Big Five).</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-background/50 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-forest dark:text-neon" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Validade do Link</p>
                    <p className="text-xs text-muted-foreground">Cada link gerado expira automaticamente em 72 horas para segurança.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-background/50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-forest dark:text-neon" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Envio Automático</p>
                    <p className="text-xs text-muted-foreground">O candidato recebe o link por e-mail assim que você o gera aqui.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-azure/5 shadow-inner">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-azure">
                  <UserPlus className="w-5 h-5" /> Novo Candidato?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Se o candidato ainda não estiver na lista, cadastre-o primeiro na aba de candidatos.</p>
                <Link href="/dashboard/candidates">
                  <Button className="w-full bg-azure hover:bg-azure/90 text-white rounded-xl font-bold">
                    Ir para Gestão de Candidatos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          <TestLinkModal
            isOpen={!!generatedLink}
            onClose={() => setGeneratedLink(null)}
            candidateName={selectedCandidate?.name || ""}
            portalUrl={generatedLink?.portalUrl || ""}
            expiresAt={generatedLink?.expiresAt || ""}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
