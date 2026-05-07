interface PrismaJobRecord {
    id: string; companyId: string; title: string; description: string | null;
    requirements: string[]; salaryMin: unknown; salaryMax: unknown;
    location: string | null; isRemote: boolean; status: string;
    responsibleId: string | null; aiGeneratedJd: string | null;
    createdAt: Date; updatedAt: Date; deletedAt: Date | null;
}