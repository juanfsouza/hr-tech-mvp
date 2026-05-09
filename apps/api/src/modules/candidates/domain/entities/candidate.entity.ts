import { CandidateProps } from '@/modules/candidates/domain/interfaces/candidate-props.interface';
import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';

export type CandidateStatus =
  | 'REGISTERED' | 'TEST_SENT' | 'TEST_IN_PROGRESS'
  | 'TEST_COMPLETED' | 'ANALYZING' | 'APPROVED' | 'REJECTED';

export class Candidate extends Entity<CandidateProps> {
  matchId?: string;
  matchScore?: number;
  private constructor(props: CandidateProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Omit<CandidateProps, 'status' | 'lgpdConsent' | 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityID,
  ): Candidate {
    return new Candidate(
      { ...props, status: 'REGISTERED', lgpdConsent: false, createdAt: new Date(), updatedAt: new Date() },
      id,
    );
  }

  static reconstitute(props: CandidateProps, id: UniqueEntityID): Candidate {
    return new Candidate(props, id);
  }

  get companyId(): string { return this.props.companyId; }
  get jobId(): string | undefined { return this.props.jobId; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get phone(): string | undefined { return this.props.phone; }
  get resumeUrl(): string | undefined { return this.props.resumeUrl; }
  get status(): CandidateStatus { return this.props.status; }
  get lgpdConsent(): boolean { return this.props.lgpdConsent; }
  get consentAt(): Date | undefined { return this.props.consentAt; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }
  get deletedAt(): Date | undefined { return this.props.deletedAt; }

  grantLgpdConsent(): void {
    this.props.lgpdConsent = true;
    this.props.consentAt = new Date();
    this.props.updatedAt = new Date();
  }

  updateStatus(status: CandidateStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  setResumeUrl(url: string): void {
    this.props.resumeUrl = url;
    this.props.updatedAt = new Date();
  }

  // LGPD: anonimizar dados pessoais (direito ao esquecimento)
  anonymize(): void {
    this.props.name = 'ANÔNIMO';
    this.props.email = `anon_${this.id.value}@removed.com`;
    this.props.phone = undefined;
    this.props.resumeUrl = undefined;
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }
}
