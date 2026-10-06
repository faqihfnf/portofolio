"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

// Worker harus di-set di modul yang sama dengan <Document>/<Page>
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

interface PdfViewerProps {
  file: string;
}

export default function PdfViewer({ file }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [numPages, setNumPages] = useState(0);

  // Lebar halaman mengikuti lebar modal supaya pas di HP maupun desktop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const status = <p className="py-16 text-center text-sm text-[var(--ed-text-muted)]">Loading…</p>;

  return (
    <div ref={containerRef} className="w-full">
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={status}
        error={<p className="py-16 text-center text-sm text-[var(--ed-text-muted)]">Gagal memuat PDF.</p>}
      >
        {width &&
          Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={width}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={status}
              className="mb-4 overflow-hidden rounded-md last:mb-0"
              canvasBackground="white"
            />
          ))}
      </Document>
    </div>
  );
}
