import { BigFiveDimension } from "@/services/sixteen-personalities.engine";

export interface IpipItemResponse {
    itemId: string;
    score: 1 | 2 | 3 | 4 | 5;
    dimension: BigFiveDimension;
    keyed: '+' | '-';
}
