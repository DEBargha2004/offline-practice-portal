import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface TestSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onConfirmSubmit: () => void;
}

export function TestSubmissionDialog({
  open,
  onOpenChange,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onConfirmSubmit,
}: TestSubmissionDialogProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Submit Test?
          </DialogTitle>
          <DialogDescription className="text-sm">
            Please review your progress before finishing this test attempt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-center">
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground">Answered</span>
              <p className="text-lg font-bold text-foreground">{answeredCount}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground">Unanswered</span>
              <p
                className={`text-lg font-bold ${
                  hasUnanswered ? "text-amber-500" : "text-foreground"
                }`}
              >
                {unansweredCount}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs text-muted-foreground">Flagged</span>
              <p className="text-lg font-bold text-amber-500">{flaggedCount}</p>
            </div>
          </div>

          {hasUnanswered ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
              <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                You still have <strong>{unansweredCount} unanswered questions</strong>.
                Unanswered questions receive zero points.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                Great job! You have answered all <strong>{totalQuestions} questions</strong>.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Keep Working
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onConfirmSubmit();
            }}
            className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold"
          >
            Submit Exam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
