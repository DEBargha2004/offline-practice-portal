import { Link } from "react-router-dom";
import type { TestSession } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowRight } from "lucide-react";

interface ActiveSessionNoticeProps {
  activeSession: TestSession | null;
  showDiscardDialog: boolean;
  onOpenDiscardDialogChange: (open: boolean) => void;
  onConfirmDiscard: () => void;
}

export function ActiveSessionNotice({
  activeSession,
  showDiscardDialog,
  onOpenDiscardDialogChange,
  onConfirmDiscard,
}: ActiveSessionNoticeProps) {
  const hasActive = activeSession && !activeSession.isCompleted;

  return (
    <>
      {/* Notice Banner */}
      {hasActive && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 sm:p-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <p className="text-foreground truncate">
              You have an unfinished test:{" "}
              <span className="font-semibold">{activeSession.title}</span>
            </p>
          </div>
          <Link
            to="/test"
            className="shrink-0 font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Resume</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      {/* Discard Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={onOpenDiscardDialogChange}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              Abandon active test session?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground">
              You currently have an in-progress test (&ldquo;{activeSession?.title}&rdquo;).
              Starting a new custom test will overwrite your saved progress for that session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs">Keep Existing</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            >
              Discard &amp; Start Custom Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
