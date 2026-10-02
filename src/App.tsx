import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { Navbar } from "@/components/Navbar";
import { Dashboard } from "@/pages/Dashboard";
import { ChapterCatalog } from "@/pages/ChapterCatalog";
import { TestSession } from "@/pages/TestSession";
import { TestResults } from "@/pages/TestResults";
import { History } from "@/pages/History";
import { SavedQuestions } from "@/pages/SavedQuestions";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chapters" element={<ChapterCatalog />} />
              <Route path="/test" element={<TestSession />} />
              <Route path="/results/:attemptId" element={<TestResults />} />
              <Route path="/history" element={<History />} />
              <Route path="/saved" element={<SavedQuestions />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
