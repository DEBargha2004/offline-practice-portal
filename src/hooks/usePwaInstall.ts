import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://")
    );
  });
  const [showIOSInstruction, setShowIOSInstruction] = useState(false);
  const [autoPromptVisible, setAutoPromptVisible] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream;

  useEffect(() => {
    // If already installed, no prompt needed
    if (isInstalled) return;

    const isDismissed = sessionStorage.getItem("pwa_install_dismissed") === "true";

    // Media query listener for standalone mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setAutoPromptVisible(false);
      }
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    // Capture beforeinstallprompt event and automatically trigger prompt/banner
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      if (!isDismissed) {
        setAutoPromptVisible(true);
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setAutoPromptVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // On iOS Safari, display the prompt after a brief 1.5s delay if not dismissed
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS && !isDismissed) {
      iosTimer = setTimeout(() => {
        setAutoPromptVisible(true);
      }, 1500);
    }

    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isInstalled, isIOS]);

  const dismissAutoPrompt = useCallback(() => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setAutoPromptVisible(false);
  }, []);

  const installApp = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setAutoPromptVisible(false);
      }
      setDeferredPrompt(null);
      return choice.outcome;
    }

    if (isIOS) {
      setShowIOSInstruction(true);
      return "ios-instruction";
    }

    setShowIOSInstruction(true);
    return "manual-instruction";
  }, [deferredPrompt, isIOS]);

  return {
    isInstalled,
    isInstallable: !!deferredPrompt || isIOS,
    canPromptDirectly: !!deferredPrompt,
    isIOS,
    installApp,
    showIOSInstruction,
    setShowIOSInstruction,
    autoPromptVisible,
    dismissAutoPrompt,
  };
}
