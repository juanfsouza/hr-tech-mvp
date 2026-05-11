export interface UpdateOnboardingInput {
  companyId: string;
  step?: number;
  companyContext?: string;
  perfilRitmo?: string;
  valores?: string[];
  isComplete?: boolean;
}
