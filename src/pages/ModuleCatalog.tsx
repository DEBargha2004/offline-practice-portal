import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { CustomModuleRecord } from "@/types";
import {
  getAllCustomModules,
  saveCustomModule,
  deleteCustomModule,
  exportCustomModule,
  validateQuestionBankData,
  generateSampleQuestionBankJson,
  type ValidationResult,
} from "@/services/customModuleService";
import { defaultEngine } from "@/services/questionService";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Upload,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export function ModuleCatalog() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [modules, setModules] = useState<CustomModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [moduleToDelete, setModuleToDelete] = useState<CustomModuleRecord | null>(null);

  const defaultMeta = defaultEngine.getMetadata();

  const loadModules = async () => {
    setLoading(true);
    try {
      const list = await getAllCustomModules();
      setModules(list);
    } catch (e) {
      console.error("Failed to load custom modules", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleFileChange = (file: File) => {
    setUploadedFile(file);
    setIsProcessingFile(true);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateQuestionBankData(parsed);
        setValidationResult(result);
        if (result.isValid && result.normalizedData) {
          setCustomTitle(result.normalizedData.metadata.title || file.name.replace(/\.[^/.]+$/, ""));
        }
      } catch (err: unknown) {
        setValidationResult({
          isValid: false,
          errors: [`Invalid JSON file: ${(err as Error).message}`],
          warnings: [],
        });
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSaveModule = async () => {
    if (!validationResult?.isValid || !validationResult.normalizedData) return;

    setIsSaving(true);
    try {
      const saved = await saveCustomModule(
        validationResult.normalizedData,
        customTitle.trim() || undefined,
        customDescription.trim() || undefined
      );
      setUploadDialogOpen(false);
      resetUploadState();
      await loadModules();
      navigate(`/module/${saved.id}`);
    } catch (err) {
      console.error("Failed to save custom module", err);
    } finally {
      setIsSaving(false);
    }
  };

  const resetUploadState = () => {
    setUploadedFile(null);
    setCustomTitle("");
    setCustomDescription("");
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    try {
      await deleteCustomModule(moduleToDelete.id);
      setModuleToDelete(null);
      await loadModules();
    } catch (err) {
      console.error("Failed to delete custom module", err);
    }
  };

  const handleDownloadSample = () => {
    const jsonStr = generateSampleQuestionBankJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_questions_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Streamlined Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Module Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Switch between courses or import your own question bank JSON.
          </p>
        </div>

        <Button
          onClick={() => {
            resetUploadState();
            setUploadDialogOpen(true);
          }}
          className="gap-2 font-semibold shadow-xs self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Import Module</span>
        </Button>
      </div>

      {/* Clean Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Built-in Portal Card */}
        <Card className="flex flex-col justify-between border-primary/20 bg-card hover:ring-foreground/20 transition-all shadow-2xs group">
          <CardHeader className="space-y-2 pb-2">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="gap-1 font-semibold text-xs bg-primary/10 text-primary border-primary/20">
                <Sparkles className="size-3" />
                <span>Built-in Course</span>
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                {defaultMeta.total_questions} Questions
              </span>
            </div>

            <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              IoT Exam Prep Portal
            </CardTitle>

            <CardDescription className="text-xs text-muted-foreground line-clamp-2">
              Full Introduction to IoT question bank with chapter tests and weekly assignments.
            </CardDescription>
          </CardHeader>

          <CardContent className="py-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{defaultMeta.total_chapters} Chapters</span>
              <span>&bull;</span>
              <span>12 Weeks</span>
            </div>
          </CardContent>

          <CardFooter className="pt-3">
            <Button
              className="w-full justify-between"
              onClick={() => navigate("/")}
            >
              <span>Open Course</span>
              <ArrowRight className="size-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Custom Modules Cards */}
        {modules.map((mod) => (
          <Card
            key={mod.id}
            className="flex flex-col justify-between hover:ring-foreground/20 transition-all shadow-2xs group"
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="text-xs font-semibold">
                  Custom Module
                </Badge>
                <span className="text-xs text-muted-foreground font-medium">
                  {mod.questionCount} Questions
                </span>
              </div>

              <CardTitle className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {mod.title}
              </CardTitle>

              <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                {mod.description || `Custom question bank with ${mod.chapterCount} chapters.`}
              </CardDescription>
            </CardHeader>

            <CardContent className="py-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{mod.chapterCount} Chapters</span>
                <span>&bull;</span>
                <span>Offline Storage</span>
              </div>
            </CardContent>

            <CardFooter className="pt-3 gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 justify-between font-semibold h-8"
                onClick={() => navigate(`/module/${mod.id}`)}
              >
                <span>Open Module</span>
                <ArrowRight className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCustomModule(mod)}
                title="Export JSON"
                aria-label="Export JSON"
                className="text-muted-foreground hover:text-foreground h-8 w-8 p-0 shrink-0"
              >
                <Download className="size-3.5" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setModuleToDelete(mod)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 shrink-0"
                title="Delete Module"
                aria-label="Delete Module"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Lightweight Empty State when no custom modules installed */}
      {!loading && modules.length === 0 && (
        <div className="rounded-xl border border-dashed border-border/80 p-6 text-center space-y-2.5 max-w-lg mx-auto">
          <p className="text-sm font-semibold text-foreground">Have another syllabus?</p>
          <p className="text-xs text-muted-foreground">
            Import a question bank JSON file to practice any subject with the same offline test runner.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetUploadState();
              setUploadDialogOpen(true);
            }}
            className="gap-1.5 text-xs font-semibold"
          >
            <Plus className="size-3.5" />
            <span>Import Question Bank</span>
          </Button>
        </div>
      )}

      {/* Streamlined Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Question Module</DialogTitle>
            <DialogDescription>
              Select or drop a question bank JSON file to build your study portal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            {/* File Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-5 text-center cursor-pointer bg-muted/20 hover:bg-muted/30 space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Upload className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-foreground">
                  {uploadedFile ? uploadedFile.name : "Click to select or drag & drop JSON"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Standard format (QuestionBankData)
                </p>
              </div>
            </div>

            {/* Template Download Link */}
            <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
              <span>Need a sample template?</span>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Download className="size-3" />
                <span>Download Sample JSON</span>
              </button>
            </div>

            {/* Validation State Feedback */}
            {isProcessingFile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-muted">
                <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Validating questions data...</span>
              </div>
            )}

            {validationResult && !validationResult.isValid && (
              <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="size-3.5" />
                  <span>Validation Error</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {validationResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult && validationResult.isValid && validationResult.normalizedData && (
              <div className="space-y-3">
                {/* Clean 1-line Success Badge */}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      {validationResult.normalizedData.metadata.total_questions} Questions in{" "}
                      {validationResult.normalizedData.metadata.total_chapters} Chapters
                    </span>
                  </div>
                  <span className="text-[11px] opacity-75 font-semibold">Valid Format</span>
                </div>

                {/* Module Details Form */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Module Title
                    </label>
                    <Input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Operating Systems"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      Description (Optional)
                    </label>
                    <Input
                      type="text"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="e.g. Complete chapter-wise revision questions"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadDialogOpen(false);
                resetUploadState();
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveModule}
              disabled={!validationResult?.isValid || isSaving}
              className="gap-1.5"
            >
              {isSaving ? "Saving..." : "Import & Open"}
              <ArrowRight className="size-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(moduleToDelete)}
        onOpenChange={(open) => !open && setModuleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{moduleToDelete?.title}&rdquo;?
              This will remove the module and its saved attempts from your offline storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ModuleCatalog;
