import { OnboardingStatus } from "../entities/company.entity";
import { CompanyAddress } from "./company-address.interface";
import { CompanyContext } from "./company-context.interface";
import { Cnpj } from "@shared/domain/value-objects/cnpj.vo";


export interface CompanyProps {
    razaoSocial: string;
    cnpj: Cnpj;
    logoUrl?: string;
    websiteUrl?: string;
    address?: CompanyAddress;
    context: CompanyContext;
    onboardingStatus: OnboardingStatus;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
