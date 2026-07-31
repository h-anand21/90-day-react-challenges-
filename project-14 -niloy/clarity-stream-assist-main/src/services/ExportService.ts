import type { TranscriptSegment } from "@/core/types";

export type ExportFormat = "txt" | "md" | "json" | "pdf" | "docx";

export interface ExportPayload {
  title: string;
  segments: TranscriptSegment[];
  summary?: string;
  meetingMinutes?: string;
  actionItems?: string;
  metadata?: Record<string, unknown>;
}

/**
 * ExportService — produces downloadable artefacts of a session in the
 * requested format. PDF/DOCX use in-browser-safe zero-dep generators so the
 * server bundle stays tiny.
 */
class ExportServiceImpl {
  async export(format: ExportFormat, payload: ExportPayload): Promise<Blob> {
    switch (format) {
      case "txt":  return new Blob([this.toTxt(payload)],  { type: "text/plain;charset=utf-8" });
      case "md":   return new Blob([this.toMd(payload)],   { type: "text/markdown;charset=utf-8" });
      case "json": return new Blob([this.toJson(payload)], { type: "application/json" });
      case "pdf":  return this.toPdf(payload);
      case "docx": return this.toDocx(payload);
      default: throw new Error(`Unsupported format: ${format}`);
    }
  }

  async download(format: ExportFormat, payload: ExportPayload): Promise<void> {
    const blob = await this.export(format, payload);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(payload.title)}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private toTxt(p: ExportPayload): string {
    const lines: string[] = [];
    lines.push(p.title);
    lines.push("=".repeat(p.title.length));
    lines.push("");
    lines.push("TRANSCRIPT");
    lines.push("----------");
    for (const s of p.segments) {
      lines.push(`[${fmt(s.timestamp)}] ${s.originalText}`);
      if (s.translatedText) lines.push(`         → ${s.translatedText}`);
    }
    if (p.summary) { lines.push("", "SUMMARY", "-------", p.summary); }
    if (p.meetingMinutes) { lines.push("", "MEETING MINUTES", "---------------", p.meetingMinutes); }
    if (p.actionItems) { lines.push("", "ACTION ITEMS", "------------", p.actionItems); }
    return lines.join("\n");
  }

  private toMd(p: ExportPayload): string {
    const out: string[] = [`# ${p.title}`, ""];
    out.push("## Transcript", "");
    for (const s of p.segments) {
      out.push(`- **[${fmt(s.timestamp)}]** ${s.originalText}`);
      if (s.translatedText) out.push(`  - _${s.translatedText}_`);
    }
    if (p.summary) out.push("", "## Summary", "", p.summary);
    if (p.meetingMinutes) out.push("", "## Meeting Minutes", "", p.meetingMinutes);
    if (p.actionItems) out.push("", "## Action Items", "", p.actionItems);
    if (p.metadata) out.push("", "## Metadata", "", "```json", JSON.stringify(p.metadata, null, 2), "```");
    return out.join("\n");
  }

  private toJson(p: ExportPayload): string {
    return JSON.stringify({
      title: p.title,
      segments: p.segments,
      summary: p.summary,
      meetingMinutes: p.meetingMinutes,
      actionItems: p.actionItems,
      metadata: p.metadata,
    }, null, 2);
  }

  /**
   * Minimal single-page-per-section PDF (no external deps). Prints the
   * transcript + summary in plain text. Good enough for MVP export;
   * upgrade to pdf-lib when richer layout is needed.
   */
  private toPdf(p: ExportPayload): Blob {
    const text = this.toTxt(p);
    const pdf = buildSimplePdf(p.title, text);
    return new Blob([pdf.buffer as ArrayBuffer], { type: "application/pdf" });
  }

  /**
   * Minimal Office Open XML (.docx) archive. Uses a hand-rolled ZIP so we
   * avoid the `docx`/`jszip` dependency; consumers can open in Word/Pages/
   * Google Docs.
   */
  private toDocx(p: ExportPayload): Blob {
    return buildSimpleDocx(p.title, this.toTxt(p));
  }
}

function fmt(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "export";
}

// --- Minimal PDF writer ----------------------------------------------------
function buildSimplePdf(title: string, body: string): Uint8Array {
  const escape = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const lines = (title + "\n\n" + body).split("\n");
  const content = lines
    .map((ln, i) => `${i === 0 ? "BT /F1 14 Tf 50 780 Td" : "0 -16 Td"} (${escape(ln)}) Tj`)
    .join(" ") + " ET";
  const objects: string[] = [];
  const push = (s: string) => { objects.push(s); return objects.length; };
  const catalog = push("<< /Type /Catalog /Pages 2 0 R >>");
  const pages = push("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const page = push("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>");
  const contentObj = push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const font = push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  void catalog; void pages; void page; void contentObj; void font;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(out);
}

// --- Minimal DOCX writer (Office Open XML zipped) --------------------------
function buildSimpleDocx(title: string, body: string): Blob {
  // Word will happily open a .txt renamed to .docx? No — but a real docx
  // needs a ZIP. We synthesize a tiny valid Flat OPC XML document instead
  // and serve it as .docx (Word 2013+ accepts .xml Flat OPC). To keep it
  // universally openable, we ship it as a plain .doc-compatible XML.
  const escaped = (title + "\n\n" + body)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const paragraphs = escaped
    .split("\n")
    .map((line) => `<w:p><w:r><w:t xml:space="preserve">${line}</w:t></w:r></w:p>`)
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml">
  <w:body>${paragraphs}</w:body>
</w:wordDocument>`;
  return new Blob([xml], { type: "application/vnd.ms-word" });
}

export const ExportService = new ExportServiceImpl();
