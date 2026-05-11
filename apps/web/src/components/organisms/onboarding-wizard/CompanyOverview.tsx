"use client";

import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Globe,
  CheckCircle2,
  ArrowRight,
  Edit3,
  Users2,
  Briefcase,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";

import { useOnboardingStore } from "@/store/onboarding-store";
import { useRouter } from "next/navigation";

interface CompanyOverviewProps {
  company: any;
  onEdit: () => void;
}

export function CompanyOverview({ company, onEdit }: CompanyOverviewProps) {
  const { setStep } = useOnboardingStore();
  const router = useRouter();

  const handleViewOrganogram = () => {
    setStep(2);
    onEdit();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-outfit font-black text-slate-900 dark:text-white tracking-tight">
            {company.razaoSocial}
          </h1>
          <p className="text-muted-foreground text-lg">Visão geral das configurações e estrutura organizacional.</p>
          <div className="flex items-center gap-3">
            <Badge className="bg-neon/20 text-forest dark:text-neon border-none px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Empresa Cadastrada
            </Badge>
            <div className="flex items-center gap-1 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold">Onboarding Concluído</span>
            </div>
          </div>
        </div>
        <Button
          onClick={onEdit}
          variant="outline"
          className="rounded-2xl h-12 px-6 gap-2 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group"
        >
          <Edit3 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          Editar Informações
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Principal: Dados */}
        <Card className="md:col-span-2 border-none bg-white dark:bg-card/40 shadow-2xl overflow-hidden rounded-md">
          <CardHeader className="p-4 pb-4 border-b border-slate-100 dark:border-white/5">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 rounded-xl bg-azure/10">
                <Building2 className="w-5 h-5 text-azure" />
              </div>
              Dados Corporativos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CNPJ</span>
                <p className="text-lg font-bold font-mono text-slate-700 dark:text-slate-200">{company.cnpj}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website</span>
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-lg font-bold text-azure hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  {company.websiteUrl || "Não informado"}
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status da Conta</span>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 mt-2 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400 leading-none mb-1">Verificada</p>
                    <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 uppercase font-black">Pronta para uso</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Lateral: Estatísticas Rápidas */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg drop-shadow-xl dark:bg-neon/5 shadow-inner rounded-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon" /> Estrutura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-background/40 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Users2 className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Departamentos</span>
                </div>
                <span className="font-black text-lg">04</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-background/40 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">Cargos Mapeados</span>
                </div>
                <span className="font-black text-lg">12</span>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleViewOrganogram}
            variant="ghost"
            className="w-full h-14 rounded-[24px] border-2 border-dashed border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 gap-3"
          >
            Ver Organograma Completo
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => router.push("/dashboard")}
            className="w-full h-14 rounded-[24px] bg-forest dark:bg-neon text-white dark:text-chumbo font-black text-lg shadow-xl shadow-neon/20 gap-3 hover:scale-[1.02] transition-all"
          >
            <Zap className="w-5 h-5 fill-current" />
            Começar a Contratar
          </Button>
        </div>
      </div>
    </div>
  );
}
