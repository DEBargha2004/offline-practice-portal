import type { Chapter, ChapterRangePreset } from "@/types";
import { ChapterSelectRow } from "./ChapterSelectRow";
import { WeekSelectRow } from "./WeekSelectRow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck2, BookOpen, Search, X } from "lucide-react";

interface ChapterSelectionSectionProps {
  chapters: Chapter[];
  weeks: Chapter[];
  filteredChapters: Chapter[];
  filteredWeeks: Chapter[];
  selectedChapters: Set<number>;
  selectedWeeks: Set<number>;
  selectedChapterCount: number;
  selectedWeekCount: number;
  selectedTotalCount: number;
  isAllChaptersSelected: boolean;
  isAllWeeksSelected: boolean;
  isAllSelected: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleChapter: (chapterNumber: number) => void;
  onToggleWeek: (weekNumber: number) => void;
  onSelectAllChapters: () => void;
  onClearAllChapters: () => void;
  onSelectAllWeeks: () => void;
  onClearAllWeeks: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  chapterRangePresets: readonly ChapterRangePreset[];
  weekRangePresets: readonly ChapterRangePreset[];
  onSelectRange: (from: number, to: number) => void;
  onSelectWeekRange: (from: number, to: number) => void;
}

export function ChapterSelectionSection({
  chapters,
  weeks,
  filteredChapters,
  filteredWeeks,
  selectedChapters,
  selectedWeeks,
  selectedChapterCount,
  selectedWeekCount,
  selectedTotalCount,
  isAllChaptersSelected,
  isAllWeeksSelected,
  isAllSelected,
  searchQuery,
  onSearchChange,
  onToggleChapter,
  onToggleWeek,
  onSelectAllChapters,
  onClearAllChapters,
  onSelectAllWeeks,
  onClearAllWeeks,
  onSelectAll,
  onClearAll,
  chapterRangePresets,
  weekRangePresets,
  onSelectRange,
  onSelectWeekRange,
}: ChapterSelectionSectionProps) {
  const hasNoResults = filteredWeeks.length === 0 && filteredChapters.length === 0;

  return (
    <div className="space-y-6">
      {/* Unified Search & Global Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search chapters or weekly assignments (e.g. Week 1, sensors, 12...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8.5 pl-8 pr-8 text-xs bg-card"
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

        <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="xs"
            onClick={onSelectAll}
            disabled={isAllSelected}
            className="h-8 text-xs font-medium px-2.5"
          >
            Select All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClearAll}
            disabled={selectedTotalCount === 0}
            className="h-8 text-xs text-muted-foreground hover:text-foreground px-2"
          >
            Clear All
          </Button>
        </div>
      </div>

      {hasNoResults ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
          <Search className="size-6 text-muted-foreground mx-auto" />
          <p className="text-xs sm:text-sm font-medium text-foreground">
            No chapters or weekly assignments match &ldquo;{searchQuery}&rdquo;
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
      ) : (
        <>
          {/* Section 1: Weekly Assignments */}
          {filteredWeeks.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck2 className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">
                    Weekly Assignments
                  </h2>
                  <Badge variant="outline" className="text-xs font-semibold ml-1">
                    {selectedWeekCount}/{weeks.length}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={onSelectAllWeeks}
                    disabled={isAllWeeksSelected}
                    className="h-7 text-xs font-medium px-2"
                  >
                    Select All Weeks
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onClearAllWeeks}
                    disabled={selectedWeekCount === 0}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-1.5"
                  >
                    Clear
                  </Button>

                  <div className="h-4 w-px bg-border/70 mx-0.5 hidden sm:block" />

                  {weekRangePresets.map((range) => (
                    <Button
                      key={range.label}
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onSelectWeekRange(range.from, range.to)}
                      className="h-7 px-2 text-[11px] font-medium shrink-0"
                    >
                      + {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredWeeks.map((week) => (
                  <WeekSelectRow
                    key={week.chapter_number}
                    week={week}
                    isSelected={selectedWeeks.has(week.chapter_number)}
                    onToggle={onToggleWeek}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Chapters */}
          {filteredChapters.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <h2 className="text-sm font-bold text-foreground">
                    Chapters
                  </h2>
                  <Badge variant="outline" className="text-xs font-semibold ml-1">
                    {selectedChapterCount}/{chapters.length}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={onSelectAllChapters}
                    disabled={isAllChaptersSelected}
                    className="h-7 text-xs font-medium px-2"
                  >
                    Select All Chapters
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={onClearAllChapters}
                    disabled={selectedChapterCount === 0}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground px-1.5"
                  >
                    Clear
                  </Button>

                  <div className="h-4 w-px bg-border/70 mx-0.5 hidden sm:block" />

                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredChapters.map((chapter) => (
                  <ChapterSelectRow
                    key={chapter.chapter_number}
                    chapter={chapter}
                    isSelected={selectedChapters.has(chapter.chapter_number)}
                    onToggle={onToggleChapter}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
