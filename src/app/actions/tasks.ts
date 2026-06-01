"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTasksAction() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return tasks.map(t => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    dueDate: t.dueDate?.toISOString(),
    reminderDate: t.reminderDate?.toISOString(),
    urgent: t.urgent,
  }));
}

export async function createTaskAction(data: { title: string; dueDate?: string; reminderDate?: string; urgent?: boolean }) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      reminderDate: data.reminderDate ? new Date(data.reminderDate) : undefined,
      urgent: data.urgent || false,
    }
  });
  revalidatePath("/");
  return {
    ...task,
    dueDate: task.dueDate?.toISOString(),
    reminderDate: task.reminderDate?.toISOString(),
  };
}

export async function updateTaskAction(id: string, data: { title?: string; completed?: boolean; dueDate?: string; urgent?: boolean }) {
  const task = await prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      completed: data.completed,
      dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === "" ? null : undefined,
      urgent: data.urgent,
    }
  });
  revalidatePath("/");
  return task;
}

export async function deleteTaskAction(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}
