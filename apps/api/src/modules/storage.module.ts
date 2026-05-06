import { Global, Module } from '@nestjs/common';
import { StorageService } from '../shared/infrastructure/storage/storage.service';
import { StorageController } from '../shared/infrastructure/storage/presentation/storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
