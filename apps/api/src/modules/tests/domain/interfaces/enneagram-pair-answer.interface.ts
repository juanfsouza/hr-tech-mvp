import { EnneagramType } from "../../engine/enneagram/enneagram.engine";

export interface EnneagramPairAnswer {
    pairId: string;
    choice: 'A' | 'B';
    typeA: EnneagramType;
    typeB: EnneagramType;
}
