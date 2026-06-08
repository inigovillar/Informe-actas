/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { ColumnMetadata, RecordRow, DataType, FilterState } from '../types';

/**
 * Extracts spreadsheet ID and GID (if present) from a Google Sheets URL.
 * Supports standard URLs, sharing links, and direct IDs.
 */
export function parseSpreadsheetUrl(urlOrId: string): { id: string; gid: string | null } {
  const url = urlOrId.trim();
  
  // If it's already just a spreadsheet ID (around 44 characters, starting with letters/numbers)
  if (/^[a-zA-Z0-9-_]{40,}$/.test(url)) {
    return { id: url, gid: null };
  }

  // Regex to extract the continuous sequence of characters between /d/ and /
  const idRegex = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  const idMatch = url.match(idRegex);
  const id = idMatch ? idMatch[1] : '';

  // Extract GID (sheet tab id) if present
  const gidRegex = /[#&?]gid=([0-9]+)/;
  const gidMatch = url.match(gidRegex);
  const gid = gidMatch ? gidMatch[1] : null;

  return { id, gid };
}

/**
 * Builds the CSV export URL for a spreadsheet ID and optional GID.
 */
export function buildCsvExportUrl(id: string, gid: string | null): string {
  let url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
  if (gid) {
    url += `&gid=${gid}`;
  }
  return url;
}

/**
 * Cleans a cell string value (currency signs, spaces, percentages, European decimals)
 * and attempts to convert it to a float. Returns null if not a number.
 */
export function cleanAndParseFloat(val: string): number | null {
  if (val === undefined || val === null) return null;
  let s = val.trim();
  if (s === '') return null;

  // Remove currency signs, percentage symbols, and spaces
  s = s.replace(/[€$£¥%]/g, '').replace(/\s/g, '');

  // Detect and resolve European decimals (e.g. 1.234,56 -> 1234.56)
  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    const commaIndex = s.indexOf(',');
    const dotIndex = s.indexOf('.');
    if (commaIndex > dotIndex) {
      // Comma is decimal separator (1.234,56)
      s = s.replace(/\./g, '').replace(/,/g, '.');
    } else {
      // Dot is decimal separator (1,234.56)
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Single separator is a comma, check if it behaves like a decimal block (usually at the end, e.g. 123,45 or 12,4)
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length <= 3) {
      s = s.replace(/,/g, '.');
    } else {
      // Thousands separator with no decimals (e.g., 1,000,000)
      s = s.replace(/,/g, '');
    }
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

/**
 * Checks if a string acts like a date format (YYYY-MM-DD, DD/MM/YYYY, etc.)
 */
export function isValidDate(val: string): boolean {
  if (val === undefined || val === null) return false;
  const s = val.trim();
  if (s.length < 5) return false; // Too short for a date

  // Simple check for date patterns (e.g., DD/MM/YYYY, YYYY-MM-DD, or containing slashes, dashes, dots)
  const datePattern = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/;
  if (!datePattern.test(s)) {
    // Also support ISO format
    const isoPattern = /^\d{4}-\d{2}-\d{2}T/;
    if (!isoPattern.test(s)) {
      return false;
    }
  }

  // Handle dot replacements e.g. 12.04.2026 -> 12-04-2026
  const normalizedDateString = s.replace(/\./g, '-');
  const timestamp = Date.parse(normalizedDateString);
  return !isNaN(timestamp);
}

/**
 * Inferred type of a single column based on analyzed values
 */
export function inferColumnType(values: string[]): DataType {
  const nonEmptyValues = values.filter(v => v !== undefined && v !== null && v.trim() !== '');
  if (nonEmptyValues.length === 0) return 'string';

  let numericCount = 0;
  let dateCount = 0;

  for (const val of nonEmptyValues) {
    if (cleanAndParseFloat(val) !== null) {
      numericCount++;
    } else if (isValidDate(val)) {
      dateCount++;
    }
  }

  const threshold = 0.7; // If 70% or more values match a type, infer it
  const total = nonEmptyValues.length;

  if (numericCount / total >= threshold) {
    return 'number';
  } else if (dateCount / total >= threshold) {
    return 'date';
  }

  return 'string';
}

/**
 * Parses raw CSV content with automatic headers and type inference.
 */
export function parseSpreadsheetCsv(csvContent: string): {
  columns: ColumnMetadata[];
  records: RecordRow[];
} {
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false // We will handle our own typed parsing for higher robustness
  });

  const rawRows = parsed.data as RecordRow[];
  const headers = parsed.meta.fields || [];

  if (headers.length === 0 || rawRows.length === 0) {
    return { columns: [], records: [] };
  }

  // Read matching values for each column to perform metadata inference
  const columns: ColumnMetadata[] = headers.map(headerName => {
    const colValues = rawRows.map(row => row[headerName] || '');
    const inferredType = inferColumnType(colValues);

    const metadata: ColumnMetadata = {
      name: headerName,
      type: inferredType,
      uniqueValues: []
    };

    if (inferredType === 'string') {
      // Find clean unique sorted values for filtering options
      const uniques = new Set<string>();
      colValues.forEach(v => {
        if (v !== undefined && v !== null) {
          const trimmed = v.trim();
          if (trimmed !== '') uniques.add(trimmed);
        }
      });
      metadata.uniqueValues = Array.from(uniques).sort((a, b) => a.localeCompare(b));
    } else if (inferredType === 'number') {
      let min = Infinity;
      let max = -Infinity;
      colValues.forEach(v => {
        const parsedNum = cleanAndParseFloat(v);
        if (parsedNum !== null) {
          if (parsedNum < min) min = parsedNum;
          if (parsedNum > max) max = parsedNum;
        }
      });
      metadata.minValue = min === Infinity ? 0 : min;
      metadata.maxValue = max === -Infinity ? 100 : max;
    } else if (inferredType === 'date') {
      let minTimestamp = Infinity;
      let maxTimestamp = -Infinity;
      let minString = '';
      let maxString = '';

      colValues.forEach(v => {
        if (isValidDate(v)) {
          const norm = v.trim().replace(/\./g, '-');
          const ts = Date.parse(norm);
          if (ts < minTimestamp) {
            minTimestamp = ts;
            minString = v.trim();
          }
          if (ts > maxTimestamp) {
            maxTimestamp = ts;
            maxString = v.trim();
          }
        }
      });

      metadata.minDate = minString;
      metadata.maxDate = maxString;
    }

    return metadata;
  });

  // Clean data records by parsing fields according to computed column types
  const records: RecordRow[] = rawRows.map(row => {
    const cleanedRow: RecordRow = {};
    columns.forEach(col => {
      const originalValue = row[col.name];
      if (originalValue === undefined || originalValue === null || originalValue.trim() === '') {
        cleanedRow[col.name] = null;
      } else if (col.type === 'number') {
        cleanedRow[col.name] = cleanAndParseFloat(originalValue);
      } else if (col.type === 'date') {
        cleanedRow[col.name] = originalValue.trim();
      } else {
        cleanedRow[col.name] = originalValue.trim();
      }
    });
    return cleanedRow;
  });

  return { columns, records };
}

