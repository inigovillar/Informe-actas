/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  HelpCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';

interface SpreadsheetLoaderProps {
  currentUrl: string;
  onImport: (url: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function SpreadsheetLoader({
  currentUrl,
  onImport,
  isLoading,
  error
}: SpreadsheetLoaderProps) {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [showInstructions, setShowInstructions] = useState(false);

  // Submit spreadsheet URL
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onImport(inputUrl.trim());
    }
  };

  // Reset to default spreadsheet
  const handleResetDefault = () => {
    const defaultUrl = 'https://docs.google.com/spreadsheets/d/169tPZFHshK6ys1d5BP620AUPw7WRvtVeQAgtD2dhL7A/edit?usp=sharing';
    setInputUrl(defaultUrl);
    onImport(defaultUrl);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      {/* Title block */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-500 rounded-lg">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Conectar Google Sheet</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analiza y visualiza los datos cargados desde cualquier hoja de cálculo compartida.</p>
          </div>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          id="instruction-toggle-btn"
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition-colors duration-200"
        >
          <HelpCircle size={15} />
          <span>¿Cómo funciona?</span>
          {showInstructions ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Foldable instruction guidance */}
      {showInstructions && (
        <div className="p-4 bg-amber-50/50 dark:bg-amber-955/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl space-y-2 text-xs text-amber-800 dark:text-amber-300">
          <h3 className="font-semibold flex items-center gap-1">
            <Info size={14} /> Requisitos para la conexión de Hojas de Cálculo
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 pl-1.5 text-slate-600 dark:text-slate-400">
            <li>
              Abre tu Google Sheet en Google Drive.
            </li>
            <li>
              Haz clic en el botón superior derecho de <strong className="text-slate-800 dark:text-slate-250">Compartir</strong>.
            </li>
            <li>
              En el panel de Configuración de acceso general, asegúrate de cambiar el permiso a: 
              <strong className="text-slate-800 dark:text-slate-250"> "Cualquier persona con el enlace puede ver"</strong> (Lector).
            </li>
            <li>
              Copia la URL completa desde el navegador de tu hoja (o el enlace para compartir) y pégala abajo.
            </li>
          </ol>
          <div className="text-[11px] pt-1 text-slate-400 dark:text-slate-500 font-serif">
            *No es necesario que publiques la hoja a la web. Nuestro motor extraerá el identificador seguro del documento directamente.
          </div>
        </div>
      )}

      {/* URL Import Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pegue la URL de la hoja de cálculo de Google..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isLoading}
            id="sheet-url-input"
            className="w-full text-xs py-2.5 pl-3.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 transition-all font-mono"
          />
          {inputUrl === 'https://docs.google.com/spreadsheets/d/169tPZFHshK6ys1d5BP620AUPw7WRvtVeQAgtD2dhL7A/edit?usp=sharing' && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" title="Hoja de demostración original activa">
              <Check size={16} />
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            id="sheet-import-submit"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Importando...' : 'Importar Hoja'}
            {!isLoading && <ArrowRight size={14} />}
          </button>

          <button
            type="button"
            onClick={handleResetDefault}
            disabled={isLoading}
            id="sheet-reset-default"
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
            title="Restablecer a la hoja por defecto"
          >
            Hoja Demo
          </button>
        </div>
      </form>

      {/* Error report panel */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-rose-800 dark:text-rose-400 text-xs">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />
          <div className="space-y-1">
            <span className="font-bold">Error de conexión:</span>
            <p className="leading-relaxed">{error}</p>
            <p className="text-[11px] text-rose-600 dark:text-rose-500 pt-1">
              Verifica que el documento esté compartido públicamente como "Lector" con cualquiera que tenga el enlace, y que sea una URL de Google Sheets válida.
            </p>
          </div>
        </div>
      )}

      {/* Loading state skeletal block */}
      {isLoading && (
        <div className="space-y-3 pt-3 animate-pulse">
          <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-md w-3/4" />
          <div className="space-y-2">
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md" />
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-md w-5/6" />
          </div>
        </div>
      )}
    </div>
  );
}
