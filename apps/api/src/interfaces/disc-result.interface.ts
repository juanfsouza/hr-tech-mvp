import { DiscDimension } from "@/services/disc.engine";

export interface DiscResult {
    D: number;
    I: number;
    S: number;
    C: number;
    dominantProfile: DiscDimension;
    secondaryProfile: DiscDimension;
    profileDescription: string;
}
