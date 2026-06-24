import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@lahabanera.com';
const EMAIL_TO = process.env.EMAIL_TO || 'lahaban3ra@gmail.com';

// Initialize Resend client
function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Email sending is disabled.');
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

export interface ReservationEmailData {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  personas: number;
  comentarios?: string;
  estado: string;
}

export interface ContactEmailData {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

/**
 * Send a notification email for a new reservation
 * @param reservation - Reservation data object
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendReservationEmail(
  reservation: ReservationEmailData
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend client not initialized. Skipping reservation email.');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `🧀 Nueva Reserva - Finca La Habanera`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF8F0; padding: 20px;">
          <div style="background-color: #D4A574; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #3D2314; margin: 0;">🧀 Nueva Reserva</h1>
            <p style="color: #3D2314; margin: 5px 0 0 0;">Finca La Habanera</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #E8E4D9;">
            <h2 style="color: #5D4037; border-bottom: 2px solid #D4A574; padding-bottom: 10px;">
              Datos de la Reserva
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold; width: 30%;">Nombre:</td>
                <td style="padding: 12px 0; color: #3D2314;">${reservation.nombre}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0; color: #3D2314;">
                  <a href="mailto:${reservation.email}" style="color: #7BA3B5; text-decoration: none;">${reservation.email}</a>
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Teléfono:</td>
                <td style="padding: 12px 0; color: #3D2314;">${reservation.telefono}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Fecha:</td>
                <td style="padding: 12px 0; color: #3D2314;">${reservation.fecha}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Personas:</td>
                <td style="padding: 12px 0; color: #3D2314;">${reservation.personas}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Estado:</td>
                <td style="padding: 12px 0; color: #3D2314;">
                  <span style="background-color: #FFF3CD; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                    ${reservation.estado}
                  </span>
                </td>
              </tr>
              ${reservation.comentarios ? `
              <tr>
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold; vertical-align: top;">Comentarios:</td>
                <td style="padding: 12px 0; color: #3D2314;">${reservation.comentarios}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #F5F5F0; border-radius: 8px;">
              <p style="margin: 0; color: #5D4037; font-size: 14px;">
                <strong>📞 Contactar por WhatsApp:</strong> 
                <a href="https://wa.me/${reservation.telefono.replace(/[^0-9]/g, '')}" style="color: #6B8E5A;">
                  ${reservation.telefono}
                </a>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6B5344; font-size: 12px;">
            <p>Este mensaje fue enviado desde el CMS de Finca La Habanera</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send reservation email:', error);
      return false;
    }

    console.log('Reservation email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending reservation email:', error);
    return false;
  }
}

/**
 * Send a notification email for a new contact message
 * @param message - Contact message data object
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendContactEmail(message: ContactEmailData): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend client not initialized. Skipping contact email.');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject: `📩 Nuevo Mensaje: ${message.asunto} - Finca La Habanera`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF8F0; padding: 20px;">
          <div style="background-color: #6B8E5A; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0;">📩 Nuevo Mensaje</h1>
            <p style="color: #E8E4D9; margin: 5px 0 0 0;">Finca La Habanera</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #E8E4D9;">
            <h2 style="color: #5D4037; border-bottom: 2px solid #6B8E5A; padding-bottom: 10px;">
              ${message.asunto}
            </h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold; width: 30%;">Nombre:</td>
                <td style="padding: 12px 0; color: #3D2314;">${message.nombre}</td>
              </tr>
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Email:</td>
                <td style="padding: 12px 0; color: #3D2314;">
                  <a href="mailto:${message.email}" style="color: #7BA3B5; text-decoration: none;">${message.email}</a>
                </td>
              </tr>
              ${message.telefono ? `
              <tr style="border-bottom: 1px solid #E8E4D9;">
                <td style="padding: 12px 0; color: #6B5344; font-weight: bold;">Teléfono:</td>
                <td style="padding: 12px 0; color: #3D2314;">${message.telefono}</td>
              </tr>
              ` : ''}
            </table>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #F5F5F0; border-radius: 8px;">
              <h3 style="color: #5D4037; margin: 0 0 10px 0;">Mensaje:</h3>
              <p style="margin: 0; color: #3D2314; white-space: pre-wrap;">${message.mensaje}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #F5F5F0; border-radius: 8px;">
              <p style="margin: 0; color: #5D4037; font-size: 14px;">
                <strong>📧 Responder:</strong> 
                <a href="mailto:${message.email}" style="color: #7BA3B5;">
                  ${message.email}
                </a>
                ${message.telefono ? ` | <a href="https://wa.me/${message.telefono.replace(/[^0-9]/g, '')}" style="color: #6B8E5A;">WhatsApp</a>` : ''}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6B5344; font-size: 12px;">
            <p>Este mensaje fue enviado desde el formulario de contacto de Finca La Habanera</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send contact email:', error);
      return false;
    }

    console.log('Contact email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending contact email:', error);
    return false;
  }
}

/**
 * Send a confirmation email to the customer for their reservation
 * @param reservation - Reservation data object
 * @returns True if email was sent successfully, false otherwise
 */
export async function sendReservationConfirmationEmail(
  reservation: ReservationEmailData
): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('Resend client not initialized. Skipping confirmation email.');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: reservation.email,
      subject: `✅ Confirmación de Reserva - Finca La Habanera`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FFF8F0; padding: 20px;">
          <div style="background-color: #D4A574; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #3D2314; margin: 0;">🧀 Finca La Habanera</h1>
            <p style="color: #3D2314; margin: 5px 0 0 0;">Tu reserva ha sido confirmada</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #E8E4D9;">
            <p style="color: #3D2314; font-size: 16px;">
              Hola <strong>${reservation.nombre}</strong>,
            </p>
            
            <p style="color: #5D4037;">
              ¡Gracias por reservar con nosotros! Tu visita a Finca La Habanera ha sido confirmada.
            </p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #F5F5F0; border-radius: 8px; border-left: 4px solid #D4A574;">
              <h3 style="color: #5D4037; margin: 0 0 10px 0;">📅 Detalles de tu reserva:</h3>
              <p style="margin: 5px 0; color: #3D2314;"><strong>Fecha:</strong> ${reservation.fecha}</p>
              <p style="margin: 5px 0; color: #3D2314;"><strong>Personas:</strong> ${reservation.personas}</p>
              <p style="margin: 5px 0; color: #3D2314;"><strong>Estado:</strong> 
                <span style="background-color: #D4EDDA; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 14px;">
                  Confirmada
                </span>
              </p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #6B8E5A; border-radius: 8px; color: white;">
              <h3 style="margin: 0 0 10px 0;">📍 ¿Cómo llegar?</h3>
              <p style="margin: 0; font-size: 14px;">
                Km 38-1/2, Carretera Central, San Pedro,<br>
                San José de Las Lajas, Mayabeque, Cuba
              </p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #F5F5F0; border-radius: 8px;">
              <p style="margin: 0; color: #5D4037; font-size: 14px;">
                <strong>📞 ¿Preguntas?</strong> Contáctanos por WhatsApp:<br>
                <a href="https://wa.me/5353972047" style="color: #6B8E5A;">+53 5 3972047</a>
              </p>
            </div>
            
            <p style="color: #5D4037; font-size: 14px; margin-top: 20px;">
              ¡Esperamos verte pronto! 🐐
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6B5344; font-size: 12px;">
            <p>Finca La Habanera - Tradición caprina desde hace más de 12 años</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send confirmation email:', error);
      return false;
    }

    console.log('Confirmation email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}
