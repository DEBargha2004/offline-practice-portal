import { useChapterCatalogController } from "@/controllers/useChapterCatalogController";
import { ChapterCard } from "@/components/chapter/ChapterCard";
import { Link } from "react-router-dom";
import { Search, BookOpen, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChapterCatalog() {
  const {
    chapters,
    totalChapters,
    searchQuery,
    setSearchQuery,
    chapterStats,
    handleStartChapterTest,
  } = useChapterCatalogController();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Chapter Catalog
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from all {totalChapters} chapters in the IoT syllabus to practice topic by topic.
          </p>
        </div>

        {/* Search & Custom Test Shortcut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search chapters or #"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 pr-8 text-sm bg-card"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground size-6"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          <Link to="/custom-test">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold w-full sm:w-auto shrink-0 shadow-2xs"
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Multi-Chapter Test</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Chapters Grid */}
      {chapters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {chapters.map((chapter) => {
            const stats = chapterStats[chapter.chapter_number];
            return (
              <ChapterCard
                key={chapter.chapter_number}
                chapter={chapter}
                bestScorePercentage={stats?.bestScore}
                onStartPractice={handleStartChapterTest}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <BookOpen className="size-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground">No chapters found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No chapter matches &ldquo;{searchQuery}&rdquo;. Try searching by topic or chapter number.
          </p>
          <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
