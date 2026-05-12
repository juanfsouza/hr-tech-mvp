"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { useOnboardingStore, OrganogramNode } from "@/store/onboarding-store";
import { UserPlus, Trash2, ChevronRight, ArrowLeft, Users2, Network, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { companyService } from "@/services/company-service";
import { authService } from "@/services/auth-service";
import { toast } from "sonner";

export function OrganogramStep() {
  const { organogram, addOrganogramNode, removeOrganogramNode, personalityResults, nextStep, prevStep } = useOnboardingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newNode, setNewNode] = useState<Omit<OrganogramNode, "id">>({
    name: "",
    role: "",
    department: "",
    parentId: null,
  });

  const handleAddNode = () => {
    if (newNode.name && newNode.role) {
      addOrganogramNode({ ...newNode, id: uuidv4() });
      setNewNode({ name: "", role: "", department: "", parentId: null });
      setIsAdding(false);
    }
  };

  const handleNext = async () => {
    if (organogram.length === 0) return;
    
    setIsSyncing(true);
    try {
      const user = authService.getUser();
      if (!user?.companyId) {
        toast.error("Empresa não identificada.");
        return;
      }

      await companyService.syncOrganogram(user.companyId, organogram, personalityResults);
      nextStep();
    } catch (error) {
      console.error("Erro ao sincronizar organograma:", error);
      toast.error("Erro ao salvar estrutura organizacional.");
    } finally {
      setIsSyncing(false);
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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-outfit text-forest dark:text-neon flex items-center gap-2">
                <Network className="w-8 h-8" />
                Estrutura Organizacional
              </CardTitle>
              <CardDescription className="text-lg">
                Monte a hierarquia da sua empresa. Isso ajudará a IA a entender o contexto de liderança.
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsAdding(!isAdding)}
              variant={isAdding ? "ghost" : "default"}
              className={isAdding ? "" : "bg-forest dark:bg-neon dark:text-chumbo"}
            >
              {isAdding ? "Cancelar" : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Novo Colaborador
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <AnimatePresence>
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="p-6 rounded-2xl border border-forest/20 dark:border-neon/20 bg-forest/5 dark:bg-neon/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input
                      value={newNode.name}
                      onChange={(e) => setNewNode({ ...newNode, name: e.target.value })}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      value={newNode.role}
                      onChange={(e) => setNewNode({ ...newNode, role: e.target.value })}
                      placeholder="Ex: Gerente de Vendas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Input
                      value={newNode.department}
                      onChange={(e) => setNewNode({ ...newNode, department: e.target.value })}
                      placeholder="Ex: Comercial"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Líder Direto</Label>
                    <Select
                      onValueChange={(val: string | null) => setNewNode({ ...newNode, parentId: val === "none" ? null : val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o líder..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguém (CEO/Topo)</SelectItem>
                        {organogram.map((node) => (
                          <SelectItem key={node.id} value={node.id}>
                            {node.name} ({node.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <Button onClick={handleAddNode} className="w-full bg-forest dark:bg-neon dark:text-chumbo">
                      Adicionar ao Organograma
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {organogram.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-muted rounded-2xl">
                <Users2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum colaborador adicionado ainda.</p>
                <Button variant="link" onClick={() => setIsAdding(true)} className="text-forest dark:text-neon">
                  Adicionar o primeiro (ex: CEO)
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {organogram.map((node) => {
                  const parent = organogram.find((p) => p.id === node.parentId);
                  return (
                    <motion.div
                      layout
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between hover:border-forest/30 dark:hover:border-neon/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">
                          {node.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold leading-none mb-1">{node.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {node.role} {node.department ? `• ${node.department}` : ""}
                          </p>
                          {parent && (
                            <p className="text-xs text-forest dark:text-azure mt-1 flex items-center gap-1">
                              <ChevronRight className="w-3 h-3" /> Reporta a: {parent.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                        onClick={() => removeOrganogramNode(node.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-8">
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="flex-[2] h-12 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo"
              disabled={organogram.length === 0 || isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  Próxima Etapa: Testes de Personalidade
                  <ChevronRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
