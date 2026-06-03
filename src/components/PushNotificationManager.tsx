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
    // 1. Tenta obter um registo existente
    let reg = await navigator.serviceWorker.getRegistration('/');
    if (reg) return reg;

    // 2. Se não existir, tenta registar o sw.js manualmente
    reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    
    // 3. Aguarda que fique ativo (com timeout de 5s)
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]) as ServiceWorkerRegistration | null;
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

    // Timeout de segurança: se o SW demorar mais de 4s, mostra o botão na mesma
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
        alert("Erro de configuração: A chave de notificações não está configurada no servidor. Verifique as variáveis de ambiente na Vercel.");
        setLoading(false);
        return;
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("O teu browser não suporta notificações Push.");
        setLoading(false);
        return;
      }

      if (Notification.permission === 'denied') {
        alert("As notificações estão bloqueadas! Vai às definições do site no teu browser e 'Permite' as Notificações.");
        setLoading(false);
        return;
      }

      const result = await Notification.requestPermission();

      if (result === 'granted') {
        // Tenta obter ou registar o Service Worker diretamente
        const reg = await getOrRegisterSW();

        if (!reg) {
          alert("Erro: Não foi possível ativar o sistema de notificações. Tenta fechar a app e abrir novamente.");
          setLoading(false);
          return;
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        setSubscription(sub);
        setIsSubscribed(true);

        // Guarda na base de dados
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify(sub),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert("✅ Notificações ativadas com sucesso!");
        } else {
          const err = await response.text();
          alert("Erro ao guardar subscrição: " + err);
        }
      } else {
        alert("A permissão foi negada ou fechada. Não vais receber notificações.");
      }
    } catch (e: any) {
      console.error("Erro ao subscrever:", e);
      alert("Erro ao ativar: " + e.message);
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
