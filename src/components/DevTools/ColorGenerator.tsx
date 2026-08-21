import React, { useState } from 'react';
import { Palette, Copy, Check, MessageSquare, Bell, Sparkles } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

interface PresetColor {
  name: string;
  hex: string;
  fivemCode: string;
}

const PRESET_COLORS: PresetColor[] = [
  { name: 'FiveM Red', hex: '#FF3B30', fivemCode: '~r~' },
  { name: 'FiveM Green', hex: '#34C759', fivemCode: '~g~' },
  { name: 'FiveM Blue', hex: '#007AFF', fivemCode: '~b~' },
  { name: 'FiveM Yellow', hex: '#FFCC00', fivemCode: '~y~' },
  { name: 'FiveM Purple', hex: '#AF52DE', fivemCode: '~p~' },
  { name: 'FiveM Orange', hex: '#FF9500', fivemCode: '~o~' },
  { name: 'FiveM Cyan', hex: '#5AC8FA', fivemCode: '~c~' },
  { name: 'FiveM White', hex: '#FFFFFF', fivemCode: '~w~' },
  { name: 'Dark Slate', hex: '#1C1C1E', fivemCode: '~m~' },
  { name: 'Emerald Glow', hex: '#10B981', fivemCode: '~g~' },
  { name: 'Cyberpunk Neon', hex: '#00F0FF', fivemCode: '~c~' },
  { name: 'Gold Luxury', hex: '#D4AF37', fivemCode: '~y~' }
];

export const ColorGenerator: React.FC = () => {
  const [hex, setHex] = useState('#10B981');
  const [alpha, setAlpha] = useState(1);
  const [previewText, setPreviewText] = useState('MD Development — System Alert');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hexToRgb = (hexStr: string) => {
    let clean = hexStr.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  const rgb = hexToRgb(hex);

  const formats = [
    { key: 'hex', label: 'HEX Code', value: hex.toUpperCase() },
    { key: 'rgb', label: 'CSS RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { key: 'rgba', label: 'CSS RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` },
    { key: 'lua_table', label: 'FiveM Lua Table', value: `{ r = ${rgb.r}, g = ${rgb.g}, b = ${rgb.b}, a = ${Math.round(alpha * 255)} }` },
    { key: 'vec4', label: 'FiveM Vector4', value: `vec4(${(rgb.r / 255).toFixed(2)}, ${(rgb.g / 255).toFixed(2)}, ${(rgb.b / 255).toFixed(2)}, ${alpha.toFixed(2)})` },
    { key: 'nui_span', label: 'NUI HTML Span', value: `<span style="color: ${hex}">${previewText}</span>` }
  ];

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    trackEvent('colors', 'copy_hex', `${key.toUpperCase()}: ${val}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">FiveM & Web Color Generator</h3>
            <p className="text-xs text-zinc-400">
              Interactive color picker with instant conversion to FiveM Lua, HEX, RGBA, and NUI formats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10">
            <span
              className="w-5 h-5 rounded-lg border border-white/20 shadow-sm"
              style={{ backgroundColor: hex }}
            />
            <span className="font-mono text-xs font-bold text-white uppercase">{hex}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-5 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hex}
              onChange={e => setHex(e.target.value)}
              className="w-16 h-16 rounded-2xl bg-transparent border-0 cursor-pointer overflow-hidden shadow-lg"
            />
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Hex Code
              </label>
              <input
                type="text"
                value={hex}
                onChange={e => setHex(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm text-white focus:outline-none focus:border-white/30 uppercase"
                placeholder="#10B981"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Opacity / Alpha:</span>
              <span className="text-white font-bold">{Math.round(alpha * 100)}% ({alpha})</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={alpha}
              onChange={e => setAlpha(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>FiveM Color Presets</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_COLORS.map(p => (
                <button
                  key={p.name}
                  onClick={() => setHex(p.hex)}
                  className={`p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border text-left transition-all flex flex-col gap-1.5 group ${
                    hex.toLowerCase() === p.hex.toLowerCase()
                      ? 'border-white shadow-sm ring-1 ring-white/50'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <span
                    className="w-full h-4 rounded-md border border-white/10"
                    style={{ backgroundColor: p.hex }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-zinc-300 truncate">{p.name}</span>
                    <span className="text-[9px] font-mono font-bold text-zinc-500">{p.fivemCode}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Generated FiveM & Web Code Formats
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {formats.map(f => (
                <div
                  key={f.key}
                  className="p-3 rounded-xl bg-zinc-900/90 border border-white/10 flex flex-col justify-between gap-1.5 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">{f.label}</span>
                    <button
                      onClick={() => handleCopy(f.key, f.value)}
                      className="p-1 rounded-lg text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 transition-colors active:scale-95"
                      data-tooltip={`Copy ${f.label}`}
                      data-tooltip-pos="left"
                      aria-label={`Copy ${f.label}`}
                    >
                      {copiedKey === f.key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <code className="font-mono text-xs text-white truncate bg-black/40 px-2 py-1 rounded-lg border border-white/5 select-all">
                    {f.value}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live FiveM HUD & Chat Simulation</span>
              </label>
              <input
                type="text"
                value={previewText}
                onChange={e => setPreviewText(e.target.value)}
                placeholder="Custom notification text..."
                className="px-3 py-1 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/80 border border-white/10 space-y-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" style={{ color: hex }} />
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">FiveM Notification</span>
                </div>
                <div
                  className="p-3 rounded-xl border flex items-center gap-3 backdrop-blur-md shadow-lg"
                  style={{
                    backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
                    borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <p className="text-xs font-semibold text-white leading-tight">
                    {previewText}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/80 border border-white/10 space-y-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase">GTA V Chat Line</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-xs">
                  <span className="font-bold" style={{ color: hex }}>
                    [MD System]:{' '}
                  </span>
                  <span className="text-zinc-200">{previewText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
