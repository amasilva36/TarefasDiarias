"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMarketItemsAction() {
  const items = await prisma.marketItem.findMany({
    orderBy: { createdAt: "asc" },
  });
  return items;
}

export async function createMarketItemAction(data: { title: string; category: string }) {
  const item = await prisma.marketItem.create({
    data: {
      title: data.title,
      category: data.category,
      bought: false,
    }
  });
  revalidatePath("/supermercado");
  return item;
}

export async function updateMarketItemAction(id: string, data: { title?: string; category?: string; bought?: boolean }) {
  const item = await prisma.marketItem.update({
    where: { id },
    data
  });
  revalidatePath("/supermercado");
  return item;
}

export async function deleteMarketItemAction(id: string) {
  await prisma.marketItem.delete({ where: { id } });
  revalidatePath("/supermercado");
}

export async function clearBoughtMarketItemsAction() {
  await prisma.marketItem.deleteMany({ where: { bought: true } });
  revalidatePath("/supermercado");
}

export async function clearAllMarketItemsAction() {
  await prisma.marketItem.deleteMany({});
  revalidatePath("/supermercado");
}
