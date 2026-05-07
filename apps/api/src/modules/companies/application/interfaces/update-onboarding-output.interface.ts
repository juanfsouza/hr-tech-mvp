import { OnboardingStatus } from "../../domain/entities/company.entity";
export interface UpdateOnboardingOutput {
    companyId: string;
    onboardingStatus: OnboardingStatus;
    isComplete: boolean;
}
