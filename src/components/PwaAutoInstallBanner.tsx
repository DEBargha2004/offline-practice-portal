import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { PwaInstallInstructionDialog } from "@/components/PwaInstallInstructionDialog";

export function PwaAutoInstallBanner() {
  const {
    isInstalled,
    isIOS,
    installApp,
    showIOSInstruction,
    setShowIOSInstruction,
    autoPromptVisible,
    dismissAutoPrompt,
  } = usePwaInstall();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInstalled) {
      setVisible(false);
      return;
    }

    if (autoPromptVisible) {
      setVisible(true);
    }
  }, [isInstalled, autoPromptVisible]);

  if (!visible || isInstalled) return null;

  return (
    <>
      <div className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:right-4 z-50 sm:max-w-sm rounded-xl border border-primary/30 bg-card/95 backdrop-blur-md p-3 shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-3 duration-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Download className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                Install IoT Practice
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Practice offline anytime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={async () => {
                await installApp();
                setVisible(false);
              }}
              className="h-7.5 px-3 text-xs font-semibold shadow-xs"
            >
              Install
            </Button>
            <button
              onClick={() => {
                dismissAutoPrompt();
                setVisible(false);
              }}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              title="Dismiss"
              aria-label="Dismiss installation prompt"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <PwaInstallInstructionDialog
        open={showIOSInstruction}
        onOpenChange={setShowIOSInstruction}
        isIOS={isIOS}
      />
    </>
  );
}
