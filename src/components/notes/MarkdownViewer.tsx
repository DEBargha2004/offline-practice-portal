import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "cn";
import {
  Copy,
  Check,
  Layers,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Reader Prose */}
      <article className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90 font-sans">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Chapter Title (omitted from renderer as page header already displays it)
            h1: () => null,

            // Section Headers
            h2: ({ children, node }) => {
              const text = String(children);
              const isExam =
                text.toLowerCase().includes("takeaway") ||
                text.toLowerCase().includes("exam");

              // Check if this is the very first h2 in document to place copy button aligned with it
              const isFirstH2 = !node?.position?.start?.line || node.position.start.line <= 4;

              return (
                <div
                  className={cn(
                    "flex items-center justify-between gap-3 pb-3 border-b",
                    isFirstH2 ? "mt-0 mb-4" : "mt-8 mb-4",
                    isExam
                      ? "border-amber-500/30 text-amber-900 dark:text-amber-100"
                      : "border-border/60 text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {isExam ? (
                      <BookmarkCheck className="size-4.5 text-amber-500 shrink-0" />
                    ) : (
                      <Layers className="size-4 text-primary/80 shrink-0" />
                    )}
                    <h2 className="text-base sm:text-lg font-bold tracking-tight m-0 text-foreground">
                      {children}
                    </h2>
                  </div>

                  {isFirstH2 && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={handleCopyNotes}
                      className="h-7 px-2 text-[11px] font-medium gap-1.5 transition-all shadow-2xs hover:bg-muted shrink-0 not-prose"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 opacity-60" />
                          <span>Copy Notes</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            },

            // Subsections
            h3: ({ children }) => (
              <div className="flex items-center gap-2 mt-6 mb-2.5">
                <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                <h3 className="text-sm sm:text-base font-semibold text-foreground/95 m-0">
                  {children}
                </h3>
              </div>
            ),

            h4: ({ children }) => (
              <h4 className="text-xs sm:text-sm font-semibold text-foreground/85 uppercase tracking-wider mt-4 mb-2">
                {children}
              </h4>
            ),

            // Paragraphs
            p: ({ children }) => (
              <p className="text-sm sm:text-[15px] leading-relaxed text-foreground/85 my-3">
                {children}
              </p>
            ),

            // Blockquotes
            blockquote: ({ children }) => (
              <div className="my-5 rounded-lg border-l-3 border-primary/70 bg-muted/40 p-3.5 sm:p-4 text-xs sm:text-sm text-foreground/80 italic shadow-2xs">
                {children}
              </div>
            ),

            // Comparison Tables
            table: ({ children }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-border/80 shadow-xs bg-card/60 backdrop-blur-xs">
                <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-muted/70 border-b border-border text-xs font-semibold text-foreground uppercase tracking-wider">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-border/40 text-foreground/85">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-muted/30 transition-colors duration-150">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-3 font-semibold text-foreground/90 whitespace-nowrap">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 align-top leading-normal">{children}</td>
            ),

            // Lists
            ul: ({ children }) => (
              <ul className="my-3 space-y-2 list-none pl-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="my-3 space-y-2 list-decimal pl-5 text-sm sm:text-[15px] text-foreground/85 leading-relaxed marker:font-semibold marker:text-primary">
                {children}
              </ol>
            ),
            li: ({ children, className }) => {
              const isTask = className?.includes("task-list-item");
              if (isTask) {
                return (
                  <li className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 py-1 font-medium bg-muted/20 px-2 rounded-md">
                    {children}
                  </li>
                );
              }
              return (
                <li className="flex items-start gap-2.5 text-sm sm:text-[15px] text-foreground/85 leading-relaxed">
                  <ArrowRight className="size-3 text-primary/60 mt-1.5 shrink-0" />
                  <div className="flex-1">{children}</div>
                </li>
              );
            },

            // Checkbox inputs (for checklists)
            input: ({ checked, disabled }) => (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                readOnly
                aria-label="Checklist item"
                className="size-4 mt-0.5 rounded border-muted-foreground/30 accent-primary cursor-pointer shrink-0"
              />
            ),

            // Inline and block code
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[12px] text-foreground font-medium border border-border/40">
                    {children}
                  </code>
                );
              }
              return (
                <div className="my-4 rounded-xl border border-border/70 bg-muted/40 p-4 font-mono text-xs overflow-x-auto shadow-2xs">
                  <code className="block text-foreground/90 whitespace-pre">
                    {children}
                  </code>
                </div>
              );
            },

            // Strong highlights
            strong: ({ children }) => (
              <strong className="font-semibold text-foreground tracking-tight">
                {children}
              </strong>
            ),

            // Dividers
            hr: () => <hr className="my-8 border-border/40" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
