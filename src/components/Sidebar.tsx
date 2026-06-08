/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table2, 
  BarChart3, 
  BookOpen, 
  Sun, 
  Moon, 
  Database, 
  Menu, 
  X, 
  RefreshCw,
  FolderTree
} from 'lucide-react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  spreadsheetTitle: string;
  onRefresh: () => void;
  isLoading: boolean;
  totalRecordsCount: number;
  filteredRecordsCount: number;
}

export default function Sidebar({
  activeView,
  setActiveView,
  darkMode,
  setDarkMode,
  spreadsheetTitle,
  onRefresh,
  isLoading,
  totalRecordsCount,
  filteredRecordsCount
}: SidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  const navItems = [
    { id: 'table' as ActiveView, label: 'Vista Tabla', icon: Table2, desc: 'Explorar registros filtrados y exportar' },
    { id: 'charts' as ActiveView, label: 'Vista Gráficas', icon: BarChart3, desc: 'Cuadro de mando analítico' },
    { id: 'docs' as ActiveView, label: 'Despliegue y Info', icon: BookOpen, desc: 'Instrucciones para Vercel/Firebase' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 p-5">
      {/* Brand Logo and Title */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <Database size={16} className="text-white animate-pulse" id="brand-icon" />
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight">SheetVision AI</span>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider">v1.1.0-TS</p>
        </div>
      </div>

      {/* Spreadsheet Status summary */}
      <div className="mt-5 px-3 py-4 bg-slate-800/50 rounded-lg border border-slate-705 mx-1">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <FolderTree size={12} />
          Hoja de Google
        </h2>
        <p className="text-xs font-semibold truncate text-white mb-2" title={spreadsheetTitle}>
          {spreadsheetTitle || 'Cargando documento...'}
        </p>

        <div className="flex items-center justify-between text-[11px] mt-3 pt-3 border-t border-slate-700">
          <span className="text-slate-400">Filas cargadas:</span>
          <span className="font-mono font-bold text-blue-400">
            {filteredRecordsCount} / {totalRecordsCount}
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          id="sidebar-refresh-btn"
          className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-600 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Actualizando...' : 'Refrescar Datos'}
        </button>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 py-6 px-1 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Navegación Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsOpenMobile(false);
              }}
              id={`nav-link-${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={16} className={`${isActive ? 'text-white' : 'text-slate-400'} shrink-0`} />
              <div className="truncate">
                <p className="text-sm">{item.label}</p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer & Dark/Light controls */}
      <div className="mt-auto border-t border-slate-800 pt-5">
        <div className="flex items-center justify-between p-1 bg-slate-950 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setDarkMode(false)}
            id="theme-light-btn"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              !darkMode 
                ? 'bg-slate-800 text-white shadow-sm font-semibold' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <Sun size={14} />
            Claro
          </button>
          <button
            onClick={() => setDarkMode(true)}
            id="theme-dark-btn"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              darkMode 
                ? 'bg-slate-800 text-white shadow-sm font-semibold' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <Moon size={14} />
            Oscuro
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile top navigation header */}
      <div className="lg:hidden w-full h-16 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg text-white">
            <Database size={18} />
          </div>
          <span className="text-md font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
            SheetAnalyzer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            id="mobile-header-refresh"
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refrescar Datos"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          
          <button
            onClick={() => setIsOpenMobile(!isOpenMobile)}
            id="mobile-sidebar-toggle"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isOpenMobile ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer backdrop and panel */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 h-screen z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
