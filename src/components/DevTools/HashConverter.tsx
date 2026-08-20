import React, { useState, useEffect, useMemo } from 'react';
import { Hash, Copy, Check, Sparkles, RefreshCw, ArrowRightLeft, Table, ShieldCheck, Database, Search } from 'lucide-react';

function jenkinsOneAtATime(key: string): number {
  const lowerKey = key.toLowerCase();
  let hash = 0;
  for (let i = 0; i < lowerKey.length; i++) {
    hash = (hash + lowerKey.charCodeAt(i)) >>> 0;
    hash = (hash + ((hash << 10) >>> 0)) >>> 0;
    hash = (hash ^ (hash >>> 6)) >>> 0;
  }
  hash = (hash + ((hash << 3) >>> 0)) >>> 0;
  hash = (hash ^ (hash >>> 11)) >>> 0;
  hash = (hash + ((hash << 15) >>> 0)) >>> 0;
  return hash >>> 0;
}

function crc32(str: string): string {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    let byte = str.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = (crc ^ byte) & 1;
      crc = (crc >>> 1) ^ (bit ? 0xEDB88320 : 0);
      byte >>>= 1;
    }
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

function md5(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }
  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str: string) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

async function subtleHash(algorithm: string, text: string): Promise<string> {
  if (!window.crypto || !window.crypto.subtle) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const COMMON_GTA_HASHES: Record<string, string> = {
  '0xb779a091': 'adder',
  '0x9c429b6a': 'zentorno',
  '0x43d46bb9': 't20',
  '0x13c7c251': 'nero',
  '0x1f5cf40a': 'nero2',
  '0xb8aa51e7': 'kuruma',
  '0x7b6f79d5': 'kuruma2',
  '0x8797f648': 'sultan',
  '0xb6966606': 'sultanrs',
  '0x1d073a89': 'elegy',
  '0x3d3090cf': 'elegy2',
  '0x7269165b': 'police',
  '0x7d6a5a22': 'police2',
  '0xaa6f4f26': 'police3',
  '0x8a63c76b': 'police4',
  '0x1517d4d9': 'sheriff',
  '0x1d4715f4': 'sheriff2',
  '0x45d56ada': 'ambulance',
  '0x73920f8e': 'firetruk',
  '0x1b06d571': 'WEAPON_PISTOL',
  '0x5ef9aec8': 'WEAPON_COMBATPISTOL',
  '0x22d8fe39': 'WEAPON_APPISTOL',
  '0x99aeeb3b': 'WEAPON_PISTOL50',
  '0x13532244': 'WEAPON_MICROSMG',
  '0x2be67031': 'WEAPON_SMG',
  '0x83bf0278': 'WEAPON_ASSAULTSMG',
  '0xbfe256d4': 'WEAPON_ASSAULTRIFLE',
  '0x83bf0279': 'WEAPON_CARBINERIFLE',
  '0xaf11e161': 'WEAPON_ADVANCEDRIFLE',
  '0x1d073a8a': 'WEAPON_PUMPSHOTGUN',
  '0x787f0bb': 'WEAPON_SNIPERRIFLE',
  '0x5fc3c11': 'WEAPON_HEAVYSNIPER',
  '0x497facc3': 'WEAPON_FLARE',
  '0x24b17070': 'WEAPON_MOLOTOV',
  '0x2c3731d9': 'WEAPON_STICKYBOMB',
  '0xab564b97': 'WEAPON_CROWBAR',
  '0x99b507ea': 'WEAPON_KNIFE',
  '0x678b81b1': 'WEAPON_BAT',
};

export const HashConverter: React.FC = () => {
  const [inputText, setInputText] = useState('adder');
  const [mode, setMode] = useState<'single' | 'batch' | 'reverse'>('single');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hashes, setHashes] = useState<{
    joaatDec: number;
    joaatSigned: number;
    joaatHex: string;
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
    crc32: string;
    base64Encode: string;
    base64Decode: string;
  }>({
    joaatDec: 0,
    joaatSigned: 0,
    joaatHex: '',
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
    crc32: '',
    base64Encode: '',
    base64Decode: ''
  });

  const [reverseInput, setReverseInput] = useState('0xB779A091');
  const [batchInput, setBatchInput] = useState(`adder\nzentorno\nt20\nWEAPON_PISTOL\npolice`);

  useEffect(() => {
    if (!inputText) {
      setHashes({
        joaatDec: 0,
        joaatSigned: 0,
        joaatHex: '0x00000000',
        md5: '',
        sha1: '',
        sha256: '',
        sha512: '',
        crc32: '',
        base64Encode: '',
        base64Decode: ''
      });
      return;
    }

    const joaatUnsigned = jenkinsOneAtATime(inputText);
    const joaatSigned = joaatUnsigned | 0;
    const joaatHex = '0x' + joaatUnsigned.toString(16).toUpperCase().padStart(8, '0');
    const md5Val = md5(inputText);
    const crc32Val = crc32(inputText);

    let b64Enc = '';
    try {
      b64Enc = btoa(unescape(encodeURIComponent(inputText)));
    } catch {}

    let b64Dec = '';
    try {
      b64Dec = decodeURIComponent(escape(atob(inputText)));
    } catch {}

    setHashes(prev => ({
      ...prev,
      joaatDec: joaatUnsigned,
      joaatSigned,
      joaatHex,
      md5: md5Val,
      crc32: crc32Val,
      base64Encode: b64Enc,
      base64Decode: b64Dec
    }));

    (async () => {
      const [s1, s256, s512] = await Promise.all([
        subtleHash('SHA-1', inputText),
        subtleHash('SHA-256', inputText),
        subtleHash('SHA-512', inputText)
      ]);
      setHashes(prev => ({
        ...prev,
        sha1: s1,
        sha256: s256,
        sha512: s512
      }));
    })();
  }, [inputText]);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const reverseLookupResult = useMemo(() => {
    const clean = reverseInput.trim().toLowerCase();
    let hexKey = '';

    if (clean.startsWith('0x')) {
      hexKey = clean;
    } else {
      const num = parseInt(clean, 10);
      if (!isNaN(num)) {
        const u = (num >>> 0).toString(16).padStart(8, '0');
        hexKey = '0x' + u;
      }
    }

    if (hexKey && COMMON_GTA_HASHES[hexKey]) {
      return {
        found: true,
        name: COMMON_GTA_HASHES[hexKey],
        hex: hexKey.toUpperCase(),
        dec: parseInt(hexKey, 16) | 0
      };
    }

    return { found: false, name: '', hex: hexKey, dec: 0 };
  }, [reverseInput]);

  const batchResults = useMemo(() => {
    const lines = batchInput.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => {
      const unsigned = jenkinsOneAtATime(line);
      const signed = unsigned | 0;
      const hex = '0x' + unsigned.toString(16).toUpperCase().padStart(8, '0');
      const md5Hash = md5(line);
      return { text: line, unsigned, signed, hex, md5Hash };
    });
  }, [batchInput]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Hash Generator & Converter</h3>
            <p className="text-xs text-zinc-400">
              Generate FiveM Jenkins (joaat) hashes, MD5, SHA-256, Base64, and reverse lookup GTA V model hashes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
              mode === 'single' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Live Converter
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
              mode === 'batch' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Batch Table
          </button>
          <button
            onClick={() => setMode('reverse')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
              mode === 'reverse' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reverse Lookup
          </button>
        </div>
      </div>

      {mode === 'single' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                Input String / Text
              </label>
              <div className="flex items-center gap-1.5">
                {(['adder', 'zentorno', 'WEAPON_PISTOL', 'prop_barrier_work05', 'MD Development'] as const).map(sample => (
                  <button
                    key={sample}
                    onClick={() => setInputText(sample)}
                    className="px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-[10px] font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Type any vehicle, weapon, prop, or string to hash..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-white/10 text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-950 to-black border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      GTA V / FiveM Jenkins Hash (joaat)
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    GetHashKey
                  </span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-zinc-500 text-[10px] block">Hexadecimal</span>
                      <span className="text-white font-bold text-sm">{hashes.joaatHex}</span>
                    </div>
                    <button
                      onClick={() => handleCopy('joaatHex', hashes.joaatHex)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                      title="Copy Hex"
                    >
                      {copiedKey === 'joaatHex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Signed (Int32)</span>
                        <span className="text-emerald-400 font-semibold">{hashes.joaatSigned}</span>
                      </div>
                      <button
                        onClick={() => handleCopy('joaatSigned', hashes.joaatSigned.toString())}
                        className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        {copiedKey === 'joaatSigned' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Unsigned (UInt32)</span>
                        <span className="text-zinc-200 font-semibold">{hashes.joaatDec}</span>
                      </div>
                      <button
                        onClick={() => handleCopy('joaatDec', hashes.joaatDec.toString())}
                        className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        {copiedKey === 'joaatDec' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                <button
                  onClick={() => handleCopy('joaatSnippet', `\`${inputText}\``)}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedKey === 'joaatSnippet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>FiveM Backtick: ` {inputText} `</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  MD5 Checksum
                </h4>
                <div className="mt-2.5 p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-300 truncate">{hashes.md5 || '—'}</span>
                  <button
                    onClick={() => handleCopy('md5', hashes.md5)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    {copiedKey === 'md5' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>CRC-32:</span>
                <span className="text-white font-bold">{hashes.crc32 || '—'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  SHA-256 Hash
                </h4>
                <div className="mt-2.5 p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-zinc-300 truncate">{hashes.sha256 || 'Calculating...'}</span>
                  <button
                    onClick={() => handleCopy('sha256', hashes.sha256)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                  >
                    {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>SHA-1:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{hashes.sha1 || '—'}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between gap-3">
              <div>
                <h4 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Base64 Encode & Decode
                </h4>
                <div className="mt-2.5 space-y-2">
                  <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-zinc-300 truncate">{hashes.base64Encode || '—'}</span>
                    <button
                      onClick={() => handleCopy('b64Enc', hashes.base64Encode)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                    >
                      {copiedKey === 'b64Enc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>URL Encoded:</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{encodeURIComponent(inputText)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'batch' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-2">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Enter Multiple Strings (One per line)
            </label>
            <textarea
              value={batchInput}
              onChange={e => setBatchInput(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30 resize-none"
            />
          </div>

          <div className="rounded-2xl bg-zinc-950/90 border border-white/10 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/80 border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="p-3.5">String</th>
                  <th className="p-3.5">Jenkins Hex</th>
                  <th className="p-3.5">Signed (Int32)</th>
                  <th className="p-3.5">Unsigned</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {batchResults.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-bold text-white">{r.text}</td>
                    <td className="p-3.5 text-emerald-400">{r.hex}</td>
                    <td className="p-3.5 text-zinc-300">{r.signed}</td>
                    <td className="p-3.5 text-zinc-400">{r.unsigned}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleCopy(`batch-${i}`, r.hex)}
                        className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                        title="Copy Hex"
                      >
                        {copiedKey === `batch-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mode === 'reverse' && (
        <div className="p-6 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
          <div>
            <h4 className="font-display font-bold text-sm text-white">Reverse GTA V Model Hash Lookup</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Paste a Hex (`0xB779A091`) or Decimal hash integer to find the original GTA V vehicle, weapon, or prop name.
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={reverseInput}
              onChange={e => setReverseInput(e.target.value)}
              placeholder="Enter hash (e.g. 0xB779A091, 0x1B06D571, -1041692462)..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="p-4 rounded-xl bg-black/60 border border-white/5">
            {reverseLookupResult.found ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Model / Hash Match</span>
                  <span className="text-base font-mono font-extrabold text-emerald-400">{reverseLookupResult.name}</span>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="text-zinc-400 block">{reverseLookupResult.hex}</span>
                  <span className="text-zinc-500">{reverseLookupResult.dec}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-zinc-500 py-2">
                {reverseInput.trim() ? 'No known GTA V model found for this hash in the local database.' : 'Enter a hash above to search.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
