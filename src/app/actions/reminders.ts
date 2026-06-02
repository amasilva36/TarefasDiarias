"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");
  return session.user.id;
}

export async function getRemindersAction() {
  const userId = await getUserId();
  const items = await prisma.reminder.findMany({
    where: { userId },
    orderBy: { nextDate: "asc" },
  });
  return items.map(r => ({
    ...r,
    nextDate: r.nextDate.toISOString(),
    createdAt: r.createdAt.toISOString()
  }));
}

export async function createReminderAction(data: { title: string; nextDate: string; repeat: string }) {
  const userId = await getUserId();
  const item = await prisma.reminder.create({
    data: {
      title: data.title,
      nextDate: new Date(data.nextDate),
      repeat: data.repeat,
      userId,
    }
  });
  revalidatePath("/lembretes");
  return { ...item, nextDate: item.nextDate.toISOString() };
}

export async function updateReminderAction(id: string, data: { title?: string; nextDate?: string; repeat?: string }) {
  const userId = await getUserId();
  const item = await prisma.reminder.update({
    where: { id, userId },
    data: {
      title: data.title,
      nextDate: data.nextDate ? new Date(data.nextDate) : undefined,
      repeat: data.repeat,
    }
  });
  revalidatePath("/lembretes");
  return { ...item, nextDate: item.nextDate.toISOString() };
}

export async function deleteReminderAction(id: string) {
  const userId = await getUserId();
  await prisma.reminder.delete({ where: { id, userId } });
  revalidatePath("/lembretes");
}
