'use client';

import { useEffect, useRef } from 'react';

// Render PDFs with pdf.js to <canvas> instead of a native <iframe>: desktop browsers have a built-in
// inline PDF viewer, but Android Chrome/Opera do not (an iframed PDF is a blank frame there), whereas
// canvas rendering works on every platform.
//
// pdf.js (pdfjs-dist v5) ships as ESM using top-level await. Webpack mis-compiles that in every
// import path we tried ("Object.defineProperty called on non-object"), so we sidestep the bundler:
// the lib + worker are vendored into /public/pdfjs and loaded with a webpackIgnore dynamic import,
// which the BROWSER evaluates as a native ES module (browsers handle top-level await fine). Keep the
// vendored files in sync with the pdfjs-dist version in package.json: run `npm run vendor-pdfjs`
// after bumping it.
const PDFJS_LIB_URL = '/pdfjs/pdf.min.mjs';
const PDFJS_WORKER_URL = '/pdfjs/pdf.worker.min.mjs';

// Cap the rendered page width so pages don't blow up on ultrawide desktops; the container governs
// the width on phones and tablets.
const MAX_PAGE_WIDTH = 1100;

interface PdfDocumentViewProps {
  /** Blob/object URL of the PDF to render. */
  fileUrl: string;
  /** Called once the document has finished rendering. */
  onLoadSuccess?: () => void;
  /** Called if the document fails to load, parse, or render. */
  onLoadError?: () => void;
}

/** Client-only PDF renderer: a vertical, fit-to-width stack of canvas pages in a scroll container. */
export function PdfDocumentView({ fileUrl, onLoadSuccess, onLoadError }: PdfDocumentViewProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Hold the callbacks in refs so the render effect depends only on fileUrl. The modal passes inline
  // closures whose identity changes every render; depending on them would re-run the render (and
  // re-fire onLoadSuccess) in a loop.
  const onLoadSuccessRef = useRef(onLoadSuccess);
  const onLoadErrorRef = useRef(onLoadError);
  onLoadSuccessRef.current = onLoadSuccess;
  onLoadErrorRef.current = onLoadError;

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const stage = stageRef.current;
      if (!stage) return;
      try {
        const pdfjs: typeof import('pdfjs-dist') = await import(
          /* webpackIgnore: true */ PDFJS_LIB_URL
        );
        // Same-origin worker, covered by the CSP `worker-src 'self'`.
        pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;

        const pdf = await pdfjs.getDocument({ url: fileUrl }).promise;
        if (cancelled) return;

        stage.replaceChildren();
        const targetWidth = Math.min((stage.clientWidth || 0) - 24, MAX_PAGE_WIDTH);
        const dpr = window.devicePixelRatio || 1;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = targetWidth > 0 ? targetWidth / baseViewport.width : 1;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.className = 'shadow-md';
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          stage.appendChild(canvas);

          await page.render({
            canvas,
            viewport,
            // Scale the device-pixel-ratio backing store down to CSS pixels (identity when dpr === 1).
            transform: [dpr, 0, 0, dpr, 0, 0],
          }).promise;
          if (cancelled) return;
        }

        onLoadSuccessRef.current?.();
      } catch (err) {
        if (!cancelled) {
          console.error('PDF render failed:', err);
          onLoadErrorRef.current?.();
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <div ref={stageRef} className="flex h-full w-full flex-col items-center gap-4 overflow-auto py-4" />
  );
}

export default PdfDocumentView;
