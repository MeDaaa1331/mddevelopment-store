import React, { useState, useMemo } from 'react';
import { FileJson, Copy, Check, Download, Sparkles, Minimize2, Maximize2, ArrowUpDown, Wand2, ArrowRightLeft, Code2, AlertTriangle } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

const SAMPLE_MINIFIED_JSON = `{"server":{"name":"MD Development Roleplay","slots":128,"locale":"cs","tags":["roleplay","custom","economy"]},"economy":{"startingMoney":5000,"currencySymbol":"$","banks":[{"id":"legion","name":"Pacific Standard Bank","coords":{"x":234.12,"y":217.45,"z":106.28},"open247":true},{"id":"blaine","name":"Blaine County Savings","coords":{"x":-112.5,"y":6467.2,"z":31.6},"open247":false}]},"jobs":{"police":{"label":"Police Department","ranks":[{"grade":0,"title":"Cadet","salary":1200},{"grade":1,"title":"Officer","salary":1800},{"grade":2,"title":"Chief","salary":3500}]}}}`;

function repairJson(input: string): string {
  let cleaned = input.trim();
  
  // Remove single line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  
  // Replace single quotes with double quotes for keys and strings
  cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

  // Fix unquoted object keys: { name: "val" } -> { "name": "val" }
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');

  // Remove trailing commas: [1, 2,] -> [1, 2]
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  return cleaned;
}

function jsonToLuaTable(obj: any, indent = 1): string {
  const pad = '    '.repeat(indent);
  const closePad = '    '.repeat(indent - 1);

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '{}';
    const lines: string[] = ['{'];
    obj.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        lines.push(`${pad}${jsonToLuaTable(item, indent + 1)},`);
      } else if (typeof item === 'string') {
        lines.push(`${pad}'${item.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`);
      } else {
        lines.push(`${pad}${String(item)},`);
      }
    });
    lines.push(`${closePad}}`);
    return lines.join('\n');
  }

  if (typeof obj === 'object' && obj !== null) {
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    const lines: string[] = ['{'];
    keys.forEach(k => {
      const val = obj[k];
      const keyRepr = /^[a-zA-Z_]\w*$/.test(k) ? `['${k}']` : `['${k}']`;
      if (typeof val === 'object' && val !== null) {
        lines.push(`${pad}${keyRepr} = ${jsonToLuaTable(val, indent + 1)},`);
      } else if (typeof val === 'string') {
        lines.push(`${pad}${keyRepr} = '${val.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`);
      } else if (typeof val === 'boolean') {
        lines.push(`${pad}${keyRepr} = ${val ? 'true' : 'false'},`);
      } else if (val === null) {
        lines.push(`${pad}${keyRepr} = nil,`);
      } else {
        lines.push(`${pad}${keyRepr} = ${String(val)},`);
      }
    });
    lines.push(`${closePad}}`);
    return lines.join('\n');
  }

  return String(obj);
}

function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key: string) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

