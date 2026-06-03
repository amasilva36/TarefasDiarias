import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  const firstName = session.user?.name?.split(' ')[0] || "Visitante";

  return <DashboardClient firstName={firstName} />;
}
