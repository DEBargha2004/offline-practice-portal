export interface ChapterNoteMeta {
  chapterNumber: number;
  title: string;
  fileName: string;
  wordCount: number;
  readingTime: string;
  hash: string;
}

export interface WeekNoteMeta {
  weekNumber: number;
  title: string;
  fileName: string;
  startChapter: number;
  endChapter: number;
  wordCount: number;
  readingTime: string;
  hash: string;
}

export interface ChapterNotesManifest {
  version: string;
  updatedAt?: number;
  chapters: ChapterNoteMeta[];
  weeks?: WeekNoteMeta[];
}

export interface CachedNoteEntry {
  chapterNumber?: number;
  weekNumber?: number;
  hash: string;
  content: string;
  cachedAt: number;
}

const MEMORY_CACHE = new Map<number, string>();
const WEEK_MEMORY_CACHE = new Map<number, string>();
const CACHE_STORAGE_PREFIX = "iot_chapter_notes_cache_v2_";
const WEEK_CACHE_STORAGE_PREFIX = "iot_week_notes_cache_v2_";
const MANIFEST_STORAGE_KEY = "iot_chapter_notes_manifest_version";

/**
 * Loads the manifest of available chapter notes.
 * Always validates against the network to check for release updates.
 */
export async function getChapterNotesManifest(
  forceRefresh = false
): Promise<ChapterNotesManifest> {
  const fetchUrl = forceRefresh
    ? `/notes/manifest.json?_t=${Date.now()}`
    : `/notes/manifest.json`;

  const res = await fetch(fetchUrl, {
    cache: forceRefresh ? "no-store" : "no-cache",
  });

  if (!res.ok) {
    throw new Error(`Failed to load chapter notes manifest (${res.status})`);
  }

  const manifest = (await res.json()) as ChapterNotesManifest;

  // Detect new release version and clear stale memory cache if changed
  try {
    const savedVersion = localStorage.getItem(MANIFEST_STORAGE_KEY);
    if (savedVersion && manifest.version && savedVersion !== manifest.version) {
      MEMORY_CACHE.clear();
      WEEK_MEMORY_CACHE.clear();
      // Purge outdated chapter and week notes from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("iot_chapter_notes_cache_") ||
            key.startsWith("iot_week_notes_cache_"))
        ) {
          localStorage.removeItem(key);
        }
      }
    }
    if (manifest.version) {
      localStorage.setItem(MANIFEST_STORAGE_KEY, manifest.version);
    }
  } catch {
    // Non-fatal if localStorage is restricted
  }

  return manifest;
}

/**
 * Clear cached chapter and week notes to force reload from origin
 */
export function clearChapterNotesCache(): void {
  MEMORY_CACHE.clear();
  WEEK_MEMORY_CACHE.clear();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("iot_chapter_notes_cache_") ||
          key.startsWith("iot_week_notes_cache_"))
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore error
  }
}

/**
 * Lazy loads a chapter's markdown notes with version-aware multi-layer caching:
 * 1. Checks current expected hash from manifest.
 * 2. In-memory Map lookup (invalidated if hash differs).
 * 3. LocalStorage cache check (invalidated if hash differs).
 * 4. Network fetch with content hash query parameter to bypass HTTP caches.
 */
export async function fetchChapterNoteContent(
  chapterNumber: number,
  manifest?: ChapterNotesManifest
): Promise<string> {
  // Determine current expected hash if manifest is available
  let activeManifest = manifest;
  if (!activeManifest) {
    try {
      activeManifest = await getChapterNotesManifest();
    } catch {
      // Allow fallback if manifest fetch fails
    }
  }

  const chapterMeta = activeManifest?.chapters.find(
    (c) => c.chapterNumber === chapterNumber
  );

  const storageKey = `${CACHE_STORAGE_PREFIX}${chapterNumber}`;

  // 1. In-memory cache hit - verify hash if available
  if (MEMORY_CACHE.has(chapterNumber)) {
    // Check if we also have an entry in localStorage with matching hash
    try {
      const rawStorage = localStorage.getItem(storageKey);
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage) as CachedNoteEntry;
        if (!chapterMeta || parsed.hash === chapterMeta.hash) {
          return MEMORY_CACHE.get(chapterNumber)!;
        }
      } else if (!chapterMeta) {
        return MEMORY_CACHE.get(chapterNumber)!;
      }
    } catch {
      // In case of error, continue to verify or re-fetch
    }
  }

  // 2. LocalStorage cache hit check (invalidated if hash differs)
  try {
    const rawStorage = localStorage.getItem(storageKey);
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage) as CachedNoteEntry;
      if (chapterMeta && parsed.hash === chapterMeta.hash) {
        MEMORY_CACHE.set(chapterNumber, parsed.content);
        return parsed.content;
      }
    }
  } catch {
    // LocalStorage read failed or parse error, fall through
  }

  // 3. Lazy fetch from static assets using hash query parameter for cache busting
  const targetFile = chapterMeta?.fileName || `ch-${chapterNumber}.md`;
  const url = chapterMeta?.hash
    ? `/notes/${targetFile}?v=${chapterMeta.hash}`
    : `/notes/${targetFile}`;

  const res = await fetch(url, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error(
      `Could not load notes for Chapter ${chapterNumber} (HTTP ${res.status}).`
    );
  }

  const markdownContent = await res.text();

  // Populate memory cache
  MEMORY_CACHE.set(chapterNumber, markdownContent);

  // Populate persistent storage
  try {
    const entry: CachedNoteEntry = {
      chapterNumber,
      hash: chapterMeta?.hash || "unknown",
      content: markdownContent,
      cachedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    // In case localStorage is full or disabled
  }

  return markdownContent;
}

