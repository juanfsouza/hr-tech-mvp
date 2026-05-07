import { DiscDimension } from "../../engine/disc/disc.engine";
export interface DiscQuestionChoice {
    questionId: string;
    mostLike: DiscDimension;
    leastLike: DiscDimension;
}