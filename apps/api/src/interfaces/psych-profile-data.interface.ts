import { ReactNode } from "react";

export interface PsychProfileData {
    candidateName: ReactNode;
    discD?: number;
    discI?: number;
    discS?: number;
    discC?: number;
    discDominant?: string;
    discSecondary?: string;
    enneagramType?: number;
    enneagramWing?: string;
    enneagramLevel?: number;
    mbtiType?: string;
    bigFiveO?: number;
    bigFiveC?: number;
    bigFiveE?: number;
    bigFiveA?: number;
    bigFiveN?: number;
}
