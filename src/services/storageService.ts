import type { TestSession, TestAttemptResult, RevisionSession } from "@/types";
import { rounded } from "@/lib/utils";

function sanitizeAttempt(attempt: TestAttemptResult): TestAttemptResult {
  return {
    ...attempt,
    score: rounded(attempt.score, 1),
    maxScore: rounded(attempt.maxScore, 1),
    reviewItems: attempt.reviewItems?.map((item) => ({
      ...item,
      earnedPoints: rounded(item.earnedPoints, 1),
    })),
  };
}

const DB_NAME = "iot_test_portal_db";
const DB_VERSION = 2;
export const STORE_ATTEMPTS = "attempts";
export const STORE_CUSTOM_MODULES = "custom_modules";

const STORAGE_KEY_ACTIVE_TEST = "iot_active_test_session";
const STORAGE_KEY_ACTIVE_REVISION = "iot_active_revision_session";
const STORAGE_KEY_BOOKMARKS = "iot_bookmarked_questions";
const STORAGE_KEY_SETTINGS = "iot_user_preferences";

function getActiveTestKey(moduleId?: string): string {
  return moduleId ? `${STORAGE_KEY_ACTIVE_TEST}_${moduleId}` : STORAGE_KEY_ACTIVE_TEST;
}

function getActiveRevisionKey(moduleId?: string): string {
  return moduleId ? `${STORAGE_KEY_ACTIVE_REVISION}_${moduleId}` : STORAGE_KEY_ACTIVE_REVISION;
}

function getBookmarksKey(moduleId?: string): string {
  return moduleId ? `${STORAGE_KEY_BOOKMARKS}_${moduleId}` : STORAGE_KEY_BOOKMARKS;
}

