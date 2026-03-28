"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function GameDescriptionMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-heading prose-p:text-muted-foreground prose-a:text-accent prose-strong:text-foreground prose-li:text-muted-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
