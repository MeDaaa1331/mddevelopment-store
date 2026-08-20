export type SupportedLang = 'cs' | 'en' | 'sk' | 'de' | 'fr' | 'es';

export interface LangOption {
  code: SupportedLang;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGS: LangOption[] = [
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

const FIVE_M_COLOR_CODES = ['~r~', '~g~', '~b~', '~y~', '~p~', '~o~', '~c~', '~m~', '~u~', '~w~', '~s~', '~h~', '~n~'];

export function parseLocalesInput(input: string): { format: 'lua' | 'json'; entries: Record<string, string> } {
  const trimmed = input.trim();
  
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) {
        const entries: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'string') {
            entries[k] = v;
          }
        }
        if (Object.keys(entries).length > 0) {
          return { format: 'json', entries };
        }
      }
    } catch {}
  }

  const entries: Record<string, string> = {};
  const luaRegex = /(?:\[['"]([^'"]+)['"]\]|(\b\w+\b))\s*=\s*['"]((?:\\.|[^'"])*)['"]/g;
  let match;
  while ((match = luaRegex.exec(input)) !== null) {
    const key = match[1] || match[2];
    const value = match[3];
    if (key && value !== undefined) {
      entries[key] = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
  }

  if (Object.keys(entries).length > 0) {
    return { format: 'lua', entries };
  }

  const lines = input.split('\n');
  for (const line of lines) {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const k = parts[0].trim().replace(/^['"[]+|['"\]]+$/g, '');
      const v = parts.slice(1).join('=').trim().replace(/^['"]+|['",]+$/g, '');
      if (k && v) {
        entries[k] = v;
      }
    }
  }

  return { format: 'lua', entries };
}

function protectPlaceholders(text: string): { protectedText: string; tokens: string[] } {
  const tokens: string[] = [];
  let protectedText = text;

  for (const color of FIVE_M_COLOR_CODES) {
    while (protectedText.includes(color)) {
      const placeholder = `__CLR${tokens.length}__`;
      tokens.push(color);
      protectedText = protectedText.replace(color, placeholder);
    }
  }

  const varRegex = /(%s|%d|%f|%\.\d+f|%\{\w+\}|\{\d+\}|\{[a-zA-Z_]+\}|\$\{\w+\})/g;
  protectedText = protectedText.replace(varRegex, (match) => {
    const placeholder = `__VAR${tokens.length}__`;
    tokens.push(match);
    return placeholder;
  });

  return { protectedText, tokens };
}

function restorePlaceholders(text: string, tokens: string[]): string {
  let restored = text;
  tokens.forEach((token, index) => {
    const clrPattern = new RegExp(`__CLR${index}__`, 'gi');
    const varPattern = new RegExp(`__VAR${index}__`, 'gi');
    restored = restored.replace(clrPattern, token).replace(varPattern, token);
  });
  return restored;
}

const COMMON_FIVEM_TRANSLATIONS: Record<SupportedLang, Record<string, string>> = {
  cs: {
    'welcome': 'Vítej na serveru, %s!',
    'press_e': 'Stiskni ~INPUT_CONTEXT~ pro interakci',
    'no_money': 'Nemáš dostatek peněz!',
    'bank_deposit': 'Vložil jsi ~g~$%s~s~ na svůj bankovní účet.',
    'bank_withdraw': 'Vybral jsi ~r~$%s~s~ ze svého účtu.',
    'item_bought': 'Koupil jsi ~b~%s~s~ za ~g~$%s~s~.',
    'item_sold': 'Prodal jsi ~b~%s~s~ za ~g~$%s~s~.',
    'inventory_full': 'Tvůj inventář je plný!',
    'vehicle_locked': 'Vozidlo bylo ~r~uzamčeno~s~.',
    'vehicle_unlocked': 'Vozidlo bylo ~g~odemčeno~s~.',
    'action_success': 'Akce byla úspěšně dokončena.',
    'action_failed': 'Akce se nezdařila!',
    'police_alert': '~r~[POLICIE]~s~ Hlášen probíhající zločin: %s',
    'player_offline': 'Hráč není online.',
    'invalid_amount': 'Neplatná částka!'
  },
  sk: {
    'welcome': 'Vitaj na serveri, %s!',
    'press_e': 'Stlač ~INPUT_CONTEXT~ pre interakciu',
    'no_money': 'Nemáš dostatok peňazí!',
    'bank_deposit': 'Vložil si ~g~$%s~s~ na svoj bankový účet.',
    'bank_withdraw': 'Vybral si ~r~$%s~s~ zo svojho účtu.',
    'item_bought': 'Kúpil si ~b~%s~s~ za ~g~$%s~s~.',
    'item_sold': 'Predal si ~b~%s~s~ za ~g~$%s~s~.',
    'inventory_full': 'Tvoj inventár je plný!',
    'vehicle_locked': 'Vozidlo bolo ~r~zamknuté~s~.',
    'vehicle_unlocked': 'Vozidlo bolo ~g~odomknuté~s~.',
    'action_success': 'Akcia bola úspešne dokončená.',
    'action_failed': 'Akcia zlyhala!',
    'police_alert': '~r~[POLÍCIA]~s~ Hlásený prebiehajúci zločin: %s',
    'player_offline': 'Hráč nie je online.',
    'invalid_amount': 'Neplatná suma!'
  },
  en: {
    'welcome': 'Welcome to the server, %s!',
    'press_e': 'Press ~INPUT_CONTEXT~ to interact',
    'no_money': 'You do not have enough money!',
    'bank_deposit': 'You deposited ~g~$%s~s~ into your bank account.',
    'bank_withdraw': 'You withdrew ~r~$%s~s~ from your account.',
    'item_bought': 'You bought ~b~%s~s~ for ~g~$%s~s~.',
    'item_sold': 'You sold ~b~%s~s~ for ~g~$%s~s~.',
    'inventory_full': 'Your inventory is full!',
    'vehicle_locked': 'Vehicle ~r~locked~s~.',
    'vehicle_unlocked': 'Vehicle ~g~unlocked~s~.',
    'action_success': 'Action completed successfully.',
    'action_failed': 'Action failed!',
    'police_alert': '~r~[POLICE]~s~ 10-90 In progress: %s',
    'player_offline': 'Player is currently offline.',
    'invalid_amount': 'Invalid amount!'
  },
  de: {
    'welcome': 'Willkommen auf dem Server, %s!',
    'press_e': 'Drücke ~INPUT_CONTEXT~ zum Interagieren',
    'no_money': 'Du hast nicht genug Geld!',
    'bank_deposit': 'Du hast ~g~$%s~s~ auf dein Bankkonto eingezahlt.',
    'bank_withdraw': 'Du hast ~r~$%s~s~ von deinem Konto abgehoben.',
    'item_bought': 'Du hast ~b~%s~s~ für ~g~$%s~s~ gekauft.',
    'item_sold': 'Du hast ~b~%s~s~ für ~g~$%s~s~ verkauft.',
    'inventory_full': 'Dein Inventar ist voll!',
    'vehicle_locked': 'Fahrzeug ~r~abgeschlossen~s~.',
    'vehicle_unlocked': 'Fahrzeug ~g~aufgeschlossen~s~.',
    'action_success': 'Aktion erfolgreich abgeschlossen.',
    'action_failed': 'Aktion fehlgeschlagen!',
    'police_alert': '~r~[POLIZEI]~s~ Verbrechen gemeldet: %s',
    'player_offline': 'Spieler ist offline.',
    'invalid_amount': 'Ungültiger Betrag!'
  },
  fr: {
    'welcome': 'Bienvenue sur le serveur, %s !',
    'press_e': 'Appuyez sur ~INPUT_CONTEXT~ pour interagir',
    'no_money': 'Vous n\'avez pas assez d\'argent !',
    'bank_deposit': 'Vous avez déposé ~g~$%s~s~ sur votre compte bancaire.',
    'bank_withdraw': 'Vous avez retiré ~r~$%s~s~ de votre compte.',
    'item_bought': 'Vous avez acheté ~b~%s~s~ pour ~g~$%s~s~.',
    'item_sold': 'Vous avez vendu ~b~%s~s~ pour ~g~$%s~s~.',
    'inventory_full': 'Votre inventaire est plein !',
    'vehicle_locked': 'Véhicule ~r~verrouillé~s~.',
    'vehicle_unlocked': 'Véhicule ~g~déverrouillé~s~.',
    'action_success': 'Action terminée avec succès.',
    'action_failed': 'L\'action a échoué !',
    'police_alert': '~r~[POLICE]~s~ Crime en cours : %s',
    'player_offline': 'Le joueur est hors ligne.',
    'invalid_amount': 'Montant invalide !'
  },
  es: {
    'welcome': '¡Bienvenido al servidor, %s!',
    'press_e': 'Presiona ~INPUT_CONTEXT~ para interactuar',
    'no_money': '¡No tienes suficiente dinero!',
    'bank_deposit': 'Has depositado ~g~$%s~s~ en tu cuenta bancaria.',
    'bank_withdraw': 'Has retirado ~r~$%s~s~ de tu cuenta.',
    'item_bought': 'Has comprado ~b~%s~s~ por ~g~$%s~s~.',
    'item_sold': 'Has vendido ~b~%s~s~ por ~g~$%s~s~.',
    'inventory_full': '¡Tu inventario está lleno!',
    'vehicle_locked': 'Vehículo ~r~bloqueado~s~.',
    'vehicle_unlocked': 'Vehículo ~g~desbloqueado~s~.',
    'action_success': 'Acción completada con éxito.',
    'action_failed': '¡La acción falló!',
    'police_alert': '~r~[POLICÍA]~s~ Crimen en curso: %s',
    'player_offline': 'El jugador está desconectado.',
    'invalid_amount': '¡Cantidad inválida!'
  }
};

export async function translateSingleText(text: string, fromLang: string, toLang: string): Promise<string> {
  if (fromLang === toLang) return text;
  
  const { protectedText, tokens } = protectPlaceholders(text);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        let result = data.responseData.translatedText;
        return restorePlaceholders(result, tokens);
      }
    }
  } catch {}

  return restorePlaceholders(protectedText, tokens);
}

