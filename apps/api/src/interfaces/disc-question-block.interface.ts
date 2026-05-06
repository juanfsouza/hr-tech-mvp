import { DiscDimension } from "@/services/disc.engine";

export interface DiscQuestionBlock {
    id: string;
    blockNumber: number;
    items: Array<{
        id: string;
        text: string;
        dimension: DiscDimension;
    }>;
}
