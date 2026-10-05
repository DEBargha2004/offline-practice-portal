import { useCustomTestController } from "@/controllers/useCustomTestController";
import { CustomTestSettingsCard } from "@/components/custom-test/CustomTestSettingsCard";
import { ChapterSelectionSection } from "@/components/custom-test/ChapterSelectionSection";
import { CustomTestBottomBar } from "@/components/custom-test/CustomTestBottomBar";
import { ActiveSessionNotice } from "@/components/custom-test/ActiveSessionNotice";

export function CustomTest() {
  const {
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
    setSearchQuery,
    isTimed,
    setIsTimed,
    durationMinutes,
    durationPresets,
    isCustomDuration,
    customDurationInput,
    handlePresetDurationSelect,
    handleCustomDurationChange,
    enableCustomDuration,
    cancelCustomDuration,
    questionCountLimit,
    setQuestionCountLimit,
    questionLimitPresets,
    chapterRangePresets,
    weekRangePresets,
    totalAvailableQuestions,
    targetQuestionCount,
    toggleChapter,
    toggleWeek,
    selectAllChapters,
    clearAllChapters,
    selectAllWeeks,
    clearAllWeeks,
    selectAll,
    clearAll,
    selectRange,
    selectWeekRange,
    handleStartTest,
    activeSession,
    showDiscardDialog,
    setShowDiscardDialog,
    confirmDiscardAndStart,
  } = useCustomTestController();

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 pb-24 sm:pb-24">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-border/60 pb-3.5">
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
          Custom Test
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Select chapters, weekly assignments, and set your preferred duration to practice.
        </p>
      </div>

      {/* Active Session Warning Banner & Overwrite Dialog */}
      <ActiveSessionNotice
        activeSession={activeSession}
        showDiscardDialog={showDiscardDialog}
        onOpenDiscardDialogChange={setShowDiscardDialog}
        onConfirmDiscard={confirmDiscardAndStart}
      />

      {/* Timing and Question Limit Configuration */}
      <CustomTestSettingsCard
        isTimed={isTimed}
        onTimedChange={setIsTimed}
        durationMinutes={durationMinutes}
        durationPresets={durationPresets}
        isCustomDuration={isCustomDuration}
        customDurationInput={customDurationInput}
        onPresetSelect={handlePresetDurationSelect}
        onCustomDurationChange={handleCustomDurationChange}
        onEnableCustomDuration={enableCustomDuration}
        onCancelCustomDuration={cancelCustomDuration}
        questionCountLimit={questionCountLimit}
        questionLimitPresets={questionLimitPresets}
        onQuestionLimitChange={setQuestionCountLimit}
      />

      {/* Unified Content Selection & Filter Controls */}
      <ChapterSelectionSection
        chapters={chapters}
        weeks={weeks}
        filteredChapters={filteredChapters}
        filteredWeeks={filteredWeeks}
        selectedChapters={selectedChapters}
        selectedWeeks={selectedWeeks}
        selectedChapterCount={selectedChapterCount}
        selectedWeekCount={selectedWeekCount}
        selectedTotalCount={selectedTotalCount}
        isAllChaptersSelected={isAllChaptersSelected}
        isAllWeeksSelected={isAllWeeksSelected}
        isAllSelected={isAllSelected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleChapter={toggleChapter}
        onToggleWeek={toggleWeek}
        onSelectAllChapters={selectAllChapters}
        onClearAllChapters={clearAllChapters}
        onSelectAllWeeks={selectAllWeeks}
        onClearAllWeeks={clearAllWeeks}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        chapterRangePresets={chapterRangePresets}
        weekRangePresets={weekRangePresets}
        onSelectRange={selectRange}
        onSelectWeekRange={selectWeekRange}
      />

      {/* Docked / Sticky Bottom Launch Action Bar */}
      <CustomTestBottomBar
        selectedChapterCount={selectedChapterCount}
        selectedWeekCount={selectedWeekCount}
        selectedCount={selectedTotalCount}
        targetQuestionCount={targetQuestionCount}
        totalAvailableQuestions={totalAvailableQuestions}
        isTimed={isTimed}
        durationMinutes={durationMinutes}
        onStartTest={handleStartTest}
      />
    </div>
  );
}
