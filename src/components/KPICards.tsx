/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ColumnMetadata, RecordRow } from '../types';
import { 
  FileText, 
  Sigma, 
  Calculator, 
  ArrowUpDown, 
  SlidersHorizontal 
} from 'lucide-react';

interface KPICardsProps {
  columns: ColumnMetadata[];
  filteredRecords: RecordRow[];
  totalRecordsCount: number;
}

export default function KPICards({
  columns,
  filteredRecords,
  totalRecordsCount
}: KPICardsProps) {
  // Find all available numeric columns
  const numericColumns = useMemo(() => {
    return columns.filter(col => col.type === 'number');
  }, [columns]);

  // Handle active metric selection index
  const [selectedMetric, setSelectedMetric] = React.useState<string>('');

  // Fallback to first numeric column if none selected (or if selected column no longer exists)
  const activeMetricColumn = useMemo(() => {
    if (numericColumns.length === 0) return null;
    const found = numericColumns.find(c => c.name === selectedMetric);
    if (found) return found;
    return numericColumns[0];
  }, [numericColumns, selectedMetric]);

  // Adjust local select state when columns load
  React.useEffect(() => {
    if (numericColumns.length > 0 && !selectedMetric) {
      setSelectedMetric(numericColumns[0].name);
    }
  }, [numericColumns, selectedMetric]);

  // Calculate stats dynamically for the active column
  const stats = useMemo(() => {
    const totalCount = totalRecordsCount;
    const filteredCount = filteredRecords.length;

    if (!activeMetricColumn) {
      return { totalCount, filteredCount, sum: 0, average: 0, min: 0, max: 0 };
    }

    const colName = activeMetricColumn.name;
    let sum = 0;
    let min = Infinity;
    let max = -Infinity;
    let validCount = 0;

    filteredRecords.forEach(row => {
      const val = row[colName];
      if (val !== null && val !== undefined && typeof val === 'number') {
        sum += val;
        if (val < min) min = val;
        if (val > max) max = val;
        validCount++;
      }
    });

    const average = validCount > 0 ? sum / validCount : 0;
    return {
      totalCount,
      filteredCount,
      sum,
      average,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max
    };
  }, [filteredRecords, activeMetricColumn, totalRecordsCount]);

  // Formatter for outputs
  const formatNumber = (num: number): string => {
    if (num === null || num === undefined) return '0';
    // Format to 2 decimal places if fractional, otherwise integer
    return num.toLocaleString('es-ES', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    });
  };

  return (
    <div className="space-y-4">
      {/* Selector of Active Metric for KPIs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Indicadores Clave de Rendimiento (KPI)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona una métrica numérica para computar estadísticas dinámicas basadas en tus filtros.</p>
          </div>
        </div>

        {numericColumns.length > 0 ? (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Métrica KPI:</span>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              id="kpi-metric-selector"
              className="w-full sm:w-48 text-xs py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {numericColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">No se detectaron columnas numéricas</div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Registros */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Registros Filtrados</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.filteredCount.toLocaleString('es-ES')}
          </div>
          <div className="text-xs text-green-600 dark:text-green-500 font-medium mt-1">
            de {stats.totalCount.toLocaleString('es-ES')} total ({((stats.filteredCount / (stats.totalCount || 1)) * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Suma Total */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Suma Total</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate" title={formatNumber(stats.sum)}>
            {formatNumber(stats.sum)}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1 truncate">
            {activeMetricColumn ? `Métrica: ${activeMetricColumn.name}` : 'Ninguna'}
          </div>
        </div>

        {/* Promedio */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Métrica Promedio</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate" title={formatNumber(stats.average)}>
            {formatNumber(stats.average)}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1 truncate">
            {activeMetricColumn ? `Avg: ${activeMetricColumn.name}/fila` : 'Ninguna'}
          </div>
        </div>

        {/* Extremos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Valores Extremos</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate mt-1 flex justify-between">
            <span className="text-xs text-slate-400">Min: {formatNumber(stats.min)}</span>
            <span className="text-xs text-slate-400">Max: {formatNumber(stats.max)}</span>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-2">
            Rango de dispersión
          </div>
        </div>
      </div>
    </div>
  );
}
