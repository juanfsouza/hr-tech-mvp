"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Candidate, CreateCandidateInput, candidateService } from "@/services/candidate-service";
import { Job } from "@/services/job-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CandidateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: Candidate | null;
  jobs: Job[];
  onSuccess: () => void;
}

export function CandidateModal({ open, onOpenChange, candidate, jobs, onSuccess }: CandidateModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCandidateInput>({
    name: "",
    email: "",
    jobId: "",
  });

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name,
        email: candidate.email,
        jobId: candidate.jobId || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        jobId: "",
      });
    }
  }, [candidate, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (candidate) {
        await candidateService.update(candidate.id, formData);
        toast.success("Candidato atualizado com sucesso!");
      } else {
        await candidateService.create(formData);
        toast.success("Candidato cadastrado com sucesso!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar candidato. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <DialogHeader className="p-0">
            <DialogTitle className="text-3xl font-outfit font-bold tracking-tight">
              {candidate ? "Editar Talento" : "Cadastrar Novo Talento"}
            </DialogTitle>
            <p className="text-muted-foreground text-sm">
              Preencha os dados básicos para iniciar o processo de avaliação psicométrica.
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Nome Completo</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="h-12 bg-background/50 border-border/50 focus:border-neon/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">E-mail Corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@exemplo.com"
                  className="h-12 bg-background/50 border-border/50 focus:border-neon/50 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job" className="text-xs font-black uppercase tracking-widest text-slate-400">Vaga / Posição Estratégica</Label>
              <Select
                value={formData.jobId}
                onValueChange={(value) => setFormData({ ...formData, jobId: value })}
              >
                <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl">
                  <SelectValue placeholder="Selecione uma vaga para este talento" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-6 gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-12 px-6 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 rounded-xl bg-forest dark:bg-neon dark:text-chumbo font-bold shadow-lg shadow-neon/10 hover:shadow-neon/20 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : candidate ? "Atualizar Dados" : "Salvar e Continuar"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
