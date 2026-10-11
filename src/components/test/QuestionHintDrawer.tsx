import { useState, useEffect } from "react";
import {
  fetchChapterNoteContent,
  fetchWeekNoteContent,
  getChapterNotesManifest,
  type ChapterNotesManifest,
} from "@/services/chapterNotesService";
import { MarkdownViewer } from "@/components/notes/MarkdownViewer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Lightbulb, RotateCcw, BookOpen, Layers } from "lucide-react";
import { cn } from "cn";

interface QuestionHintDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapterNumber?: number;
  chapterTitle?: string;
  weekNumber?: number;
  mode?: "chapter" | "week" | "full_mock" | "custom";
}

export function QuestionHintDrawer({
  open,
  onOpenChange,
  chapterNumber,
  chapterTitle,
  weekNumber: directWeekNumber,
  mode,
}: QuestionHintDrawerProps) {
  const isMobile = useIsMobile();
  const [manifest, setManifest] = useState<ChapterNotesManifest | null>(null);

  // Compute resolved chapter and week numbers
  // If in week mode and weekNumber isn't direct, or vice versa
  const resolvedChapterNumber =
    chapterNumber && chapterNumber > 0 ? chapterNumber : undefined;

  // Calculate week number if not directly provided (chapters 1..60, 5 per week)
  const computedWeekNumber =
    directWeekNumber && directWeekNumber > 0
      ? directWeekNumber
      : mode === "week" && chapterNumber
        ? chapterNumber
        : resolvedChapterNumber
          ? Math.ceil(resolvedChapterNumber / 5)
          : undefined;

  const hasBoth = Boolean(resolvedChapterNumber && computedWeekNumber);
  const [activeTab, setActiveTab] = useState<"chapter" | "week">("chapter");

  useEffect(() => {
    if (mode === "week" && computedWeekNumber) {
      setActiveTab("week");
    } else {
      setActiveTab("chapter");
    }
  }, [mode, resolvedChapterNumber, computedWeekNumber]);

  // Load manifest once
  useEffect(() => {
    getChapterNotesManifest()
      .then(setManifest)
      .catch((err) =>
        console.error("Failed to load notes manifest for hint", err),
      );
  }, []);

  const [chapterContent, setChapterContent] = useState<string>("");
  const [weekContent, setWeekContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeTargetType =
    !resolvedChapterNumber && computedWeekNumber
      ? "week"
      : !computedWeekNumber && resolvedChapterNumber
        ? "chapter"
        : activeTab;

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        if (activeTargetType === "week" && computedWeekNumber) {
          const text = await fetchWeekNoteContent(
            computedWeekNumber,
            manifest || undefined,
          );
          if (isMounted) setWeekContent(text);
        } else if (resolvedChapterNumber) {
          const text = await fetchChapterNoteContent(
            resolvedChapterNumber,
            manifest || undefined,
          );
          if (isMounted) setChapterContent(text);
        } else if (computedWeekNumber) {
          const text = await fetchWeekNoteContent(
            computedWeekNumber,
            manifest || undefined,
          );
          if (isMounted) setWeekContent(text);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load reference summary notes.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [
    open,
    activeTargetType,
    resolvedChapterNumber,
    computedWeekNumber,
    manifest,
  ]);

  const currentChapterMeta = manifest?.chapters.find(
    (c) => c.chapterNumber === resolvedChapterNumber,
  );
  const currentWeekMeta = manifest?.weeks?.find(
    (w) => w.weekNumber === computedWeekNumber,
  );

  const displayTitle =
    activeTargetType === "week"
      ? `Week ${computedWeekNumber} Summary Notes`
      : currentChapterMeta?.title ||
        chapterTitle ||
        `Chapter ${resolvedChapterNumber || ""}`;

  const subtitle =
    activeTargetType === "week"
      ? currentWeekMeta
        ? `Lectures ${currentWeekMeta.startChapter}–${currentWeekMeta.endChapter} · ${currentWeekMeta.readingTime} read`
        : `Assignment & Weekly Revision Notes`
      : `Chapter ${resolvedChapterNumber} · ${currentChapterMeta?.readingTime || "3 min"} read`;

  const activeContent =
    activeTargetType === "week" ? weekContent : chapterContent;

  const notesBody = (
    <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-3 space-y-4">
      {hasBoth && (
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg w-fit border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("chapter")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === "chapter"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Chapter {resolvedChapterNumber}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("week")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === "week"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-3.5" />
            <span>Week {computedWeekNumber}</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3 my-4">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">
            Loading summary notes...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3 my-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
              if (activeTargetType === "week" && computedWeekNumber) {
                fetchWeekNoteContent(computedWeekNumber)
                  .then(setWeekContent)
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              } else if (resolvedChapterNumber) {
                fetchChapterNoteContent(resolvedChapterNumber)
                  .then(setChapterContent)
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              }
            }}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      ) : activeContent ? (
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-6 shadow-2xs">
          <MarkdownViewer content={activeContent} />
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No notes available for this topic.
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[88vh] flex flex-col p-4">
          <DrawerHeader className="text-left px-1 pb-3 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
              <Lightbulb className="size-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
              <span>Reference Notes</span>
            </div>
            <DrawerTitle className="text-base font-bold truncate mt-0.5">
              {displayTitle}
            </DrawerTitle>
            <DrawerDescription className="text-xs text-muted-foreground">
              {subtitle}
            </DrawerDescription>
          </DrawerHeader>
          {notesBody}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:min-w-2xl md:min-w-3xl lg:min-w-4xl flex flex-col p-6 gap-3"
      >
        <SheetHeader className="px-0 pb-3 border-b border-border/60 text-left">
          <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
            <Lightbulb className="size-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
            <span>Reference Notes</span>
          </div>
          <SheetTitle className="text-lg font-bold break-words leading-tight mt-0.5">
            {displayTitle}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {subtitle}
          </SheetDescription>
        </SheetHeader>
        {notesBody}
      </SheetContent>
    </Sheet>
  );
}
