export interface GetCompanyOutput {
    id: string;
    razaoSocial: string;
    cnpj: string;
    logoUrl?: string;
    websiteUrl?: string;
    address?: {
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
        };
    context: {
        companyProfile?: string;
        companyContext?: string;
        cultureValues: string[];
        mainChallenges?: string;
        leadershipStyle?: string;
        };
    onboardingStatus: string;
    createdAt: Date;
}
