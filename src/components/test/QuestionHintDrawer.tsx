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
  calculateChapterMatchScores,
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

  // Determine if question belongs to a week-based bank or session
  const isWeekMode = Boolean(
    mode === "week" ||
    question?.id?.startsWith("wk") ||
    (typeof question?.chapter_title === "string" && question.chapter_title.toLowerCase().startsWith("week"))
  );

  // Computed week number
  const computedWeekNumber = useMemo(() => {
    if (directWeekNumber && directWeekNumber > 0) return directWeekNumber;
    if (isWeekMode) {
      const qNum = question?.chapter_number || chapterNumber;
      return qNum && qNum > 0 && qNum <= 12 ? qNum : undefined;
    }
    const qNum = question?.chapter_number || chapterNumber;
    return qNum && qNum > 0 ? Math.ceil(qNum / 5) : undefined;
  }, [directWeekNumber, isWeekMode, question?.chapter_number, chapterNumber]);

  // Allowed chapter range for week: (week - 1) * 5 + 1 to week * 5
  const weekChapterRange = useMemo(() => {
    if (!computedWeekNumber) return [];
    const start = (computedWeekNumber - 1) * 5 + 1;
    const end = computedWeekNumber * 5;
    const list: number[] = [];
    for (let i = start; i <= end; i++) {
      list.push(i);
    }
    return list;
  }, [computedWeekNumber]);

  // Resolved single chapter number (for direct chapter questions)
  const directChapterNumber = useMemo(() => {
    if (isWeekMode) return undefined;
    const num = question?.chapter_number || chapterNumber;
    return num && num > 0 ? num : undefined;
  }, [isWeekMode, question?.chapter_number, chapterNumber]);

  // Selected chapter for tab viewing
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<number | undefined>(undefined);

  // Sync selected chapter when question or week changes
  useEffect(() => {
    if (directChapterNumber) {
      setSelectedChapterNumber(directChapterNumber);
    } else if (weekChapterRange.length > 0) {
      setSelectedChapterNumber(weekChapterRange[0]);
    } else {
      setSelectedChapterNumber(undefined);
    }
  }, [directChapterNumber, computedWeekNumber]);

  const [activeTab, setActiveTab] = useState<"smart" | "chapter" | "week">("smart");

  useEffect(() => {
    if (open) {
      setActiveTab("smart");
    }
  }, [open, question?.id]);

  useEffect(() => {
    getChapterNotesManifest()
      .then(setManifest)
      .catch((err) =>
        console.error("Failed to load notes manifest for hint", err),
      );
  }, []);

  const [chapterContents, setChapterContents] = useState<Record<number, string>>({});
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

        // Determine which chapters to fetch
        const chaptersToFetch = isWeekMode ? weekChapterRange : (directChapterNumber ? [directChapterNumber] : []);

        for (const chNum of chaptersToFetch) {
          promises.push(
            fetchChapterNoteContent(chNum, manifest || undefined)
              .then((text) => {
                if (isMounted) {
                  setChapterContents((prev) => ({ ...prev, [chNum]: text }));
                }
              })
              .catch(() => {
                // Ignore individual missing chapter notes
              })
          );
        }

        if (computedWeekNumber) {
          promises.push(
            fetchWeekNoteContent(computedWeekNumber, manifest || undefined)
              .then((text) => {
                if (isMounted) setWeekContent(text);
              })
              .catch(() => {
                // Ignore missing week note
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
    isWeekMode,
    directChapterNumber,
    computedWeekNumber,
    weekChapterRange,
    manifest,
  ]);

  // Extract top matching sections across all loaded notes
  const matchedHints: MatchedHint[] = useMemo(() => {
    if (!question) return [];

    const allChunks = [];

    // Chunks from week notes
    if (weekContent && computedWeekNumber) {
      allChunks.push(
        ...chunkMarkdownNotes(weekContent, "week", computedWeekNumber)
      );
    }

    // Chunks from all loaded constituent chapter notes
    for (const [chNumStr, content] of Object.entries(chapterContents)) {
      const chNum = parseInt(chNumStr, 10);
      if (content && chNum) {
        allChunks.push(
          ...chunkMarkdownNotes(content, "chapter", chNum)
        );
      }
    }

    if (!allChunks.length) return [];
    return findRelevantHintSections(question, allChunks, 2);
  }, [question, weekContent, chapterContents, computedWeekNumber]);

  // Calculate matching scores across all chapters in the week range
  const chapterMatchScores: Record<number, number> = useMemo(() => {
    if (!question || !isWeekMode || !weekChapterRange.length) return {};

    const constituentChunks = [];
    for (const chNum of weekChapterRange) {
      const content = chapterContents[chNum];
      if (content) {
        constituentChunks.push(...chunkMarkdownNotes(content, "chapter", chNum));
      }
    }

    if (!constituentChunks.length) return {};
    return calculateChapterMatchScores(question, constituentChunks);
  }, [question, isWeekMode, weekChapterRange, chapterContents]);

  // Find the chapter with highest match score
  const topMatchedChapterNumber = useMemo(() => {
    if (!isWeekMode || !weekChapterRange.length) return undefined;

    let bestNum = weekChapterRange[0];
    let highestScore = -1;

    for (const chNum of weekChapterRange) {
      const score = chapterMatchScores[chNum] || 0;
      if (score > highestScore) {
        highestScore = score;
        bestNum = chNum;
      }
    }

    return bestNum;
  }, [isWeekMode, weekChapterRange, chapterMatchScores]);

  // Automatically select the chapter with the most matching when scores are computed
  useEffect(() => {
    if (isWeekMode && topMatchedChapterNumber) {
      setSelectedChapterNumber(topMatchedChapterNumber);
    }
  }, [isWeekMode, topMatchedChapterNumber]);

  const activeChapterNumber = selectedChapterNumber || directChapterNumber;
  const currentChapterContent = activeChapterNumber ? chapterContents[activeChapterNumber] || "" : "";

  const currentChapterMeta = manifest?.chapters.find(
    (c) => c.chapterNumber === activeChapterNumber,
  );
  const currentWeekMeta = manifest?.weeks?.find(
    (w) => w.weekNumber === computedWeekNumber,
  );

  const displayTitle =
    activeTab === "week"
      ? `Week ${computedWeekNumber} Summary Notes`
      : activeTab === "chapter"
        ? currentChapterMeta?.title || chapterTitle || `Chapter ${activeChapterNumber || ""}`
        : "Concept Hint";

  const subtitle =
    activeTab === "week"
      ? currentWeekMeta
        ? `Lectures ${currentWeekMeta.startChapter}–${currentWeekMeta.endChapter}`
        : computedWeekNumber
          ? `Lectures ${(computedWeekNumber - 1) * 5 + 1}–${computedWeekNumber * 5}`
          : `Weekly Notes`
      : activeTab === "chapter"
        ? `Chapter ${activeChapterNumber || ""}`
        : isWeekMode && computedWeekNumber
          ? `Week ${computedWeekNumber} • Lectures ${(computedWeekNumber - 1) * 5 + 1}–${computedWeekNumber * 5}`
          : activeChapterNumber
            ? `Chapter ${activeChapterNumber}`
            : `Targeted reference for this question`;

  const renderSmartHints = () => {
    if (loading) {
      return (
        <div className="rounded-xl border border-border/70 bg-card p-10 text-center space-y-2.5 my-3">
          <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Finding relevant notes...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-xl border border-dashed border-border p-5 text-center space-y-2.5 my-3">
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
        <div className="space-y-3">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 text-center text-xs text-muted-foreground">
            No specific excerpt pinpointed. Browse the full summary note below.
          </div>
          {(currentChapterContent || weekContent) && (
            <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
              <MarkdownViewer content={currentChapterContent || weekContent} />
            </div>
          )}
        </div>
      );
    }

    const primaryHint = matchedHints[0];
    const secondaryHint = matchedHints[1];

    return (
      <div className="space-y-3">
        {/* Focused Key Excerpt */}
        <div className="rounded-xl border border-border/70 bg-card/70 p-4 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              {primaryHint.sectionTitle}
            </h4>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono shrink-0">
              {primaryHint.sourceType === "week" ? `Week ${primaryHint.sourceNumber}` : `Ch ${primaryHint.sourceNumber}`}
            </span>
          </div>

          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed pt-1">
            <MarkdownViewer content={primaryHint.excerpt} />
          </div>
        </div>

        {/* Secondary context if available */}
        {secondaryHint && (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">{secondaryHint.sectionTitle}</span>
              <span className="text-[10px] font-mono">
                {secondaryHint.sourceType === "week" ? `Week ${secondaryHint.sourceNumber}` : `Ch ${secondaryHint.sourceNumber}`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground/90 leading-relaxed pt-0.5">
              <MarkdownViewer content={secondaryHint.excerpt} />
            </div>
          </div>
        )}
      </div>
    );
  };

  const notesBody = (
    <div className="flex-1 overflow-y-auto px-1 sm:px-2 py-2 space-y-3">
      {/* Clean segmented tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg w-fit border border-border/60 text-xs">
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
            <span>Clue</span>
          </button>

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

          {activeChapterNumber && (
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
              <span>Chapter {activeChapterNumber}</span>
            </button>
          )}
        </div>

        {/* Minimal inline chapter pills in chapter view */}
        {isWeekMode && activeTab === "chapter" && weekChapterRange.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            {weekChapterRange.map((chNum) => {
              const isSelected = activeChapterNumber === chNum;
              return (
                <button
                  key={chNum}
                  type="button"
                  onClick={() => setSelectedChapterNumber(chNum)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs transition-all font-medium border",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-2xs"
                      : "bg-muted/40 hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/50"
                  )}
                >
                  Ch {chNum}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeTab === "smart" ? (
        renderSmartHints()
      ) : activeTab === "chapter" ? (
        loading && !currentChapterContent ? (
          <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3 my-4">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading chapter notes...</p>
          </div>
        ) : currentChapterContent ? (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5 shadow-2xs">
            <MarkdownViewer content={currentChapterContent} />
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No notes available for Chapter {activeChapterNumber}.
          </div>
        )
      ) : activeTab === "week" ? (
        loading && !weekContent ? (
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
            No notes available for Week {computedWeekNumber}.
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
