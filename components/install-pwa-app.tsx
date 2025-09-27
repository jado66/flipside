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
import {
  Smartphone,
  Download,
  Share,
  Plus,
  Menu,
  CheckCircle,
  Sparkles,
} from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPWAApp() {
  // PWA install states
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setIsInstalled(true);
    }

    // Check if running as PWA
    if ((navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      console.log("beforeinstallprompt fired");
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
      console.error("Error during install prompt:", error);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30 shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Install Trickipedia App
        </CardTitle>
        <CardDescription className="text-base">
          Get the full PWA experience with offline access and native features
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {deferredPrompt ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-sm font-medium">
                Ready to install! Tap below for instant access.
              </p>
            </div>
            <Button
              onClick={handleInstallClick}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App Now
            </Button>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Share className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-foreground">Install on iOS</h3>
            </div>

            <div className="space-y-3">
              {[
                { icon: Share, text: "Tap the Share button in Safari" },
                { icon: Plus, text: 'Select "Add to Home Screen"' },
                {
                  icon: CheckCircle,
                  text: 'Tap "Add" to complete installation',
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full mr-2">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isAndroid ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Menu className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-foreground">
                Install on Android
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { icon: Menu, text: "Tap the menu (⋮) in your browser" },
                {
                  icon: Download,
                  text: 'Select "Add to Home screen" or "Install app"',
                },
                {
                  icon: CheckCircle,
                  text: "Follow the prompts to complete installation",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <step.icon className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full mr-2">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto">
              <Download className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Install as PWA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can install this app as a PWA for a better experience. Look
                for an install option in your browser menu or address bar.
              </p>
            </div>
          </div>
        )}

        {/* Enhanced debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-muted/30 border border-muted rounded-lg">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Debug Information
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Has prompt:</span>
                <span
                  className={deferredPrompt ? "text-green-600" : "text-red-600"}
                >
                  {deferredPrompt ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Is iOS:</span>
                <span
                  className={isIOS ? "text-blue-600" : "text-muted-foreground"}
                >
                  {isIOS ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Is Android:</span>
                <span
                  className={
                    isAndroid ? "text-green-600" : "text-muted-foreground"
                  }
                >
                  {isAndroid ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Is installed:</span>
                <span
                  className={
                    isInstalled ? "text-green-600" : "text-muted-foreground"
                  }
                >
                  {isInstalled ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
