"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { CompanyDataStep } from "./CompanyDataStep";
import { OrganogramStep } from "./OrganogramStep";
import { PersonalityTestsStep } from "./PersonalityTestsStep";
import { CompanyContextStep } from "./CompanyContextStep";
import { motion, AnimatePresence } from "framer-motion";

export function OnboardingWizard() {
  const { step } = useOnboardingStore();

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
    <div className="w-full max-w-3xl mx-auto py-12 px-6">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-sm font-semibold text-forest dark:text-neon uppercase tracking-wider mb-1">
              Onboarding Empresa
            </p>
            <h1 className="text-2xl font-bold font-outfit">
              {step === 1 && "Dados Cadastrais"}
              {step === 2 && "Estrutura do Time"}
              {step === 3 && "Testes de Personalidade"}
              {step === 4 && "Cultura e Ritmo"}
            </h1>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Passo <span className="text-foreground font-bold">{step}</span> de 4
          </p>
        </div>
        <div className="h-2 w-full bg-forest/10 dark:bg-neon/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-forest dark:bg-neon"
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
