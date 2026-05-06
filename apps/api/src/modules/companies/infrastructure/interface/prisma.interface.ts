
export interface PrismaCompanyRecord {
    id: string;
    razaoSocial: string;
    cnpj: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    companyProfile: string | null;
    companyContext: string | null;
    cultureValues: string[];
    mainChallenges: string | null;
    leadershipStyle: string | null;
    onboardingStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}