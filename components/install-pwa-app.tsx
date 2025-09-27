"use client";
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
  // PWA install prompt listener

  // PWA install states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  // Detect iOS
  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
  }, []);

  return (
    <Card className="md:hidden">
      <CardHeader>
        <CardTitle>Install Trickipedia App</CardTitle>
        <CardDescription>
          Get the full PWA experience on your device
        </CardDescription>
      </CardHeader>
      <CardContent>
        {deferredPrompt ? (
          <Button
            onClick={async () => {
              deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              if (outcome === "accepted") {
                setDeferredPrompt(null);
              }
            }}
          >
            Install App
          </Button>
        ) : isIOS ? (
          <p className="text-sm text-muted-foreground">
            To install on iOS, tap the Share button in Safari and select
            &quot;Add to Home Screen&quot;.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            You can install this app as a PWA for a better experience. If the
            install prompt doesn&apos;t appear, try adding it from your browser
            menu.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
