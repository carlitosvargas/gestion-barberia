const nodemailer = require('nodemailer');

// Configuración del transporter. 
// Si hay variables de entorno reales, las usa. Si no, genera una cuenta de pruebas de Ethereal Mail.
let transporter;

const obtenerTransporter = async () => {
  if (transporter) return transporter;

  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = process.env.SMTP_PORT;
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    console.log('📧 Mailer: Utilizando configuración SMTP provista en variables de entorno.');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT) || 587,
      secure: parseInt(SMTP_PORT) === 465, // true para 465, false para otros
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  } else {
    console.log('📧 Mailer: Creando cuenta de correo de prueba automatizada en Ethereal Mail...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`📧 Mailer: Cuenta de prueba creada con éxito (${testAccount.user}).`);
    } catch (error) {
      console.error('❌ Mailer Error: No se pudo crear la cuenta de prueba de correo:', error);
      // Fallback a un transporter mock
      transporter = {
        sendMail: async (options) => {
          console.log('🔄 Mailer (Mock): Correo simulado (no enviado por falta de transporter):', options.subject);
          return { messageId: 'mock-id' };
        }
      };
    }
  }

  return transporter;
};

// Formateador de fecha amigable para mails
const formatearFechaEmail = (fechaStr) => {
  try {
    const fechaObj = new Date(fechaStr);
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const diaSemana = dias[fechaObj.getDay()];
    const diaNum = fechaObj.getDate();
    const mes = meses[fechaObj.getMonth()];
    const anio = fechaObj.getFullYear();
    const hora = `${String(fechaObj.getHours()).padStart(2, '0')}:${String(fechaObj.getMinutes()).padStart(2, '0')}`;
    
    return `${diaSemana}, ${diaNum} de ${mes} de ${anio} a las ${hora} hs`;
  } catch (err) {
    return fechaStr;
  }
};

