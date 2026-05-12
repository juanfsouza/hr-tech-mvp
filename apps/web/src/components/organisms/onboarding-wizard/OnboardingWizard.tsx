"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { CompanyDataStep } from "./CompanyDataStep";
import { OrganogramStep } from "./OrganogramStep";
import { PersonalityTestsStep } from "./PersonalityTestsStep";
import { CompanyContextStep } from "./CompanyContextStep";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingWizard() {
  const { step, setStep, companyData } = useOnboardingStore();
  const hasCompany = !!companyData.id;

  const renderStep = () => {
    switch (step) {
      case 1:
        return <CompanyDataStep key="step1" />;
      case 2:
        return <OrganogramStep key="step2" />;
      case 3:
        return <PersonalityTestsStep key="step3" />;
      case 4:
        return <CompanyContextStep key="step4" />;
      default:
        return null;
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-bold text-azure uppercase tracking-[0.2em] bg-azure/20 inline-block px-3 py-1 rounded-full border border-azure/20">
                Passo {step} de 4
              </p>
              {hasCompany && step < 4 && (
                <button
                  onClick={() => setStep(4)}
                  className="text-xs font-bold text-neon uppercase tracking-wider hover:underline"
                >
                  ⚡ Pular para Contexto
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold font-outfit text-slate-900 dark:text-white mt-2">
              {step === 1 && "Dados da Empresa"}
              {step === 2 && "Estrutura Organizacional"}
              {step === 3 && "Configuração de Testes"}
              {step === 4 && "Cultura Organizacional"}
            </h1>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-slate-400 dark:text-muted-foreground">
              Seu progresso: <span className="text-slate-900 dark:text-neon font-bold">{Math.round(progress)}%</span>
            </p>
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
          <motion.div
            className="h-full bg-neon shadow-[0_0_15px_rgba(196,255,87,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
