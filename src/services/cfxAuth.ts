
export interface CfxForumUser {
  username: string;
  name?: string;
  avatarUrl: string;
  trustLevel?: number;
  cfxId: string;
  isVerified: boolean;
  loggedAt: string;
}

const CFX_STORAGE_KEY = 'md_cfx_forum_user_v2';
const PRIVATE_KEY_STORAGE = 'md_cfx_rsa_private_jwk';

export class CfxAuthService {

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64.replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public static async generateRsaPublicKeyPem(): Promise<string> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
    sessionStorage.setItem(PRIVATE_KEY_STORAGE, JSON.stringify(privateJwk));

    const spkiBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const base64Spki = this.arrayBufferToBase64(spkiBuffer);

    const formattedBase64 = base64Spki.match(/.{1,64}/g)?.join('\n') || base64Spki;
    return `-----BEGIN PUBLIC KEY-----\n${formattedBase64}\n-----END PUBLIC KEY-----`;
  }

  public static async getCfxForumLoginUrl(returnUrl?: string): Promise<string> {
    const callbackUrl = returnUrl || (window.location.origin + window.location.pathname);
    const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const clientId = `md_store_${Math.random().toString(36).substring(2, 10)}`;

    sessionStorage.setItem('md_cfx_auth_nonce', nonce);
    sessionStorage.setItem('md_cfx_auth_client_id', clientId);

    const publicKeyPem = await this.generateRsaPublicKeyPem();

    const forumAuthBase = 'https://forum.cfx.re/user-api-key/new';
    const params = new URLSearchParams({
      application_name: 'MD Development Store',
      client_id: clientId,
      scopes: 'session_info',
      nonce: nonce,
      auth_redirect: callbackUrl,
      public_key: publicKeyPem
    });

    return `${forumAuthBase}?${params.toString()}`;
  }

  public static async decryptAuthPayload(payloadBase64: string): Promise<{ key?: string; nonce?: string } | null> {
    try {
      const privateJwkJson = sessionStorage.getItem(PRIVATE_KEY_STORAGE);
      if (!privateJwkJson) return null;

      const privateJwk = JSON.parse(privateJwkJson);
      const privateKey = await window.crypto.subtle.importKey(
        'jwk',
        privateJwk,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        false,
        ['decrypt']
      );

      const encryptedBuffer = this.base64ToArrayBuffer(payloadBase64);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer
      );

      const decText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decText);
    } catch (err) {
      console.warn('[CfxAuth] Could not decrypt payload with WebCrypto:', err);
      return null;
    }
  }

  public static async fetchForumProfile(username: string): Promise<CfxForumUser> {
    const cleanUsername = username.trim().replace(/^@/, '');

    let avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanUsername)}&backgroundColor=050507`;
    let trustLevel = 1;

    try {
      const res = await fetch(`https://forum.cfx.re/u/${encodeURIComponent(cleanUsername)}.json`, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const userObj = data.user;
        if (userObj) {
          if (userObj.avatar_template) {
            avatarUrl = `https://forum.cfx.re${userObj.avatar_template.replace('{size}', '120')}`;
          }
          trustLevel = userObj.trust_level ?? 1;
        }
      }
    } catch (e) {
      console.warn('[CfxAuth] Could not fetch public forum avatar, using generated badge:', e);
    }

    return {
      username: cleanUsername,
      cfxId: `cfx_${cleanUsername.toLowerCase()}`,
      avatarUrl: avatarUrl,
      trustLevel: trustLevel,
      isVerified: true,
      loggedAt: new Date().toISOString()
    };
  }

  public static saveUser(user: CfxForumUser): void {
    localStorage.setItem(CFX_STORAGE_KEY, JSON.stringify(user));
  }

  public static getSavedUser(): CfxForumUser | null {
    try {
      const saved = localStorage.getItem(CFX_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public static clearUser(): void {
    localStorage.removeItem(CFX_STORAGE_KEY);
    sessionStorage.removeItem(PRIVATE_KEY_STORAGE);
  }
}
