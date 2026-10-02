import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share, PlusSquare } from "lucide-react";

interface PwaInstallInstructionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isIOS?: boolean;
}

export function PwaInstallInstructionDialog({
  open,
  onOpenChange,
  isIOS = false,
}: PwaInstallInstructionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold">Install App</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isIOS ? (
              <span className="space-y-1.5 block">
                Tap <Share className="inline size-3 text-foreground align-middle" /> <strong>Share</strong> in Safari, then tap <PlusSquare className="inline size-3 text-foreground align-middle" /> <strong>Add to Home Screen</strong>.
              </span>
            ) : (
              <span>
                Use your browser address bar or menu to select <strong>Install App</strong>.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs font-semibold h-8"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
