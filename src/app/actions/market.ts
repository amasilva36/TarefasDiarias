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

export async function getMarketItemsAction() {
  const userId = await getUserId();
  const items = await prisma.marketItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return items;
}

export async function createMarketItemAction(data: { title: string; category: string }) {
  const userId = await getUserId();
  const item = await prisma.marketItem.create({
    data: {
      title: data.title,
      category: data.category,
      bought: false,
      userId,
    }
  });
  revalidatePath("/supermercado");
  return item;
}

export async function updateMarketItemAction(id: string, data: { title?: string; category?: string; bought?: boolean }) {
  const userId = await getUserId();
  const item = await prisma.marketItem.update({
    where: { id, userId },
    data
  });
  revalidatePath("/supermercado");
  return item;
}

export async function deleteMarketItemAction(id: string) {
  const userId = await getUserId();
  await prisma.marketItem.delete({ where: { id, userId } });
  revalidatePath("/supermercado");
}

export async function clearBoughtMarketItemsAction() {
  const userId = await getUserId();
  await prisma.marketItem.deleteMany({ where: { bought: true, userId } });
  revalidatePath("/supermercado");
}

export async function clearAllMarketItemsAction() {
  const userId = await getUserId();
  await prisma.marketItem.deleteMany({ where: { userId } });
  revalidatePath("/supermercado");
}
