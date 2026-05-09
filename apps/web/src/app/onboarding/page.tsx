import { OnboardingWizard } from "@/components/organisms/onboarding-wizard/OnboardingWizard";
import { DashboardLayout } from "@/components/templates/DashboardLayout";

export default function OnboardingPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <OnboardingWizard />
      </div>
    </DashboardLayout>
  );
}
