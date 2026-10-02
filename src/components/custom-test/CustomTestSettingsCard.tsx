import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, X } from "lucide-react";

interface CustomTestSettingsCardProps {
  isTimed: boolean;
  onTimedChange: (checked: boolean) => void;
  durationMinutes: number;
  durationPresets: readonly number[];
  isCustomDuration: boolean;
  customDurationInput: string;
  onPresetSelect: (minutes: number) => void;
  onCustomDurationChange: (value: string) => void;
  onEnableCustomDuration: () => void;
  onCancelCustomDuration: () => void;
  questionCountLimit: number | null;
  questionLimitPresets: readonly { label: string; value: number | null }[];
  onQuestionLimitChange: (limit: number | null) => void;
}

export function CustomTestSettingsCard({
  isTimed,
  onTimedChange,
  durationMinutes,
  durationPresets,
  isCustomDuration,
  customDurationInput,
  onPresetSelect,
  onCustomDurationChange,
  onEnableCustomDuration,
  onCancelCustomDuration,
  questionCountLimit,
  questionLimitPresets,
  onQuestionLimitChange,
}: CustomTestSettingsCardProps) {
  return (
    <Card className="border-border/70 bg-card shadow-2xs overflow-hidden">
      <CardContent className="p-3.5 sm:p-4 space-y-3">
        {/* Row 1: Duration Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground shrink-0">
            <Clock className="size-3.5 text-primary" />
            <span>Time Limit:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Untimed Toggle Button */}
            <Button
              type="button"
              variant={!isTimed ? "default" : "outline"}
              size="sm"
              onClick={() => onTimedChange(false)}
              className="text-xs font-medium"
            >
              Untimed
            </Button>

            {/* Timed Presets */}
            {durationPresets.map((mins) => {
              const isSelected = isTimed && !isCustomDuration && durationMinutes === mins;
              return (
                <Button
                  key={mins}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (!isTimed) onTimedChange(true);
                    onPresetSelect(mins);
                  }}
                  className="text-xs font-medium"
                >
                  {mins}m
                </Button>
              );
            })}

            {/* Custom Minutes Input / Button */}
            {!isCustomDuration ? (
              <Button
                type="button"
                variant={isTimed && isCustomDuration ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!isTimed) onTimedChange(true);
                  onEnableCustomDuration();
                }}
                className="text-xs font-medium border-dashed"
              >
                Custom...
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1 rounded-lg border border-primary bg-background px-1.5 h-7 shadow-2xs">
                <Input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="Mins"
                  value={customDurationInput}
                  onChange={(e) => onCustomDurationChange(e.target.value)}
                  className="h-6 w-11 px-1 text-xs font-semibold text-foreground bg-transparent border-0 focus-visible:ring-0 shadow-none text-center"
                  autoFocus
                />
                <span className="text-[10px] text-muted-foreground pr-0.5">m</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={onCancelCustomDuration}
                  className="size-5 text-muted-foreground hover:text-foreground"
                  aria-label="Cancel custom duration"
                >
                  <X className="size-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Compact Question Limit Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
          <span className="text-muted-foreground font-medium text-xs">
            Question Count:
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {questionLimitPresets.map((preset) => {
              const isSelected = questionCountLimit === preset.value;
              return (
                <Button
                  key={preset.label}
                  type="button"
                  variant={isSelected ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => onQuestionLimitChange(preset.value)}
                  className="text-[11px] font-medium"
                >
                  {preset.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