// Enviar correo de Confirmación de Reserva
const enviarEmailConfirmacion = async (emailDestino, datosReserva) => {
  if (!emailDestino) return;

  try {
    const mailClient = await obtenerTransporter();
    const fechaAmigable = formatearFechaEmail(datosReserva.fecha);

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f1113; color: #ffffff; padding: 2.5rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #c9a063;">
        <div style="text-align: center; border-bottom: 2px solid #c9a063; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h1 style="color: #c9a063; margin: 0; font-size: 1.8rem; letter-spacing: 2px;">TURNO CONFIRMADO</h1>
          <p style="color: #a0a0a0; margin: 0.5rem 0 0 0; font-size: 0.9rem;">¡Tu reserva ha sido registrada con éxito!</p>
        </div>
        
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hola <strong>${datosReserva.clienteNombre}</strong>,</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Te confirmamos que tu turno en <strong>${datosReserva.barberia}</strong> ha sido agendado de forma automática.</p>
        
        <div style="background-color: rgba(201, 160, 99, 0.05); border-left: 4px solid #c9a063; padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #c9a063; margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Detalle de la Cita</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; color: #ffffff;">
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0; width: 35%;">✂️ Servicio:</td>
              <td style="padding: 0.4rem 0; font-weight: bold;">${datosReserva.servicioNombre}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">💰 Precio:</td>
              <td style="padding: 0.4rem 0; font-weight: bold; color: #2ecc71;">$${datosReserva.servicioPrecio}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">📅 Fecha y Hora:</td>
              <td style="padding: 0.4rem 0; font-weight: bold; text-transform: capitalize;">${fechaAmigable}</td>
            </tr>
            ${datosReserva.barberiaDireccion ? `
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">📍 Dirección:</td>
              <td style="padding: 0.4rem 0; font-weight: bold;">${datosReserva.barberiaDireccion}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <p style="font-size: 0.9rem; color: #a0a0a0; line-height: 1.5; margin-top: 2rem; text-align: center;">
          Si necesitas reprogramar o cancelar, por favor ponte en contacto llamando al <strong>${datosReserva.barberiaTelefono || ''}</strong>.
        </p>
        
        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem; margin-top: 2.5rem; font-size: 0.8rem; color: #707070;">
          <p>&copy; ${new Date().getFullYear()} ${datosReserva.barberia} - Gestiones en línea CV. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    const info = await mailClient.sendMail({
      from: `"${datosReserva.barberia}" <no-reply@gestioneslineacv.com>`,
      to: emailDestino,
      subject: `✅ Turno Confirmado - ${datosReserva.barberia}`,
      html: htmlContent
    });

    console.log(`✉️ Correo de confirmación enviado a ${emailDestino}. ID: ${info.messageId}`);
    
    // Si es una cuenta de prueba de Ethereal, imprimimos el URL para visualizarlo
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ver correo de confirmación enviado: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`❌ Error al enviar correo de confirmación a ${emailDestino}:`, error);
  }
};

// Enviar correo de Cancelación de Reserva
const enviarEmailCancelacion = async (emailDestino, datosReserva) => {
  if (!emailDestino) return;

  try {
    const mailClient = await obtenerTransporter();
    const fechaAmigable = formatearFechaEmail(datosReserva.fecha);

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f1113; color: #ffffff; padding: 2.5rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e74c3c;">
        <div style="text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h1 style="color: #e74c3c; margin: 0; font-size: 1.8rem; letter-spacing: 2px;">TURNO CANCELADO</h1>
          <p style="color: #a0a0a0; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Notificación de cancelación de cita</p>
        </div>
        
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hola <strong>${datosReserva.clienteNombre}</strong>,</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Lamentamos informarte que tu turno programado en <strong>${datosReserva.barberia}</strong> ha sido cancelado.</p>
        
        <div style="background-color: rgba(231, 76, 60, 0.05); border-left: 4px solid #e74c3c; padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #e74c3c; margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Detalle de la Cita Cancelada</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; color: #ffffff;">
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0; width: 35%;">✂️ Servicio:</td>
              <td style="padding: 0.4rem 0; font-weight: bold; text-decoration: line-through;">${datosReserva.servicioNombre}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">📅 Fecha y Hora:</td>
              <td style="padding: 0.4rem 0; font-weight: bold; text-transform: capitalize;">${fechaAmigable}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 0.9rem; color: #a0a0a0; line-height: 1.5; margin-top: 2rem; text-align: center;">
          Si deseas agendar un nuevo turno para otro horario, puedes hacerlo ingresando nuevamente a nuestro portal en línea o comunicándote al <strong>${datosReserva.barberiaTelefono || ''}</strong>.
        </p>
        
        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem; margin-top: 2.5rem; font-size: 0.8rem; color: #707070;">
          <p>&copy; ${new Date().getFullYear()} ${datosReserva.barberia} - Gestiones en línea CV. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    const info = await mailClient.sendMail({
      from: `"${datosReserva.barberia}" <no-reply@gestioneslineacv.com>`,
      to: emailDestino,
      subject: `❌ Turno Cancelado - ${datosReserva.barberia}`,
      html: htmlContent
    });

    console.log(`✉️ Correo de cancelación enviado a ${emailDestino}. ID: ${info.messageId}`);
    
    // Si es una cuenta de prueba de Ethereal, imprimimos el URL para visualizarlo
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ver correo de cancelación enviado: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`❌ Error al enviar correo de cancelación a ${emailDestino}:`, error);
  }
};

// Enviar correo de Bienvenida al Dueño
const enviarEmailBienvenida = async (emailDestino, nombre, frontendUrl = 'http://localhost:5173') => {
  if (!emailDestino) return;

  try {
    const mailClient = await obtenerTransporter();

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f1113; color: #ffffff; padding: 2.5rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #c9a063;">
        <div style="text-align: center; border-bottom: 2px solid #c9a063; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h1 style="color: #c9a063; margin: 0; font-size: 1.8rem; letter-spacing: 2px;">¡BIENVENIDO A GESTIONES CV!</h1>
          <p style="color: #a0a0a0; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Tu cuenta ha sido creada exitosamente</p>
        </div>
        
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hola <strong>${nombre}</strong>,</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Gracias por registrarte en el sistema de gestión. Tu cuenta ha sido validada como una cuenta de persona real y ya puedes iniciar sesión en la plataforma.</p>
        
        <p style="font-size: 0.9rem; color: #a0a0a0; line-height: 1.5; margin-top: 2rem; text-align: center;">
          Una vez inicies sesión, podrás administrar tu sucursal, ver los turnos y servicios.<br><br>
          <a href="${frontendUrl}/login" style="display: inline-block; padding: 10px 20px; background-color: #c9a063; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Acceder a mi panel</a>
        </p>
        
        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem; margin-top: 2.5rem; font-size: 0.8rem; color: #707070;">
          <p>&copy; ${new Date().getFullYear()} Gestiones en línea CV. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    const info = await mailClient.sendMail({
      from: `"Gestiones CV" <no-reply@gestioneslineacv.com>`,
      to: emailDestino,
      subject: `✅ Verificación de Cuenta y Bienvenida`,
      html: htmlContent
    });

    console.log(`✉️ Correo de bienvenida enviado a ${emailDestino}. ID: ${info.messageId}`);
    
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ver correo de bienvenida enviado: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`❌ Error al enviar correo de bienvenida a ${emailDestino}:`, error);
  }
};

// Enviar correo de Recuperación de Contraseña
const enviarEmailRecuperacionPassword = async (emailDestino, nombre, linkRecuperacion) => {
  if (!emailDestino) return;

  try {
    const mailClient = await obtenerTransporter();

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f1113; color: #ffffff; padding: 2.5rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #c9a063;">
        <div style="text-align: center; border-bottom: 2px solid #c9a063; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h1 style="color: #c9a063; margin: 0; font-size: 1.8rem; letter-spacing: 2px;">RECUPERACIÓN DE CONTRASEÑA</h1>
          <p style="color: #a0a0a0; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Solicitud de restablecimiento</p>
        </div>
        
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hola <strong>${nombre}</strong>,</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este correo.</p>
        
        <p style="font-size: 0.9rem; color: #a0a0a0; line-height: 1.5; margin-top: 2rem; text-align: center;">
          Para cambiar tu contraseña, haz clic en el siguiente botón. El enlace expirará en 1 hora.<br><br>
          <a href="${linkRecuperacion}" style="display: inline-block; padding: 10px 20px; background-color: #c9a063; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">Restablecer Contraseña</a>
        </p>
        
        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem; margin-top: 2.5rem; font-size: 0.8rem; color: #707070;">
          <p>&copy; ${new Date().getFullYear()} Gestiones en línea CV. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    const info = await mailClient.sendMail({
      from: `"Gestiones CV" <no-reply@gestioneslineacv.com>`,
      to: emailDestino,
      subject: `🔐 Recuperación de Contraseña`,
      html: htmlContent
    });

    console.log(`✉️ Correo de recuperación enviado a ${emailDestino}. ID: ${info.messageId}`);
    
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`🔗 Ver correo de recuperación enviado: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error(`❌ Error al enviar correo de recuperación a ${emailDestino}:`, error);
  }
};

// Enviar correo de Recordatorio (5 minutos antes)
const enviarEmailRecordatorio = async (emailDestino, datosReserva) => {
  if (!emailDestino) return;

  try {
    const mailClient = await obtenerTransporter();
    const fechaAmigable = formatearFechaEmail(datosReserva.fecha);

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0f1113; color: #ffffff; padding: 2.5rem; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #c9a063;">
        <div style="text-align: center; border-bottom: 2px solid #c9a063; padding-bottom: 1.5rem; margin-bottom: 2rem;">
          <h1 style="color: #c9a063; margin: 0; font-size: 1.8rem; letter-spacing: 2px;">¡TU TURNO ESTÁ POR COMENZAR!</h1>
          <p style="color: #a0a0a0; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Recordatorio Automático</p>
        </div>
        
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Hola <strong>${datosReserva.clienteNombre}</strong>,</p>
        <p style="font-size: 1rem; line-height: 1.6; color: #e0e0e0;">Te recordamos que tienes un turno programado en <strong>${datosReserva.barberia}</strong> en aproximadamente 5 minutos.</p>
        
        <div style="background-color: rgba(201, 160, 99, 0.05); border-left: 4px solid #c9a063; padding: 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #c9a063; margin-top: 0; margin-bottom: 1rem; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px;">Detalles Rápidos</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; color: #ffffff;">
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0; width: 35%;">✂️ Servicio:</td>
              <td style="padding: 0.4rem 0; font-weight: bold;">${datosReserva.servicioNombre}</td>
            </tr>
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">📅 Fecha y Hora:</td>
              <td style="padding: 0.4rem 0; font-weight: bold; text-transform: capitalize;">${fechaAmigable}</td>
            </tr>
            ${datosReserva.barberiaDireccion ? `
            <tr>
              <td style="padding: 0.4rem 0; color: #a0a0a0;">📍 Dirección:</td>
              <td style="padding: 0.4rem 0; font-weight: bold;">${datosReserva.barberiaDireccion}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <p style="font-size: 0.9rem; color: #a0a0a0; line-height: 1.5; margin-top: 2rem; text-align: center;">
          ¡Te esperamos!
        </p>
        
        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1.5rem; margin-top: 2.5rem; font-size: 0.8rem; color: #707070;">
          <p>&copy; ${new Date().getFullYear()} ${datosReserva.barberia} - Gestiones en línea CV.</p>
        </div>
      </div>
    `;

    const info = await mailClient.sendMail({
      from: `"${datosReserva.barberia}" <no-reply@gestioneslineacv.com>`,
      to: emailDestino,
      subject: `🔔 Recordatorio: Tu turno en ${datosReserva.barberia} es en 5 minutos`,
      html: htmlContent
    });

    console.log(`✉️ Correo de recordatorio enviado a ${emailDestino}. ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Error al enviar recordatorio a ${emailDestino}:`, error);
  }
};

module.exports = {
  enviarEmailConfirmacion,
  enviarEmailCancelacion,
  enviarEmailBienvenida,
  enviarEmailRecuperacionPassword,
  enviarEmailRecordatorio
};
