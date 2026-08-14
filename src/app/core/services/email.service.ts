import { Injectable } from '@angular/core';

export interface EmailJSConfig {
  serviceId: string;
  templateIdVerification: string;
  templateIdViewerInvite: string;
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  // Placeholders para EmailJS - El usuario sustituirá estas llaves desde su panel de emailjs.com
  private config: EmailJSConfig = {
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    templateIdVerification: 'YOUR_TEMPLATE_ID_VERIFICATION',
    templateIdViewerInvite: 'YOUR_TEMPLATE_ID_VIEWER_INVITE',
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
  };

  /**
   * Envía correo de verificación al registrar un nuevo usuario
   */
  async sendVerificationEmail(toEmail: string, userName: string): Promise<boolean> {
    console.log(`[EmailService] Enviando correo de verificación a: ${toEmail}`);
    return this.sendEmail(this.config.templateIdVerification, {
      to_email: toEmail,
      user_name: userName,
      verification_link: `${window.location.origin}/login`,
      app_name: '熊猫理财 El Panda Ahorrador'
    });
  }

  /**
   * Envía notificación por correo cuando se comparte acceso con un Viewer
   */
  async sendViewerInvitation(toEmail: string, ownerName: string): Promise<boolean> {
    console.log(`[EmailService] Enviando invitación de observador a: ${toEmail} de parte de ${ownerName}`);
    return this.sendEmail(this.config.templateIdViewerInvite, {
      to_email: toEmail,
      owner_name: ownerName,
      login_link: `${window.location.origin}/login`,
      app_name: '熊猫理财 El Panda Ahorrador'
    });
  }

  private async sendEmail(templateId: string, templateParams: Record<string, any>): Promise<boolean> {
    // Si la clave es placeholder, simulamos el envío en consola sin fallar
    if (this.config.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
      console.warn('[EmailService] Configura tus llaves de EmailJS en email.service.ts para habilitar el envío real de correos.');
      console.log('[EmailService] Parámetros enviados:', templateParams);
      return true;
    }

    try {
      // Usar API REST directa de EmailJS (sin requerir compilación pesada de SDK)
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: this.config.serviceId,
          template_id: templateId,
          user_id: this.config.publicKey,
          template_params: templateParams
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[EmailService] Error EmailJS:', errorText);
        return false;
      }

      console.log('[EmailService] Correo enviado con éxito vía EmailJS API!');
      return true;
    } catch (err) {
      console.error('[EmailService] Error al enviar email:', err);
      return false;
    }
  }
}
