import { useState, useEffect, useMemo } from "react";
import {
  fetchChapterNoteContent,
  fetchWeekNoteContent,
  getChapterNotesManifest,
  type ChapterNotesManifest,
} from "@/services/chapterNotesService";
import {
  chunkMarkdownNotes,
  findRelevantHintSections,
  type MatchedHint,
} from "@/services/hintService";
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
import {
  Lightbulb,
  RotateCcw,
  BookOpen,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "cn";
import type { Question } from "@/types";

interface QuestionHintDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: Question;
  chapterNumber?: number;
  chapterTitle?: string;
  weekNumber?: number;
  mode?: "chapter" | "week" | "full_mock" | "custom";
}

export function QuestionHintDrawer({
  open,
  onOpenChange,
  question,
  chapterNumber,
  chapterTitle,
  weekNumber: directWeekNumber,
  mode,
}: QuestionHintDrawerProps) {
  const isMobile = useIsMobile();
  const [manifest, setManifest] = useState<ChapterNotesManifest | null>(null);

  // Derive target chapter and week numbers
  const effectiveChapterNumber =
    question?.chapter_number || chapterNumber;
  const resolvedChapterNumber =
    effectiveChapterNumber && effectiveChapterNumber > 0
      ? effectiveChapterNumber
      : undefined;

  const computedWeekNumber =
    directWeekNumber && directWeekNumber > 0
      ? directWeekNumber
      : mode === "week" && effectiveChapterNumber
        ? effectiveChapterNumber
        : resolvedChapterNumber
          ? Math.ceil(resolvedChapterNumber / 5)
          : undefined;

  const [activeTab, setActiveTab] = useState<"smart" | "chapter" | "week">("smart");
  const [showFullNotes, setShowFullNotes] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab("smart");
      setShowFullNotes(false);
    }
  }, [open, question?.id]);

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

  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadContent = async () => {
      try {
        const promises: Promise<unknown>[] = [];

        if (resolvedChapterNumber) {
          promises.push(
            fetchChapterNoteContent(
              resolvedChapterNumber,
              manifest || undefined,
            ).then((text) => {
              if (isMounted) setChapterContent(text);
            })
          );
        }

        if (computedWeekNumber) {
          promises.push(
            fetchWeekNoteContent(
              computedWeekNumber,
              manifest || undefined,
            ).then((text) => {
              if (isMounted) setWeekContent(text);
            })
          );
        }

        await Promise.all(promises);
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
    resolvedChapterNumber,
    computedWeekNumber,
    manifest,
  ]);

  // Extract top matching sections
  const matchedHints: MatchedHint[] = useMemo(() => {
    if (!question) return [];

    const allChunks = [];
    if (chapterContent && resolvedChapterNumber) {
      allChunks.push(
        ...chunkMarkdownNotes(chapterContent, "chapter", resolvedChapterNumber)
      );
    }
    if (weekContent && computedWeekNumber) {
      allChunks.push(
        ...chunkMarkdownNotes(weekContent, "week", computedWeekNumber)
      );
    }

    if (!allChunks.length) return [];
    return findRelevantHintSections(question, allChunks, 2);
  }, [question, chapterContent, weekContent, resolvedChapterNumber, computedWeekNumber]);

  const currentChapterMeta = manifest?.chapters.find(
    (c) => c.chapterNumber === resolvedChapterNumber,
  );
  const currentWeekMeta = manifest?.weeks?.find(
    (w) => w.weekNumber === computedWeekNumber,
  );

  const displayTitle =
    activeTab === "week"
      ? `Week ${computedWeekNumber} Summary Notes`
      : activeTab === "chapter"
        ? currentChapterMeta?.title || chapterTitle || `Chapter ${resolvedChapterNumber || ""}`
        : "Concept Hint";

  const subtitle =
    activeTab === "week"
      ? currentWeekMeta
        ? `Lectures ${currentWeekMeta.startChapter}–${currentWeekMeta.endChapter}`
        : `Weekly Notes`
      : activeTab === "chapter"
        ? `Chapter ${resolvedChapterNumber}`
        : `Targeted reference for this question`;

  const renderSmartHints = () => {
    if (loading) {
      return (
        <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3 my-4">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Finding relevant notes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-dashed border-border p-6 text-center space-y-2.5 my-4">
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
            }}
            className="gap-1.5 h-8 text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Retry</span>
          </Button>
        </div>
      );
    }

    if (!matchedHints.length) {
      return (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-card/60 p-5 text-center text-xs text-muted-foreground">
            No specific excerpt pinpointed. Browse the full chapter note below.
          </div>
          {chapterContent && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
              <MarkdownViewer content={chapterContent} />
            </div>
          )}
        </div>
      );
    }

    const primaryHint = matchedHints[0];
    const secondaryHint = matchedHints[1];

    return (
      <div className="space-y-3.5">
        {/* Primary Concept Spotlight */}
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/15 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              Focus Concept
            </span>
            {primaryHint.parentHeading && (
              <span className="text-[11px] text-muted-foreground">
                {primaryHint.parentHeading}
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold text-foreground">
            {primaryHint.sectionTitle}
          </h4>

          <div className="text-xs sm:text-sm text-foreground/90 bg-background/85 rounded-lg p-3.5 border border-border/50 leading-relaxed shadow-2xs">
            <MarkdownViewer content={primaryHint.excerpt} />
          </div>
        </div>

        {/* Secondary section if directly relevant */}
        {secondaryHint && (
          <div className="rounded-xl border border-border/60 bg-card p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span>{secondaryHint.sectionTitle}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {secondaryHint.sourceType} {secondaryHint.sourceNumber}
              </span>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              <MarkdownViewer content={secondaryHint.excerpt} />
            </div>
          </div>
        )}

        {/* Expandable full lecture note */}
        {chapterContent && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullNotes(!showFullNotes)}
              className="w-full justify-between text-xs text-muted-foreground hover:text-foreground h-8 px-2"
            >
              <span>
                {showFullNotes
                  ? "Hide Full Chapter Notes"
                  : `Expand Full Chapter ${resolvedChapterNumber || ""} Notes`}
              </span>
              {showFullNotes ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>

            {showFullNotes && (
              <div className="mt-2.5 rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
                <MarkdownViewer content={chapterContent} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const notesBody = (
    <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2.5 space-y-3.5">
      {/* Clean segmented tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg w-fit border border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("smart")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all",
            activeTab === "smart"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Relevant Clue</span>
        </button>

        {resolvedChapterNumber && (
          <button
            type="button"
            onClick={() => setActiveTab("chapter")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all",
              activeTab === "chapter"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="size-3.5" />
            <span>Chapter {resolvedChapterNumber}</span>
          </button>
        )}

        {computedWeekNumber && (
          <button
            type="button"
            onClick={() => setActiveTab("week")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all",
              activeTab === "week"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="size-3.5" />
            <span>Week {computedWeekNumber}</span>
          </button>
        )}
      </div>

      {activeTab === "smart" ? (
        renderSmartHints()
      ) : activeTab === "chapter" ? (
        loading ? (
          <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3 my-4">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading chapter notes...</p>
          </div>
        ) : chapterContent ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
            <MarkdownViewer content={chapterContent} />
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No notes available for this chapter.
          </div>
        )
      ) : activeTab === "week" ? (
        loading ? (
          <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3 my-4">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading week notes...</p>
          </div>
        ) : weekContent ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
            <MarkdownViewer content={weekContent} />
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No notes available for this week.
          </div>
        )
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[85vh] flex flex-col p-4">
          <DrawerHeader className="text-left px-1 pb-2.5 border-b border-border/60">
            <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
              <Lightbulb className="size-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
              <span>Hint</span>
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
        className="w-full sm:min-w-xl md:min-w-2xl lg:min-w-3xl flex flex-col p-5 gap-2.5"
      >
        <SheetHeader className="px-0 pb-2.5 border-b border-border/60 text-left">
          <div className="flex items-center gap-1.5 text-amber-500 font-medium text-xs">
            <Lightbulb className="size-3.5 shrink-0 fill-amber-500/20 text-amber-500" />
            <span>Hint</span>
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
