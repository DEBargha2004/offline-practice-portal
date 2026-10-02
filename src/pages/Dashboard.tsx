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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  getMetadata,
  generateFullMockQuestions,
  generateCustomQuestions,
} from "@/services/questionService";
import {
  getActiveSession,
  clearActiveSession,
  saveActiveSession,
  getAllAttempts,
  getBookmarks,
} from "@/services/storageService";
import type { TestAttemptResult, TestSession, QuestionType } from "@/types";
import {
  BookOpen,
  Clock,
  Sparkles,
  Flame,
  Layers,
  ArrowRight,
  Play,
  Bookmark,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const metadata = getMetadata();

  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
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
      }
    });
  }, []);

  const handleStartFullMock = () => {
    const questions = generateFullMockQuestions(100);
    const newSession: TestSession = {
      id: `session_${Date.now()}`,
      title: "Full Syllabus Mock Exam",
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
    navigate("/test");
  };

  const handleStartCustomTypePractice = (type: QuestionType, count = 25) => {
    const questions = generateCustomQuestions({ types: [type], count, randomize: true });
    const label = type === "MCQ" ? "Single Choice" : type === "MSQ" ? "Multiple Answers" : "True or False";
    const newSession: TestSession = {
      id: `session_${Date.now()}`,
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
    navigate("/test");
  };

  const handleDiscardActiveSession = () => {
    if (confirm("Are you sure you want to discard your current unfinished test?")) {
      clearActiveSession();
      setActiveSession(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Active Test Banner */}
      {activeSession && !activeSession.isCompleted && (
        <Alert className="border-amber-500/40 bg-amber-500/10 text-foreground">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-amber-500" />
                <AlertTitle className="text-base font-semibold">
                  Unfinished Test In Progress
                </AlertTitle>
              </div>
              <AlertDescription className="text-sm text-muted-foreground">
                You are currently taking: <strong className="text-foreground">{activeSession.title}</strong>{" "}
                ({Object.keys(activeSession.userAnswers).length} of {activeSession.questionIds.length} answered)
              </AlertDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardActiveSession}
                className="text-muted-foreground hover:text-destructive"
              >
                Discard
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/test")}
                className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              >
                <Play className="size-4" />
                Resume Test
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Hero: Full Syllabus Mock Exam */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/40 p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            <span>Recommended for Final Exam Prep</span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
            Full Syllabus Mock Exam
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Practice an authentic 100-question test drawn randomly and evenly across all 60 chapters. Covers single choice, multiple answer, and true/false questions.
          </p>

          {/* Test Configuration */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background/80 px-3.5 py-2 text-sm shadow-2xs">
              <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={mockWithTimer}
                  onChange={(e) => setMockWithTimer(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <Clock className="size-4 text-muted-foreground" />
                <span>{mockWithTimer ? "Timed Exam" : "Untimed Practice"}</span>
              </label>

              {mockWithTimer && (
                <select
                  value={mockTimerMinutes}
                  onChange={(e) => setMockTimerMinutes(Number(e.target.value))}
                  className="ml-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs font-medium cursor-pointer"
                >
                  <option value={60}>60 mins (1 hr)</option>
                  <option value={90}>90 mins (1.5 hrs)</option>
                  <option value={120}>120 mins (2 hrs)</option>
                  <option value={180}>180 mins (3 hrs)</option>
                </select>
              )}
            </div>

            <Button
              size="lg"
              onClick={handleStartFullMock}
              className="gap-2 font-semibold shadow-xs px-6 text-base"
            >
              <Play className="size-4" />
              Start 100-Question Exam
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card size="sm" className="justify-between">
          <CardContent className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Total Questions</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{metadata.total_questions}</span>
              <span className="text-xs text-muted-foreground">in 60 chapters</span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="justify-between">
          <CardContent className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Tests Taken</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{totalAttemptsCount}</span>
              <span className="text-xs text-muted-foreground">attempts saved</span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="justify-between">
          <CardContent className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Average Accuracy</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {totalAttemptsCount > 0 ? `${averageScore}%` : "—"}
              </span>
              <span className="text-xs text-muted-foreground">overall</span>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="justify-between">
          <CardContent className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Saved Questions</span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl font-bold tracking-tight text-foreground">{bookmarkCount}</span>
              <span className="text-xs text-muted-foreground">for review</span>
            </div>
          </CardContent>
        </Card>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Chapter-Wise Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="size-5" />
                </div>
                <Badge variant="outline">60 Chapters</Badge>
              </div>
              <CardTitle className="text-lg font-bold">Chapter-by-Chapter</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm leading-relaxed">
                Select individual chapters to practice specific topics from Introduction to Advanced IoT.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/chapters")}
              >
                <span>Browse All Chapters</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Practice by Type Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Layers className="size-5" />
                </div>
                <Badge variant="outline">Quick Drills</Badge>
              </div>
              <CardTitle className="text-lg font-bold">Practice by Question Type</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
              <CardDescription className="text-sm pb-1">
                Target specific question formats:
              </CardDescription>
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground">Single Choice (MCQ):</span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs font-medium"
                  onClick={() => handleStartCustomTypePractice("MCQ", 20)}
                >
                  Start 20 Qs
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground">Multiple Answers (MSQ):</span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs font-medium"
                  onClick={() => handleStartCustomTypePractice("MSQ", 15)}
                >
                  Start 15 Qs
                </Button>
              </div>
              <div className="flex items-center justify-between text-xs py-0.5">
                <span className="text-muted-foreground">True or False:</span>
                <Button
                  variant="ghost"
                  size="xs"
                  className="h-7 text-xs font-medium"
                  onClick={() => handleStartCustomTypePractice("True / False", 20)}
                >
                  Start 20 Qs
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => handleStartCustomTypePractice("MCQ", 25)}
              >
                <span>Start Random 25 Drill</span>
                <ArrowRight className="size-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Saved Questions Card */}
          <Card className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bookmark className="size-5" />
                </div>
                <Badge variant="outline">{bookmarkCount} Saved</Badge>
              </div>
              <CardTitle className="text-lg font-bold">Review Saved Questions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm leading-relaxed">
                Revisit questions you flagged during tests to solidify your understanding and review answers.
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => navigate("/saved")}
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
            <Link to="/history" className="text-sm font-medium text-primary hover:underline">
              View All History &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAttempts.map((attempt) => (
              <Card
                key={attempt.id}
                size="sm"
                className="flex flex-col justify-between hover:ring-foreground/20 transition-all cursor-pointer group"
                onClick={() => navigate(`/results/${attempt.id}`)}
              >
                <CardHeader className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={attempt.percentage >= 60 ? "default" : "secondary"}>
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
                    <span>Score: {attempt.score} / {attempt.maxScore}</span>
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
    </div>
  );
}
