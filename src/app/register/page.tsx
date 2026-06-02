"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await registerAction({ name, email, password });
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative bg-[#020817]">
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-[#020817] to-[#020817]"></div>
      
      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 mb-6 rounded-full overflow-hidden border-2 border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] bg-black flex items-center justify-center relative">
            <img src="/logo.jpg" alt="O Meu Dia Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
            Criar Registo
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Comece a organizar o seu dia</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-950/50 border border-red-900/50 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Nome (opcional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/30"
              placeholder="O seu nome"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/30"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-white/30"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50 mt-4"
          >
            {isLoading ? "A criar..." : "Criar Conta"}
          </button>
        </form>

        <div className="text-center text-sm text-white/50">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
