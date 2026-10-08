import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCurrentModule } from "@/hooks/useCurrentModule";
import type { TestAttemptResult, TestSession, QuestionType } from "@/types";
import {
  BookOpen,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Play,
  Bookmark,
  SlidersHorizontal,
  CalendarCheck,
  FolderOpen,
} from "lucide-react";
import { cn, formatScore } from "@/lib/utils";

export function Dashboard() {
  const navigate = useNavigate();
  const {
    basePath,
    moduleId,
    isCustomModule,
    moduleRecord,
    moduleLoading,
    moduleError,
    getMetadata,
    getWeekMetadata,
    getAllWeeks,
    generateFullMockQuestions,
    generateCustomQuestions,
    getActiveSession,
    clearActiveSession,
    saveActiveSession,
    getAllAttempts,
    getBookmarks,
  } = useCurrentModule();

  const metadata = getMetadata();
  const weekMetadata = getWeekMetadata();
  const weeks = getAllWeeks();

  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<TestAttemptResult[]>([]);
  const [totalAttemptsCount, setTotalAttemptsCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  // Exam launch options
  const [mockWithTimer, setMockWithTimer] = useState(true);
  const [mockTimerMinutes, setMockTimerMinutes] = useState(120);

  useEffect(() => {
    setActiveSession(getActiveSession());
    setBookmarkCount(getBookmarks().length);

    getAllAttempts().then((attempts) => {
      setTotalAttemptsCount(attempts.length);
      setRecentAttempts(attempts.slice(0, 4));

      if (attempts.length > 0) {
        const sum = attempts.reduce((acc, curr) => acc + curr.percentage, 0);
        setAverageScore(Math.round(sum / attempts.length));
      } else {
        setAverageScore(0);
      }
    });
  }, [getActiveSession, getBookmarks, getAllAttempts, moduleId]);

  const targetMockQuestionsCount = Math.min(
    100,
    Math.max(1, metadata.total_questions),
  );

  const handleStartFullMock = () => {
    const questions = generateFullMockQuestions(targetMockQuestionsCount);
    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      moduleId: moduleId || undefined,
      title:
        isCustomModule && moduleRecord
          ? `${moduleRecord.title} Mock Exam`
          : "Full Syllabus Mock Exam",
      mode: "full_mock",
      startedAt: Date.now(),
      timeLimitSeconds: mockWithTimer ? mockTimerMinutes * 60 : null,
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: questions.map((q) => q.id),
      questions: questions,
      userAnswers: {},
      flaggedQuestionIds: [],
      currentQuestionIndex: 0,
    };

    saveActiveSession(newSession);
    navigate(`${basePath}/test`);
  };

  const handleStartCustomTypePractice = (type: QuestionType, count = 25) => {
    const availableOfType = metadata.question_types[type] || 0;
    const actualCount = Math.min(count, Math.max(1, availableOfType));

    const questions = generateCustomQuestions({
      types: [type],
      count: actualCount,
      randomize: true,
    });
    const label =
      type === "MCQ"
        ? "Single Choice"
        : type === "MSQ"
          ? "Multiple Answers"
          : "True or False";
    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      moduleId: moduleId || undefined,
      title: `${label} Practice (${questions.length} Questions)`,
      mode: "custom",
      startedAt: Date.now(),
      timeLimitSeconds: null, // untimed for quick practice
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: questions.map((q) => q.id),
      questions: questions,
      userAnswers: {},
      flaggedQuestionIds: [],
      currentQuestionIndex: 0,
    };

    saveActiveSession(newSession);
    navigate(`${basePath}/test`);
  };

  const handleStartMixedDrill = (count = 25) => {
    const targetCount = Math.min(count, Math.max(1, metadata.total_questions));
    const questions = generateCustomQuestions({
      types: ["MCQ", "MSQ", "True / False"],
      count: targetCount,
      randomize: true,
    });
    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      moduleId: moduleId || undefined,
      title: `Mixed Practice Drill (${questions.length} Questions)`,
      mode: "custom",
      startedAt: Date.now(),
      timeLimitSeconds: null,
      elapsedSeconds: 0,
      isCompleted: false,
      questionIds: questions.map((q) => q.id),
      questions: questions,
      userAnswers: {},
      flaggedQuestionIds: [],
      currentQuestionIndex: 0,
    };

    saveActiveSession(newSession);
    navigate(`${basePath}/test`);
  };

  const handleDiscardActiveSession = () => {
    setDiscardModalOpen(true);
  };

  const confirmDiscardActiveSession = () => {
    clearActiveSession();
    setActiveSession(null);
    setDiscardModalOpen(false);
  };

  if (moduleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">
            Loading custom module...
          </p>
        </div>
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4 text-center space-y-4">
        <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          !
        </div>
        <h2 className="text-xl font-bold">Module Not Found</h2>
        <p className="text-sm text-muted-foreground">{moduleError}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/modules">
            <Button variant="outline">Browse Modules</Button>
          </Link>
          <Link to="/">
            <Button>Main Portal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Enhanced Responsive Resume Test Card */}
      {activeSession &&
        !activeSession.isCompleted &&
        (() => {
          const answeredCount = Object.keys(activeSession.userAnswers).length;
          const totalCount = activeSession.questionIds.length;
          const progressPercent =
            totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
          const currentIndex = (activeSession.currentQuestionIndex || 0) + 1;
          const flaggedCount = activeSession.flaggedQuestionIds?.length || 0;

          return (
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              {/* Top Amber Gradient Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                {/* Left / Middle: Test Status & Details */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  {/* Meta row: Timer & Started time */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                    {activeSession.timeLimitSeconds ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                        <Clock className="size-3.5" />
                        <span>
                          {Math.round(activeSession.timeLimitSeconds / 60)} min
                          limit
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                        <Clock className="size-3.5" />
                        <span>Untimed</span>
                      </span>
                    )}
                    <span>&bull;</span>
                    <span>
                      Started{" "}
                      {new Date(activeSession.startedAt).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground line-clamp-1">
                      {activeSession.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Currently at question{" "}
                      <span className="font-semibold text-foreground">
                        #{currentIndex}
                      </span>{" "}
                      of {totalCount}. Your answers and time are saved
                      automatically.
                    </p>
                  </div>

                  {/* Progress bar & Stat Chips */}
                  <div className="space-y-2 pt-0.5 max-w-xl">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">
                        Progress:{" "}
                        <span className="font-semibold">{answeredCount}</span>{" "}
                        of {totalCount} answered
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {progressPercent}% Complete
                      </span>
                    </div>

                    <Progress
                      value={progressPercent}
                      className="h-2 bg-muted/80"
                    />

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-muted-foreground">
                      <span>
                        {totalCount - answeredCount} question
                        {totalCount - answeredCount === 1 ? "" : "s"} remaining
                      </span>
                      {flaggedCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                          <span>★ {flaggedCount} flagged for review</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action buttons: Responsive layout */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
                  <Button
                    size="default"
                    onClick={() => navigate(`${basePath}/test`)}
                    className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold shadow-xs gap-2 px-6 h-10 w-full sm:w-auto lg:w-44 transition-all"
                  >
                    <Play className="size-4 fill-white" />
                    <span>Resume Test</span>
                    <ArrowRight className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDiscardActiveSession}
                    className="h-9 px-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto lg:w-44"
                  >
                    <span>Discard Session</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Hero: Full Syllabus Mock Exam */}
      <Card className="border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-6 sm:p-7 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {isCustomModule && (
              <Badge
                variant="secondary"
                className="gap-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
              >
                <FolderOpen className="size-3" />
                <span>Custom Module</span>
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="size-3 text-amber-500" />
              <span>{targetMockQuestionsCount} Questions</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              All {metadata.total_chapters} Chapters
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {isCustomModule && moduleRecord
              ? `${moduleRecord.title} Mock Exam`
              : "Full Syllabus Mock Exam"}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {targetMockQuestionsCount} questions sampled proportionally across
            all {metadata.total_chapters} chapters with randomized options and
            instant offline scoring.
          </p>
        </div>

        {/* Unified Bottom Settings & Launch Bar */}
        <div className="border-t border-border/60 bg-muted/20 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Mode / Duration Segmented Selector */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-border/80 bg-background p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setMockWithTimer(false)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all select-none",
                  !mockWithTimer
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Untimed
              </button>
              {[60, 90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setMockWithTimer(true);
                    setMockTimerMinutes(mins);
                  }}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all select-none",
                    mockWithTimer && mockTimerMinutes === mins
                      ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Right: Start Button */}
          <Button
            size="default"
            onClick={handleStartFullMock}
            className="gap-2 font-semibold shadow-xs h-9 px-5 w-full sm:w-auto"
          >
            <Play className="size-4 fill-primary-foreground" />
            <span>Start Mock Exam</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </Card>

      {/* Sleek Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-xl border border-border/70 bg-card/60 shadow-2xs divide-y md:divide-y-0 md:divide-x divide-border/60">
        <div className="px-2 sm:px-4 py-1 flex flex-col justify-center">
          <span className="text-[11px] font-medium text-muted-foreground">
            Total Questions
          </span>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {(metadata?.total_questions || 0) +
                (weekMetadata?.total_questions || 0)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              in {metadata?.total_chapters || 0} Ch
              {weekMetadata?.total_chapters
                ? ` + ${weekMetadata.total_chapters} Wks`
                : ""}
            </span>
          </div>
        </div>

        <div className="px-2 sm:px-4 py-1 flex flex-col justify-center pt-2 md:pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Tests Taken
          </span>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {totalAttemptsCount}
            </span>
            <span className="text-[11px] text-muted-foreground">completed</span>
          </div>
        </div>

        <div className="px-2 sm:px-4 py-1 flex flex-col justify-center pt-2 md:pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Average Accuracy
          </span>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {totalAttemptsCount > 0 ? `${averageScore}%` : "—"}
            </span>
            <span className="text-[11px] text-muted-foreground">overall</span>
          </div>
        </div>

        <div className="px-2 sm:px-4 py-1 flex flex-col justify-center pt-2 md:pt-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Saved Questions
          </span>
          <div className="flex items-baseline gap-1.5 pt-0.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {bookmarkCount}
            </span>
            <span className="text-[11px] text-muted-foreground">
              for review
            </span>
          </div>
        </div>
      </div>

      {/* Practice Modes Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ways to Practice
          </h2>
          <p className="text-sm text-muted-foreground">
            Focus on specific topics, question types, or your saved questions.
          </p>
        </div>

        {/* Uniform 3-Column Grid for Identical Layout Parity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {/* Optional: Weekly Assignments Card (ONLY rendered if weeks exist) */}
          {weeks.length > 0 && (
            <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group h-full">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CalendarCheck className="size-5" />
                  </div>
                  <Badge variant="outline">
                    {weekMetadata.total_chapters} Weeks
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold">
                  Weekly Assignments
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <CardDescription className="text-sm leading-relaxed">
                  Study official weekly assignment questions with timed or
                  untimed practice.
                </CardDescription>
                <p className="text-xs text-muted-foreground">
                  {weekMetadata.total_questions} total questions across{" "}
                  {weekMetadata.total_chapters} weeks
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate(`${basePath}/assignments`)}
                >
                  <span>Browse Assignments</span>
                  <ArrowRight className="size-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* 1. Chapter-Wise Practice Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="size-5" />
                </div>
                <Badge variant="outline">
                  {metadata.total_chapters} Chapters
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold">
                Chapter Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <CardDescription className="text-sm leading-relaxed">
                Practice specific syllabus topics chapter by chapter at your own
                pace.
              </CardDescription>
              <p className="text-xs text-muted-foreground">
                {metadata.total_questions.toLocaleString()} total questions
                across {metadata.total_chapters} chapters
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(`${basePath}/chapters`)}
              >
                <span>Browse All Chapters</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* 2. Custom Test Builder Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <SlidersHorizontal className="size-5" />
                </div>
                <Badge variant="outline">
                  {weeks.length > 0 ? "Chapters & Weeks" : "Custom Chapters"}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold">Custom Test</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <CardDescription className="text-sm leading-relaxed">
                Build a personalized test by selecting specific chapters and
                time limits.
              </CardDescription>
              <p className="text-xs text-muted-foreground">
                Custom chapters &amp; custom time limits
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(`${basePath}/custom-test`)}
              >
                <span>Create Custom Test</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* 3. Question Type Drills Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Layers className="size-5" />
                </div>
                <Badge variant="outline">Quick Drills</Badge>
              </div>
              <CardTitle className="text-lg font-bold">
                Question Type Drills
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <CardDescription className="text-sm leading-relaxed">
                Target specific question formats with rapid practice drills:
              </CardDescription>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <Button
                  variant="secondary"
                  size="xs"
                  className="h-8 text-xs font-semibold"
                  onClick={() => handleStartCustomTypePractice("MCQ", 20)}
                >
                  20 MCQ
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  className="h-8 text-xs font-semibold"
                  onClick={() => handleStartCustomTypePractice("MSQ", 15)}
                >
                  15 MSQ
                </Button>
                <Button
                  variant="secondary"
                  size="xs"
                  className="h-8 text-xs font-semibold"
                  onClick={() =>
                    handleStartCustomTypePractice("True / False", 20)
                  }
                >
                  20 T/F
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleStartMixedDrill(25)}
              >
                <span>Start Mixed Drill (25 Qs)</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* 4. Saved Questions Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group h-full">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bookmark className="size-5" />
                </div>
                <Badge variant="outline">{bookmarkCount} Saved</Badge>
              </div>
              <CardTitle className="text-lg font-bold">
                Saved Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <CardDescription className="text-sm leading-relaxed">
                Revisit and test questions you flagged during previous exams.
              </CardDescription>
              <p className="text-xs text-muted-foreground">
                {bookmarkCount} flagged question{bookmarkCount === 1 ? "" : "s"}{" "}
                saved for review
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate(`${basePath}/saved`)}
              >
                <span>Open Saved Questions</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Attempts History */}
      {recentAttempts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Recent Attempts
            </h2>
            <Link
              to={`${basePath}/history`}
              className="text-sm font-medium text-primary hover:underline"
            >
              View All History &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAttempts.map((attempt) => (
              <Card
                key={attempt.id}
                size="sm"
                className="flex flex-col justify-between hover:ring-foreground/20 transition-all cursor-pointer group"
                onClick={() => navigate(`${basePath}/results/${attempt.id}`)}
              >
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        attempt.percentage >= 60 ? "default" : "secondary"
                      }
                    >
                      {attempt.percentage}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {attempt.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>
                      Score: {formatScore(attempt.score)} /{" "}
                      {formatScore(attempt.maxScore)}
                    </span>
                    <span>&bull;</span>
                    <span>{Math.round(attempt.timeSpentSeconds / 60)} min</span>
                  </div>
                </CardContent>

                <CardFooter className="justify-between text-xs text-primary font-medium">
                  <span>Review Answers</span>
                  <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Discard Active Session Alert Dialog */}
      <AlertDialog open={discardModalOpen} onOpenChange={setDiscardModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Unfinished Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to discard your current test in progress?
              All answers recorded so far will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Test</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDiscardActiveSession}
            >
              Discard Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Dashboard;
