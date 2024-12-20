import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase/config";

const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error al solicitar permiso para notificaciones:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
});

export const scheduleNotification = async (event: {
  id: any;
  title: string;
  dateTime: string;
  type: string;
  details?: string;
}) => {
  const eventTime = new Date(event.dateTime).getTime();
  const notificationTime = eventTime - 15 * 60 * 1000; // 15 minutos antes
  const eventDate = new Date(event.dateTime);
  
  // Formatear la fecha para la notificación inmediata
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  const formattedDate = eventDate.toLocaleDateString('es-ES', options);

  try {
    // Programar la notificación para 15 minutos antes
    await fetch('/api/schedule-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: event.id,
        title: event.title,
        body: `Recordatorio: ${event.type === 'medication' ? 'Medicación' : 'Actividad física'} - ${event.details || ''}`,
        scheduledTime: notificationTime,
      }),
    });

    // Enviar notificación inmediata
    await fetch('/api/schedule-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId: `${event.id}-immediate`,
        title: "Nuevo evento registrado",
        body: `Recordatorio: Tiene un evento registrado para ${formattedDate}`,
        scheduledTime: Date.now(), // Enviar inmediatamente
      }),
    });
  } catch (error) {
    console.error('Error al programar la notificación:', error);
  }
};
