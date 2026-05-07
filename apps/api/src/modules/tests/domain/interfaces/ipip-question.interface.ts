import { BigFiveDimension } from "@/services/sixteen-personalities.engine";

export interface IpipQuestion {
    id: string;
    itemNumber: number;
    text: string;
    dimension: BigFiveDimension;
    keyed: '+' | '-';
}
