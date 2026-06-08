/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnMetadata, RecordRow, FilterState, ActiveView } from './types';
import { 
  parseSpreadsheetUrl, 
  buildCsvExportUrl, 
  parseSpreadsheetCsv, 
  filterRecords 
} from './utils/spreadsheet';
import Sidebar from './components/Sidebar';
import SpreadsheetLoader from './components/SpreadsheetLoader';
import FilterPanel from './components/FilterPanel';
import KPICards from './components/KPICards';
import TableView from './components/TableView';
import ChartView from './components/ChartView';
import DeployInstructions from './components/DeployInstructions';
import { 
  AlertCircle, 
  RefreshCw, 
  FileText, 
  CalendarDays,
  LayoutGrid
} from 'lucide-react';

export default function App() {
  // Navigation View
  const [activeView, setActiveView] = useState<ActiveView>('table');
  
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Spreadsheet connection states
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(
    'https://docs.google.com/spreadsheets/d/169tPZFHshK6ys1d5BP620AUPw7WRvtVeQAgtD2dhL7A/edit?usp=sharing'
  );
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>('Hoja de Demostración');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Loaded database structure
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [records, setRecords] = useState<RecordRow[]>([]);

  // Filter conditions
  const [filters, setFilters] = useState<FilterState>({
    globalSearch: '',
    columnFilters: {}
  });

  // Theme synchronization effect on body tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Read data pipeline from spreadsheetId and GID
  const loadSpreadsheetData = async (targetUrl: string) => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const { id, gid } = parseSpreadsheetUrl(targetUrl);
      if (!id) {
        throw new Error('La dirección provista no corresponde a un patrón de Google Sheets identificable. Por favor, revisa la URL.');
      }

      // Sync active url reference
      setSpreadsheetUrl(targetUrl);
      setSpreadsheetTitle(`Cargando ID: ${id.substring(0, 8)}...`);

      const csvUrl = buildCsvExportUrl(id, gid);
      const response = await fetch(csvUrl);

      if (!response.ok) {
        throw new Error(`Servidor de Google Sheets respondió con estado: ${response.status}.`);
      }

      const csvContent = await response.text();

      // Detection of Private Sheets: Google Sheets redirects to active login HTML pages
      if (csvContent.trim().startsWith('<!DOCTYPE html') || csvContent.trim().startsWith('<!doctype html')) {
        throw new Error('El documento parece estar restringido. Por favor, asegúrate de compartirlo en Google Drive de forma que "Cualquier persona con el enlace puede ver" (Lector).');
      }

      // Parse CSV Data and update state models
      const { columns: inferredCols, records: parsedRows } = parseSpreadsheetCsv(csvContent);

      if (inferredCols.length === 0 || parsedRows.length === 0) {
        throw new Error('La hoja de cálculo regresó un archivo vacío o sin columnas legibles.');
      }

      setColumns(inferredCols);
      setRecords(parsedRows);
      
      // Clear filters on spreadsheet source swap to avoid out-of-bounds metrics bugs
      setFilters({
        globalSearch: '',
        columnFilters: {}
      });

      // Style Sheet Name
      let sheetName = 'Hoja de Cálculo';
      if (gid) {
        sheetName += ` (Subhoja GID: ${gid})`;
      } else {
        sheetName += ` (ID: ${id.substring(0, 8)})`;
      }
      setSpreadsheetTitle(sheetName);

    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Error desconocido al intentar obtener datos de la hoja de cálculo.');
      setColumns([]);
      setRecords([]);
      setSpreadsheetTitle('Fallo de Conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial fetch on mount
  useEffect(() => {
    loadSpreadsheetData(spreadsheetUrl);
  }, []);

  // Compute records matching current filters
  const filteredRecords = useMemo(() => {
    return filterRecords(records, columns, filters);
  }, [records, columns, filters]);

  // Reset/reload current sheet handler
  const handleReload = () => {
    loadSpreadsheetData(spreadsheetUrl);
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row transition-colors duration-200 ${
      darkMode 
        ? 'dark bg-slate-950 text-slate-50' 
        : 'bg-slate-50 text-slate-900'
    }`} id="app-root">
      
      {/* 1. Navigation Sidebar */}
      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        spreadsheetTitle={spreadsheetTitle}
        onRefresh={handleReload}
        isLoading={isLoading}
        totalRecordsCount={records.length}
        filteredRecordsCount={filteredRecords.length}
      />

      {/* 2. Main Dashboard Content Frame */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto px-4 py-6 md:px-8 space-y-6">
        
        {/* Connection Loader card */}
        <SpreadsheetLoader
          currentUrl={spreadsheetUrl}
          onImport={loadSpreadsheetData}
          isLoading={isLoading}
          error={fetchError}
        />

        {/* Dashboard contents as long as we have structured records loaded */}
        {records.length > 0 && !isLoading ? (
          <>
            {/* Filter section panel */}
            <FilterPanel 
              columns={columns}
              filters={filters}
              setFilters={setFilters}
            />

            {/* Top-Level KPI indicators cards */}
            <KPICards 
              columns={columns}
              filteredRecords={filteredRecords}
              totalRecordsCount={records.length}
            />

            {/* Dynamic View Swapper */}
            <div className="flex-1 min-h-[550px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeView}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="h-full"
                >
                  {activeView === 'table' && (
                    <TableView 
                      columns={columns}
                      records={filteredRecords}
                    />
                  )}

                  {activeView === 'charts' && (
                    <ChartView 
                      columns={columns}
                      filteredRecords={filteredRecords}
                    />
                  )}

                  {activeView === 'docs' && (
                    <DeployInstructions />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        ) : (
          // Empty State & Instructions panel
          !isLoading && !fetchError && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full">
                <LayoutGrid size={32} />
              </div>
              <div>
                <h3 className="text-md font-bold text-slate-800 dark:text-slate-100">Sin Datos Disponibles</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mt-1 leading-relaxed">
                  Por favor, ingresa una URL válida de hoja de cálculo compartida públicamente en la barra de arriba para iniciar la carga del cuadro estratégico.
                </p>
              </div>
            </div>
          )
        )}

        {/* Error placeholder cover */}
        {fetchError && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full">
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No se pudo obtener la hoja</h3>
              <p className="text-xs text-slate-505 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                El motor no pudo conectarse con la hoja de Google Sheets. Asegúrate de seguir las instrucciones de uso para compartir la hoja como "Lector" con acceso libre a cualquiera con el enlace.
              </p>
            </div>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 text-xs font-semibold py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            >
              <RefreshCw size={14} />
              Reintentar Conexión
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

