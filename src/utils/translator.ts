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

const FIVE_M_COLOR_CODES = ['~r~', '~g~', '~b~', '~y~', '~p~', '~o~', '~c~', '~m~', '~u~', '~w~', '~s~', '~h~', '~n~', '~INPUT_CONTEXT~', '~INPUT_ENTER~', '~INPUT_DETONATE~'];

interface NestedJsonItem {
  path: (string | number)[];
  value: string;
}

export interface ParsedLocalesData {
  format: 'lua' | 'json';
  isNestedJson: boolean;
  jsonData?: any;
  jsonItems?: NestedJsonItem[];
  entries: Record<string, string>;
}

function extractStringsFromJson(obj: any): NestedJsonItem[] {
  const results: NestedJsonItem[] = [];
  function walk(current: any, currentPath: (string | number)[]) {
    if (typeof current === 'string') {
      results.push({ path: currentPath, value: current });
    } else if (Array.isArray(current)) {
      current.forEach((item, idx) => walk(item, [...currentPath, idx]));
    } else if (typeof current === 'object' && current !== null) {
      for (const [key, val] of Object.entries(current)) {
        walk(val, [...currentPath, key]);
      }
    }
  }
  walk(obj, []);
  return results;
}

function setNestedValue(obj: any, path: (string | number)[], value: string) {
  let curr = obj;
  for (let i = 0; i < path.length - 1; i++) {
    curr = curr[path[i]];
  }
  curr[path[path.length - 1]] = value;
}

function cleanJsonString(input: string): string {
  return input
    .replace(/,\s*([\]}])/g, '$1')
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
}

