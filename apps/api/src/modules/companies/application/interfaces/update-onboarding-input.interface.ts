import { CompanyAddress } from "./company-address.interface";
import { CompanyContext } from "./company-context.interface";

export interface UpdateOnboardingInput {
    companyId: string;
    step: 1 | 2 | 3 | 4;
    razaoSocial?: string;
    logoUrl?: string;
    websiteUrl?: string;
    address?: CompanyAddress;
    context?: Partial<CompanyContext>;
}
