import { NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '../../firebase/admin';

// Initialize Firebase Admin
initAdmin();

const messaging = getMessaging();
const db = getFirestore();

export async function POST(request: Request) {
  try {
    const { eventId, title, body, scheduledTime } = await request.json();

    // Save the scheduled notification in Firestore
    await db.collection('scheduledNotifications').add({
      eventId,
      title,
      body,
      scheduledTime: new Date(scheduledTime).toISOString(),
      sent: false,
    });

    // For immediate notifications (when scheduledTime is current timestamp)
    const now = Date.now();
    if (Math.abs(scheduledTime - now) < 1000) { // Si la diferencia es menos de 1 segundo
      try {
        const message = {
          notification: {
            title,
            body,
          },
          topic: 'all' // Enviar a todos los dispositivos suscritos
        };

        await messaging.send(message);
      } catch (messagingError) {
        console.error('Error al enviar notificación inmediata:', messagingError);
        // Continuamos la ejecución incluso si falla el envío inmediato
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al programar la notificación:', error);
    return NextResponse.json(
      { error: 'Error al programar la notificación' },
      { status: 500 }
    );
  }
}
