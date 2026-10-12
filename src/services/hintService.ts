import type { Question } from "@/types";

export interface NoteSectionChunk {
  id: string;
  title: string;
  parentHeading?: string;
  content: string;
  cleanContent: string;
  sourceType: "chapter" | "week";
  sourceNumber: number;
}

export interface MatchedHint {
  sectionTitle: string;
  parentHeading?: string;
  excerpt: string;
  matchedKeywords: string[];
  relevanceScore: number;
  sourceType: "chapter" | "week";
  sourceNumber: number;
}

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
  "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his",
  "how", "i", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's", "me",
  "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
  "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs",
  "them", "themselves", "then", "there", "there's", "these", "they", "this", "those", "through", "to",
  "too", "under", "until", "up", "very", "was", "wasn't", "we", "were", "weren't", "what", "what's",
  "when", "where", "which", "while", "who", "whom", "why", "with", "won't", "would", "wouldn't",
  "you", "your", "yours", "yourself", "yourselves",
  // Common question words
  "which", "statement", "following", "true", "false", "correct", "incorrect", "best", "defines",
  "refer", "refers", "context", "given", "select", "options", "option", "point", "points", "lecture",
  "according", "mcq", "msq",
]);

/**
 * Clean latex and markdown formatting into plain text
 */
function cleanText(text: string): string {
  return text
    .replace(/\\texttt\{([^}]+)\}/g, "$1")
    .replace(/\\textbf\{([^}]+)\}/g, "$1")
    .replace(/\\textit\{([^}]+)\}/g, "$1")
    .replace(/\\mbox\{([^}]+)\}/g, "$1")
    .replace(/\\hfill/g, " ")
    .replace(/\[(MCQ|MSQ)[^\]]*\]/gi, " ")
    .replace(/[*#`_~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize text into alphanumeric terms, filtering short words and stopwords
 */
function tokenize(text: string): string[] {
  const cleaned = cleanText(text).toLowerCase();
  const tokens = cleaned.match(/[a-z0-9_]{3,}/g) || [];
  return tokens.filter((t) => !STOP_WORDS.has(t) && !/^\d+$/.test(t));
}

/**
 * Break markdown content into semantic sections based on ## or ### headings
 */
export function chunkMarkdownNotes(
  markdown: string,
  sourceType: "chapter" | "week",
  sourceNumber: number
): NoteSectionChunk[] {
  const lines = markdown.split("\n");
  const chunks: NoteSectionChunk[] = [];

  let currentHeading = `General (Ch ${sourceNumber})`;
  let currentParent = "";
  let currentBuffer: string[] = [];
  let chunkIndex = 0;

  const flushChunk = () => {
    const rawContent = currentBuffer.join("\n").trim();
    if (rawContent.length > 20) {
      chunks.push({
        id: `${sourceType}-${sourceNumber}-chunk-${chunkIndex++}`,
        title: currentHeading,
        parentHeading: currentParent || undefined,
        content: rawContent,
        cleanContent: cleanText(rawContent),
        sourceType,
        sourceNumber,
      });
    }
    currentBuffer = [];
  };

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    const h3Match = line.match(/^###\s+(.+)$/);

    if (h2Match) {
      flushChunk();
      currentParent = h2Match[1].trim();
      currentHeading = currentParent;
    } else if (h3Match) {
      flushChunk();
      currentHeading = h3Match[1].trim();
    } else {
      currentBuffer.push(line);
    }
  }

  flushChunk();
  return chunks;
}

/**
 * BM25 / Frequency-based scoring of note chunks against a Question
 */
export function findRelevantHintSections(
  question: Question,
  chunks: NoteSectionChunk[],
  maxResults = 2
): MatchedHint[] {
  if (!chunks.length) return [];

  // Extract query terms with distinct weighting
  // Question stem has higher weight, options give supporting vocabulary
  const stemTokens = tokenize(question.question || question.raw_stem || "");
  const optionTokens: string[] = [];
  if (question.options) {
    for (const opt of question.options) {
      optionTokens.push(...tokenize(opt.text || ""));
    }
  }

  // Frequency map for query
  const queryTermWeights = new Map<string, number>();
  for (const t of stemTokens) {
    queryTermWeights.set(t, (queryTermWeights.get(t) || 0) + 2.5);
  }
  for (const t of optionTokens) {
    queryTermWeights.set(t, (queryTermWeights.get(t) || 0) + 0.8);
  }

  const queryTerms = Array.from(queryTermWeights.keys());
  if (!queryTerms.length) return [];

  // Corpus stats for BM25
  const N = chunks.length;
  const docFreq = new Map<string, number>();
  const chunkTokenData = chunks.map((chunk) => {
    const titleTokens = tokenize(chunk.title);
    const parentTokens = chunk.parentHeading ? tokenize(chunk.parentHeading) : [];
    const bodyTokens = tokenize(chunk.cleanContent);

    // Give heading tokens extra prominence in the chunk representation
    const allTokens = [...titleTokens, ...titleTokens, ...parentTokens, ...bodyTokens];
    const termCounts = new Map<string, number>();
    for (const t of allTokens) {
      termCounts.set(t, (termCounts.get(t) || 0) + 1);
    }

    // Update document frequencies
    for (const t of termCounts.keys()) {
      docFreq.set(t, (docFreq.get(t) || 0) + 1);
    }

    return {
      chunk,
      termCounts,
      docLength: allTokens.length,
      titleTokens: new Set(titleTokens),
    };
  });

  const avgDocLength =
    chunkTokenData.reduce((acc, d) => acc + d.docLength, 0) / (N || 1);

  // BM25 parameters
  const k1 = 1.4;
  const b = 0.75;

  const scoredResults: {
    chunk: NoteSectionChunk;
    score: number;
    matchedKeywords: string[];
    bestParagraphExcerpt: string;
  }[] = [];

  for (const { chunk, termCounts, docLength, titleTokens } of chunkTokenData) {
    let score = 0;
    const matchedTerms: string[] = [];

    for (const term of queryTerms) {
      const tf = termCounts.get(term) || 0;
      if (tf > 0) {
        matchedTerms.push(term);
        const df = docFreq.get(term) || 1;
        // Standard BM25 IDF formula
        const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
        const tfComponent = (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (docLength / (avgDocLength || 1))));
        const qWeight = queryTermWeights.get(term) || 1;

        // Bonus for heading match
        const headingBoost = titleTokens.has(term) ? 2.0 : 1.0;

        score += idf * tfComponent * qWeight * headingBoost;
      }
    }

    if (score > 0 && matchedTerms.length > 0) {
      // Find the most relevant paragraph / bullet block within the chunk
      const bestParagraphExcerpt = extractBestSnippet(chunk.content, matchedTerms);

      scoredResults.push({
        chunk,
        score,
        matchedKeywords: matchedTerms.slice(0, 5),
        bestParagraphExcerpt,
      });
    }
  }

  // Sort descending by score
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.slice(0, maxResults).map((r) => ({
    sectionTitle: r.chunk.title,
    parentHeading: r.chunk.parentHeading,
    excerpt: r.bestParagraphExcerpt || r.chunk.content.slice(0, 300),
    matchedKeywords: r.matchedKeywords,
    relevanceScore: Math.round(r.score * 10) / 10,
    sourceType: r.chunk.sourceType,
    sourceNumber: r.chunk.sourceNumber,
  }));
}

/**
 * Calculates total match relevance score aggregated per chapter
 */
export function calculateChapterMatchScores(
  question: Question,
  chunks: NoteSectionChunk[]
): Record<number, number> {
  const chapterChunks = chunks.filter((c) => c.sourceType === "chapter");
  if (!chapterChunks.length) return {};

  const hints = findRelevantHintSections(question, chapterChunks, 20);
  const scores: Record<number, number> = {};

  for (const h of hints) {
    if (h.sourceType === "chapter") {
      scores[h.sourceNumber] = (scores[h.sourceNumber] || 0) + h.relevanceScore;
    }
  }

  return scores;
}

/**
 * Extracts 2-4 key lines/bullets from a section that have the highest concentration of matched query terms
 */
function extractBestSnippet(content: string, matchedTerms: string[]): string {
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  if (blocks.length <= 1) {
    return content.trim();
  }

  const termSet = new Set(matchedTerms.map((t) => t.toLowerCase()));

  let bestBlock = blocks[0];
  let maxMatches = -1;

  for (const block of blocks) {
    const lower = block.toLowerCase();
    let matches = 0;
    for (const term of termSet) {
      if (lower.includes(term)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestBlock = block;
    }
  }

  return bestBlock.trim();
}
