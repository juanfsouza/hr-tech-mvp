import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { CandidateStatus } from '@modules/candidates/domain/entities/candidate.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: ['REGISTERED', 'TEST_SENT', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'ANALYZING', 'APPROVED', 'REJECTED'] })
  @IsString()
  @IsIn(['REGISTERED', 'TEST_SENT', 'TEST_IN_PROGRESS', 'TEST_COMPLETED', 'ANALYZING', 'APPROVED', 'REJECTED'])
  status!: CandidateStatus;
}