export async function translateEntries(
  entries: Record<string, string>,
  fromLang: SupportedLang,
  toLang: SupportedLang,
  onProgress?: (current: number, total: number) => void
): Promise<Record<string, string>> {
  if (fromLang === toLang) return { ...entries };

  const keys = Object.keys(entries);
  const total = keys.length;
  const translated: Record<string, string> = {};

  const knownDict = COMMON_FIVEM_TRANSLATIONS[toLang] || {};

  for (let i = 0; i < total; i++) {
    const key = keys[i];
    const originalText = entries[key];

    const cleanKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (knownDict[cleanKey]) {
      translated[key] = knownDict[cleanKey];
    } else {
      const res = await translateSingleText(originalText, fromLang, toLang);
      translated[key] = res;
    }

    if (onProgress) {
      onProgress(i + 1, total);
    }
  }

  return translated;
}

export function formatLocalesOutput(
  entries: Record<string, string>,
  targetLang: SupportedLang,
  format: 'lua' | 'json'
): string {
  if (format === 'json') {
    return JSON.stringify(entries, null, 2);
  }

  const lines = [
    `Locales['${targetLang}'] = {`,
  ];

  for (const [key, value] of Object.entries(entries)) {
    const escapedVal = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`  ['${key}'] = '${escapedVal}',`);
  }

  lines.push('}');
  return lines.join('\n');
}
