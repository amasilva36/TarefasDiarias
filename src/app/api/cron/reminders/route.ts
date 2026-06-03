import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import webpush from "web-push";

export const dynamic = 'force-dynamic';

// Configura o web-push com as tuas chaves. O email serve como identificação (subject)
webpush.setVapidDetails(
  "mailto:app@omeudia.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

function getNextRepeatDate(currentDate: Date, repeat: string): Date {
  const next = new Date(currentDate);
  switch (repeat) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  return next;
}

export async function GET(req: Request) {
  // Esta API é suposta ser chamada pelo Vercel Cron. 
  // Em produção, devíamos validar um token secreto para segurança,
  // mas como os cron jobs no Vercel já injetam o header de segurança,
  // poderíamos validá-lo. Para já, vamos manter simples.
  
  try {
    const now = new Date();
    
    // Procura todos os lembretes que já passaram da hora e ainda não foram notificados
    const dueReminders = await prisma.reminder.findMany({
      where: {
        nextDate: { lte: now },
        notified: false,
      },
      include: {
        user: {
          include: {
            pushSubscriptions: true
          }
        }
      }
    });

    if (dueReminders.length === 0) {
      return NextResponse.json({ message: "No reminders to send." });
    }

    const notificationsPromises = [];

    for (const reminder of dueReminders) {
      // Cria a payload da notificação
      const payload = JSON.stringify({
        title: "O Meu Dia - Lembrete",
        body: reminder.title,
        url: "/lembretes", // Opcional: abre a página quando clicas
      });

      // Envia notificação para todos os telemóveis do utilizador
      for (const sub of reminder.user.pushSubscriptions) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const pushPromise = webpush
          .sendNotification(pushSubscription, payload)
          .catch(async (err) => {
            if (err.statusCode === 404 || err.statusCode === 410) {
              // Subscrição expirou ou utilizador removeu permissão. Apagar da DB.
              console.log("Subscription expired, deleting from DB:", sub.endpoint);
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
            } else {
              console.error("Error sending push:", err);
            }
          });

        notificationsPromises.push(pushPromise);
      }

      // Atualiza o lembrete
      if (reminder.repeat !== 'none') {
        const nextDate = getNextRepeatDate(reminder.nextDate, reminder.repeat);
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { nextDate, notified: false }
        });
      } else {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { notified: true }
        });
      }
    }

    await Promise.all(notificationsPromises);

    return NextResponse.json({ success: true, sent: dueReminders.length });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
