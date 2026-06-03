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

export default function PushNotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }
  }, []);

  const subscribeButtonOnClick = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      if (result === 'granted' && registration) {
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });
        
        setSubscription(sub);
        setIsSubscribed(true);
        
        // Save to our DB
        await fetch('/api/push/subscribe', {
          method: 'POST',
          body: JSON.stringify(sub),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        alert("Permissão para notificações negada.");
      }
    } catch (e) {
      console.error("Erro ao subscrever:", e);
      alert("Erro ao subscrever. Tenta novamente.");
    }
    setLoading(false);
  };

  const unsubscribeButtonOnClick = async () => {
    setLoading(true);
    try {
      if (subscription) {
        // Remove from DB first
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        // Unsubscribe from browser
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
      >
        {isSubscribed ? <BellOff size={18} /> : <Bell size={18} />}
      </button>
    </div>
  );
}
