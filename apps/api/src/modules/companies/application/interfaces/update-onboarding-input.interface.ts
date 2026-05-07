import { CompanyAddress } from "../../domain/interfaces/company-address.interface";
import { CompanyContext } from "../../domain/interfaces/company-context.interface";
export interface UpdateOnboardingInput {
    companyId: string;
    step: 1 | 2 | 3 | 4;
    razaoSocial?: string;
    logoUrl?: string;
    websiteUrl?: string;
    address?: CompanyAddress;
    context?: Partial<CompanyContext>;
}
