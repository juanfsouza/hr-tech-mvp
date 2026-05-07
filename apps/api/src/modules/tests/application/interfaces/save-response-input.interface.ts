import { TestType } from "@/modules/tests/domain/entities/test-session.entity";
export interface SaveResponseInput {
    sessionId: string;
    testType: TestType;
    questionId: string;
    answer: string;
}
