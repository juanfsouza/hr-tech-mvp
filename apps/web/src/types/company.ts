export interface Company {
  id: string;
  razaoSocial: string;
  cnpj: string;
  websiteUrl?: string;
  onboardingStatus?: string;
  companyContext?: string;
  perfilRitmo?: string;
  valores?: string[];
  isComplete?: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInput {
  razaoSocial: string;
  cnpj: string;
  websiteUrl?: string;
  userId: string;
}

export interface UpdateOnboardingInput {
  onboardingStatus?: string;
  companyContext?: string;
  perfilRitmo?: string;
  valores?: string[];
  isComplete?: boolean;
}

export interface OrganogramNode {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
}
