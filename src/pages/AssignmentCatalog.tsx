import { Link } from "react-router-dom";
import { useAssignmentCatalogController } from "@/controllers/useAssignmentCatalogController";
import { AssignmentCard } from "@/components/assignment/AssignmentCard";
import { Search, CalendarCheck, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function AssignmentCatalog() {
  const {
    weeks,
    totalWeeks,
    searchQuery,
    setSearchQuery,
    weekStats,
    handleStartWeekTest,
    handleStartWeekRevision,
  } = useAssignmentCatalogController();

  // Calculate overall completed count and percentage
  const attemptedCount = Object.keys(weekStats).length;
  const progressPercent =
    totalWeeks > 0 ? Math.round((attemptedCount / totalWeeks) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Weekly Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Practice official NPTEL weekly assignments week by week, or use Revision mode to review answers.
          </p>
        </div>

        {/* Search & Custom Test Shortcut */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search assignments (e.g. Week 1)"
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
              <span>Custom Test</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="rounded-xl border border-border/60 bg-card p-3.5 sm:px-4 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <CalendarCheck className="size-4 text-primary shrink-0" />
            <span>
              Progress:{" "}
              <strong className="text-foreground font-semibold">
                {attemptedCount} of {totalWeeks}
              </strong>{" "}
              assignments completed
            </span>
          </div>
          <span className="font-semibold text-muted-foreground">
            {progressPercent}% Complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5 bg-muted/80" />
      </div>

      {/* Weeks Grid */}
      {weeks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {weeks.map((week) => {
            const stats = weekStats[week.chapter_number];
            return (
              <AssignmentCard
                key={week.chapter_number}
                week={week}
                bestScorePercentage={stats?.bestScore}
                attemptsCount={stats?.attemptsCount}
                onStartPractice={handleStartWeekTest}
                onStartRevision={handleStartWeekRevision}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
          <CalendarCheck className="size-8 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-foreground">No assignments found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            No assignment matches &ldquo;{searchQuery}&rdquo;. Try searching
            with &ldquo;Week 1&rdquo; or &ldquo;3&rdquo;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
