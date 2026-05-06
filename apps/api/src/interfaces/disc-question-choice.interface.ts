import { DiscDimension } from "@/services/disc.engine";

export interface DiscQuestionChoice {
    questionId: string;
    mostLike: DiscDimension;
    leastLike: DiscDimension;
}
