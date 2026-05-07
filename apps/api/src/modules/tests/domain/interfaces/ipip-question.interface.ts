import { BigFiveDimension } from "../../engine/sixteen-personalities/sixteen-personalities.engine";

export interface IpipQuestion {
    id: string;
    itemNumber: number;
    text: string;
    dimension: BigFiveDimension;
    keyed: '+' | '-';
}
