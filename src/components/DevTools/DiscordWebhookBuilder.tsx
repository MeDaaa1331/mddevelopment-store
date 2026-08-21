import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Plus, Trash2, Code2, Sparkles, Send } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

interface EmbedField {
  id: string;
  name: string;
  value: string;
  inline: boolean;
}

export const DiscordWebhookBuilder: React.FC = () => {
  const [botName, setBotName] = useState('MD Development Logs');
  const [title, setTitle] = useState('🚨 Player Transaction Alert');
  const [description, setDescription] = useState('A new in-game transaction has been successfully processed.');
  const [colorHex, setColorHex] = useState('#10B981');
  const [footerText, setFooterText] = useState('MD Development • System Logs');
  const [fields, setFields] = useState<EmbedField[]>([
    { id: '1', name: '👤 Player', value: 'John Doe (ID: 1)', inline: true },
    { id: '2', name: '💰 Amount', value: '$50,000', inline: true },
    { id: '3', name: '💳 Account Type', value: 'Bank Transfer', inline: true }
  ]);
  const [copied, setCopied] = useState(false);

  const hexToInt = (hex: string) => {
    return parseInt(hex.replace('#', ''), 16) || 1095937;
  };

  const addField = () => {
    const newField: EmbedField = {
      id: Date.now().toString(),
      name: 'Field Name',
      value: 'Field Value',
      inline: true
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: keyof EmbedField, val: any) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const generateLuaCode = () => {
    const fieldsLua = fields.map(f => `            {
                ["name"] = "${f.name}",
                ["value"] = "${f.value}",
                ["inline"] = ${f.inline}
            }`).join(',\n');

    return `local function SendDiscordLog(title, description, customFields)
    local webhook = "YOUR_DISCORD_WEBHOOK_URL_HERE"
    if not webhook or webhook == "" or webhook:find("YOUR_DISCORD") then return end

    local embed = {
        {
            ["title"] = title or "${title}",
            ["description"] = description or "${description}",
            ["color"] = ${hexToInt(colorHex)},
            ["fields"] = customFields or {
${fieldsLua}
            },
            ["footer"] = {
                ["text"] = "${footerText} • " .. os.date("%Y-%m-%d %H:%M:%S")
            }
        }
    }

    PerformHttpRequest(webhook, function(err, text, headers) end, 'POST', json.encode({
        username = "${botName}",
        embeds = embed,
        avatar_url = "https://www.mddevelopment.store/logo.png"
    }), { ['Content-Type'] = 'application/json' })
end

-- Example trigger:
-- SendDiscordLog("${title}", "${description}")`;
  };

  const outputCode = generateLuaCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    trackEvent('webhook', 'copy_lua', `Discord Embed (${title})`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">FiveM Discord Webhook Builder</h3>
            <p className="text-xs text-zinc-400">
              Create custom Discord embed logs and generate ready-to-use FiveM server Lua functions.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-glow-sm active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Copied Lua Code!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-black" />
              <span>Copy FiveM Log Code</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col gap-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Bot Username
              </label>
              <input
                type="text"
                value={botName}
                onChange={e => setBotName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Embed Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={e => setColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer overflow-hidden"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={e => setColorHex(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30 uppercase"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Embed Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Embed Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Embed Fields ({fields.length})
              </label>
              <button
                onClick={addField}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-semibold text-white transition-all flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Field</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fields.map(field => (
                <div key={field.id} className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-center gap-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={e => updateField(field.id, 'name', e.target.value)}
                    placeholder="Field name"
                    className="flex-1 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => updateField(field.id, 'value', e.target.value)}
                    placeholder="Field value"
                    className="flex-1 px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-xs text-white focus:outline-none"
                  />
                  <label className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={field.inline}
                      onChange={e => updateField(field.id, 'inline', e.target.checked)}
                      className="rounded accent-emerald-500"
                    />
                    <span>Inline</span>
                  </label>
                  <button
                    onClick={() => removeField(field.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Footer Text
            </label>
            <input
              type="text"
              value={footerText}
              onChange={e => setFooterText(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-[#313338] border border-white/10 shadow-2xl text-[#dbdee1] font-sans">
            <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Live Discord Embed Preview
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 p-1 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Bot Avatar" className="w-full h-full object-contain rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{botName}</span>
                  <span className="px-1 py-0.2 text-[10px] font-bold bg-[#5865F2] text-white rounded">BOT</span>
                  <span className="text-[11px] text-zinc-400">Today at 12:00</span>
                </div>

                <div
                  className="mt-2 p-3.5 rounded-r-lg bg-[#2b2d31] border-l-4 space-y-2"
                  style={{ borderLeftColor: colorHex }}
                >
                  <h4 className="font-bold text-sm text-white">{title}</h4>
                  <p className="text-xs text-[#dbdee1] leading-relaxed">{description}</p>

                  {fields.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                      {fields.map(f => (
                        <div key={f.id} className={f.inline ? 'col-span-1' : 'col-span-2'}>
                          <div className="text-[11px] font-bold text-zinc-300">{f.name}</div>
                          <div className="text-xs text-zinc-200 mt-0.5">{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-zinc-400 pt-2 border-t border-white/5">
                    {footerText} • 2026-08-20 12:00:00
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={outputCode}
              readOnly
              rows={9}
              className="w-full h-full p-4 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs font-mono text-emerald-300 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
