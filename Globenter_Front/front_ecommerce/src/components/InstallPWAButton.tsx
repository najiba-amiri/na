"use client";

import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi"; // React icon

// Type for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PWAInstallFloating() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isiOS, setIsiOS] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const isIOSDevice =
      /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
      !window.navigator.userAgent.includes("CriOS") &&
      !window.navigator.userAgent.includes("FxiOS");

    setIsiOS(isIOSDevice);

    const handler = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault();
      setDeferredPrompt(evt);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    console.log("User install outcome:", result.outcome);

    if (result.outcome === "accepted") {
      setIsVisible(false);
    }
  };

  // Hide if no prompt & not iOS
  if (!isVisible && !isiOS) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      {/* iOS Install Instructions */}
      {isiOS && (
        <div className="bg-background border rounded-xl shadow-lg p-4 mb-3 w-72">
          <h3 className="font-semibold mb-1">Add to Home Screen</h3>
          <p className="text-sm text-muted-foreground">
            To install this app, tap{" "}
            <span className="font-bold">Share</span> →{" "}
            <span className="font-bold">Add to Home Screen</span>.
          </p>
        </div>
      )}

      {/* Custom Install Button */}
      {!isiOS && (
        <button
          onClick={installApp}
          style={{
            backgroundColor: "#b16926",
          }}
          className="
            flex items-center gap-2
            text-white 
            font-medium 
            rounded-full 
            shadow-lg 
            px-6 
            py-5 
            text-base
            hover:opacity-90 
            active:scale-95
            transition
          "
        >
          <FiDownload className="h-5 w-5" />
          نصب اپلیکیشن
        </button>
      )}
    </div>
  );
}
