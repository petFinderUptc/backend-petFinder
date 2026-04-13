import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const emailUser = this.configService.get<string>('email.user');
    const emailPass = this.configService.get<string>('email.password');
    const emailPort = this.configService.get<number>('email.port') || 587;
    const useSecure = emailPort === 465; // true only for SSL port 465; port 587 uses STARTTLS

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('email.host'),
      port: emailPort,
      secure: useSecure,
      requireTLS: !useSecure, // Force STARTTLS upgrade on port 587
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false, // Required for some cloud hosting environments
      },
    });

    if (emailUser) {
      this.transporter
        .verify()
        .then(() => {
          this.logger.log('Servidor SMTP conectado correctamente');
        })
        .catch((err) => {
          this.logger.warn(
            `No se pudo verificar conexión SMTP: ${err.message}. Los correos podrían no enviarse.`,
          );
        });
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('email.frontendUrl');
    const from = this.configService.get<string>('email.from');
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await this.send({
      from,
      to,
      subject: 'Restablecer tu contraseña — PetFinder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; font-size: 28px; margin: 0;">PetFinder</h1>
            <p style="color: #64748b; margin-top: 4px;">Plataforma de mascotas perdidas</p>
          </div>

          <h2 style="color: #1e293b;">Solicitud para restablecer contraseña</h2>
          <p style="color: #475569; line-height: 1.6;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            Si fuiste tú, haz clic en el botón de abajo para continuar.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background: linear-gradient(135deg, #06b6d4, #3b82f6);
                      color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px;
                      display: inline-block;">
              Restablecer contraseña
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            Este enlace expira en <strong>15 minutos</strong>.
            Si no solicitaste restablecer tu contraseña, ignora este correo — tu cuenta sigue segura.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
            <a href="${resetUrl}" style="color: #0ea5e9; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      `,
    });
  }

  async sendEmailVerification(to: string, verificationToken: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('email.frontendUrl');
    const from = this.configService.get<string>('email.from');
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    await this.send({
      from,
      to,
      subject: 'Verifica tu correo electrónico — PetFinder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; font-size: 28px; margin: 0;">PetFinder</h1>
            <p style="color: #64748b; margin-top: 4px;">Plataforma de mascotas perdidas</p>
          </div>

          <h2 style="color: #1e293b;">¡Bienvenido a PetFinder!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Gracias por registrarte. Para activar tu cuenta y publicar reportes,
            verifica tu correo electrónico haciendo clic en el botón de abajo.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}"
               style="background: linear-gradient(135deg, #06b6d4, #3b82f6);
                      color: white; padding: 14px 32px; border-radius: 8px;
                      text-decoration: none; font-weight: bold; font-size: 16px;
                      display: inline-block;">
              Verificar correo
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px;">
            Este enlace expira en <strong>24 horas</strong>.
            Si no creaste esta cuenta, ignora este correo.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
            <a href="${verifyUrl}" style="color: #0ea5e9; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
      `,
    });
  }

  private async send(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const emailUser = this.configService.get<string>('email.user');

    if (!emailUser) {
      this.logger.warn(
        `EMAIL_USER no configurado — correo a ${options.to} (asunto: "${options.subject}") no enviado`,
      );
      return;
    }

    try {
      await this.transporter.sendMail(options);
      this.logger.log(`Correo enviado a ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo a ${options.to}: ${error.message}`);
      throw error;
    }
  }
}
