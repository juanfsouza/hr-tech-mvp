import { BigFiveDimension } from "../../engine/sixteen-personalities/sixteen-personalities.engine";
export interface IpipItemResponse {
    itemId: string;
    score: 1 | 2 | 3 | 4 | 5;
    dimension: BigFiveDimension;
    keyed: '+' | '-';
}
