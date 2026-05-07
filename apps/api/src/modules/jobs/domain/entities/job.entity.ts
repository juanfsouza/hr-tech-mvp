import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { JobProps } from '@/modules/jobs/domain/interfaces/job-props.interface';

export type JobStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export class Job extends Entity<JobProps> {
  private constructor(props: JobProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(props: Omit<JobProps, 'status' | 'createdAt' | 'updatedAt'>, id?: UniqueEntityID): Job {
    return new Job({ ...props, status: 'DRAFT', createdAt: new Date(), updatedAt: new Date() }, id);
  }

  static reconstitute(props: JobProps, id: UniqueEntityID): Job {
    return new Job(props, id);
  }

  get companyId(): string { return this.props.companyId; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get requirements(): string[] { return this.props.requirements; }
  get salaryMin(): number | undefined { return this.props.salaryMin; }
  get salaryMax(): number | undefined { return this.props.salaryMax; }
  get location(): string | undefined { return this.props.location; }
  get isRemote(): boolean { return this.props.isRemote; }
  get status(): JobStatus { return this.props.status; }
  get responsibleId(): string | undefined { return this.props.responsibleId; }
  get aiGeneratedJd(): string | undefined { return this.props.aiGeneratedJd; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  publish(): void { this.props.status = 'ACTIVE'; this.props.updatedAt = new Date(); }
  pause(): void { this.props.status = 'PAUSED'; this.props.updatedAt = new Date(); }
  close(): void { this.props.status = 'CLOSED'; this.props.updatedAt = new Date(); }

  setAiJd(jd: string): void { this.props.aiGeneratedJd = jd; this.props.updatedAt = new Date(); }

  update(data: Partial<Pick<JobProps, 'title' | 'description' | 'requirements' | 'salaryMin' | 'salaryMax' | 'location' | 'isRemote' | 'responsibleId'>>): void {
    Object.assign(this.props, data);
    this.props.updatedAt = new Date();
  }
}
