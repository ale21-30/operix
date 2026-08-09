const { Expo } = require('expo-server-sdk');
const pool = require('../config/db');

const expo = new Expo();

// Envía una notificación push a todos los usuarios admin con push_token registrado
const notificarAdmins = async (titulo, cuerpo) => {
  try {
    const [admins] = await pool.query(
      `SELECT id, push_token FROM usuarios WHERE rol = 'admin' AND push_token IS NOT NULL`
    );
    if (admins.length === 0) return;

    const mensajes = [];
    for (const admin of admins) {
      if (!Expo.isExpoPushToken(admin.push_token)) continue;
      mensajes.push({
        to: admin.push_token,
        sound: 'default',
        title: titulo,
        body: cuerpo,
      });
    }
    if (mensajes.length === 0) return;

    const chunks = expo.chunkPushNotifications(mensajes);
    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      tickets.forEach((ticket, i) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          const tokenInvalido = chunk[i].to;
          pool.query('UPDATE usuarios SET push_token = NULL WHERE push_token = ?', [tokenInvalido])
            .catch(err => console.error('Error limpiando push_token inválido:', err));
        }
      });
    }
  } catch (err) {
    console.error('Error notificarAdmins:', err);
  }
};

module.exports = { notificarAdmins };
