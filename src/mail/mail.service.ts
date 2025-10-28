import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private frontendOrigin: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendOrigin = this.configService.get<string>('FRONTEND_URL')!;
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any = {},
  ) {
    await this.mailerService.sendMail({
      to,
      subject,
      template,
      context: {
        frontendOrigin: this.frontendOrigin,
        date: new Date().getFullYear(),
        ...context,
      },
    });

    return {
      message: 'Email sent',
    };
  }
}
