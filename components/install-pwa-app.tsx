"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "./ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPWAApp() {
  // PWA install states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if running as PWA
    if ((navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt fired');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Detect device types
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream);
    setIsAndroid(/Android/.test(userAgent));
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Error during install prompt:', error);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Install Trickipedia App</CardTitle>
        <CardDescription>
          Get the full PWA experience on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deferredPrompt ? (
          <Button onClick={handleInstallClick} className="w-full">
            Install App
          </Button>
        ) : isIOS ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To install on iOS:
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Tap the Share button in Safari</li>
              <li>Select &quot;Add to Home Screen&quot;</li>
              <li>Tap &quot;Add&quot; to install</li>
            </ol>
          </div>
        ) : isAndroid ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              To install on Android:
            </p>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>Tap the menu (⋮) in your browser</li>
              <li>Select &quot;Add to Home screen&quot; or &quot;Install app&quot;</li>
              <li>Follow the prompts to install</li>
            </ol>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            You can install this app as a PWA for a better experience. Look for
            an install option in your browser menu or address bar.
          </p>
        )}
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p>Debug info:</p>
            <p>Has prompt: {deferredPrompt ? 'Yes' : 'No'}</p>
            <p>Is iOS: {isIOS ? 'Yes' : 'No'}</p>
            <p>Is Android: {isAndroid ? 'Yes' : 'No'}</p>
            <p>Is installed: {isInstalled ? 'Yes' : 'No'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
