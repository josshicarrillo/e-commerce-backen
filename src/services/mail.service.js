import nodemailer from 'nodemailer';
import { config } from '../config/env.js';

const hasMailConfig = [
  config.mailHost,
  config.mailPort,
  config.mailUser,
  config.mailPass,
  config.mailFrom,
].every(Boolean);

const transporter = hasMailConfig
  ? nodemailer.createTransport({
    host: config.mailHost,
    port: config.mailPort,
    secure: config.mailPort === 465,
    auth: { user: config.mailUser, pass: config.mailPass },
  })
  : null;

export const sendTicketConfirmation = async ({ recipient, ticket, event }) => {
  if (!transporter) {
    console.warn('Email no configurado. Se omite la confirmación por correo.');
    return false;
  }

  await transporter.sendMail({
    from: config.mailFrom,
    to: recipient,
    subject: `Inscripción confirmada: ${event.title}`,
    text: [
      `Tu inscripción fue confirmada para ${event.title}.`,
      `Fecha: ${new Date(event.date).toLocaleString()}`,
      `Ubicación: ${event.location}`,
      `Cantidad: ${ticket.quantity}`,
      `Código de reserva: ${ticket.reservationCode}`,
    ].join('\n'),
  });
  return true;
};
