/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DataType = 'string' | 'number' | 'date';

export interface ColumnMetadata {
  name: string;
  type: DataType;
  uniqueValues: string[];
  minValue?: number;
  maxValue?: number;
  minDate?: string;
  maxDate?: string;
}

export interface RecordRow {
  [columnName: string]: any;
}

export interface FilterState {
  globalSearch: string;
  columnFilters: {
    [columnName: string]: {
      selectedValues?: string[]; // For string columns (multi-select categorical)
      min?: number;              // For numeric columns
      max?: number;              // For numeric columns
      startDate?: string;        // For date columns
      endDate?: string;          // For date columns
    };
  };
}

export type ActiveView = 'table' | 'charts' | 'docs';

export interface KPIStats {
  totalCount: number;
  filteredCount: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  selectedMetricName: string;
}
