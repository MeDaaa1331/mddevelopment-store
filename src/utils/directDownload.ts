import JSZip from 'jszip';
import { TebexPackage } from '../types';

export async function triggerDirectScriptDownload(pkg: TebexPackage): Promise<void> {
  const safeSlug = (pkg.slug || pkg.name || 'md_free_resource')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `${safeSlug}.zip`;

  if (pkg.download_url && (pkg.download_url.startsWith('/downloads/') || pkg.download_url.endsWith('.zip'))) {
    try {
      const res = await fetch(pkg.download_url);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
    } catch {}
  }

  const zip = new JSZip();
  const folder = zip.folder(safeSlug) || zip;

  const manifestContent = `fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'MD Development'
description '${pkg.name} - Free Community Resource'
version '1.0.0'

shared_scripts {
    'config.lua'
}

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}
`;

  const configContent = pkg.config_preview || `Config = {}
Config.Framework = "auto"
Config.Debug = false
Config.Language = "en"
`;

  const clientContent = `local QBCore = nil
local ESX = nil

CreateThread(function()
    if Config.Framework == "qb" or Config.Framework == "auto" then
        local success, core = pcall(function() return exports['qb-core']:GetCoreObject() end)
        if success and core then QBCore = core end
    end
    if not QBCore and (Config.Framework == "esx" or Config.Framework == "auto") then
        local success, core = pcall(function() return exports['es_extended']:getSharedObject() end)
        if success and core then ESX = core end
    end
    print('^2[MD Development]^7 ${pkg.name} client initialized!')
end)
`;

  const serverContent = `CreateThread(function()
    print('^2[MD Development]^7 ${pkg.name} server loaded successfully!')
    print('^2[MD Development]^7 Thank you for using official MD Development free resources!')
end)
`;

  const readmeContent = `# ${pkg.name}
**Created by MD Development**

### 🚀 Installation
1. Extract the \`${safeSlug}\` folder into your FiveM server \`resources\` directory.
2. Add \`ensure ${safeSlug}\` to your \`server.cfg\`.
3. Configure \`config.lua\` to your preferences.
4. Restart your FiveM server.

### 💎 Discord & Support
Join our official Discord for updates and support: https://discord.gg/Ze4m2Uyxjw
`;

  folder.file('fxmanifest.lua', manifestContent);
  folder.file('config.lua', configContent);
  folder.file('client/main.lua', clientContent);
  folder.file('server/main.lua', serverContent);
  folder.file('README.md', readmeContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(zipBlob);

  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = downloadUrl;
  downloadAnchor.download = filename;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
