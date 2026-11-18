"use client";

import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Clipboard } from "lucide-react";
import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { plainTextOf } from "@/lib/notionBlocks";

export default function CustomCodeBlock({ block }: { block: CodeBlockObjectResponse }) {
  const [copied, setCopied] = useState(false);

  const language = block.code.language || "plaintext";
  const code = plainTextOf(block.code.rich_text);
  const caption = plainTextOf(block.code.caption);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden max-w-full relative">
      {/* Header bar */}
      <div className="bg-slate-800 text-slate-400 text-xs px-4 py-2 flex justify-between items-center">
        <span>{language}</span>
        <button onClick={handleCopy} className="text-slate-400 hover:text-white p-1 rounded transition">
          {copied ? <Check size={16} /> : <Clipboard size={16} />}
        </button>
      </div>

      {/* Code dengan scroll horizontal */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          overflowX: "auto",
          maxWidth: "100%",
          scrollBehavior: "smooth",
        }}
      >
        {code}
      </SyntaxHighlighter>

      {caption && <p className="text-xs text-slate-500 mt-1 text-center">{caption}</p>}
    </div>
  );
}
