import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModuleProvider } from "@/context/ModuleContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PwaAutoInstallBanner } from "@/components/PwaAutoInstallBanner";
import { Dashboard } from "@/pages/Dashboard";
import { ChapterCatalog } from "@/pages/ChapterCatalog";
import { TestSession } from "@/pages/TestSession";
import { TestResults } from "@/pages/TestResults";
import { History } from "@/pages/History";
import { SavedQuestions } from "@/pages/SavedQuestions";
import { CustomTest } from "@/pages/CustomTest";
import { AssignmentCatalog } from "@/pages/AssignmentCatalog";
import { RevisionSession } from "@/pages/RevisionSession";
import { ModuleCatalog } from "@/pages/ModuleCatalog";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ModuleProvider>
          <ScrollToTop />
          <PwaAutoInstallBanner />
          <SidebarProvider defaultOpen={false} className="flex flex-col min-h-screen">
            <AppSidebar />
            <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 w-full">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Default IoT Portal Routes */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/assignments" element={<AssignmentCatalog />} />
                  <Route path="/weeks" element={<Navigate to="/assignments" replace />} />
                  <Route path="/chapters" element={<ChapterCatalog />} />
                  <Route path="/custom-test" element={<CustomTest />} />
                  <Route path="/create-test" element={<CustomTest />} />
                  <Route path="/test" element={<TestSession />} />
                  <Route path="/revision" element={<RevisionSession />} />
                  <Route path="/results/:attemptId" element={<TestResults />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/saved" element={<SavedQuestions />} />

                  {/* Modules Manager & Uploader */}
                  <Route path="/modules" element={<ModuleCatalog />} />

                  {/* Dynamic Custom Module Routes under /module/:moduleId/* */}
                  <Route path="/module/:moduleId" element={<Dashboard />} />
                  <Route path="/module/:moduleId/chapters" element={<ChapterCatalog />} />
                  <Route path="/module/:moduleId/custom-test" element={<CustomTest />} />
                  <Route path="/module/:moduleId/create-test" element={<CustomTest />} />
                  <Route path="/module/:moduleId/test" element={<TestSession />} />
                  <Route path="/module/:moduleId/revision" element={<RevisionSession />} />
                  <Route path="/module/:moduleId/results/:attemptId" element={<TestResults />} />
                  <Route path="/module/:moduleId/history" element={<History />} />
                  <Route path="/module/:moduleId/saved" element={<SavedQuestions />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </SidebarProvider>
        </ModuleProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