export const JsonFormatter: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_MINIFIED_JSON);
  const [indentSize, setIndentSize] = useState<2 | 4 | 'tab'>(2);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<'json' | 'lua'>('json');

  const { formattedOutput, isValid, stats } = useMemo(() => {
    if (!inputText.trim()) {
      return { formattedOutput: '', isValid: true, stats: null };
    }

    try {
      const parsed = JSON.parse(inputText);
      const indentStr = indentSize === 'tab' ? '\t' : indentSize;
      
      let out = '';
      if (outputMode === 'lua') {
        out = `return ${jsonToLuaTable(parsed, 1)}`;
      } else {
        out = JSON.stringify(parsed, null, indentStr);
      }

      const lineCount = out.split('\n').length;
      const sizeBytes = new Blob([out]).size;

      return {
        formattedOutput: out,
        isValid: true,
        stats: {
          lines: lineCount,
          sizeKb: (sizeBytes / 1024).toFixed(2),
          keys: Object.keys(parsed).length
        }
      };
    } catch (e: any) {
      return {
        formattedOutput: '',
        isValid: false,
        stats: null,
        error: e.message
      };
    }
  }, [inputText, indentSize, outputMode]);

  const handleBeautify = (spaces: 2 | 4 | 'tab') => {
    setIndentSize(spaces);
    setOutputMode('json');
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputText);
      const indentStr = spaces === 'tab' ? '\t' : spaces;
      setInputText(JSON.stringify(parsed, null, indentStr));
    } catch {
      handleAutoRepair();
    }
  };

  const handleMinify = () => {
    setOutputMode('json');
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputText);
      setInputText(JSON.stringify(parsed));
      trackEvent('json', 'format', 'Minified JSON');
    } catch (e: any) {
      setErrorMsg('Cannot minify invalid JSON. Try "Auto Repair" first.');
    }
  };

  const handleSortKeys = () => {
    setOutputMode('json');
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputText);
      const sorted = sortObjectKeys(parsed);
      const indentStr = indentSize === 'tab' ? '\t' : indentSize;
      setInputText(JSON.stringify(sorted, null, indentStr));
      trackEvent('json', 'format', 'Sorted JSON Keys');
    } catch (e: any) {
      setErrorMsg('Cannot sort invalid JSON. Try "Auto Repair" first.');
    }
  };

  const handleAutoRepair = () => {
    setErrorMsg(null);
    try {
      const repaired = repairJson(inputText);
      const parsed = JSON.parse(repaired);
      const indentStr = indentSize === 'tab' ? '\t' : indentSize;
      setInputText(JSON.stringify(parsed, null, indentStr));
      trackEvent('json', 'format', 'Auto-Repaired Broken JSON');
    } catch (e: any) {
      setErrorMsg('Auto-repair failed. Please check quotes or brackets.');
    }
  };

  const handleCopy = () => {
    const textToCopy = formattedOutput || inputText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    trackEvent('json', outputMode === 'lua' ? 'copy_lua' : 'copy_json', `${outputMode.toUpperCase()} formatted text`);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const content = formattedOutput || inputText;
    if (!content) return;
    const filename = outputMode === 'lua' ? 'config.lua' : 'data.json';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    trackEvent('json', outputMode === 'lua' ? 'copy_lua' : 'copy_json', `Downloaded ${filename}`);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <FileJson className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">JSON Formatter & Beautifier</h3>
            <p className="text-xs text-zinc-400">
              Format minified 1-line JSON, validate syntax, auto-repair broken commas/quotes, and convert to Lua tables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setInputText(SAMPLE_MINIFIED_JSON)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load 1-Line Sample</span>
          </button>
          <button
            onClick={() => setInputText('')}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-2xl bg-zinc-950/80 border border-white/10">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleBeautify(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              indentSize === 2 && outputMode === 'json' ? 'bg-white text-black shadow-sm' : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/5'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Format (2 Spaces)</span>
          </button>

          <button
            onClick={() => handleBeautify(4)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              indentSize === 4 && outputMode === 'json' ? 'bg-white text-black shadow-sm' : 'bg-zinc-900 text-zinc-300 hover:text-white border border-white/5'
            }`}
          >
            <span>Format (4 Spaces)</span>
          </button>

          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify (1 Line)</span>
          </button>

          <button
            onClick={handleSortKeys}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort Keys (A-Z)</span>
          </button>

          <button
            onClick={handleAutoRepair}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
            data-tooltip="Fix trailing commas, quotes & keys"
            data-tooltip-pos="bottom"
            aria-label="Auto Repair JSON"
          >
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto Repair JSON</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setOutputMode('json')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                outputMode === 'json' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setOutputMode('lua')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all flex items-center gap-1 ${
                outputMode === 'lua' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Lua Table</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs font-mono text-red-300 flex items-center gap-2 animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="relative rounded-2xl bg-zinc-950/90 border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isValid ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
            <span className={`font-bold ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
              {isValid ? 'Valid JSON' : 'Invalid JSON Syntax'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stats && (
              <span className="text-zinc-400 text-[11px] hidden sm:inline-block">
                {stats.lines} lines • {stats.sizeKb} KB
              </span>
            )}

            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
              data-tooltip="Download file"
              data-tooltip-pos="left"
              aria-label="Download file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          value={outputMode === 'lua' ? formattedOutput : inputText}
          onChange={e => {
            if (outputMode === 'lua') setOutputMode('json');
            setInputText(e.target.value);
          }}
          placeholder="Paste minified 1-line JSON or formatted JSON here..."
          rows={16}
          className="w-full p-4 bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
