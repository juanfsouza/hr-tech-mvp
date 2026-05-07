import { CompanyProfile } from "@/entities/company.entity";

export interface CompanyContext {
    companyProfile?: CompanyProfile;
    companyContext?: string;
    cultureValues: string[];
    mainChallenges?: string;
    leadershipStyle?: string;
}
