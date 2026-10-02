import { useChapterCatalogController } from "@/controllers/useChapterCatalogController";
import { ChapterCard } from "@/components/chapter/ChapterCard";
import { Search, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search chapters or #"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
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
