import { TestType } from "@/entities/test-session.entity";

export interface SaveResponseInput {
    sessionId: string;
    testType: TestType;
    questionId: string;
    answer: string;
}
