"use client";

import { useEffect, useState } from "react";
import { OnboardingWizard } from "@/components/organisms/onboarding-wizard/OnboardingWizard";
import { CompanyOverview } from "@/components/organisms/onboarding-wizard/CompanyOverview";
import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { useOnboardingStore } from "@/store/onboarding-store";
import { authService } from "@/services/auth-service";
import { companyService } from "@/services/company-service";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/button";

export default function OnboardingPage() {
  const { updateCompanyData, setStep } = useOnboardingStore();
  const [isEditing, setIsEditing] = useState(false);
  const user = authService.getUser();

  const { data: company, isLoading } = useQuery({
    queryKey: ["company", user?.companyId],
    queryFn: () => companyService.getById(user.companyId!),
    enabled: !!user?.companyId,
  });

  useEffect(() => {
    if (company) {
      updateCompanyData({
        id: company.id,
        name: company.razaoSocial,
        cnpj: company.cnpj,
      });
    }
  }, [company, updateCompanyData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-neon" />
        </div>
      </DashboardLayout>
    );
  }

  // Se já tem empresa e não está em modo de edição, mostra o Overview
  const showOverview = !!company && !isEditing;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {showOverview ? (
          <CompanyOverview
            company={company}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <div className="space-y-6">
            {isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="mb-4 text-slate-500 dark:hover:bg-neon hover:text-black dark:hover:text-black"
              >
                ← Voltar para Visão Geral
              </Button>
            )}
            <OnboardingWizard />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
