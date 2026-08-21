import React, { useState } from 'react';
import { Languages, Copy, Check, Download, Sparkles, RefreshCw, FileCode2, ArrowRight } from 'lucide-react';
import {
  SupportedLang,
  SUPPORTED_LANGS,
  parseLocalesInput,
  translateParsedLocales,
  formatLocalesOutput
} from '../../utils/translator';
import { trackEvent } from '../../utils/analytics';

const SAMPLE_LUA = `Locales['en'] = {
  ['welcome'] = 'Welcome to the server, %s!',
  ['press_e'] = 'Press ~INPUT_CONTEXT~ to open menu',
  ['bank_deposit'] = 'You have deposited ~g~$%s~s~ into your bank account.',
  ['bank_withdraw'] = 'You have withdrawn ~r~$%s~s~ from your account.',
  ['no_money'] = 'You do not have enough money in your wallet!',
  ['vehicle_locked'] = 'Your vehicle has been ~r~locked~s~.',
  ['vehicle_unlocked'] = 'Your vehicle has been ~g~unlocked~s~.',
  ['inventory_full'] = 'Your inventory is full! Cannot carry more items.',
  ['police_alert'] = '~r~[POLICE]~s~ 10-90 In progress: %s'
}`;

export const LocalesTranslator: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLE_LUA);
  const [sourceLang, setSourceLang] = useState<SupportedLang>('en');
  const [targetLang, setTargetLang] = useState<SupportedLang>('cs');
  const [format, setFormat] = useState<'lua' | 'json'>('lua');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ totalKeys: number; durationMs: number } | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    setProgress({ current: 0, total: 0 });
    setStats(null);
    const startTime = Date.now();

    try {
      const parsedData = parseLocalesInput(inputText);
      const activeFormat = format || parsedData.format;
      const count = parsedData.isNestedJson && parsedData.jsonItems
        ? parsedData.jsonItems.length
        : Object.keys(parsedData.entries).length;

      if (count === 0) {
        setOutputText('-- No valid key-value pairs detected in input.');
        setIsTranslating(false);
        return;
      }

      setProgress({ current: 0, total: count });

      const translatedResult = await translateParsedLocales(parsedData, sourceLang, targetLang, (curr, tot) => {
        setProgress({ current: curr, total: tot });
      });

      const formatted = formatLocalesOutput(translatedResult, targetLang, activeFormat);
      setOutputText(formatted);
      setStats({
        totalKeys: count,
        durationMs: Date.now() - startTime
      });
      trackEvent('translator', 'format', `${sourceLang.toUpperCase()} ➔ ${targetLang.toUpperCase()} (${count} keys translated)`);
    } catch {
      setOutputText('-- Translation failed. Please check your input format.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    trackEvent('translator', format === 'json' ? 'copy_json' : 'copy_lua', `${targetLang.toUpperCase()} Locales (${stats?.totalKeys || 0} keys)`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const filename = format === 'json' ? `${targetLang}.json` : `${targetLang}.lua`;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    trackEvent('translator', format === 'json' ? 'copy_json' : 'copy_lua', `Exported ${filename}`);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_LUA);
    setSourceLang('en');
    setTargetLang('cs');
    setFormat('lua');
    setOutputText('');
    setStats(null);
  };

  const progressPct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">FiveM Locales Auto-Translator</h3>
            <p className="text-xs text-zinc-400">
              Parallel batch engine preserving <code className="text-emerald-400 font-mono">%s</code>, <code className="text-emerald-400 font-mono">~r~</code> color codes, and keys.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample</span>
          </button>
          <div className="flex items-center p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setFormat('lua')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                format === 'lua' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              LUA
            </button>
            <button
              onClick={() => setFormat('json')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                format === 'json' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Source Language:</span>
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              {SUPPORTED_LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSourceLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    sourceLang === lang.code
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Paste your Locales['en'] = { ... } or JSON here..."
              rows={14}
              className="w-full h-full p-4 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/30 resize-none transition-colors"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>Target Language:</span>
            </label>
            <div className="flex items-center gap-1 flex-wrap">
              {SUPPORTED_LANGS.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setTargetLang(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    targetLang === lang.code
                      ? 'bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={outputText}
              readOnly
              placeholder="Click 'Translate Locales' to generate translated code..."
              rows={14}
              className="w-full h-full p-4 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs font-mono text-emerald-300 placeholder-zinc-600 focus:outline-none resize-none"
              spellCheck={false}
            />

            {outputText && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-xs font-semibold text-white backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
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
                  className="p-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-zinc-300 hover:text-white backdrop-blur-md transition-all shadow-lg active:scale-95"
                  data-tooltip="Download file"
                  data-tooltip-pos="left"
                  aria-label="Download file"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isTranslating && progress.total > 0 && (
        <div className="p-4 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 space-y-2 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Translating {progress.current} of {progress.total} lines in parallel batches...</span>
            </span>
            <span className="text-white font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-200 shadow-glow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-zinc-400 font-mono">
          {stats && !isTranslating && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Translated {stats.totalKeys} lines in {(stats.durationMs / 1000).toFixed(2)}s!</span>
            </span>
          )}
        </div>

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 disabled:opacity-50 text-black font-extrabold text-xs transition-all duration-200 shadow-glow-sm flex items-center justify-center gap-2 active:scale-95"
        >
          {isTranslating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Translating ({progressPct}%)...</span>
            </>
          ) : (
            <>
              <FileCode2 className="w-4 h-4 text-black" />
              <span>Translate to {targetLang.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
