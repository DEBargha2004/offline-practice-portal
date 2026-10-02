import { useCustomTestController } from "@/controllers/useCustomTestController";
import { CustomTestSettingsCard } from "@/components/custom-test/CustomTestSettingsCard";
import { ChapterSelectionSection } from "@/components/custom-test/ChapterSelectionSection";
import { CustomTestBottomBar } from "@/components/custom-test/CustomTestBottomBar";
import { ActiveSessionNotice } from "@/components/custom-test/ActiveSessionNotice";

export function CustomTest() {
  const {
    chapters,
    filteredChapters,
    selectedChapters,
    selectedCount,
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
    totalAvailableQuestions,
    targetQuestionCount,
    toggleChapter,
    selectAll,
    clearAll,
    selectRange,
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
          Select chapters and set your preferred duration to practice.
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

      {/* Chapter Selection Checklist & Filter Controls */}
      <ChapterSelectionSection
        chapters={chapters}
        filteredChapters={filteredChapters}
        selectedChapters={selectedChapters}
        selectedCount={selectedCount}
        isAllSelected={isAllSelected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleChapter={toggleChapter}
        onSelectAll={selectAll}
        onClearAll={clearAll}
        chapterRangePresets={chapterRangePresets}
        onSelectRange={selectRange}
      />

      {/* Docked / Sticky Bottom Launch Action Bar */}
      <CustomTestBottomBar
        selectedCount={selectedCount}
        targetQuestionCount={targetQuestionCount}
        totalAvailableQuestions={totalAvailableQuestions}
        isTimed={isTimed}
        durationMinutes={durationMinutes}
        onStartTest={handleStartTest}
      />
    </div>
  );
}
