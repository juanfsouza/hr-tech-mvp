import { Global, Module } from '@nestjs/common';
import { EmailService } from '../shared/infrastructure/email/email.service';
import { PdfService } from '../shared/infrastructure/pdf/pdf.service';

@Global()
@Module({
  providers: [EmailService, PdfService],
  exports: [EmailService, PdfService],
})
export class NotificationsModule {}
