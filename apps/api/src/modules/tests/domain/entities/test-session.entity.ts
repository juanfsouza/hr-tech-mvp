import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { randomBytes } from 'node:crypto';
import { TestSessionProps } from '@/modules/tests/domain/interfaces/test-session-props.interface';

export type TestSessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
export type TestType = 'DISC' | 'ENNEAGRAM' | 'SIXTEEN_PERSONALITIES';

export class TestSession extends Entity<TestSessionProps> {
  private constructor(props: TestSessionProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Pick<TestSessionProps, 'companyId' | 'candidateId' | 'expiresAt'>,
    id?: UniqueEntityID,
  ): TestSession {
    return new TestSession(
      {
        ...props,
        token: randomBytes(32).toString('hex'),
        status: 'PENDING',
        currentTest: 'DISC',
        createdAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: TestSessionProps, id: UniqueEntityID): TestSession {
    return new TestSession(props, id);
  }

  get companyId(): string { return this.props.companyId; }
  get candidateId(): string | undefined { return this.props.candidateId; }
  get token(): string { return this.props.token; }
  get status(): TestSessionStatus { return this.props.status; }
  get expiresAt(): Date { return this.props.expiresAt; }
  get startedAt(): Date | undefined { return this.props.startedAt; }
  get completedAt(): Date | undefined { return this.props.completedAt; }
  get currentTest(): TestType | undefined { return this.props.currentTest; }
  get createdAt(): Date { return this.props.createdAt; }

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  isAccessible(): boolean {
    return !this.isExpired() && this.props.status !== 'COMPLETED';
  }

  start(): void {
    this.props.status = 'IN_PROGRESS';
    this.props.startedAt = new Date();
  }

  advanceToNextTest(): void {
    const order: TestType[] = ['DISC', 'ENNEAGRAM', 'SIXTEEN_PERSONALITIES'];
    const current = this.props.currentTest ?? 'DISC';
    const idx = order.indexOf(current);
    if (idx < order.length - 1) {
      this.props.currentTest = order[idx + 1];
    }
  }

  complete(): void {
    this.props.status = 'COMPLETED';
    this.props.completedAt = new Date();
  }

  expire(): void {
    this.props.status = 'EXPIRED';
  }

  setCandidateId(candidateId: string): void {
    this.props.candidateId = candidateId;
  }
}