/**
 * Filter records based on global search query and active column filters.
 */
export function filterRecords(
  records: RecordRow[],
  columns: ColumnMetadata[],
  filters: FilterState
): RecordRow[] {
  return records.filter(row => {
    // 1. Global Search Filter
    if (filters.globalSearch.trim() !== '') {
      const query = filters.globalSearch.toLowerCase().trim();
      const matchGlobal = columns.some(col => {
        const val = row[col.name];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
      if (!matchGlobal) return false;
    }

    // 2. Column-Specific Filters
    for (const col of columns) {
      const colFilter = filters.columnFilters[col.name];
      if (!colFilter) continue;

      const val = row[col.name];

      // Format-specific matching
      if (col.type === 'string') {
        const selected = colFilter.selectedValues;
        if (selected && selected.length > 0) {
          if (val === null || val === undefined) return false;
          if (!selected.includes(String(val))) {
            return false;
          }
        }
      } else if (col.type === 'number') {
        if (val === null || val === undefined) {
          // If value is missing but a range is set, exclude it
          if (colFilter.min !== undefined || colFilter.max !== undefined) {
            return false;
          }
        } else {
          if (colFilter.min !== undefined && val < colFilter.min) return false;
          if (colFilter.max !== undefined && val > colFilter.max) return false;
        }
      } else if (col.type === 'date') {
        if (val === null || val === undefined) {
          if (colFilter.startDate || colFilter.endDate) return false;
        } else {
          const normVal = String(val).replace(/\./g, '-');
          const valTs = Date.parse(normVal);
          
          if (colFilter.startDate) {
            const startTs = Date.parse(colFilter.startDate.replace(/\./g, '-'));
            if (valTs < startTs) return false;
          }
          if (colFilter.endDate) {
            const endTs = Date.parse(colFilter.endDate.replace(/\./g, '-'));
            if (valTs > endTs) return false;
          }
        }
      }
    }

    return true;
  });
}
