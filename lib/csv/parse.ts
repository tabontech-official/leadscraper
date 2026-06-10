import Papa from "papaparse";

export interface CsvRow {
  zip_code: string;
  category: string;
  state: string;
}

const REQUIRED_COLUMNS = ["zip_code", "category", "state"] as const;

export function parseCsv(content: string): Papa.ParseResult<Record<string, string>> {
  return Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  rows: CsvRow[];
}

export function validateCsvRows(
  parsed: Papa.ParseResult<Record<string, string>>
): ValidationResult {
  const errors: string[] = [];

  if (parsed.errors.length > 0) {
    errors.push(...parsed.errors.map((e) => `Parse error row ${e.row}: ${e.message}`));
  }

  if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
    return { valid: false, errors: ["CSV has no headers"], rows: [] };
  }

  const headers = parsed.meta.fields.map((f) => f.trim().toLowerCase());
  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      errors.push(`Missing required column: ${col}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, rows: [] };
  }

  if (parsed.data.length === 0) {
    return { valid: false, errors: ["CSV is empty"], rows: [] };
  }

  const rows: CsvRow[] = [];
  parsed.data.forEach((row, index) => {
    const zip = sanitize(row.zip_code);
    const category = sanitize(row.category);
    const state = sanitize(row.state);

    if (!zip || !category || !state) {
      errors.push(`Row ${index + 2}: missing required values`);
      return;
    }

    rows.push({ zip_code: zip, category, state });
  });

  return {
    valid: errors.length === 0,
    errors,
    rows,
  };
}

function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 500);
}

export function getRequiredColumns() {
  return [...REQUIRED_COLUMNS];
}
