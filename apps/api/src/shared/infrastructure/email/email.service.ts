import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { AppConfig } from 'src/config/app.config';

/**
 * EmailService — wrapper do Resend SDK para envio transacional
 */
@Injectable()
export class EmailService {
  private readonly client: Resend;
  private readonly defaultFrom: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(config: ConfigService<AppConfig>) {
    this.client = new Resend(config.getOrThrow('RESEND_API_KEY'));
    this.defaultFrom = config.get('EMAIL_FROM') ?? 'noreply@psicometriaai.com';
  }

  async send(input: SendEmailInput): Promise<void> {
    try {
      await this.client.emails.send({
        from: input.from ?? this.defaultFrom,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      this.logger.log(`Email sent to ${input.to}: ${input.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${input.to}:`, error);
      throw error;
    }
  }

  // ─── Templates ─────────────────────────────────────────────────────────────

  async sendTestInvite(to: string, name: string, testUrl: string, expiresAt: Date): Promise<void> {
    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo',
    }).format(expiresAt);

    await this.send({
      to,
      subject: 'Convite para Avaliação Psicométrica',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: Inter, sans-serif; background: #f9fafb; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #6366f1; font-size: 28px; margin: 0;">🧠 Avaliação Psicométrica</h1>
            </div>
            <p style="color: #374151; font-size: 16px;">Olá, <strong>${name}</strong>!</p>
            <p style="color: #6b7280; line-height: 1.7;">
              Você foi convidado(a) para realizar uma avaliação psicométrica composta por três instrumentos:
              <strong>DISC</strong>, <strong>Eneagrama</strong> e <strong>16 Personalidades</strong>.
            </p>
            <p style="color: #6b7280;">A avaliação pode ser interrompida e retomada a qualquer momento. Seus dados ficam salvos automaticamente.</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${testUrl}" style="background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Iniciar Avaliação →
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              Link válido até <strong>${formattedDate}</strong>
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #d1d5db; font-size: 12px; text-align: center;">
              Seus dados são protegidos conforme a LGPD. Ao iniciar o teste, você confirma o consentimento para análise dos dados.
            </p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendMatchResult(
    to: string,
    candidateName: string,
    jobTitle: string,
    score: number,
    recommendation: string,
  ): Promise<void> {
    const recColors: Record<string, string> = {
      STRONG_YES: '#10b981',
      YES: '#6366f1',
      MAYBE: '#f59e0b',
      NO: '#ef4444',
    };
    const color = recColors[recommendation] ?? '#6b7280';

    await this.send({
      to,
      subject: `Resultado de Match: ${candidateName} × ${jobTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <body style="font-family: Inter, sans-serif; background: #f9fafb; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            <h1 style="color: #111827; font-size: 22px;">📊 Resultado de Match</h1>
            <p><strong>Candidato:</strong> ${candidateName}</p>
            <p><strong>Vaga:</strong> ${jobTitle}</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
              <div style="font-size: 48px; font-weight: 700; color: ${color};">${score}%</div>
              <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Score de Compatibilidade</div>
              <div style="display: inline-block; background: ${color}; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-top: 8px;">
                ${recommendation.replace('_', ' ')}
              </div>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Acesse a plataforma para ver a análise completa.</p>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendTestCompleted(
    to: string,
    candidateName: string,
    discDominant: string,
    enneagramType: string,
    mbtiType: string,
    pdfBuffer?: Buffer,
  ): Promise<void> {
    await this.send({
      to,
      subject: `Seus Resultados: Avaliação Psicométrica Concluída!`,
      attachments: pdfBuffer ? [
        {
          filename: 'mapa_comportamental.pdf',
          content: pdfBuffer,
        }
      ] : undefined,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <body style="font-family: Inter, sans-serif; background: #f9fafb; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            <h1 style="color: #111827; font-size: 22px;">🎉 Parabéns, ${candidateName}!</h1>
            <p style="color: #4b5563;">Você concluiu sua avaliação psicométrica com sucesso.</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <h2 style="font-size: 16px; margin-top: 0;">Resumo do seu Perfil:</h2>
              <ul style="color: #374151; line-height: 1.6;">
                <li><strong>DISC:</strong> Perfil ${discDominant}</li>
                <li><strong>Eneagrama:</strong> Tipo ${enneagramType}</li>
                <li><strong>16 Personalidades:</strong> ${mbtiType}</li>
              </ul>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Em breve enviaremos o PDF detalhado com o seu mapa comportamental completo.</p>
            <p style="color: #6b7280; font-size: 14px;">O RH da empresa já foi notificado sobre a conclusão dos seus testes.</p>
          </div>
        </body>
        </html>
      `,
    });
  }
}
