import React from "react";
import { cn } from "cn";

export interface DiagramNode {
  id: string;
  title: string;
  subtitle?: string;
  details?: string[];
  variant?: "primary" | "secondary" | "accent" | "muted";
}

export interface DiagramFlowConnection {
  label?: string;
  bidirectional?: boolean;
}

export interface DiagramData {
  type: "stack" | "tree" | "pipeline";
  title?: string;
  nodes: (DiagramNode | DiagramNode[])[];
  connectors: (DiagramFlowConnection | undefined)[];
}

/**
 * Parses `diagram` fenced code block syntax:
 */
export function parseDiagramSyntax(source: string): DiagramData {
  const lines = source.trim().split("\n");
  const nodesSequence: (DiagramNode | DiagramNode[])[] = [];
  const connectors: (DiagramFlowConnection | undefined)[] = [];

  let pendingConnectorLabel: string | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const connectorMatch = rawLine.match(/^(\||\^|v|<->|-->|<-)\s*(?:\((.+?)\))?/i);
    const arrowOnlyMatch = rawLine.match(/^[vV\^]\s*(?:\((.+?)\))?/);

    if (connectorMatch || arrowOnlyMatch) {
      const label = connectorMatch?.[2] || arrowOnlyMatch?.[1];
      if (label) {
        pendingConnectorLabel = label.trim();
      }
      continue;
    }

    if (rawLine.includes("[") && rawLine.includes("]")) {
      const bracketRegex = /\[([^\]]+)\]/g;
      const rowMatches: string[] = [];
      let match;
      while ((match = bracketRegex.exec(rawLine)) !== null) {
        rowMatches.push(match[1]);
      }

      if (rowMatches.length > 0) {
        if (nodesSequence.length > 0) {
          connectors.push({
            label: pendingConnectorLabel,
            bidirectional: false,
          });
          pendingConnectorLabel = undefined;
        }

        const parsedNodes: DiagramNode[] = rowMatches.map((content, idx) => {
          const parts = content.split("|").map((p) => p.trim());
          const title = parts[0];
          const subtitle = parts.length > 1 ? parts[1] : undefined;
          const details = parts.slice(2);

          return {
            id: `node-${nodesSequence.length}-${idx}`,
            title,
            subtitle,
            details: details.length ? details : undefined,
            variant:
              nodesSequence.length === 0
                ? "primary"
                : idx % 2 === 0
                  ? "secondary"
                  : "accent",
          };
        });

        if (parsedNodes.length === 1) {
          nodesSequence.push(parsedNodes[0]);
        } else {
          nodesSequence.push(parsedNodes);
        }
      }
    }
  }

  return {
    type: "stack",
    nodes: nodesSequence,
    connectors,
  };
}

/**
 * Clean SVG Flow Connector that embeds the label cleanly along the arrow path
 */
function FlowConnector({ label }: { label?: string }) {
  return (
    <div className="relative flex flex-col items-center justify-center my-1 select-none">
      {/* SVG Arrow line that passes through the badge seamlessly */}
      <div className="flex flex-col items-center">
        {/* Upper stem */}
        <div className="w-[1.5px] h-3 bg-border dark:bg-border/80" />

        {/* Integrated Label or Minimal Bridge */}
        {label ? (
          <div className="relative my-0.5 z-10">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-tight font-medium bg-background dark:bg-zinc-800 text-muted-foreground border border-border/80 shadow-2xs">
              {label}
            </span>
          </div>
        ) : (
          <div className="w-[1.5px] h-2 bg-border dark:bg-border/80" />
        )}

        {/* Lower stem and sharp arrow head */}
        <div className="flex flex-col items-center -mt-0.5">
          <div className="w-[1.5px] h-3 bg-border dark:bg-border/80" />
          <svg
            className="w-3 h-2 -mt-0.5 text-muted-foreground/80 dark:text-muted-foreground fill-current"
            viewBox="0 0 12 8"
          >
            <path d="M6 8L0 0H12L6 8Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * Modern Interactive SVG / Tailwind Component for Architecture & Taxonomy diagrams
 */
export function ModernDiagramViewer({ code }: { code: string }) {
  const diagram = React.useMemo(() => parseDiagramSyntax(code), [code]);

  if (!diagram.nodes.length) {
    return null;
  }

  return (
    <div className="my-6 rounded-2xl border border-border/80 bg-linear-to-b from-card/90 via-card to-muted/20 p-5 sm:p-7 shadow-xs not-prose overflow-hidden">
      <div className="max-w-3xl mx-auto flex flex-col items-center">
        {diagram.nodes.map((item, index) => {
          const isRow = Array.isArray(item);
          const connector = index > 0 ? diagram.connectors[index - 1] : undefined;

          return (
            <React.Fragment key={index}>
              {/* Connected Arrow + Integrated Label */}
              {index > 0 && <FlowConnector label={connector?.label} />}

              {/* Node Card / Multi-column Row */}
              {isRow ? (
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-0.5">
                  {item.map((node) => (
                    <div
                      key={node.id}
                      className="flex flex-col p-3.5 rounded-xl border border-border/80 bg-background/90 hover:border-primary/40 shadow-2xs hover:shadow-xs transition-all duration-200"
                    >
                      <span className="text-xs font-bold text-foreground tracking-tight">
                        {node.title}
                      </span>
                      {node.subtitle && (
                        <span className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {node.subtitle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={cn(
                    "w-full rounded-xl border p-4 sm:p-5 transition-all duration-200 shadow-2xs my-0.5",
                    index === 0
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-primary/5"
                      : "border-border/80 bg-background/80 hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="size-2 rounded-full bg-primary/70 shrink-0" />
                    <h4 className="text-sm sm:text-[15px] font-bold text-foreground tracking-tight m-0">
                      {item.title}
                    </h4>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed pl-4.5 m-0 mt-0.5">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
