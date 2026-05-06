import { Module } from '@nestjs/common';
import { PrismaUserRepository } from './users/infrastructure/repositories/prisma-user.repository';
import { USER_REPOSITORY } from './users/domain/repositories/user.repository.interface';

@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
