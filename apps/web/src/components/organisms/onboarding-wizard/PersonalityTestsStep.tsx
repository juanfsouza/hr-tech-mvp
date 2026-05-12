"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { Label } from "@/components/atoms/label";
import { Badge } from "@/components/atoms/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/atoms/table";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Brain, ClipboardCopy, CheckCircle2, ArrowLeft, ChevronRight, Link as LinkIcon, ExternalLink, UserCircle2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { testService, TestSession } from "@/services/test-service";
import { companyService } from "@/services/company-service";
import { authService } from "@/services/auth-service";
import { useQuery } from "@tanstack/react-query";

export function PersonalityTestsStep() {
  const { companyData, organogram, personalityResults, updatePersonalityResult, nextStep, prevStep } = useOnboardingStore();
  const [option, setOption] = useState<"A" | "B" | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar sessões reais para ver quem já concluiu
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["company-test-sessions"],
    queryFn: () => testService.listSessions(),
    enabled: !!companyData.id,
    refetchInterval: 10000,
  });

  const handleSaveAndExit = async () => {
    if (!companyData.id) {
      toast.error("ID da empresa não encontrado.");
      return;
    }

    setIsSaving(true);
    try {
      await companyService.syncOrganogram(
        companyData.id,
        organogram,
        personalityResults
      );
      toast.success("Estrutura salva com sucesso!");
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao salvar estrutura.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = async (name: string, id: string) => {
    try {
      const { portalUrl } = await testService.createSession({
        collaboratorId: id,
        expiryHours: 72
      });
      navigator.clipboard.writeText(portalUrl);
      toast.success(`Link real criado e copiado para ${name}!`);
      refetchSessions();
    } catch (error) {
      toast.error("Erro ao criar link de teste real.");
    }
  };

  const handleSync = async () => {
    setIsSaving(true);
    try {
      const user = authService.getUser();
      if (!user?.companyId) return;
      await companyService.syncOrganogram(user.companyId, organogram, personalityResults);
      toast.success("Estrutura sincronizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao sincronizar estrutura.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <Card className="border-none shadow-none bg-transparent p-5">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl font-outfit text-forest dark:text-neon flex items-center gap-2">
            <Brain className="w-8 h-8" />
            Testes de Personalidade
          </CardTitle>
          <CardDescription className="text-lg">
            Como você deseja inserir os perfis psicométricos do time atual?
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          <RadioGroup
            onValueChange={(val) => setOption(val as "A" | "B")}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
          >
            <div>
              <RadioGroupItem
                value="A"
                id="option-a"
                className="peer sr-only"
              />
              <Label
                htmlFor="option-a"
                className="flex flex-col h-full items-center justify-between rounded-2xl border-2 border-muted bg-popover p-6 dark:hover:bg-neon hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-forest dark:peer-data-[state=checked]:border-neon transition-all cursor-pointer"
              >
                <div className="text-center">
                  <p className="text-lg font-bold mb-1">Já tenho os resultados</p>
                  <p className="text-sm text-muted-foreground">
                    Vou inserir os resultados manualmente para cada colaborador.
                  </p>
                </div>
                {option === "A" && <CheckCircle2 className="mt-4 text-forest dark:text-neon" />}
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="B"
                id="option-b"
                className="peer sr-only"
              />
              <Label
                htmlFor="option-b"
                className="flex flex-col h-full dark:hover:bg-neon items-center justify-between rounded-2xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-forest dark:peer-data-[state=checked]:border-neon transition-all cursor-pointer"
              >
                <div className="text-center">
                  <p className="text-lg font-bold mb-1">Ainda não tenho</p>
                  <p className="text-sm text-muted-foreground">
                    Quero enviar links para que eles preencham agora.
                  </p>
                </div>
                {option === "B" && <CheckCircle2 className="mt-4 text-forest dark:text-neon" />}
              </Label>
            </div>
          </RadioGroup>

          <AnimatePresence mode="wait">
            {option === "B" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-outfit text-xl font-bold flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-azure" />
                    Links para Colaboradores
                  </h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSync}
                    disabled={isSaving}
                    className="gap-2 border-azure/30 text-azure hover:bg-azure/10"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sincronizar Estrutura
                  </Button>
                </div>

                <div className="rounded-2xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organogram.map((node) => {
                        const session = sessions?.find((s: TestSession) => s.candidateId === node.id || s.collaboratorId === node.id);
                        const isCompleted = session?.isCompleted;

                        return (
                          <TableRow key={node.id}>
                            <TableCell className="font-medium">{node.name}</TableCell>
                            <TableCell>{node.role}</TableCell>
                            <TableCell className="text-right">
                              {isCompleted ? (
                                <Badge className="bg-emerald-500 text-white border-none">CONCLUÍDO</Badge>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-8 gap-2"
                                  onClick={() => copyLink(node.name, node.id)}
                                >
                                  <ClipboardCopy className="w-3.5 h-3.5" />
                                  {session ? "Recopiar Link" : "Copiar Link"}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}

            {option === "A" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-[32px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <div className="space-y-2">
                    <Label>Colaborador</Label>
                    <Select value={selectedNode || ""} onValueChange={setSelectedNode}>
                      <SelectTrigger className="bg-white truncate dark:bg-background border-none h-11 rounded-xl shadow-sm">
                        <SelectValue placeholder="Selecione...">
                          {selectedNode ? organogram.find(n => n.id === selectedNode)?.name : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {organogram.map(node => (
                          <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedNode && (
                    <>
                      <div className="space-y-2">
                        <Label>Perfil DISC Principal</Label>
                        <Select
                          value={personalityResults[selectedNode]?.disc || ""}
                          onValueChange={(val) => updatePersonalityResult(selectedNode, { disc: val! })}
                        >
                          <SelectTrigger className="bg-white dark:bg-background border-none h-11 rounded-xl shadow-sm">
                            <SelectValue placeholder="Ex: D, I, S, C..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="D">D (Dominante)</SelectItem>
                            <SelectItem value="I">I (Influente)</SelectItem>
                            <SelectItem value="S">S (Estável)</SelectItem>
                            <SelectItem value="C">C (Analítico)</SelectItem>
                            <SelectItem value="DI">D-I (Executor/Comunicador)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo Eneagrama</Label>
                        <Select
                          value={personalityResults[selectedNode]?.enneagram || ""}
                          onValueChange={(val) => updatePersonalityResult(selectedNode, { enneagram: val! })}
                        >
                          <SelectTrigger className="bg-white dark:bg-background border-none h-11 rounded-xl shadow-sm">
                            <SelectValue placeholder="Tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                              <SelectItem key={n} value={n.toString()}>Tipo {n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-2xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Colaborador</TableHead>
                        <TableHead>DISC</TableHead>
                        <TableHead>Eneagrama</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organogram.map((node) => {
                        const res = personalityResults[node.id];
                        return (
                          <TableRow key={node.id}>
                            <TableCell className="font-medium">{node.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-azure/20 text-azure">{res?.disc || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-forest/20 text-forest dark:text-neon">{res?.enneagram ? `Tipo ${res.enneagram}` : "-"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {res?.disc && res?.enneagram ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                              ) : (
                                <span className="text-[10px] uppercase font-black text-slate-400">Pendente</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 pt-12">
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={handleSaveAndExit}
              className="flex-[2] h-12 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo shadow-xl shadow-neon/20"
              disabled={!option || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Salvando Estrutura...
                </>
              ) : (
                <>
                  Salvar e Concluir Etapa
                  <CheckCircle2 className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
