import { EnneagramType } from "@/services/enneagram.engine";

export interface EnneagramQuestionPair {
    id: string;
    pairNumber: number;
    statementA: string;
    statementB: string;
    typeA: EnneagramType;
    typeB: EnneagramType;
}