/**
 * Lazy loads a week's markdown notes with version-aware multi-layer caching:
 * 1. Checks expected hash from manifest.weeks.
 * 2. In-memory Map lookup.
 * 3. LocalStorage cache check.
 * 4. Network fetch with content hash query parameter.
 */
export async function fetchWeekNoteContent(
  weekNumber: number,
  manifest?: ChapterNotesManifest
): Promise<string> {
  // Determine current expected hash if manifest is available
  let activeManifest = manifest;
  if (!activeManifest) {
    try {
      activeManifest = await getChapterNotesManifest();
    } catch {
      // Fallback
    }
  }

  const weekMeta = activeManifest?.weeks?.find(
    (w) => w.weekNumber === weekNumber
  );

  const storageKey = `${WEEK_CACHE_STORAGE_PREFIX}${weekNumber}`;

  // 1. In-memory cache hit - verify hash if available
  if (WEEK_MEMORY_CACHE.has(weekNumber)) {
    try {
      const rawStorage = localStorage.getItem(storageKey);
      if (rawStorage) {
        const parsed = JSON.parse(rawStorage) as CachedNoteEntry;
        if (!weekMeta || parsed.hash === weekMeta.hash) {
          return WEEK_MEMORY_CACHE.get(weekNumber)!;
        }
      } else if (!weekMeta) {
        return WEEK_MEMORY_CACHE.get(weekNumber)!;
      }
    } catch {
      // Continue
    }
  }

  // 2. LocalStorage cache hit check
  try {
    const rawStorage = localStorage.getItem(storageKey);
    if (rawStorage) {
      const parsed = JSON.parse(rawStorage) as CachedNoteEntry;
      if (weekMeta && parsed.hash === weekMeta.hash) {
        WEEK_MEMORY_CACHE.set(weekNumber, parsed.content);
        return parsed.content;
      }
    }
  } catch {
    // Fall through
  }

  // 3. Network fetch with hash query param
  const targetFile = weekMeta?.fileName || `week-${weekNumber}.md`;
  const url = weekMeta?.hash
    ? `/notes/${targetFile}?v=${weekMeta.hash}`
    : `/notes/${targetFile}`;

  const res = await fetch(url, {
    cache: "no-cache",
  });

  if (!res.ok) {
    throw new Error(
      `Could not load summary notes for Week ${weekNumber} (HTTP ${res.status}).`
    );
  }

  const markdownContent = await res.text();

  WEEK_MEMORY_CACHE.set(weekNumber, markdownContent);

  try {
    const entry: CachedNoteEntry = {
      weekNumber,
      hash: weekMeta?.hash || "unknown",
      content: markdownContent,
      cachedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(entry));
  } catch {
    // Ignore
  }

  return markdownContent;
}

/**
 * Preloads a list of chapters (e.g. adjacent chapters) in background idle time
 */
export function preloadAdjacentChapterNotes(
  currentChapter: number,
  maxChapters = 60
): void {
  const targets = [currentChapter - 1, currentChapter + 1].filter(
    (n) => n >= 1 && n <= maxChapters && !MEMORY_CACHE.has(n)
  );

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      targets.forEach((n) => fetchChapterNoteContent(n).catch(() => {}));
    });
  } else {
    setTimeout(() => {
      targets.forEach((n) => fetchChapterNoteContent(n).catch(() => {}));
    }, 1000);
  }
}

