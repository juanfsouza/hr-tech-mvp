"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { RadioGroup, RadioGroupItem } from "@/components/atoms/radio-group";
import { Label } from "@/components/atoms/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/atoms/table";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Brain, ClipboardCopy, CheckCircle2, ArrowLeft, ChevronRight, Link as LinkIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function PersonalityTestsStep() {
  const { organogram, nextStep, prevStep } = useOnboardingStore();
  const [option, setOption] = useState<"A" | "B" | null>(null);

  const copyLink = (name: string) => {
    const mockLink = `https://saas-rh.com/teste/${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(mockLink);
    toast.success(`Link copiado para ${name}!`, {
      description: "Envie este link para o colaborador realizar os testes.",
    });
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
                      {organogram.map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className="font-medium">{node.name}</TableCell>
                          <TableCell>{node.role}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 gap-2"
                              onClick={() => copyLink(node.name)}
                            >
                              <ClipboardCopy className="w-3.5 h-3.5" />
                              Copiar Link
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                className="p-12 text-center border-2 border-dashed border-muted rounded-2xl"
              >
                <p className="text-muted-foreground mb-4">
                  Interface de cadastro manual em desenvolvimento...
                </p>
                <Button variant="outline" disabled>Abrir Formulário de Resultados</Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 pt-12">
            <Button variant="outline" onClick={prevStep} className="flex-1 h-12">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Voltar
            </Button>
            <Button
              onClick={nextStep}
              className="flex-[2] h-12 text-lg font-bold bg-forest dark:bg-neon dark:text-chumbo"
              disabled={!option}
            >
              Próxima Etapa: Contexto e Ritmo
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
