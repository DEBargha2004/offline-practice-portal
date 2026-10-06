import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevisionEyeButtonProps {
  showAnswers: boolean;
  onToggle: () => void;
  className?: string;
}

export function RevisionEyeButton({
  showAnswers,
  onToggle,
  className,
}: RevisionEyeButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={showAnswers ? "Hide answers" : "Show answers"}
      title={showAnswers ? "Hide answers (Space)" : "Show answers in green (Space)"}
      className={cn(
        "fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex size-16 sm:size-20 items-center justify-center rounded-full backdrop-blur-md cursor-pointer transition-all duration-300 select-none active:scale-95 shadow-lg hover:shadow-xl hover:scale-105",
        showAnswers
          ? "border-2 border-emerald-500/80 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-500/20 hover:bg-emerald-500/30"
          : "border border-border/80 bg-background/70 text-muted-foreground hover:text-foreground hover:bg-background/90",
        className
      )}
    >
      {showAnswers ? (
        <Eye className="size-8 sm:size-10 transition-transform duration-200" />
      ) : (
        <EyeOff className="size-8 sm:size-10 transition-transform duration-200" />
      )}
    </button>
  );
}
