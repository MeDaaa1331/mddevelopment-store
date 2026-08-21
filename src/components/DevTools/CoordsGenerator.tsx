import React, { useState } from 'react';
import { MapPin, Copy, Check, Sparkles, Code2, Box, Eye } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export const CoordsGenerator: React.FC = () => {
  const [coordsInput, setCoordsInput] = useState('vec3(215.34, -810.12, 30.73)');
  const [headingInput, setHeadingInput] = useState('160.0');
  const [zoneName, setZoneName] = useState('my_custom_zone');
  const [zoneLabel, setZoneLabel] = useState('Open Bank');
  const [zoneIcon, setZoneIcon] = useState('fa-solid fa-vault');
  const [targetType, setTargetType] = useState<'ox_target' | 'qb_target' | 'polyzone' | 'ped' | 'marker'>('ox_target');
  const [copied, setCopied] = useState(false);

  const parseCoordinates = (input: string) => {
    const nums = input.match(/-?\d+(?:\.\d+)?/g);
    if (!nums || nums.length < 3) {
      return { x: '215.34', y: '-810.12', z: '30.73', h: headingInput || '0.0' };
    }
    const x = nums[0];
    const y = nums[1];
    const z = nums[2];
    const h = nums[3] || headingInput || '0.0';
    return { x, y, z, h };
  };

  const coords = parseCoordinates(coordsInput);
  const hVal = headingInput || coords.h;

  const generateCode = () => {
    switch (targetType) {
      case 'ox_target':
        return `exports.ox_target:addBoxZone({
    coords = vec3(${coords.x}, ${coords.y}, ${coords.z}),
    size = vec3(2.0, 2.0, 2.0),
    rotation = ${hVal},
    debug = false,
    options = {
        {
            name = '${zoneName}',
            icon = '${zoneIcon}',
            label = '${zoneLabel}',
            distance = 2.5,
            onSelect = function(data)
                -- Trigger your client/server event here
                print('${zoneName} selected')
            end
        }
    }
})`;

      case 'qb_target':
        return `exports['qb-target']:AddBoxZone("${zoneName}", vector3(${coords.x}, ${coords.y}, ${coords.z}), 2.0, 2.0, {
    name = "${zoneName}",
    heading = ${hVal},
    debugPoly = false,
    minZ = ${coords.z} - 1.0,
    maxZ = ${coords.z} + 1.5,
}, {
    options = {
        {
            type = "client",
            event = "md:${zoneName}:client",
            icon = "${zoneIcon}",
            label = "${zoneLabel}",
        },
    },
    distance = 2.5
})`;

      case 'polyzone':
        return `local ${zoneName} = BoxZone:Create(vector3(${coords.x}, ${coords.y}, ${coords.z}), 2.5, 2.5, {
    name = "${zoneName}",
    heading = ${hVal},
    debugPoly = false,
    minZ = ${coords.z} - 1.0,
    maxZ = ${coords.z} + 2.0
})

${zoneName}:onPlayerInOut(function(isPointInside)
    if isPointInside then
        lib.showTextUI('${zoneLabel}')
    else
        lib.hideTextUI()
    end
end)`;

      case 'ped':
        return `CreateThread(function()
    local model = \`mp_m_freemode_01\`
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(10) end

    local ped = CreatePed(4, model, ${coords.x}, ${coords.y}, ${coords.z} - 1.0, ${hVal}, false, true)
    SetEntityHeading(ped, ${hVal})
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetModelAsNoLongerNeeded(model)
end)`;

      case 'marker':
        return `CreateThread(function()
    local coords = vector3(${coords.x}, ${coords.y}, ${coords.z})
    while true do
        local sleep = 1500
        local playerCoords = GetEntityCoords(PlayerPedId())
        local dist = #(playerCoords - coords)

        if dist < 20.0 then
            sleep = 0
            DrawMarker(2, coords.x, coords.y, coords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.5, 0.5, 0.5, 255, 255, 255, 200, false, true, 2, false, nil, nil, false)
            if dist < 1.5 then
                lib.showTextUI('[E] ${zoneLabel}')
                if IsControlJustPressed(0, 38) then
                    -- Execute action
                end
            end
        end
        Wait(sleep)
    end
end)`;
    }
  };

  const outputCode = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    trackEvent('coords', 'copy_lua', `${targetType} (${coords.x}, ${coords.y}, ${coords.z})`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Coords & Zone Generator</h3>
            <p className="text-xs text-zinc-400">
              Convert vector coordinates to ox_target, qb-target, PolyZone, and Ped spawning scripts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs flex-wrap">
          {(['ox_target', 'qb_target', 'polyzone', 'ped', 'marker'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTargetType(type)}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all uppercase ${
                targetType === type ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              In-Game Coordinates (/coords)
            </label>
            <input
              type="text"
              value={coordsInput}
              onChange={e => setCoordsInput(e.target.value)}
              placeholder="vec3(123.4, 567.8, 20.0) or 123.4, 567.8, 20.0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Heading (Degrees)
              </label>
              <input
                type="text"
                value={headingInput}
                onChange={e => setHeadingInput(e.target.value)}
                placeholder="180.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Zone Identifier Name
              </label>
              <input
                type="text"
                value={zoneName}
                onChange={e => setZoneName(e.target.value)}
                placeholder="my_zone"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Target Label
              </label>
              <input
                type="text"
                value={zoneLabel}
                onChange={e => setZoneLabel(e.target.value)}
                placeholder="Open Menu"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                FontAwesome Icon
              </label>
              <input
                type="text"
                value={zoneIcon}
                onChange={e => setZoneIcon(e.target.value)}
                placeholder="fa-solid fa-hand"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 space-y-1.5 text-xs text-zinc-400">
            <div className="flex justify-between font-mono text-[11px]">
              <span>Parsed X: <strong className="text-white">{coords.x}</strong></span>
              <span>Parsed Y: <strong className="text-white">{coords.y}</strong></span>
              <span>Parsed Z: <strong className="text-white">{coords.z}</strong></span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generated FiveM Lua Snippet:</span>
            </label>
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/15 text-xs font-semibold text-white transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
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
          </div>

          <div className="relative flex-1">
            <textarea
              value={outputCode}
              readOnly
              rows={14}
              className="w-full h-full p-4 rounded-2xl bg-zinc-950/90 border border-white/10 text-xs font-mono text-emerald-300 focus:outline-none resize-none selection:bg-emerald-950 selection:text-emerald-200"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
