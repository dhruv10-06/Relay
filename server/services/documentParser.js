import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { parse as parseCsv } from 'csv-parse/sync';

/**
 * Extracts readable plain text, word count, and metadata from uploaded files.
 * Supports PDF, DOCX, TXT, MD, and CSV.
 */
export async function extractDocumentText(filePath, originalFileName, fileType) {
  const ext = (fileType || path.extname(originalFileName)).toLowerCase().replace('.', '');
  
  let extractedText = '';
  let metadata = {
    originalFileName,
    fileType: ext,
    pages: 1,
    detectedSections: [],
  };

  try {
    const fileBuffer = fs.readFileSync(filePath);

    switch (ext) {
      case 'pdf': {
        try {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text || '';
          metadata.pages = pdfData.numpages || 1;
          metadata.pdfInfo = pdfData.info || {};
        } catch (pdfErr) {
          console.warn(`[Parser Warning] Standard pdf-parse failed (${pdfErr.message}). Using raw text stream fallback.`);
          const rawStr = fileBuffer.toString('binary');
          const matches = rawStr.match(/\(([^()]+)\)\s*Tj/g) || rawStr.match(/\[(.*?)\]\s*TJ/g);
          if (matches) {
            extractedText = matches
              .map((m) => m.replace(/^[(\[]|[)\]]\s*T[jJ]$/g, ''))
              .join(' ');
          } else {
            extractedText = fileBuffer.toString('utf-8').replace(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g, ' ');
          }
          metadata.parserFallback = true;
        }
        break;
      }

      case 'docx': {
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = docxResult.value || '';
        if (docxResult.messages && docxResult.messages.length > 0) {
          metadata.parserWarnings = docxResult.messages.map((m) => m.message);
        }
        break;
      }

      case 'csv': {
        const csvContent = fileBuffer.toString('utf-8');
        const records = parseCsv(csvContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });

        // Format CSV into readable contextual text for LLM and human inspection
        const formattedRows = records.map((row, index) => {
          const pairs = Object.entries(row)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');
          return `[Row ${index + 1}] ${pairs}`;
        });

        extractedText = `CSV DATASET: ${originalFileName}\nTotal Rows: ${records.length}\nColumns: ${Object.keys(records[0] || {}).join(', ')}\n\n` + formattedRows.join('\n');
        metadata.rowCount = records.length;
        metadata.columns = Object.keys(records[0] || {});
        break;
      }

      case 'txt':
      case 'md':
      case 'markdown':
      default: {
        extractedText = fileBuffer.toString('utf-8');
        break;
      }
    }

    // Clean up excessive whitespace while preserving paragraph structure
    const cleanedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const wordCount = cleanedText.length > 0 ? cleanedText.split(/\s+/).length : 0;

    // Detect section headers for evidence location mapping
    const lines = cleanedText.split('\n');
    const detectedSections = [];
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (/^(#|==|--|\d+\.|\bADR\b|\bSection\b|\bMeeting\b|\bExecutive\b)/i.test(trimmed) && trimmed.length < 80) {
        detectedSections.push({ title: trimmed, line: idx + 1 });
      }
    });
    metadata.detectedSections = detectedSections.slice(0, 15);

    return {
      success: true,
      extractedText: cleanedText,
      wordCount,
      metadata,
    };
  } catch (error) {
    console.error(`[Parser Error] Failed to extract text from ${originalFileName}:`, error);
    return {
      success: false,
      extractedText: `[Extraction Error: ${error.message}]`,
      wordCount: 0,
      metadata: { error: error.message },
    };
  }
}
