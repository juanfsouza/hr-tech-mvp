import { BigFiveScores } from "./big-five-scores.interface";

export interface SixteenPResult {
    mbtiType: string;
    E: number;
    I: number;
    N: number;
    S: number;
    T: number;
    F: number;
    J: number;
    P: number;
    bigFive: BigFiveScores;
    typeDescription: string;
    cognitiveStrengths: string[];
}
