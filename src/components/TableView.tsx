/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ColumnMetadata, RecordRow } from '../types';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  SlidersHorizontal,
  Table,
  Check,
  FileSpreadsheet
} from 'lucide-react';

interface TableViewProps {
  columns: ColumnMetadata[];
  records: RecordRow[];
}

export default function TableView({
  columns,
  records
}: TableViewProps) {
  // Sort State
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

  // Column Visibility State (initially all visible)
  const [visibleColumnsMap, setVisibleColumnsMap] = useState<{ [colName: string]: boolean }>(
    columns.reduce((acc, col) => ({ ...acc, [col.name]: true }), {})
  );
  
  // Toggle columns dropdown visibility
  const [showColToggler, setShowColToggler] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Align visible column map if spreadsheet source columns change
  React.useEffect(() => {
    setVisibleColumnsMap(
      columns.reduce((acc, col) => ({ ...acc, [col.name]: true }), {})
    );
    setCurrentPage(1);
  }, [columns]);

  // Handle Sort Toggle cycle
  const handleSort = (columnName: string) => {
    if (sortColumn !== columnName) {
      setSortColumn(columnName);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  const toggleColumnVisibility = (colName: string) => {
    setVisibleColumnsMap(prev => ({
      ...prev,
      [colName]: !prev[colName]
    }));
  };

  // Extract visible columns array
  const visibleColumns = useMemo(() => {
    return columns.filter(col => visibleColumnsMap[col.name] !== false);
  }, [columns, visibleColumnsMap]);

  // Sort and filter records
  const processedRecords = useMemo(() => {
    if (!sortColumn || !sortDirection) return records;

    const col = columns.find(c => c.name === sortColumn);
    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    return [...records].sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Type-specific comparison
      if (col?.type === 'number') {
        const numA = typeof valA === 'number' ? valA : parseFloat(String(valA));
        const numB = typeof valB === 'number' ? valB : parseFloat(String(valB));
        return (numA - numB) * directionFactor;
      } else if (col?.type === 'date') {
        const tsA = Date.parse(String(valA).replace(/\./g, '-'));
        const tsB = Date.parse(String(valB).replace(/\./g, '-'));
        if (isNaN(tsA)) return 1;
        if (isNaN(tsB)) return -1;
        return (tsA - tsB) * directionFactor;
      } else {
        // String locale comparison
        return String(valA).localeCompare(String(valB)) * directionFactor;
      }
    });
  }, [records, sortColumn, sortDirection, columns]);

  // Pagination calculation
  const totalRows = processedRecords.length;
  // If All is selected, we use totalRows as pageSize
  const effectivePageSize = pageSize === -1 ? totalRows : pageSize;
  const totalPages = Math.ceil(totalRows / effectivePageSize) || 1;

  // Sync current page if count of records shrinks
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * effectivePageSize;
    return processedRecords.slice(start, start + effectivePageSize);
  }, [processedRecords, currentPage, effectivePageSize]);

  // Export CSV local handler
  const handleExportCSV = () => {
    if (processedRecords.length === 0) return;
    
    // Header row
    const headers = visibleColumns.map(col => `"${col.name.replace(/"/g, '""')}"`).join(',');
    
    // Data rows
    const rows = processedRecords.map(row => {
      return visibleColumns.map(col => {
        const val = row[col.name];
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' }); // Include BOM for proper Excel Spanish symbols
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sheet_data_filtrada.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Excel local XML trick to open perfectly in office editors
  const handleExportExcel = () => {
    if (processedRecords.length === 0) return;

    // Create an XML/HTML string that tells Excel to display it with standard gridlines and cells
    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Datos Filtrados</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          th { background-color: #2563EB; color: white; font-weight: bold; }
          td, th { padding: 5px; border: 0.5px solid #CBD5E1; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>${visibleColumns.map(c => `<th>${c.name}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${processedRecords.map(row => {
              return `<tr>${visibleColumns.map(col => {
                const rawVal = row[col.name];
                const cleanVal = rawVal === null || rawVal === undefined ? '' : String(rawVal);
                return `<td>${cleanVal}</td>`;
              }).join('')}</tr>`;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sheet_data_filtrada.xls';
    link.click();
    URL.revokeObjectURL(url);
  };

  const startRecordIndex = (currentPage - 1) * effectivePageSize + 1;
  const endRecordIndex = Math.min(currentPage * effectivePageSize, totalRows);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full space-y-4 p-5">
      
      {/* Table tools and controls bar */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between shrink-0 rounded-xl">
        <div className="flex items-center gap-2">
          <Table size={18} className="text-blue-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Vista de Registros</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {totalRows === 0 ? (
                'No se encontraron coincidencias'
              ) : (
                `Mostrando registros del ${startRecordIndex} al ${endRecordIndex} (filtrados de un total de ${records.length})`
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Column Toggle dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColToggler(!showColToggler)}
              id="column-visibility-toggle"
              className="flex items-center gap-2 text-xs py-2 px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-205 rounded-xl transition-colors font-medium"
            >
              <EyeOff size={14} />
              <span>Columnas</span>
            </button>

            {showColToggler && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowColToggler(false)} />
                <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-xl shadow-lg z-30 p-2 max-h-64 overflow-y-auto">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 py-1 mb-1">
                    Mostrar/Ocultar columnas
                  </div>
                  {columns.map(col => {
                    const isVisible = visibleColumnsMap[col.name] !== false;
                    return (
                      <button
                        key={col.name}
                        onClick={() => toggleColumnVisibility(col.name)}
                        className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xxs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-left"
                      >
                        <span className="truncate pr-2">{col.name}</span>
                        {isVisible ? (
                          <Check size={14} className="text-blue-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 border border-slate-300 dark:border-slate-700 rounded-sm" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Export Dropdown buttons */}
          <button
            onClick={handleExportCSV}
            disabled={totalRows === 0}
            id="export-csv-btn"
            className="flex items-center gap-1 text-xs py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold shadow-md shadow-emerald-600/10 disabled:opacity-50"
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={totalRows === 0}
            id="export-excel-btn"
            className="flex items-center gap-1 text-xs py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-semibold shadow-md shadow-teal-600/10 disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table responsive scroll container - fixed header scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-slate-250 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/25 max-h-[500px] relative">
        <table className="w-full text-left border-collapse" id="data-table">
          <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
            <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {visibleColumns.map(col => {
                const isSorted = sortColumn === col.name;
                return (
                  <th
                    key={col.name}
                    onClick={() => handleSort(col.name)}
                    className="cursor-pointer select-none py-3 px-6 hover:bg-slate-100 dark:hover:bg-slate-805 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{col.name}</span>
                      <span className="text-slate-400 shrink-0">
                        {isSorted ? (
                          sortDirection === 'asc' ? <ArrowUp size={11} className="text-blue-500" /> : <ArrowDown size={11} className="text-blue-500" />
                        ) : (
                          <ArrowUpDown size={11} className="opacity-40" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-900 bg-white dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length || 1} className="py-12 text-center text-xs text-slate-400 italic">
                  No se encontraron registros para mostrar con los filtros activos.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((row, rIdx) => (
                <tr 
                  key={rIdx} 
                  className="border-b border-slate-50 dark:border-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors duration-155"
                >
                  {visibleColumns.map(col => {
                    const rawVal = row[col.name];
                    let formattedVal = '';

                    if (rawVal !== null && rawVal !== undefined) {
                      if (col.type === 'number' && typeof rawVal === 'number') {
                        formattedVal = rawVal.toLocaleString('es-ES', {
                          maximumFractionDigits: 3
                        });
                      } else {
                        formattedVal = String(rawVal);
                      }
                    }

                    return (
                      <td 
                        key={col.name} 
                        className="py-3 px-6 font-medium truncate max-w-[200px]"
                        title={formattedVal}
                      >
                        {rawVal === null || rawVal === undefined ? (
                          <span className="text-[10px] text-slate-350 italic">—</span>
                        ) : col.type === 'number' ? (
                          <span className="font-mono tracking-tight text-slate-900 dark:text-slate-100 font-bold">{formattedVal}</span>
                        ) : (
                          formattedVal
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control element footer */}
      {totalRows > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-900 shrink-0">
          {/* Rows Per Page selector */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              id="rows-per-page-selector"
              className="py-1 px-2.5 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Todos</option>
            </select>
          </div>

          {/* Page controls buttons */}
          {pageSize !== -1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Primera Página"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Página Anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs text-slate-600 dark:text-slate-350 font-medium px-2.5">
                Página <span className="font-mono">{currentPage}</span> de <span className="font-mono">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Siguiente Página"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Última Página"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