export function parseLocalesInput(input: string): ParsedLocalesData {
  const trimmed = input.trim();

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      const clean = cleanJsonString(trimmed);
      const parsed = JSON.parse(clean);
      if (typeof parsed === 'object' && parsed !== null) {
        const jsonItems = extractStringsFromJson(parsed);
        if (jsonItems.length > 0) {
          const flatEntries: Record<string, string> = {};
          jsonItems.forEach(item => {
            const keyPath = item.path.join('.');
            flatEntries[keyPath] = item.value;
          });
          return {
            format: 'json',
            isNestedJson: true,
            jsonData: parsed,
            jsonItems,
            entries: flatEntries
          };
        }
      }
    } catch {}
  }

  const entries: Record<string, string> = {};
  const lines = input.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('//')) {
      continue;
    }

    const luaMatch = trimmedLine.match(/^(?:\[['"]([^'"]+)['"]\]|(\b[\w-]+\b)|"([^"]+)"|'([^']+)')\s*(?:=|:)\s*(['"])((?:\\.|(?!\5).)*)\5/);
    if (luaMatch) {
      const key = luaMatch[1] || luaMatch[2] || luaMatch[3] || luaMatch[4];
      const value = luaMatch[6];
      if (key && value !== undefined) {
        entries[key] = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
        continue;
      }
    }

    const eqIdx = trimmedLine.indexOf('=');
    const colonIdx = trimmedLine.indexOf(':');
    const splitIdx = eqIdx !== -1 ? eqIdx : colonIdx;

    if (splitIdx > 0) {
      const rawK = trimmedLine.substring(0, splitIdx).trim();
      const rawV = trimmedLine.substring(splitIdx + 1).trim();
      const cleanK = rawK.replace(/^['"[\s]+|['"\]\s]+$/g, '');
      const cleanV = rawV.replace(/^['"\s]+|['",;\s]+$/g, '');
      if (cleanK && cleanV && !cleanV.startsWith('{') && !cleanV.startsWith('[')) {
        entries[cleanK] = cleanV;
      }
    }
  }

  if (Object.keys(entries).length > 0) {
    return { format: 'lua', isNestedJson: false, entries };
  }

  const regex = /(?:(\[?['"]?[\w-]+['"]?\]?)\s*(?:=|:)\s*)(['"])((?:\\.|(?!\2).)*)\2/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const rawKey = match[1];
    const value = match[3];
    if (rawKey && value !== undefined) {
      const cleanKey = rawKey.replace(/^['"[\s]+|['"\]\s]+$/g, '');
      entries[cleanKey] = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
  }

  return { format: 'lua', isNestedJson: false, entries };
}

function protectPlaceholders(text: string, tokenStore: string[]): string {
  let protectedText = text;

  for (const color of FIVE_M_COLOR_CODES) {
    while (protectedText.includes(color)) {
      const placeholder = `__C${tokenStore.length}__`;
      tokenStore.push(color);
      protectedText = protectedText.replace(color, placeholder);
    }
  }

  const varRegex = /(%s|%d|%f|%\.\d+f|%\{\w+\}|\{\d+\}|\{[a-zA-Z_]+\}|\$\{\w+\})/g;
  protectedText = protectedText.replace(varRegex, (match) => {
    const placeholder = `__V${tokenStore.length}__`;
    tokenStore.push(match);
    return placeholder;
  });

  return protectedText;
}

function restorePlaceholders(text: string, tokenStore: string[]): string {
  let restored = text;
  tokenStore.forEach((token, index) => {
    const cPat = new RegExp(`__C${index}__`, 'gi');
    const vPat = new RegExp(`__V${index}__`, 'gi');
    restored = restored.replace(cPat, token).replace(vPat, token);
  });
  return restored;
}

async function translateBatchWithGoogle(
  items: string[],
  fromLang: string,
  toLang: string
): Promise<string[]> {
  if (items.length === 0) return [];
  if (fromLang === toLang) return items;

  const tokenStore: string[] = [];
  const protectedItems = items.map(txt => protectPlaceholders(txt, tokenStore));
  const delimiter = "\n===MD_SPLIT===\n";
  const joinedText = protectedItems.join(delimiter);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(joinedText)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const rawTranslated = data[0].map((item: any) => item[0] || '').join('');
        const restored = restorePlaceholders(rawTranslated, tokenStore);
        const splitResults = restored.split(/\s*===MD_SPLIT===\s*/);
        if (splitResults.length === items.length) {
          return splitResults;
        }
      }
    }
  } catch {}

  const fallbackResults: string[] = [];
  for (const item of items) {
    const translated = await translateSingleFallback(item, fromLang, toLang);
    fallbackResults.push(translated);
  }
  return fallbackResults;
}

async function translateSingleFallback(text: string, fromLang: string, toLang: string): Promise<string> {
  const tokenStore: string[] = [];
  const protectedText = protectPlaceholders(text, tokenStore);

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText)}&langpair=${fromLang}|${toLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return restorePlaceholders(data.responseData.translatedText, tokenStore);
      }
    }
  } catch {}

  return text;
}

