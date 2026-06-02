"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerAction(data: { name: string; email: string; password: string }) {
  if (!data.email || !data.password) {
    throw new Error("Email e palavra-passe são obrigatórios");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error("Já existe um utilizador com este email");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword
    }
  });

  return { id: user.id, name: user.name, email: user.email };
}
