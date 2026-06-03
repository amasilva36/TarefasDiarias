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

export async function getTasksAction() {
  const userId = await getUserId();
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return tasks.map(t => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    dueDate: t.dueDate?.toISOString(),
    reminderDate: t.reminderDate?.toISOString(),
    urgent: t.urgent,
    category: t.category,
  }));
}

export async function createTaskAction(data: { title: string; category?: string; dueDate?: string; reminderDate?: string; urgent?: boolean }) {
  const userId = await getUserId();
  const task = await prisma.task.create({
    data: {
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : undefined,
      urgent: data.urgent || false,
      category: data.category,
      userId,
    }
  });
  revalidatePath("/");
  return {
    ...task,
    dueDate: task.dueDate?.toISOString(),
    reminderDate: task.reminderDate?.toISOString(),
  };
}

export async function updateTaskAction(id: string, data: { title?: string; category?: string; completed?: boolean; dueDate?: string; urgent?: boolean }) {
  const userId = await getUserId();
  const task = await prisma.task.update({
    where: { id, userId },
    data: {
      title: data.title,
      completed: data.completed,
      dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === "" ? null : undefined,
      urgent: data.urgent,
      category: data.category,
    }
  });
  revalidatePath("/");
  return task;
}

export async function deleteTaskAction(id: string) {
  const userId = await getUserId();
  await prisma.task.delete({ where: { id, userId } });
  revalidatePath("/");
}
