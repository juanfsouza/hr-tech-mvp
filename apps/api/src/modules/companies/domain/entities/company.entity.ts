import { Entity } from '@shared/domain/value-objects/entity';
import { UniqueEntityID } from '@shared/domain/value-objects/unique-entity-id';
import { Cnpj } from '@shared/domain/value-objects/cnpj.vo';
import { CompanyProps } from '@/interfaces/company-props.interface';
import { CompanyAddress } from '@/interfaces/company-address.interface';
import { CompanyContext } from '@/interfaces/company-context.interface';

export type CompanyProfile = 'STARTUP' | 'CONSOLIDATED' | 'RESTRUCTURING' | 'OTHER';
export type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';


export class Company extends Entity<CompanyProps> {
  private constructor(props: CompanyProps, id?: UniqueEntityID) {
    super(props, id);
  }

  static create(
    props: Pick<CompanyProps, 'razaoSocial' | 'cnpj'> & Partial<CompanyProps>,
    id?: UniqueEntityID,
  ): Company {
    return new Company(
      {
        razaoSocial: props.razaoSocial,
        cnpj: props.cnpj,
        logoUrl: props.logoUrl,
        websiteUrl: props.websiteUrl,
        address: props.address,
        context: props.context ?? { cultureValues: [] },
        onboardingStatus: 'PENDING',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id,
    );
  }

  static reconstitute(props: CompanyProps, id: UniqueEntityID): Company {
    return new Company(props, id);
  }

  get razaoSocial(): string { return this.props.razaoSocial; }
  get cnpj(): Cnpj { return this.props.cnpj; }
  get logoUrl(): string | undefined { return this.props.logoUrl; }
  get websiteUrl(): string | undefined { return this.props.websiteUrl; }
  get address(): CompanyAddress | undefined { return this.props.address; }
  get context(): CompanyContext | undefined { return this.props.context; }
  get onboardingStatus(): OnboardingStatus { return this.props.onboardingStatus; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateAddress(address: CompanyAddress): void {
    this.props.address = address;
    this.props.updatedAt = new Date();
  }

  updateContext(context: Partial<CompanyContext>): void {
    this.props.context = { ...this.props.context, ...context };
    this.props.updatedAt = new Date();
  }

  updateLogo(logoUrl: string): void {
    this.props.logoUrl = logoUrl;
    this.props.updatedAt = new Date();
  }

  advanceOnboarding(status: OnboardingStatus): void {
    this.props.onboardingStatus = status;
    this.props.updatedAt = new Date();
  }

  completeOnboarding(): void {
    this.props.onboardingStatus = 'COMPLETED';
    this.props.updatedAt = new Date();
  }

  hasCompleteContext(): boolean {
    const ctx = this.props.context;
    return (
      !!ctx.companyProfile &&
      !!ctx.companyContext &&
      ctx.companyContext.split(' ').length >= 100 &&
      ctx.cultureValues.length > 0
    );
  }

  isOnboardingComplete(): boolean {
    return this.props.onboardingStatus === 'COMPLETED';
  }
}
