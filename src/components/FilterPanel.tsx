/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ColumnMetadata, FilterState } from '../types';
import { 
  Filter, 
  Search, 
  Calendar, 
  Sliders, 
  CheckSquare, 
  Square, 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp,
  Tag
} from 'lucide-react';

interface FilterPanelProps {
  columns: ColumnMetadata[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function FilterPanel({
  columns,
  filters,
  setFilters
}: FilterPanelProps) {
  // Toggle the visible state of the filter panel on mobile/desktop
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Track open state for individual categorical column filter dropdowns
  const [openDropdowns, setOpenDropdowns] = useState<{ [colName: string]: boolean }>({});
  
  // Local search strings for individual categorical lists
  const [catSearch, setCatSearch] = useState<{ [colName: string]: string }>({});

  const toggleDropdown = (colName: string) => {
    setOpenDropdowns(prev => ({ ...prev, [colName]: !prev[colName] }));
  };

  const handleCatSearchChange = (colName: string, text: string) => {
    setCatSearch(prev => ({ ...prev, [colName]: text }));
  };

  // Reset all filters in shared state
  const handleClearAllFilters = () => {
    const freshFilters: FilterState = {
      globalSearch: '',
      columnFilters: {}
    };
    setFilters(freshFilters);
    setCatSearch({});
  };

  // Update global search input
  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      globalSearch: e.target.value
    }));
  };

  // Handle categorical string updates
  const handleToggleCatValue = (colName: string, value: string) => {
    setFilters(prev => {
      const current = prev.columnFilters[colName]?.selectedValues || [];
      let next: string[];

      if (current.includes(value)) {
        next = current.filter(item => item !== value);
      } else {
        next = [...current, value];
      }

      return {
        ...prev,
        columnFilters: {
          ...prev.columnFilters,
          [colName]: {
            ...prev.columnFilters[colName],
            selectedValues: next
          }
        }
      };
    });
  };

  // Handle categorical select/deselect all shortcut buttons
  const handleCatSelectAll = (colName: string, allValues: string[]) => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          selectedValues: allValues
        }
      }
    }));
  };

  const handleCatDeselectAll = (colName: string) => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          selectedValues: []
        }
      }
    }));
  };

  // Handle numeric min range input update
  const handleNumberMinChange = (colName: string, val: string) => {
    const num = val === '' ? undefined : parseFloat(val);
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          min: num
        }
      }
    }));
  };

  // Handle numeric max range input update
  const handleNumberMaxChange = (colName: string, val: string) => {
    const num = val === '' ? undefined : parseFloat(val);
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          max: num
        }
      }
    }));
  };

  // Handle date start range update
  const handleDateStartChange = (colName: string, val: string) => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          startDate: val === '' ? undefined : val
        }
      }
    }));
  };

  // Handle date end range update
  const handleDateEndChange = (colName: string, val: string) => {
    setFilters(prev => ({
      ...prev,
      columnFilters: {
        ...prev.columnFilters,
        [colName]: {
          ...prev.columnFilters[colName],
          endDate: val === '' ? undefined : val
        }
      }
    }));
  };

  // Counts how many active filters are applied from columnFilters
  const activeFiltersCount = React.useMemo(() => {
    let count = filters.globalSearch.trim() !== '' ? 1 : 0;
    
    Object.keys(filters.columnFilters).forEach(key => {
      const filter = filters.columnFilters[key];
      if (!filter) return;
      if (filter.selectedValues && filter.selectedValues.length > 0) count++;
      if (filter.min !== undefined || filter.max !== undefined) count++;
      if (filter.startDate !== undefined || filter.endDate !== undefined) count++;
    });

    return count;
  }, [filters]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header element */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            Filtros Dinámicos
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xxs font-mono font-semibold bg-blue-105 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                {activeFiltersCount} activo(s)
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearAllFilters();
              }}
              id="clear-filters-btn"
              className="flex items-center gap-1 text-xxs px-2 py-1 rounded-md bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-medium"
            >
              <RefreshCcw size={11} />
              Limpiar
            </button>
          )}

          <div className="text-slate-400">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* Global Search card row */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Buscador Global
            </label>
            <div className="relative">
              <input
                type="text"
                value={filters.globalSearch}
                onChange={handleGlobalSearchChange}
                placeholder="Buscar coincidencia de texto en cualquier columna..."
                id="global-search-input"
                className="w-full text-xs py-2.5 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Dynamic Column Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1 border-t border-slate-100 dark:border-slate-900">
            {columns.map(col => {
              const filter = filters.columnFilters[col.name];

              // RENDER OPTION 1: String / categorical columns (Multi-select popup/dropdown)
              if (col.type === 'string') {
                const sVal = catSearch[col.name] || '';
                const filteredValues = col.uniqueValues.filter(val => 
                  val.toLowerCase().includes(sVal.toLowerCase())
                );
                const selected = filter?.selectedValues || [];
                const isActive = selected.length > 0;
                const dropOpen = openDropdowns[col.name] || false;

                return (
                  <div key={col.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                      <Tag size={13} className="text-blue-400" />
                      {col.name}
                    </label>

                    <div className="relative">
                      {/* Trigger button */}
                      <button
                        type="button"
                        onClick={() => toggleDropdown(col.name)}
                        id={`filter-trigger-${col.name}`}
                        className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl border text-left transition-colors truncate ${
                          isActive 
                            ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="truncate">
                          {selected.length === 0
                            ? 'Todos los valores'
                            : selected.length === 1
                            ? `${selected[0]}`
                            : `${selected.length} seleccionados`}
                        </span>
                        <ChevronDown size={14} className="shrink-0 text-slate-400 ml-1" />
                      </button>

                      {/* Dropdown panel */}
                      {dropOpen && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-30 flex flex-col max-h-60">
                          {/* Inner Categorical Search */}
                          {col.uniqueValues.length > 6 && (
                            <div className="p-2 border-b border-slate-100 dark:border-slate-900">
                              <input
                                type="text"
                                value={sVal}
                                onChange={(e) => handleCatSearchChange(col.name, e.target.value)}
                                placeholder="Búsqueda de valores..."
                                className="w-full text-xxs py-1.5 px-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
                              />
                            </div>
                          )}

                          {/* Action shortcuts */}
                          <div className="flex items-center gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-900 text-xxs shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCatSelectAll(col.name, col.uniqueValues)}
                              className="flex-1 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-center font-medium"
                            >
                              Seleccionar todos
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCatDeselectAll(col.name)}
                              className="flex-1 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-center font-medium"
                            >
                              Limpiar
                            </button>
                          </div>

                          {/* List items */}
                          <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredValues.length === 0 ? (
                              <div className="text-xxs text-slate-400 italic p-2 text-center">No hay resultados</div>
                            ) : (
                              filteredValues.map(item => {
                                const isChecked = selected.includes(item);
                                return (
                                  <div
                                    key={item}
                                    onClick={() => handleToggleCatValue(col.name, item)}
                                    className="flex items-center gap-2 py-1 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer text-xxs text-slate-700 dark:text-slate-300 truncate"
                                  >
                                    <div className="text-blue-500">
                                      {isChecked ? <CheckSquare size={14} /> : <Square size={14} className="text-slate-400" />}
                                    </div>
                                    <span className="truncate" title={item}>{item}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // RENDER OPTION 2: Numeric columns (Min/Max Fields)
              if (col.type === 'number') {
                const isFiltered = filter?.min !== undefined || filter?.max !== undefined;
                return (
                  <div key={col.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                      <Sliders size={13} className="text-emerald-400" />
                      {col.name}
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Min input field */}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xxs text-slate-400 font-medium font-sans">Mín</span>
                        <input
                          type="number"
                          placeholder={col.minValue !== undefined ? String(col.minValue) : 'Min'}
                          value={filter?.min !== undefined ? filter.min : ''}
                          onChange={(e) => handleNumberMinChange(col.name, e.target.value)}
                          className={`w-full text-xxs py-2 pl-9 pr-2 rounded-xl border font-mono text-slate-800 dark:text-slate-100 ${
                            filter?.min !== undefined
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-900'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        />
                      </div>

                      {/* Max input field */}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xxs text-slate-400 font-medium font-sans">Máx</span>
                        <input
                          type="number"
                          placeholder={col.maxValue !== undefined ? String(col.maxValue) : 'Max'}
                          value={filter?.max !== undefined ? filter.max : ''}
                          onChange={(e) => handleNumberMaxChange(col.name, e.target.value)}
                          className={`w-full text-xxs py-2 pl-9 pr-2 rounded-xl border font-mono text-slate-800 dark:text-slate-100 ${
                            filter?.max !== undefined
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-900'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // RENDER OPTION 3: Date columns (From / To Date pickers)
              if (col.type === 'date') {
                const isFiltered = filter?.startDate !== undefined || filter?.endDate !== undefined;
                return (
                  <div key={col.name} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                      <Calendar size={13} className="text-violet-400" />
                      {col.name}
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Start Date */}
                      <div className="relative flex flex-col items-stretch">
                        <input
                          type="date"
                          value={filter?.startDate || ''}
                          onChange={(e) => handleDateStartChange(col.name, e.target.value)}
                          className={`w-full text-[10px] py-1.5 px-2 rounded-xl border font-mono text-slate-800 dark:text-slate-100 ${
                            filter?.startDate
                              ? 'bg-violet-50/30 dark:bg-violet-950/10 border-violet-300 dark:border-violet-900'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 text-center truncate">Desde {col.minDate || ''}</span>
                      </div>

                      {/* End Date */}
                      <div className="relative flex flex-col items-stretch">
                        <input
                          type="date"
                          value={filter?.endDate || ''}
                          onChange={(e) => handleDateEndChange(col.name, e.target.value)}
                          className={`w-full text-[10px] py-1.5 px-2 rounded-xl border font-mono text-slate-800 dark:text-slate-100 ${
                            filter?.endDate
                              ? 'bg-violet-50/30 dark:bg-violet-950/10 border-violet-300 dark:border-violet-900'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          }`}
                        />
                        <span className="text-[9px] text-slate-400 mt-0.5 text-center truncate">Hasta {col.maxDate || ''}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
