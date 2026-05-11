import { SaveResponseInput } from "../../application/interfaces/save-response-input.interface";
import { TestSession, TestType } from "../entities/test-session.entity";
import { PsychProfileData } from "../interfaces/psych-profile-data.interface";


export interface ITestRepository {
    findSessionByToken(token: string): Promise<TestSession | null>;
    findSessionById(id: string): Promise<TestSession | null>;
    findSessionsByCompany(companyId: string): Promise<TestSession[]>;
    saveSession(session: TestSession): Promise<void>;
    updateSession(session: TestSession): Promise<void>;
    expireOldSessions(): Promise<number>;
    upsertResponse(input: SaveResponseInput): Promise<void>;
    findResponses(sessionId: string, testType: TestType): Promise<Array<{ questionId: string; answer: string }>>;
    savePsychProfile(candidateId: string | undefined, collaboratorId: string | undefined, profile: PsychProfileData): Promise<string>;
}
