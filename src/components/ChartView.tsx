/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useRef } from 'react';
import { ColumnMetadata, RecordRow } from '../types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  AreaChart as AreaChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface ChartViewProps {
  columns: ColumnMetadata[];
  filteredRecords: RecordRow[];
}

const PALETTE = [
  '#2563EB', // Blue
  '#10B981', // Emerald/Green
  '#8B5CF6', // Violet
  '#F59E0B', // Amber/Yellow
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#F43F5E', // Rose
];

export default function ChartView({
  columns,
  filteredRecords
}: ChartViewProps) {
  // Chart refs to download them as images
  const barContainerRef = useRef<HTMLDivElement>(null);
  const lineContainerRef = useRef<HTMLDivElement>(null);
  const areaContainerRef = useRef<HTMLDivElement>(null);
  const pieContainerRef = useRef<HTMLDivElement>(null);

  // Separate lists of dimensions (strings, dates) and metrics (numbers)
  const dimensionColumns = useMemo(() => {
    return columns.filter(col => col.type === 'string' || col.type === 'date');
  }, [columns]);

  const metricColumns = useMemo(() => {
    return columns.filter(col => col.type === 'number');
  }, [columns]);

  // Selected configurations
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [aggregationType, setAggregationType] = useState<'sum' | 'avg'>('sum');

  // Load defaults
  React.useEffect(() => {
    if (dimensionColumns.length > 0 && !selectedDimension) {
      // Prefer string columns over date columns for default categorical dimension
      const firstStrCol = dimensionColumns.find(c => c.type === 'string');
      setSelectedDimension(firstStrCol ? firstStrCol.name : dimensionColumns[0].name);
    }
    if (metricColumns.length > 0 && !selectedMetric) {
      setSelectedMetric(metricColumns[0].name);
    }
  }, [dimensionColumns, metricColumns, selectedDimension, selectedMetric]);

  const activeDimension = useMemo(() => {
    return dimensionColumns.find(c => c.name === selectedDimension) || null;
  }, [dimensionColumns, selectedDimension]);

  const activeMetric = useMemo(() => {
    return metricColumns.find(c => c.name === selectedMetric) || null;
  }, [metricColumns, selectedMetric]);

  // Aggregate and format chart records
  const chartData = useMemo(() => {
    if (!activeDimension || !activeMetric || filteredRecords.length === 0) return [];

    const dimName = activeDimension.name;
    const metName = activeMetric.name;

    // Map: DimValue -> { count: number, total: number }
    const groups: { [key: string]: { count: number; total: number } } = {};

    filteredRecords.forEach(row => {
      let dimVal = row[dimName];
      if (dimVal === null || dimVal === undefined || String(dimVal).trim() === '') {
        dimVal = '(En blanco)';
      } else {
        dimVal = String(dimVal).trim();
      }

      const metVal = row[metName];
      const parsedMet = metVal !== null && metVal !== undefined ? parseFloat(String(metVal)) : null;

      if (!groups[dimVal]) {
        groups[dimVal] = { count: 0, total: 0 };
      }

      if (parsedMet !== null && !isNaN(parsedMet)) {
        groups[dimVal].total += parsedMet;
        groups[dimVal].count += 1;
      }
    });

    // Form list
    let list = Object.keys(groups).map(key => {
      const g = groups[key];
      const val = aggregationType === 'sum' 
        ? g.total 
        : g.count > 0 ? g.total / g.count : 0;

      return {
        dimension: key,
        value: parseFloat(val.toFixed(2)),
        count: g.count
      };
    });

    // Sort order
    if (activeDimension.type === 'date') {
      // Sort chronologically
      list.sort((a, b) => {
        const tsA = Date.parse(a.dimension.replace(/\./g, '-'));
        const tsB = Date.parse(b.dimension.replace(/\./g, '-'));
        if (isNaN(tsA)) return 1;
        if (isNaN(tsB)) return -1;
        return tsA - tsB;
      });
    } else {
      // Sort categorical alphabetically
      list.sort((a, b) => a.dimension.localeCompare(b.dimension));
    }

    return list;
  }, [filteredRecords, activeDimension, activeMetric, aggregationType]);

  // Create a trimmed version specifically optimized for Pie Chart (Top 7 + Otros)
  const pieChartData = useMemo(() => {
    if (chartData.length <= 8) return chartData;

    // Sort descending by value to isolate top players
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const top7 = sorted.slice(0, 7);
    const othersSlice = sorted.slice(7);

    const othersSum = othersSlice.reduce((acc, curr) => acc + curr.value, 0);

    return [
      ...top7,
      {
        dimension: 'Otros',
        value: parseFloat(othersSum.toFixed(2)),
        count: othersSlice.reduce((acc, curr) => acc + curr.count, 0)
      }
    ];
  }, [chartData]);

  // SVG to PNG download function
  const downloadChartAsPng = (containerRef: React.RefObject<HTMLDivElement | null>, fileName: string) => {
    if (!containerRef.current) return;

    // Find the SVG element rendered inside the container
    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) {
      alert('Error: No se encontró gráfico SVG activo.');
      return;
    }

    try {
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgSize = svgElement.getBoundingClientRect();
      const width = svgSize.width || 600;
      const height = svgSize.height || 400;

      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // Export at 2x scale for high resolution
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle transparent background by painting it white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.scale(2, 2);

      const img = new Image();
      // SVG base64 UTF-8 encoding safely handles accent letters and symbols in Spanish
      const base64Data = window.btoa(unescape(encodeURIComponent(svgString)));
      img.src = `data:image/svg+xml;base64,${base64Data}`;

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `${fileName}.png`;
        link.click();
      };
    } catch (err) {
      console.error(err);
      alert('La exportación de la imagen no se pudo completar completamente.');
    }
  };

  // Human readable metric prefix
  const metricLabel = aggregationType === 'sum' ? 'Suma de' : 'Promedio de';

  if (!activeDimension || !activeMetric) {
    return (
      <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 italic">
        Configura dimensiones y métricas para visualizar gráficos analytics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Selector Panel for dimension and metrics */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal size={18} className="text-blue-500" />
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dimensiones y Métricas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personaliza la agregación del eje horizontal y vertical para todas las gráficas analíticas.</p>
          </div>
        </div>

        {/* Input selectors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Dimension Selection */}
          <div className="space-y-1">
            <label className="text-xxs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Dimensión (Eje X)
            </label>
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              {dimensionColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name} ({col.type === 'date' ? 'Fecha' : 'Texto'})</option>
              ))}
            </select>
          </div>

          {/* Metric Selection */}
          <div className="space-y-1">
            <label className="text-xxs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Métrica (Eje Y)
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none font-medium"
            >
              {metricColumns.map(col => (
                <option key={col.name} value={col.name}>{col.name} (Número)</option>
              ))}
            </select>
          </div>

          {/* Aggregator Type selection */}
          <div className="space-y-1">
            <label className="text-xxs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Método de Agregación
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 h-[34px]">
              <button
                type="button"
                onClick={() => setAggregationType('sum')}
                className={`flex-1 text-center py-1 rounded-lg text-xs font-semibold select-none transition-all ${
                  aggregationType === 'sum'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Suma
              </button>
              <button
                type="button"
                onClick={() => setAggregationType('avg')}
                className={`flex-1 text-center py-1 rounded-lg text-xs font-semibold select-none transition-all ${
                  aggregationType === 'avg'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                Promedio
              </button>
            </div>
          </div>
        </div>

        {chartData.length === 0 && (
          <div className="flex items-center gap-2 text-xxs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/45 rounded-lg p-2.5">
            <Info size={14} />
            <span>Los filtros actuales excluyen todo el conjunto de datos de la hoja. Libere filtros en el panel superior para volver a renderizar.</span>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        /* Visualizer Grids of charts */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50 dark:border-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gráfico de Barras</span>
              </div>
              <button
                onClick={() => downloadChartAsPng(barContainerRef, `bar_chart_${selectedDimension}_y_${selectedMetric}`)}
                className="p-1 px-2 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 text-xxs font-medium rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                title="Descargar como PNG"
              >
                <Download size={12} />
                <span>PNG</span>
              </button>
            </div>

            <div ref={barContainerRef} className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="99%" height="100%">
                <BarChart data={chartData.slice(0, 20)} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8" 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8" 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '10px', direction: 'ltr' }}
                    labelFormatter={(value) => `${selectedDimension}: ${value}`}
                  />
                  <Bar 
                    dataKey="value" 
                    name={`${metricLabel} ${selectedMetric}`} 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Line Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50 dark:border-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <LineChartIcon size={16} className="text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gráfico de Líneas</span>
              </div>
              <button
                onClick={() => downloadChartAsPng(lineContainerRef, `line_chart_${selectedDimension}_y_${selectedMetric}`)}
                className="p-1 px-2 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 text-xxs font-medium rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                title="Descargar como PNG"
              >
                <Download size={12} />
                <span>PNG</span>
              </button>
            </div>

            <div ref={lineContainerRef} className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="99%" height="100%">
                <LineChart data={chartData.slice(0, 25)} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8"
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8" 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '10px' }}
                    labelFormatter={(value) => `${selectedDimension}: ${value}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    name={`${metricLabel} ${selectedMetric}`} 
                    stroke="#10B981" 
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Area Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50 dark:border-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <AreaChartIcon size={16} className="text-violet-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gráfico de Áreas</span>
              </div>
              <button
                onClick={() => downloadChartAsPng(areaContainerRef, `area_chart_${selectedDimension}_y_${selectedMetric}`)}
                className="p-1 px-2 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 text-xxs font-medium rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                title="Descargar como PNG"
              >
                <Download size={12} />
                <span>PNG</span>
              </button>
            </div>

            <div ref={areaContainerRef} className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="99%" height="100%">
                <AreaChart data={chartData.slice(0, 25)} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorAreaValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="dimension" 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8" 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }} 
                    stroke="#94A3B8" 
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '10px' }}
                    labelFormatter={(value) => `${selectedDimension}: ${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    name={`${metricLabel} ${selectedMetric}`} 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorAreaValue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Pie Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-50 dark:border-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <PieChartIcon size={16} className="text-amber-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gráfico Circular (Distribución)</span>
              </div>
              <button
                onClick={() => downloadChartAsPng(pieContainerRef, `pie_chart_${selectedDimension}_y_${selectedMetric}`)}
                className="p-1 px-2 flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-slate-250 text-xxs font-medium rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
                title="Descargar como PNG"
              >
                <Download size={12} />
                <span>PNG</span>
              </button>
            </div>

            <div ref={pieContainerRef} className="flex-1 min-h-0 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="99%" height="100%">
                <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="dimension"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={35}
                    paddingAngle={2}
                    label={({ dimension, percent }) => `${dimension} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ strokeWidth: 1 }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ fontSize: '11px', borderRadius: '10px' }}
                    labelFormatter={(value) => `${selectedDimension}: ${value}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={8}
                    wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
