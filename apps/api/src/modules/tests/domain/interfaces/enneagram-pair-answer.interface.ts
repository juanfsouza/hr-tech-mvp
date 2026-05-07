import { EnneagramType } from "@/services/enneagram.engine";


export interface EnneagramPairAnswer {
    pairId: string;
    choice: 'A' | 'B';
    typeA: EnneagramType;
    typeB: EnneagramType;
}
