export interface SaveProgressInput {
    token: string;
    testType: 'DISC' | 'ENNEAGRAM' | 'SIXTEEN_PERSONALITIES';
    questionId: string;
    answer: string;
}
