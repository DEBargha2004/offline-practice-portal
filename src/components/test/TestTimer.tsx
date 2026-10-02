import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "cn";

interface TestTimerProps {
  timeLimitSeconds: number | null;
  elapsedSeconds: number;
  className?: string;
}

export function TestTimer({
  timeLimitSeconds,
  elapsedSeconds,
  className,
}: TestTimerProps) {
  // Untimed mode: simply display elapsed time
  if (timeLimitSeconds === null) {
    const formatElapsed = (total: number) => {
      const mins = Math.floor(total / 60);
      const secs = total % 60;
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-foreground",
          className
        )}
      >
        <Clock className="size-3.5 text-muted-foreground shrink-0" />
        <span>{formatElapsed(elapsedSeconds)}</span>
        <span className="text-[10px] text-muted-foreground hidden md:inline">(Untimed)</span>
      </div>
    );
  }

  // Timed mode: countdown
  const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const isLowTime = remainingSeconds <= 300; // 5 minutes or less
  const isCriticalTime = remainingSeconds <= 60; // 1 minute or less

  const formatCountdown = () => {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-mono font-bold transition-colors",
        isCriticalTime
          ? "border-destructive bg-destructive/10 text-destructive animate-pulse"
          : isLowTime
          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-background text-foreground",
        className
      )}
      title="Remaining time"
    >
      {isLowTime ? (
        <AlertTriangle className="size-3.5 shrink-0" />
      ) : (
        <Clock className="size-3.5 text-muted-foreground shrink-0" />
      )}
      <span>{formatCountdown()}</span>
      <span className="text-[10px] font-sans font-normal text-muted-foreground">left</span>
    </div>
  );
}
