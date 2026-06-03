import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    // Check if subscription already exists
    const existingSub = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSub) {
      // Update existing if it belongs to someone else (or same user)
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: { userId: session.user.id, p256dh, auth },
      });
    } else {
      // Create new subscription
      await prisma.pushSubscription.create({
        data: {
          endpoint,
          p256dh,
          auth,
          userId: session.user.id,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        endpoint,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
