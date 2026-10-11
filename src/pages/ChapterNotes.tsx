import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getChapterNotesManifest,
  fetchChapterNoteContent,
  fetchWeekNoteContent,
  preloadAdjacentChapterNotes,
  type ChapterNoteMeta,
  type WeekNoteMeta,
} from "@/services/chapterNotesService";
import { MarkdownViewer } from "@/components/notes/MarkdownViewer";
import { ChapterListNav } from "@/components/notes/ChapterListNav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Eye,
  Sparkles,
  List,
} from "lucide-react";

interface ChapterNotesProps {
  isWeekMode?: boolean;
}

export function ChapterNotes({ isWeekMode = false }: ChapterNotesProps) {
  const { chapterNumber: chapterParam, weekNumber: weekParam } = useParams<{
    chapterNumber?: string;
    weekNumber?: string;
  }>();
  const navigate = useNavigate();

  const activeIdParam = isWeekMode ? weekParam : chapterParam;
  const initialId = activeIdParam ? parseInt(activeIdParam, 10) : 1;

  const [activeNumber, setActiveNumber] = useState<number>(
    isNaN(initialId) ? 1 : initialId
  );
  const [chaptersManifest, setChaptersManifest] = useState<ChapterNoteMeta[]>([]);
  const [weeksManifest, setWeeksManifest] = useState<WeekNoteMeta[]>([]);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Separate open states for drawer (mobile) and sheet (desktop)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (activeIdParam) {
      const parsed = parseInt(activeIdParam, 10);
      if (!isNaN(parsed) && parsed !== activeNumber) {
        setActiveNumber(parsed);
      }
    }
  }, [activeIdParam]);

  useEffect(() => {
    getChapterNotesManifest()
      .then((data) => {
        setChaptersManifest(data.chapters || []);
        setWeeksManifest(data.weeks || []);
      })
      .catch((err) => {
        console.error("Failed to fetch notes manifest", err);
      });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const fetcher = isWeekMode
      ? fetchWeekNoteContent(activeNumber)
      : fetchChapterNoteContent(activeNumber);

    fetcher
      .then((text) => {
        if (!isCancelled) {
          setContent(text);
          setLoading(false);
          if (!isWeekMode) {
            preloadAdjacentChapterNotes(activeNumber);
          }
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(
            err.message ||
              `Failed to load ${isWeekMode ? "week" : "chapter"} notes.`
          );
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeNumber, isWeekMode]);

  const currentChapterMeta = chaptersManifest.find(
    (c) => c.chapterNumber === activeNumber
  );
  const currentWeekMeta = weeksManifest.find(
    (w) => w.weekNumber === activeNumber
  );

  const totalCount = isWeekMode
    ? weeksManifest.length || 12
    : chaptersManifest.length || 60;

  const handleSelectNote = (num: number) => {
    setActiveNumber(num);
    setDrawerOpen(false);
    setSheetOpen(false);
    navigate(isWeekMode ? `/notes/week/${num}` : `/notes/${num}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartPractice = () => {
    if (isWeekMode) {
      navigate(`/test?mode=week&id=${activeNumber}&count=0&timed=false`);
    } else {
      navigate(`/test?mode=chapter&id=${activeNumber}&count=0&timed=false`);
    }
  };

  const handleStartRevision = () => {
    if (isWeekMode) {
      navigate(`/revision?mode=week&id=${activeNumber}`);
    } else {
      navigate(`/revision?mode=chapter&id=${activeNumber}`);
    }
  };

  const pageTitle = isWeekMode
    ? `Week ${activeNumber}`
    : currentChapterMeta
    ? currentChapterMeta.title
    : `Chapter ${activeNumber}`;

  const readingTime = isWeekMode
    ? currentWeekMeta?.readingTime
    : currentChapterMeta?.readingTime;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Standard Platform Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link to={isWeekMode ? "/assignments" : "/chapters"}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 -ml-2 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>{isWeekMode ? "Weekly Assignments" : "Chapter Catalog"}</span>
              </Button>
            </Link>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground break-words leading-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {isWeekMode && currentWeekMeta
                ? `Lectures ${currentWeekMeta.startChapter}–${currentWeekMeta.endChapter}`
                : "Summary notes"}
            </span>
            {readingTime && (
              <>
                <span className="text-muted-foreground/50 hidden xs:inline">·</span>
                <span>{readingTime} read</span>
              </>
            )}
          </p>
        </div>

        {/* Action Controls & Responsive Chapter/Week Navigation Trigger */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end sm:justify-start shrink-0">
          {/* Small screens: Drawer Trigger */}
          <div className="block sm:hidden flex-1 xs:flex-none">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger
                render={
                  <Button variant="outline" size="sm" className="h-9 w-full xs:w-auto gap-1.5 text-xs font-medium px-2.5">
                    <List className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{isWeekMode ? "Weeks" : "Chapters"}</span>
                  </Button>
                }
              />
              <DrawerContent className="h-[80vh] flex flex-col p-4">
                <DrawerHeader className="text-left px-0 pb-2">
                  <DrawerTitle>{isWeekMode ? "All Weeks" : "All Chapters"}</DrawerTitle>
                  <DrawerDescription>
                    Select any {isWeekMode ? "week" : "chapter"} to read its summary notes
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 overflow-hidden pt-2">
                  <ChapterListNav
                    manifest={chaptersManifest}
                    weeks={weeksManifest}
                    mode={isWeekMode ? "week" : "chapter"}
                    activeChapter={activeNumber}
                    onSelectChapter={handleSelectNote}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Large screens: Sheet Trigger */}
          <div className="hidden sm:block">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger
                render={
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium">
                    <BookOpen className="size-3.5 text-muted-foreground shrink-0" />
                    <span>{isWeekMode ? "Weeks List" : "Chapters List"}</span>
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[380px] sm:max-w-md flex flex-col p-6">
                <SheetHeader className="px-0 pb-2">
                  <SheetTitle>{isWeekMode ? "All Weeks" : "All Chapters"}</SheetTitle>
                  <SheetDescription>
                    Browse and jump to any {isWeekMode ? "week" : "chapter"} summary notes
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-hidden pt-2">
                  <ChapterListNav
                    manifest={chaptersManifest}
                    weeks={weeksManifest}
                    mode={isWeekMode ? "week" : "chapter"}
                    activeChapter={activeNumber}
                    onSelectChapter={handleSelectNote}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleStartRevision}
            className="h-9 px-2.5 text-xs font-medium gap-1.5 flex-1 xs:flex-none text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            title="Revise questions with answers"
          >
            <Eye className="size-3.5 shrink-0" />
            <span>Revise</span>
          </Button>

          <Button
            size="sm"
            onClick={handleStartPractice}
            className="h-9 px-2.5 text-xs font-semibold gap-1.5 flex-1 xs:flex-none"
            title={isWeekMode ? "Practice week questions" : "Practice chapter questions"}
          >
            <Sparkles className="size-3.5 shrink-0" />
            <span>Practice</span>
          </Button>
        </div>
      </div>

      {/* Main Reading Surface */}
      <div className="space-y-6">
        {loading ? (
          <div className="rounded-xl border border-border/70 bg-card p-12 text-center space-y-3">
            <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">
              Loading {isWeekMode ? "week" : "chapter"} notes...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
            <h3 className="font-bold text-foreground">Failed to load notes</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectNote(activeNumber)}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border/70 bg-card p-6 sm:p-8 shadow-xs">
            <MarkdownViewer content={content} />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={activeNumber <= 1}
            onClick={() => handleSelectNote(activeNumber - 1)}
            className="h-9 text-xs gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            <span>Previous {isWeekMode ? "Week" : "Chapter"}</span>
          </Button>

          <span className="text-xs text-muted-foreground font-medium">
            {isWeekMode ? `Week ${activeNumber} of ${totalCount}` : `Chapter ${activeNumber} of ${totalCount}`}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={activeNumber >= totalCount}
            onClick={() => handleSelectNote(activeNumber + 1)}
            className="h-9 text-xs gap-1.5"
          >
            <span>Next {isWeekMode ? "Week" : "Chapter"}</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChapterNotes;
