import type { Chapter, ChapterRangePreset } from "@/types";
import { ChapterSelectRow } from "./ChapterSelectRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, X } from "lucide-react";

interface ChapterSelectionSectionProps {
  chapters: Chapter[];
  filteredChapters: Chapter[];
  selectedChapters: Set<number>;
  selectedCount: number;
  isAllSelected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleChapter: (chapterNumber: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  chapterRangePresets: readonly ChapterRangePreset[];
  onSelectRange: (from: number, to: number) => void;
}

export function ChapterSelectionSection({
  chapters,
  filteredChapters,
  selectedChapters,
  selectedCount,
  isAllSelected,
  searchQuery,
  onSearchChange,
  onToggleChapter,
  onSelectAll,
  onClearAll,
  chapterRangePresets,
  onSelectRange,
}: ChapterSelectionSectionProps) {
  return (
    <div className="space-y-3">
      {/* Chapter Section Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">
            Chapters
          </h2>
          <Badge variant="outline" className="text-xs font-semibold ml-1">
            {selectedCount}/{chapters.length}
          </Badge>
        </div>

        {/* Fast Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={onSelectAll}
            disabled={isAllSelected}
            className="h-7 text-xs font-medium px-2.5"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClearAll}
            disabled={selectedCount === 0}
            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Unified Search & Quick Range Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Search Input using shadcn Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search chapters by title or # (e.g. 5, sensors, rfid...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 pr-8 text-xs bg-card"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground size-6"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </Button>
          )}
        </div>

        {/* Quick Range Chips using shadcn Button */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none shrink-0">
          {chapterRangePresets.map((range) => (
            <Button
              key={range.label}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onSelectRange(range.from, range.to)}
              className="h-7 px-2 text-[11px] font-medium shrink-0"
            >
              + {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chapter Grid */}
      {filteredChapters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
          {filteredChapters.map((chapter) => (
            <ChapterSelectRow
              key={chapter.chapter_number}
              chapter={chapter}
              isSelected={selectedChapters.has(chapter.chapter_number)}
              onToggle={onToggleChapter}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <BookOpen className="size-6 text-muted-foreground mx-auto" />
          <p className="text-xs sm:text-sm font-medium text-foreground">
            No chapters match &ldquo;{searchQuery}&rdquo;
          </p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onSearchChange("")}
            className="text-xs"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
