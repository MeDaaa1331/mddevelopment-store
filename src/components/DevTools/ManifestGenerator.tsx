import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, Layers, Shield } from 'lucide-react';

export const ManifestGenerator: React.FC = () => {
  const [fxVersion, setFxVersion] = useState('cerulean');
  const [game, setGame] = useState('gta5');
  const [lua54, setLua54] = useState(true);
  const [author, setAuthor] = useState('MD Development');
  const [description, setDescription] = useState('High-performance FiveM Resource');
  const [version, setVersion] = useState('1.0.0');

  const [useOxLib, setUseOxLib] = useState(true);
  const [useOxmysql, setUseOxmysql] = useState(true);
  const [useEsx, setUseEsx] = useState(false);
  const [useQBCore, setUseQBCore] = useState(false);
  const [hasNui, setHasNui] = useState(false);
  const [escrowIgnore, setEscrowIgnore] = useState('config.lua\nlocales/*.lua');

  const [copied, setCopied] = useState(false);

  const generateManifest = () => {
    const lines = [
      `fx_version '${fxVersion}'`,
      `game '${game}'`,
      '',
      `name '${description}'`,
      `author '${author}'`,
      `version '${version}'`,
      `description '${description}'`,
      ''
    ];

    if (lua54) {
      lines.push("lua54 'yes'");
      lines.push('');
    }

    const dependencies: string[] = [];
    if (useOxLib) dependencies.push("'ox_lib'");
    if (useOxmysql) dependencies.push("'oxmysql'");
    if (useEsx) dependencies.push("'es_extended'");
    if (useQBCore) dependencies.push("'qb-core'");

    if (dependencies.length > 0) {
      lines.push(`dependencies {`);
      dependencies.forEach(d => lines.push(`    ${d},`));
      lines.push(`}`);
      lines.push('');
    }

    const sharedScripts: string[] = [];
    if (useOxLib) sharedScripts.push("'@ox_lib/init.lua'");
    sharedScripts.push("'config.lua'");
    sharedScripts.push("'locales/*.lua'");

    lines.push(`shared_scripts {`);
    sharedScripts.forEach(s => lines.push(`    ${s},`));
    lines.push(`}`);
    lines.push('');

    const clientScripts = ["'client/main.lua'", "'client/modules/*.lua'"];
    lines.push(`client_scripts {`);
    clientScripts.forEach(s => lines.push(`    ${s},`));
    lines.push(`}`);
    lines.push('');

    const serverScripts: string[] = [];
    if (useOxmysql) serverScripts.push("'@oxmysql/lib/MySQL.lua'");
    serverScripts.push("'server/main.lua'");
    serverScripts.push("'server/modules/*.lua'");

    lines.push(`server_scripts {`);
    serverScripts.forEach(s => lines.push(`    ${s},`));
    lines.push(`}`);
    lines.push('');

    if (hasNui) {
      lines.push("ui_page 'web/dist/index.html'");
      lines.push('');
      lines.push("files {");
      lines.push("    'web/dist/**',");
      lines.push("    'locales/*.json'");
      lines.push("}");
      lines.push('');
    }

    if (escrowIgnore.trim()) {
      const ignores = escrowIgnore.split('\n').map(i => i.trim()).filter(Boolean);
      if (ignores.length > 0) {
        lines.push('escrow_ignore {');
        ignores.forEach(ig => lines.push(`    '${ig}',`));
        lines.push('}');
      }
    }

    return lines.join('\n');
  };

  const outputManifest = generateManifest();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputManifest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputManifest], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fxmanifest.lua';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">fxmanifest.lua Generator</h3>
            <p className="text-xs text-zinc-400">
              Generate a clean, validated FiveM resource manifest with dependencies, scripts, and escrow config.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1.5 active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-glow-sm active:scale-95"
          >
            <Download className="w-4 h-4 text-black" />
            <span>Download fxmanifest.lua</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                FX Version
              </label>
              <select
                value={fxVersion}
                onChange={e => setFxVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none"
              >
                <option value="cerulean">cerulean (Recommended)</option>
                <option value="adamant">adamant</option>
                <option value="bodacious">bodacious</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Game Engine
              </label>
              <input
                type="text"
                value={game}
                onChange={e => setGame(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Version
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Resource Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dependencies & Features</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={useOxLib}
                  onChange={e => setUseOxLib(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">ox_lib</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={useOxmysql}
                  onChange={e => setUseOxmysql(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">oxmysql</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={useEsx}
                  onChange={e => setUseEsx(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">es_extended</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={useQBCore}
                  onChange={e => setUseQBCore(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">qb-core</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={hasNui}
                  onChange={e => setHasNui(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">NUI / Web UI</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 cursor-pointer hover:border-white/20 transition-colors">
                <input
                  type="checkbox"
                  checked={lua54}
                  onChange={e => setLua54(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span className="text-xs font-semibold text-zinc-200">lua54 'yes'</span>
              </label>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>CFX Escrow Ignore (Unencrypted files)</span>
            </label>
            <textarea
              value={escrowIgnore}
              onChange={e => setEscrowIgnore(e.target.value)}
              rows={3}
              placeholder="config.lua&#10;locales/*.lua"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30 resize-none"
            />
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative flex-1">
            <textarea
              value={outputManifest}
              readOnly
              rows={18}
              className="w-full h-full p-5 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs font-mono text-emerald-300 focus:outline-none resize-none selection:bg-emerald-950"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
