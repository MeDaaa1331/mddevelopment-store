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
  const lines = input.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('--') || trimmedLine.startsWith('//')) {
      continue;
    }

    const luaMatch = trimmedLine.match(/^(?:\[['"]([^'"]+)['"]\]|(\b[\w-]+\b))\s*=\s*['"]((?:\\.|[^'"])*)['"]/);
    if (luaMatch) {
      const key = luaMatch[1] || luaMatch[2];
      const value = luaMatch[3];
      if (key && value !== undefined) {
        entries[key] = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
        continue;
      }
    }

    const eqIdx = trimmedLine.indexOf('=');
    if (eqIdx > 0) {
      const rawK = trimmedLine.substring(0, eqIdx).trim();
      const rawV = trimmedLine.substring(eqIdx + 1).trim();
      const cleanK = rawK.replace(/^['"[\s]+|['"\]\s]+$/g, '');
      const cleanV = rawV.replace(/^['"\s]+|['",;\s]+$/g, '');
      if (cleanK && cleanV) {
        entries[cleanK] = cleanV;
      }
    }
  }

  if (Object.keys(entries).length > 0) {
    return { format: 'lua', entries };
  }

  const luaRegex = /(?:\[['"]([^'"]+)['"]\]|(\b\w+\b))\s*=\s*['"]((?:\\.|[^'"])*)['"]/g;
  let match;
  while ((match = luaRegex.exec(input)) !== null) {
    const key = match[1] || match[2];
    const value = match[3];
    if (key && value !== undefined) {
      entries[key] = value.replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
  }

  return { format: 'lua', entries };
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
        const chunkValues = chunkKeys.map(k => entries[k]);
        const translatedValues = await translateBatchWithGoogle(chunkValues, fromLang, toLang);

        chunkKeys.forEach((key, idx) => {
          translated[key] = translatedValues[idx] || entries[key];
        });

        completedCount += chunkKeys.length;
        if (onProgress) {
          onProgress(Math.min(completedCount, total), total);
        }
      })
    );
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
    lines.push(`    ['${key}'] = '${escapedVal}',`);
  }

  lines.push('}');
  return lines.join('\n');
}
