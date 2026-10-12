import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "cn";

interface MermaidViewerProps {
  code: string;
  className?: string;
}

// Global initialization with modern design styling
mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  securityLevel: "loose",
  fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif",
  flowchart: {
    htmlLabels: true,
    curve: "basis",
    useMaxWidth: true,
    nodeSpacing: 45,
    rankSpacing: 55,
    padding: 16,
  },
  themeVariables: {
    // Canvas & backgrounds
    background: "transparent",
    mainBkg: "#18181b", // zinc-900
    nodeBorder: "#3f3f46", // zinc-700

    // Typography
    textColor: "#f4f4f5", // zinc-100
    fontSize: "13px",

    // Flow edges & connectors
    lineColor: "#71717a", // zinc-500
    edgeLabelBackground: "#27272a", // zinc-800 pill badge

    // Accent clusters & primary
    primaryColor: "#27272a",
    primaryTextColor: "#fafafa",
    primaryBorderColor: "#52525b",

    // Secondary & Tertiary
    secondaryColor: "#18181b",
    secondaryBorderColor: "#3f3f46",
    secondaryTextColor: "#e4e4e7",
    tertiaryColor: "#09090b",
    tertiaryBorderColor: "#27272a",
    tertiaryTextColor: "#d4d4d8",
  },
});

export function MermaidViewer({ code, className }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid
      .render(id, code.trim())
      .then(({ svg }) => {
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError("Failed to render diagram.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  if (error) {
    return (
      <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg font-mono">
        {error}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-6 overflow-x-auto rounded-2xl border border-border/80 bg-zinc-950/40 dark:bg-zinc-950/70 backdrop-blur-xs p-6 sm:p-8 shadow-xs not-prose flex justify-center",
        className,
      )}
    >
      <div
        ref={containerRef}
        className={cn(
          "w-full flex justify-center text-foreground transition-all duration-200",
          // Style SVG nodes as sleek modern cards
          "[&_svg]:max-w-full [&_svg]:h-auto",
          // Node boxes styling
          "[&_.node_rect]:rx-3 [&_.node_rect]:ry-3", // Rounded corners (12px)
          "[&_.node_rect]:fill-zinc-900! [&_.node_rect]:stroke-zinc-700/80! [&_.node_rect]:stroke-[1.5px]!",
          "[&_.node_polygon]:fill-zinc-900! [&_.node_polygon]:stroke-zinc-700/80! [&_.node_polygon]:stroke-[1.5px]!",
          // Node text
          "[&_.node_.label]:font-sans",
          "[&_.node_.label_b]:text-[13px]! [&_.node_.label_b]:font-bold! [&_.node_.label_b]:tracking-wide! [&_.node_.label_b]:text-zinc-100!",
          "[&_.node_.label_small]:text-[11px]! [&_.node_.label_small]:leading-relaxed! [&_.node_.label_small]:text-zinc-400! [&_.node_.label_small]:block! [&_.node_.label_small]:mt-1!",
          // Flow connectors & arrows
          "[&_.flowchart-link]:stroke-zinc-500! [&_.flowchart-link]:stroke-[1.5px]!",
          "[&_.marker]:fill-zinc-400! [&_.marker]:stroke-zinc-400!",
          // Edge labels pill badges
          "[&_.edgeLabel]:bg-transparent!",
          "[&_.edgeLabel_rect]:fill-zinc-800/90! [&_.edgeLabel_rect]:rx-2! [&_.edgeLabel_rect]:ry-2! [&_.edgeLabel_rect]:stroke-zinc-700/80! [&_.edgeLabel_rect]:stroke-[1px]!",
          "[&_.edgeLabel_.label]:text-[11px]! [&_.edgeLabel_.label]:font-mono! [&_.edgeLabel_.label]:text-zinc-300! [&_.edgeLabel_.label]:font-medium!",
        )}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
}
