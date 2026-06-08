/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Terminal, 
  Settings, 
  Send, 
  Flame, 
  HelpCircle,
  Code2,
  Cpu
} from 'lucide-react';

export default function DeployInstructions() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro info box */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-lg space-y-2">
        <div className="flex items-center gap-2.5">
          <BookOpen size={22} className="animate-pulse" />
          <h2 className="text-lg font-bold">Documentación e Instrucciones de Despliegue</h2>
        </div>
        <p className="text-sm text-blue-100 max-w-2xl leading-relaxed">
          SheetAnalyzer ha sido diseñado como un motor de Business Intelligence agnóstico y auto-configurable. 
          Aquí encontrarás todos los detalles técnicos para clonar, lanzar e integrar tu propio cuadro de mandos corporativo.
        </p>
      </div>

      {/* Grid of detail sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Local Installation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-900">
            <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100">
              <Terminal size={16} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Instalación Local</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sigue estos comandos para ejecutar y auditar la aplicación localmente en tu ordenador o servidor Node.js:
          </p>
          <div className="bg-slate-950 text-slate-100 p-3 rounded-xl font-mono text-[11px] leading-relaxed select-all">
            <span className="text-slate-500"># 1. Clonar o descomprimir repositorio</span><br/>
            cd react-google-sheets-dashboard<br/><br/>
            <span className="text-slate-500"># 2. Instalar dependencias requeridas</span><br/>
            npm install<br/><br/>
            <span className="text-slate-500"># 3. Lanzar servidor de desarrollo local</span><br/>
            npm run dev<br/><br/>
            <span className="text-slate-550"># 4. Compilar optimizado para producción</span><br/>
            npm run build
          </div>
        </div>

        {/* Inference engine explanation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-900">
              <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-slate-100">
                <Cpu size={16} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Motor de Inferencia Inteligente</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
              La aplicación no requiere configurar campos fijos. Al cargar el documento CSV, se realiza una inspección profunda del 70% de las filas de cada columna para determinar óptimamente:
            </p>
            <ul className="mt-3 space-y-2 text-xxs text-slate-600 dark:text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-slate-800 dark:text-slate-250">Eje Numérico (Métricas)</strong>: Filtra monedas, símbolos (€, $, ¥) y formatos porcentuales (%), parseando automáticamente con tolerancia a configuraciones de miles europeas.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-250">Eje Temporal (Fechas)</strong>: Detecta formatos ISO, guiones y barras temporales construyendo filtros deslizantes cronológicos exactos.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-250">Eje Categórico (Texto)</strong>: Genera glosarios únicos ordenados alfabéticamente para filtrado reactivo multi-select.
              </li>
            </ul>
          </div>
          <div className="text-[10px] text-blue-500 bg-blue-50/50 dark:bg-blue-955/20 p-2.5 rounded-lg border border-blue-200/50 flex items-center gap-1.5">
            <Code2 size={13} />
            <span>Desarrollado en React 19 + TypeScript + Recharts.</span>
          </div>
        </div>

      </div>

      {/* Cloud deployment cards */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pt-2">Despliegue Multi-Plataforma Cloud</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Vercel Hosting */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-900">
            <div className="p-1.5 bg-black text-white rounded-lg">
              <Send size={15} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Desplegar en Vercel</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Vercel es ideal para albergar aplicaciones estáticas basadas en Vite y React con carga instantánea y SSL integrado:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li>
              Sube el repositorio de tu código completo a tu cuenta de <strong className="text-slate-700 dark:text-slate-250">GitHub, GitLab o Bitbucket</strong>.
            </li>
            <li>
              Inicia sesión en <strong className="text-slate-700 dark:text-slate-250">Vercel</strong> y haz clic en <strong className="text-blue-500">Add New Project</strong>.
            </li>
            <li>
              Importa tu repositorio git detectado.
            </li>
            <li>
              En la sección de configuraciones de compilación de Vercel (<strong className="text-slate-705">Build & Development Settings</strong>), verifica los valores estándar:
              <ul className="list-disc list-inside pl-4 pt-1 space-y-0.5 text-xxs text-slate-505 dark:text-slate-500 font-mono">
                <li>Framework Preset: Vite</li>
                <li>Build Command: <code className="bg-slate-50 dark:bg-slate-900 px-1 py-0.5 border rounded">npm run build</code></li>
                <li>Output Directory: <code className="bg-slate-50 dark:bg-slate-900 px-1 py-0.5 border rounded">dist</code></li>
              </ul>
            </li>
            <li>
              Haz clic en <strong className="text-indigo-500">Deploy</strong>. Vercel se encargará de las subsiguientes compilaciones con cada commit.
            </li>
          </ol>
        </div>

        {/* Firebase Hosting */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-900">
            <div className="p-1.5 bg-orange-500 text-white rounded-lg">
              <Flame size={15} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Desplegar en Firebase</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Firebase Hosting proporciona infraestructura CDN rápida y segura ideal para tu despliegue estático de dashboard:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <li>
              Instala herramientas Firebase globes en tu sistema:<br/>
              <code className="bg-slate-950 text-slate-100 block text-xxs font-mono p-2 rounded-lg mt-1 select-all">npm install -g firebase-tools</code>
            </li>
            <li>
              Logueate e inicializa tu proyecto indicando directorio de salida:<br/>
              <code className="bg-slate-950 text-slate-100 block text-xxs font-mono p-2 rounded-lg mt-1 select-all">firebase login<br/>firebase init hosting</code>
            </li>
            <li>
              Durante la configuración responde a los flujos sugeridos:
              <ul className="list-disc list-inside pl-4 pt-1 space-y-0.5 text-xxs text-slate-505 dark:text-slate-500 font-mono">
                <li>What do you want to use as your public directory? <code className="text-green-500">dist</code></li>
                <li>Configure as a single-page app (rewrite all urls to /index.html)? <code className="text-green-500">Yes</code></li>
                <li>Set up automatic builds and deploys with GitHub? <code className="text-slate-400">Opcional</code></li>
              </ul>
            </li>
            <li>
              Compila y exporta de forma final la aplicación:<br/>
              <code className="bg-slate-950 text-slate-100 block text-xxs font-mono p-2 rounded-lg mt-1 select-all">npm run build<br/>firebase deploy</code>
            </li>
          </ol>
        </div>

      </div>

    </div>
  );
}
