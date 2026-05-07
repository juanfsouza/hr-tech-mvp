import { Global, Module } from '@nestjs/common';
import { StorageService } from '../shared/infrastructure/storage/services/storage.service';
import { StorageController } from '../shared/infrastructure/storage/controllers/storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule { }
