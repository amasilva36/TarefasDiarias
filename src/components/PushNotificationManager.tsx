"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getOrRegisterSW(): Promise<ServiceWorkerRegistration | null> {
  try {
    // Tenta obter registo existente
    const existing = await navigator.serviceWorker.getRegistration('/');
    if (existing) return existing;

    // Regista o sw.js e aguarda 3 segundos para ativar
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return reg;
  } catch (e) {
    console.error("Erro ao registar Service Worker:", e);
    return null;
  }
}

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setLoading(false);
      return;
    }

    // Timeout de segurança: se o SW demorar mais de 4s, mostra o botão
    const timeout = setTimeout(() => setLoading(false), 4000);

    navigator.serviceWorker.ready.then((reg) => {
      clearTimeout(timeout);
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscription(sub);
          setIsSubscribed(true);
        }
        setLoading(false);
      });
    }).catch(() => {
      clearTimeout(timeout);
      setLoading(false);
    });
  }, []);

  const subscribeButtonOnClick = async () => {
    setLoading(true);
    try {
      if (!publicVapidKey) {
        alert("❌ Erro: Chave VAPID não configurada no servidor.\nVerifica as variáveis de ambiente na Vercel.");
        setLoading(false);
        return;
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("❌ O teu browser não suporta notificações Push.");
        setLoading(false);
        return;
      }

      if (Notification.permission === 'denied') {
        alert("❌ Notificações bloqueadas!\nVai às definições do site no browser e permite as notificações.");
        setLoading(false);
        return;
      }

      const permResult = await Notification.requestPermission();
      if (permResult !== 'granted') {
        alert("⚠️ Permissão negada. Não vais receber notificações.");
        setLoading(false);
        return;
      }

      // Passo 1: obter o Service Worker
      alert("🔄 A ativar... (pode demorar alguns segundos)");
      const reg = await getOrRegisterSW();

      if (!reg) {
        alert("❌ Não foi possível iniciar o sistema de notificações.\nFecha a app completamente e tenta de novo.");
        setLoading(false);
        return;
      }

      // Passo 2: criar a subscrição push
      let sub: PushSubscription;
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
      } catch (subErr: any) {
        alert("❌ Erro ao criar subscrição push:\n" + subErr.message + "\n\nTenta fechar e abrir a app de novo.");
        setLoading(false);
        return;
      }

      setSubscription(sub);
      setIsSubscribed(true);

      // Passo 3: guardar na base de dados
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        alert("✅ Notificações ativadas com sucesso!\nVais receber avisos quando chegar a hora dos lembretes.");
      } else {
        const errText = await response.text();
        alert("⚠️ Subscrição criada mas erro ao guardar:\n" + errText);
      }
    } catch (e: any) {
      console.error("Erro ao subscrever:", e);
      alert("❌ Erro inesperado:\n" + (e.message || String(e)));
    }
    setLoading(false);
  };

  const unsubscribeButtonOnClick = async () => {
    setLoading(true);
    try {
      if (subscription) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("Erro ao cancelar subscrição:", e);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-sm text-slate-400">A verificar notificações...</div>;
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return <div className="text-sm text-slate-400">O teu browser não suporta notificações Push.</div>;
  }

  return (
    <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
      <div className="flex-1">
        <h4 className="font-medium text-amber-500 text-sm">Notificações no Telemóvel</h4>
        <p className="text-xs text-slate-400">
          {isSubscribed
            ? "Vais receber um aviso quando chegar a hora do lembrete."
            : "Ativa para receberes avisos mesmo com a app fechada."}
        </p>
      </div>
      <button
        onClick={isSubscribed ? unsubscribeButtonOnClick : subscribeButtonOnClick}
        className={`flex items-center justify-center p-2 rounded-full transition-colors ${
          isSubscribed
            ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
            : "bg-amber-500 text-slate-900 hover:bg-amber-400"
        }`}
        title={isSubscribed ? "Desativar" : "Ativar"}
        disabled={loading}
      >
        {isSubscribed ? <BellOff size={18} /> : <Bell size={18} />}
      </button>
    </div>
  );
}