export async function translateParsedLocales(
  parsedData: ParsedLocalesData,
  fromLang: SupportedLang,
  toLang: SupportedLang,
  onProgress?: (current: number, total: number) => void
): Promise<{ translatedData: any; isNestedJson: boolean; entries: Record<string, string> }> {
  if (parsedData.isNestedJson && parsedData.jsonData && parsedData.jsonItems) {
    const total = parsedData.jsonItems.length;
    const clonedJson = JSON.parse(JSON.stringify(parsedData.jsonData));
    const translatedEntries: Record<string, string> = {};

    if (fromLang === toLang) {
      parsedData.jsonItems.forEach(item => {
        translatedEntries[item.path.join('.')] = item.value;
      });
      return { translatedData: clonedJson, isNestedJson: true, entries: translatedEntries };
    }

    const CHUNK_SIZE = 35;
    const itemChunks: NestedJsonItem[][] = [];
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      itemChunks.push(parsedData.jsonItems.slice(i, i + CHUNK_SIZE));
    }

    let completedCount = 0;
    const CONCURRENCY_LIMIT = 4;

    for (let i = 0; i < itemChunks.length; i += CONCURRENCY_LIMIT) {
      const activeChunks = itemChunks.slice(i, i + CONCURRENCY_LIMIT);

      await Promise.all(
        activeChunks.map(async chunk => {
          const valuesToTranslate = chunk.map(it => it.value);
          const translatedValues = await translateBatchWithGoogle(valuesToTranslate, fromLang, toLang);

          chunk.forEach((item, idx) => {
            const newVal = translatedValues[idx] || item.value;
            setNestedValue(clonedJson, item.path, newVal);
            translatedEntries[item.path.join('.')] = newVal;
          });

          completedCount += chunk.length;
          if (onProgress) {
            onProgress(Math.min(completedCount, total), total);
          }
        })
      );
    }

    return { translatedData: clonedJson, isNestedJson: true, entries: translatedEntries };
  }

  const keys = Object.keys(parsedData.entries);
  const total = keys.length;
  const translatedEntries: Record<string, string> = {};

  if (fromLang === toLang) {
    return { translatedData: parsedData.entries, isNestedJson: false, entries: parsedData.entries };
  }

  const CHUNK_SIZE = 35;
  const chunks: string[][] = [];
  for (let i = 0; i < total; i += CHUNK_SIZE) {
    chunks.push(keys.slice(i, i + CHUNK_SIZE));
  }

  let completedCount = 0;
  const CONCURRENCY_LIMIT = 4;

  for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
    const activeChunks = chunks.slice(i, i + CONCURRENCY_LIMIT);

    await Promise.all(
      activeChunks.map(async chunkKeys => {
        const chunkValues = chunkKeys.map(k => parsedData.entries[k]);
        const translatedValues = await translateBatchWithGoogle(chunkValues, fromLang, toLang);

        chunkKeys.forEach((key, idx) => {
          translatedEntries[key] = translatedValues[idx] || parsedData.entries[key];
        });

        completedCount += chunkKeys.length;
        if (onProgress) {
          onProgress(Math.min(completedCount, total), total);
        }
      })
    );
  }

  return { translatedData: translatedEntries, isNestedJson: false, entries: translatedEntries };
}

export function formatLocalesOutput(
  translatedResult: { translatedData: any; isNestedJson: boolean; entries: Record<string, string> },
  targetLang: SupportedLang,
  format: 'lua' | 'json'
): string {
  if (format === 'json') {
    if (translatedResult.isNestedJson && translatedResult.translatedData) {
      return JSON.stringify(translatedResult.translatedData, null, 2);
    }
    return JSON.stringify(translatedResult.entries, null, 2);
  }

  if (translatedResult.isNestedJson && translatedResult.translatedData) {
    const formatLuaTable = (obj: any, indent = 1): string => {
      const pad = '    '.repeat(indent);
      const closePad = '    '.repeat(indent - 1);
      const lines: string[] = [];

      for (const [k, v] of Object.entries(obj)) {
        const keyRepr = /^[a-zA-Z_]\w*$/.test(k) ? `['${k}']` : `['${k}']`;
        if (typeof v === 'string') {
          const escaped = v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
          lines.push(`${pad}${keyRepr} = '${escaped}',`);
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          lines.push(`${pad}${keyRepr} = {`);
          lines.push(formatLuaTable(v, indent + 1));
          lines.push(`${pad}},`);
        }
      }
      return lines.join('\n');
    };

    return `Locales['${targetLang}'] = {\n${formatLuaTable(translatedResult.translatedData, 1)}\n}`;
  }

  const lines = [
    `Locales['${targetLang}'] = {`,
  ];

  for (const [key, value] of Object.entries(translatedResult.entries)) {
    const escapedVal = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    lines.push(`    ['${key}'] = '${escapedVal}',`);
  }

  lines.push('}');
  return lines.join('\n');
}
