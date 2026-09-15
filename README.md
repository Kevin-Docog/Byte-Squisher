# Byte Squisher

A single-file, fully offline compressor for images, audio, PDFs, and DOCX files. Every file goes in and comes back out as the **same file type** — a JPEG stays a JPEG, a PDF stays a PDF.

Open `byte-squisher.html` in any modern browser. That's the whole install.

## Why it's fully offline

Everything the page needs is baked directly into the single HTML file — there are no `<script src>` tags, no `<link>` tags, and no `fetch`/`XHR` calls to any external server, ever:

- **Compression libraries** are inlined: [JSZip](https://stuk.github.io/jszip/), [pdf-lib](https://pdf-lib.js.org/), [jsPDF](https://github.com/parallax/jsPDF), and [pdf.js](https://mozilla.github.io/pdf.js/) (including its worker script, embedded as base64 and turned into a Blob URL at runtime).
- **Audio encoding** uses a bundled MP3 encoder ([lamejs](https://github.com/zhuker/lamejs)) plus the browser's native Web Audio API — no server-side transcoding.
- **The display font** (Press Start 2P) is embedded as a base64 `@font-face`, not loaded from Google Fonts.
- **Files never leave your device.** Nothing is uploaded anywhere; all compression happens client-side in your browser.

You can disconnect from the internet entirely before opening the file and everything still works.

## Tools included

| Tab | What it does | Output |
|---|---|---|
| **Image** | Re-encodes at a lower quality and/or smaller max width via the Canvas API | JPEG, WebP, or PNG |
| **Audio** | Decodes and re-encodes as a real MP3 at your chosen bitrate | MP3 |
| **PDF** | *Standard* mode re-saves with an optimized internal structure (text stays selectable). *Aggressive* mode rasterizes each page as a compressed image (much smaller, but text is no longer selectable) | PDF |
| **DOCX** | Re-encodes embedded images and repacks the internal zip at maximum compression; text and formatting are untouched | DOCX |

## How to use it

1. Pick a tab for your file type.
2. Drag a file onto the drop zone, or tap it to browse.
3. Adjust the quality/bitrate/mode settings shown.
4. Click **Compress**.
5. Download the result — it shows original size, compressed size, and % saved.

## Notes & limits

- Already-compressed files (photos that are already low quality, heavily-compressed MP3s, etc.) won't shrink much further — that's expected, not a bug.
- PDF "Aggressive" mode and MP3 encoding are CPU-bound and run entirely in your browser tab, so very large files take a little time.
- Requires a browser with Canvas, Web Audio, and `CompressionStream`-era JS support — recent Chrome, Edge, Firefox, or Safari.
- The file is large (~3 MB) because every library is embedded rather than loaded from a CDN — that's the tradeoff for true offline use.

## File

- `byte-squisher.html` — the entire app. Single file, no dependencies, no build step.
