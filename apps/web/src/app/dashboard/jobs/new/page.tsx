import { DashboardLayout } from "@/components/templates/DashboardLayout";
import { JobCreationWizard } from "@/components/organisms/jobs/JobCreationWizard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nova Vaga | RH TECH",
  description: "Crie novas oportunidades usando inteligência artificial.",
};

export default function NewJobPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold font-outfit mb-2">Criar Nova Vaga</h1>
          <p className="text-muted-foreground text-lg">
            Escolha como deseja configurar sua nova oportunidade de recrutamento.
          </p>
        </header>

        <JobCreationWizard />
      </div>
    </DashboardLayout>
  );
}
