import { NextResponse } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '../../firebase/admin';

export async function POST(request: Request) {
  try {
    initAdmin();
    const messaging = getMessaging();
    const db = getFirestore();

    const { eventId, title, body, scheduledTime } = await request.json();

    await db.collection('scheduledNotifications').add({
      eventId,
      title,
      body,
      scheduledTime: new Date(scheduledTime).toISOString(),
      sent: false,
    });

    const now = Date.now();
    const t =
      typeof scheduledTime === 'number'
        ? scheduledTime
        : new Date(scheduledTime).getTime();
    if (Math.abs(t - now) < 1000) {
      try {
        const message = {
          notification: {
            title,
            body,
          },
          topic: 'all',
        };

        await messaging.send(message);
      } catch (messagingError) {
        console.error('Error al enviar notificación inmediata:', messagingError);
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
