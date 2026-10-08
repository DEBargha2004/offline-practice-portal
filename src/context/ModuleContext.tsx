import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import type {
  CustomModuleRecord,
  QuestionType,
  TestSession,
  RevisionSession,
  TestAttemptResult,
} from "@/types";
import {
  defaultEngine,
  createQuestionBankEngine,
  type QuestionBankEngine,
} from "@/services/questionService";
import { getCustomModuleById } from "@/services/customModuleService";
import {
  getActiveSession as storageGetActiveSession,
  saveActiveSession as storageSaveActiveSession,
  clearActiveSession as storageClearActiveSession,
  getActiveRevisionSession as storageGetActiveRevisionSession,
  saveActiveRevisionSession as storageSaveActiveRevisionSession,
  clearActiveRevisionSession as storageClearActiveRevisionSession,
  getAllAttempts as storageGetAllAttempts,
  saveAttempt as storageSaveAttempt,
  clearAllAttempts as storageClearAllAttempts,
  getBookmarks as storageGetBookmarks,
  toggleBookmark as storageToggleBookmark,
  isBookmarked as storageIsBookmarked,
} from "@/services/storageService";
import { ModuleContext, type ModuleContextValue } from "./moduleContextDef";

export function ModuleProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Extract moduleId from pathname pattern: /module/:moduleId(/*)
  const match = location.pathname.match(/^\/module\/([^/]+)/);
  const detectedModuleId = match ? match[1] : null;

  const [moduleRecord, setModuleRecord] = useState<CustomModuleRecord | null>(null);
  const [moduleLoading, setModuleLoading] = useState<boolean>(Boolean(detectedModuleId));
  const [moduleError, setModuleError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    if (!detectedModuleId) {
      setModuleRecord(null);
      setModuleLoading(false);
      setModuleError(null);
      return;
    }

    setModuleLoading(true);
    setModuleError(null);

    getCustomModuleById(detectedModuleId)
      .then((record) => {
        if (isCancelled) return;
        if (record) {
          setModuleRecord(record);
        } else {
          setModuleRecord(null);
          setModuleError(`Module "${detectedModuleId}" not found in local library.`);
        }
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error("Failed to load module", err);
        setModuleError("Failed to load module data from local storage.");
      })
      .finally(() => {
        if (!isCancelled) {
          setModuleLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [detectedModuleId]);

  // Create or retrieve engine
  const engine = useMemo<QuestionBankEngine>(() => {
    if (detectedModuleId && moduleRecord) {
      return createQuestionBankEngine(moduleRecord.data);
    }
    return defaultEngine;
  }, [detectedModuleId, moduleRecord]);

  const basePath = detectedModuleId ? `/module/${detectedModuleId}` : "";
  const isCustomModule = Boolean(detectedModuleId);
  const targetModuleId = detectedModuleId || undefined;

  const contextValue: ModuleContextValue = useMemo(() => {
    return {
      moduleId: detectedModuleId,
      isCustomModule,
      moduleRecord,
      moduleLoading,
      moduleError,
      basePath,
      engine,

      // Engine shortcuts
      getMetadata: () => engine.getMetadata(),
      getWeekMetadata: () => engine.getWeekMetadata(),
      getAllChapters: () => engine.getAllChapters(),
      getChapter: (num: number) => engine.getChapter(num),
      getAllWeeks: () => engine.getAllWeeks(),
      getWeek: (num: number) => engine.getWeek(num),
      getQuestionById: (id: string) => engine.getQuestionById(id),
      getQuestionsForChapter: (num: number) => engine.getQuestionsForChapter(num),
      getQuestionsForWeek: (num: number) => engine.getQuestionsForWeek(num),
      getAllQuestions: () => engine.getAllQuestions(),
      getAllWeekQuestions: () => engine.getAllWeekQuestions(),
      getAllQuestionsCombined: () => engine.getAllQuestionsCombined(),
      getQuestionsByType: (type: QuestionType) => engine.getQuestionsByType(type),
      generateChapterQuestions: (num, rand, lim) => engine.generateChapterQuestions(num, rand, lim),
      generateWeekQuestions: (num, rand, lim) => engine.generateWeekQuestions(num, rand, lim),
      generateFullMockQuestions: (count) => engine.generateFullMockQuestions(count),
      generateCustomQuestions: (opts) => engine.generateCustomQuestions(opts),

      // Scoped storage
      getActiveSession: () => storageGetActiveSession(targetModuleId),
      saveActiveSession: (s: TestSession) => storageSaveActiveSession(s, targetModuleId),
      clearActiveSession: () => storageClearActiveSession(targetModuleId),
      getActiveRevisionSession: () => storageGetActiveRevisionSession(targetModuleId),
      saveActiveRevisionSession: (s: RevisionSession) =>
        storageSaveActiveRevisionSession(s, targetModuleId),
      clearActiveRevisionSession: () => storageClearActiveRevisionSession(targetModuleId),
      getAllAttempts: () => storageGetAllAttempts(targetModuleId),
      saveAttempt: (att: TestAttemptResult) => storageSaveAttempt(att, targetModuleId),
      clearAllAttempts: () => storageClearAllAttempts(targetModuleId),
      getBookmarks: () => storageGetBookmarks(targetModuleId),
      toggleBookmark: (qId: string) => storageToggleBookmark(qId, targetModuleId),
      isBookmarked: (qId: string) => storageIsBookmarked(qId, targetModuleId),
    };
  }, [detectedModuleId, isCustomModule, moduleRecord, moduleLoading, moduleError, basePath, engine, targetModuleId]);

  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  );
}
