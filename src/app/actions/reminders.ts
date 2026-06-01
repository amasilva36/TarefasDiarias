"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getRemindersAction() {
  const items = await prisma.reminder.findMany({
    orderBy: { nextDate: "asc" },
  });
  return items.map(r => ({
    ...r,
    nextDate: r.nextDate.toISOString(),
    createdAt: r.createdAt.toISOString()
  }));
}

export async function createReminderAction(data: { title: string; nextDate: string; repeat: string }) {
  const item = await prisma.reminder.create({
    data: {
      title: data.title,
      nextDate: new Date(data.nextDate),
      repeat: data.repeat,
    }
  });
  revalidatePath("/lembretes");
  return { ...item, nextDate: item.nextDate.toISOString() };
}

export async function updateReminderAction(id: string, data: { title?: string; nextDate?: string; repeat?: string }) {
  const item = await prisma.reminder.update({
    where: { id },
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
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/lembretes");
}