// Open or initialize IndexedDB
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ATTEMPTS)) {
        const store = db.createObjectStore(STORE_ATTEMPTS, { keyPath: "id" });
        store.createIndex("completedAt", "completedAt", { unique: false });
        store.createIndex("mode", "mode", { unique: false });
        store.createIndex("chapterNumber", "chapterNumber", { unique: false });
        store.createIndex("moduleId", "moduleId", { unique: false });
      } else {
        const tx = (event.target as IDBOpenDBRequest).transaction;
        const store = tx?.objectStore(STORE_ATTEMPTS);
        if (store && !store.indexNames.contains("moduleId")) {
          store.createIndex("moduleId", "moduleId", { unique: false });
        }
      }

      if (!db.objectStoreNames.contains(STORE_CUSTOM_MODULES)) {
        const modStore = db.createObjectStore(STORE_CUSTOM_MODULES, { keyPath: "id" });
        modStore.createIndex("createdAt", "createdAt", { unique: false });
        modStore.createIndex("title", "title", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ----------------------------------------------------
// Active In-Progress Test Session (LocalStorage for fast synchronous updates)
// ----------------------------------------------------

export function saveActiveSession(session: TestSession, moduleId?: string): void {
  try {
    const targetModuleId = moduleId || session.moduleId;
    if (targetModuleId && !session.moduleId) {
      session.moduleId = targetModuleId;
    }
    const key = getActiveTestKey(targetModuleId);
    localStorage.setItem(key, JSON.stringify(session));
  } catch (err) {
    console.error("Failed to save active session to localStorage", err);
  }
}

export function getActiveSession(moduleId?: string): TestSession | null {
  try {
    const key = getActiveTestKey(moduleId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read active session from localStorage", err);
    return null;
  }
}

export function clearActiveSession(moduleId?: string): void {
  try {
    const key = getActiveTestKey(moduleId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to clear active session", err);
  }
}

// ----------------------------------------------------
// Active Revision Session
// ----------------------------------------------------

export function saveActiveRevisionSession(session: RevisionSession, moduleId?: string): void {
  try {
    const targetModuleId = moduleId || session.moduleId;
    if (targetModuleId && !session.moduleId) {
      session.moduleId = targetModuleId;
    }
    const key = getActiveRevisionKey(targetModuleId);
    localStorage.setItem(key, JSON.stringify(session));
  } catch (err) {
    console.error("Failed to save active revision session to localStorage", err);
  }
}

export function getActiveRevisionSession(moduleId?: string): RevisionSession | null {
  try {
    const key = getActiveRevisionKey(moduleId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("Failed to read active revision session from localStorage", err);
    return null;
  }
}

export function clearActiveRevisionSession(moduleId?: string): void {
  try {
    const key = getActiveRevisionKey(moduleId);
    localStorage.removeItem(key);
  } catch (err) {
    console.error("Failed to clear active revision session", err);
  }
}

// ----------------------------------------------------
// Completed Attempts & History (IndexedDB with LocalStorage fallback)
// ----------------------------------------------------

const LOCALSTORAGE_ATTEMPTS_BACKUP_KEY = "iot_attempts_history_backup";

function getLocalStorageAttempts(): TestAttemptResult[] {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_ATTEMPTS_BACKUP_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageAttempts(attempts: TestAttemptResult[]): void {
  try {
    localStorage.setItem(LOCALSTORAGE_ATTEMPTS_BACKUP_KEY, JSON.stringify(attempts));
  } catch (e) {
    console.warn("LocalStorage backup save failed", e);
  }
}

export async function saveAttempt(attempt: TestAttemptResult, moduleId?: string): Promise<void> {
  const targetModuleId = moduleId || attempt.moduleId;
  if (targetModuleId && !attempt.moduleId) {
    attempt.moduleId = targetModuleId;
  }
  const sanitized = sanitizeAttempt(attempt);
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, "readwrite");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.put(sanitized);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbError) {
    console.warn("IndexedDB save failed, falling back to localStorage", idbError);
    const list = getLocalStorageAttempts().filter((a) => a.id !== sanitized.id);
    list.unshift(sanitized);
    saveLocalStorageAttempts(list);
  }
}

export async function getAllAttempts(moduleId?: string): Promise<TestAttemptResult[]> {
  try {
    const db = await openDatabase();
    return await new Promise<TestAttemptResult[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, "readonly");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();
      req.onsuccess = () => {
        let results = (req.result as TestAttemptResult[]).map(sanitizeAttempt);
        if (moduleId) {
          results = results.filter((a) => a.moduleId === moduleId);
        } else {
          results = results.filter((a) => !a.moduleId || a.moduleId === "iot");
        }
        // Sort descending by completion date (most recent first)
        results.sort((a, b) => b.completedAt - a.completedAt);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (idbError) {
    console.warn("IndexedDB read failed, falling back to localStorage", idbError);
    let list = getLocalStorageAttempts().map(sanitizeAttempt);
    if (moduleId) {
      list = list.filter((a) => a.moduleId === moduleId);
    } else {
      list = list.filter((a) => !a.moduleId || a.moduleId === "iot");
    }
    list.sort((a, b) => b.completedAt - a.completedAt);
    return list;
  }
}

export async function getAttemptById(id: string): Promise<TestAttemptResult | null> {
  try {
    const db = await openDatabase();
    return await new Promise<TestAttemptResult | null>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, "readonly");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result as TestAttemptResult | undefined;
        resolve(result ? sanitizeAttempt(result) : null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = getLocalStorageAttempts();
    const item = list.find((a) => a.id === id);
    return item ? sanitizeAttempt(item) : null;
  }
}

export async function deleteAttempt(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, "readwrite");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = getLocalStorageAttempts().filter((a) => a.id !== id);
    saveLocalStorageAttempts(list);
  }
}

export async function clearAllAttempts(moduleId?: string): Promise<void> {
  try {
    const db = await openDatabase();
    if (!moduleId) {
      // Clear non-module or iot attempts
      const tx = db.transaction(STORE_ATTEMPTS, "readwrite");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result as TestAttemptResult[];
        for (const item of all) {
          if (!item.moduleId || item.moduleId === "iot") {
            store.delete(item.id);
          }
        }
      };
    } else {
      const tx = db.transaction(STORE_ATTEMPTS, "readwrite");
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const all = req.result as TestAttemptResult[];
        for (const item of all) {
          if (item.moduleId === moduleId) {
            store.delete(item.id);
          }
        }
      };
    }
  } catch {
    const list = getLocalStorageAttempts().filter((a) =>
      moduleId ? a.moduleId !== moduleId : a.moduleId && a.moduleId !== "iot"
    );
    saveLocalStorageAttempts(list);
  }
}

// ----------------------------------------------------
// Bookmarks & Starred Questions
// ----------------------------------------------------

export function getBookmarks(moduleId?: string): string[] {
  try {
    const key = getBookmarksKey(moduleId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(questionId: string, moduleId?: string): boolean {
  try {
    const key = getBookmarksKey(moduleId);
    const current = new Set(getBookmarks(moduleId));
    let isNowBookmarked = false;
    if (current.has(questionId)) {
      current.delete(questionId);
      isNowBookmarked = false;
    } else {
      current.add(questionId);
      isNowBookmarked = true;
    }
    localStorage.setItem(key, JSON.stringify(Array.from(current)));
    return isNowBookmarked;
  } catch {
    return false;
  }
}

export function isBookmarked(questionId: string, moduleId?: string): boolean {
  const current = new Set(getBookmarks(moduleId));
  return current.has(questionId);
}

// ----------------------------------------------------
// User Preferences
// ----------------------------------------------------

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultTimedMode: boolean;
  defaultTimerDurationMinutes: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  defaultTimedMode: true,
  defaultTimerDurationMinutes: 120, // 2 hours for full test, or proportional
};

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  try {
    const updated = { ...getUserPreferences(), ...prefs };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}
