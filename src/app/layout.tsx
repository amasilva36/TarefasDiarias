import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { StatsBar } from "@/components/StatsBar";
import { AlertBanner } from "@/components/AlertBanner";
import { TasksProvider, RemindersProvider, MarketProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "O Meu Dia",
  description: "Organize as suas tarefas, lembretes e supermercado num só lugar.",
  manifest: "/manifest.json",
  themeColor: "#020817",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className="dark">
      <body className={inter.className}>
        <TasksProvider>
          <RemindersProvider>
            <MarketProvider>
              <div className="mx-auto max-w-[430px] min-h-screen relative shadow-2xl bg-background/95 backdrop-blur-3xl flex flex-col pb-16 overflow-hidden">
                <StatsBar />
                <AlertBanner />
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                  {children}
                </main>
                <BottomNav />
              </div>
            </MarketProvider>
          </RemindersProvider>
        </TasksProvider>
      </body>
    </html>
  );
}
