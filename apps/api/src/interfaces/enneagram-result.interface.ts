import { EnneagramType } from "@/services/enneagram.engine";

export interface EnneagramResult {
    type: EnneagramType;
    wing: string;
    integrationLevel: number;
    typeName: string;
    description: string;
    strengths: string[];
    challenges: string[];
    scores: Record<EnneagramType, number>;
}
