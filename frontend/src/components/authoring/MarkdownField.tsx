"use client";

import { useState } from "react";
import Markdown from "react-markdown";

interface MarkdownFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}

/** Markdown textarea with a live preview tab, rendered the same way as published articles. */
export function MarkdownField({ name, label, defaultValue = "", error }: MarkdownFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const id = `field-${name}`;

  return (
    <div className="markdown-field">
      <div className="markdown-field__header">
        <label htmlFor={id}>{label}</label>
        <div role="tablist" className="markdown-field__tabs">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
            >
              {t === "write" ? "Write" : "Preview"}
            </button>
          ))}
        </div>
      </div>
      {/* The textarea stays mounted (hidden in preview) so the form always submits it. */}
      <textarea
        id={id}
        name={name}
        rows={18}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hidden={tab === "preview"}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
      />
      {tab === "preview" && (
        <div className="article-body markdown-field__preview">
          {value.trim() ? <Markdown>{value}</Markdown> : <p>Nothing to preview yet.</p>}
        </div>
      )}
      <p className="field-hint" id={`${id}-hint`}>
        Markdown: **bold**, *italic*, ## headings, - lists, [links](https://…). Leave a blank line
        between paragraphs.
      </p>
      {error && (
        <div className="error" id={`${id}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}
