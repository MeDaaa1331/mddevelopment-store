import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Sparkles,
  Flame,
  Bell,
  Tag,
  Gift,
  AlertTriangle,
  Shield,
  ArrowRight,
  X
} from 'lucide-react';
import { SiteAnnouncement } from '../types';

const ICON_MAP = {
  megaphone: Megaphone,
  sparkles: Sparkles,
  flame: Flame,
  bell: Bell,
  tag: Tag,
  gift: Gift,
  alert: AlertTriangle,
  shield: Shield
};

const COLOR_THEMES = {
  emerald: {
    bg: 'bg-emerald-950/30 hover:bg-emerald-950/40',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    iconColor: 'text-emerald-400',
    btnBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    accentLine: 'from-emerald-500/60 via-emerald-400 to-emerald-500/60'
  },
  purple: {
    bg: 'bg-purple-950/30 hover:bg-purple-950/40',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.15)]',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    iconColor: 'text-purple-400',
    btnBg: 'bg-purple-500 hover:bg-purple-400 text-white',
    accentLine: 'from-purple-500/60 via-purple-400 to-purple-500/60'
  },
  amber: {
    bg: 'bg-amber-950/30 hover:bg-amber-950/40',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    iconColor: 'text-amber-400',
    btnBg: 'bg-amber-500 hover:bg-amber-400 text-black',
    accentLine: 'from-amber-500/60 via-amber-400 to-amber-500/60'
  },
  cyan: {
    bg: 'bg-cyan-950/30 hover:bg-cyan-950/40',
    border: 'border-cyan-500/30 hover:border-cyan-500/50',
    glow: 'shadow-[0_0_25px_rgba(6,182,212,0.15)]',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    iconColor: 'text-cyan-400',
    btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-black',
    accentLine: 'from-cyan-500/60 via-cyan-400 to-cyan-500/60'
  },
  rose: {
    bg: 'bg-rose-950/30 hover:bg-rose-950/40',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    iconColor: 'text-rose-400',
    btnBg: 'bg-rose-500 hover:bg-rose-400 text-white',
    accentLine: 'from-rose-500/60 via-rose-400 to-rose-500/60'
  },
  blue: {
    bg: 'bg-blue-950/30 hover:bg-blue-950/40',
    border: 'border-blue-500/30 hover:border-blue-500/50',
    glow: 'shadow-[0_0_25px_rgba(59,130,246,0.15)]',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    iconColor: 'text-blue-400',
    btnBg: 'bg-blue-500 hover:bg-blue-400 text-white',
    accentLine: 'from-blue-500/60 via-blue-400 to-blue-500/60'
  },
  zinc: {
    bg: 'bg-zinc-900/40 hover:bg-zinc-900/60',
    border: 'border-white/15 hover:border-white/25',
    glow: 'shadow-[0_0_25px_rgba(255,255,255,0.05)]',
    badgeBg: 'bg-white/10 text-zinc-200 border-white/20',
    iconColor: 'text-zinc-300',
    btnBg: 'bg-white hover:bg-zinc-200 text-black',
    accentLine: 'from-zinc-500/40 via-white/50 to-zinc-500/40'
  }
};

function formatAnnouncementHtml(raw: string): string {
  if (!raw) return '';
  let formatted = raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px] text-emerald-300">$1</code>');

  return formatted;
}

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/stats?type=announcement');
      if (res.ok) {
        const data = await res.json();
        if (data?.announcement && data.announcement.enabled && data.announcement.text) {
          setAnnouncement(data.announcement);
          try {
            const dismissedId = localStorage.getItem('md_dismissed_announcement_id');
            if (dismissedId === data.announcement.id && data.announcement.closable) {
              setIsDismissed(true);
            } else {
              setIsDismissed(false);
            }
          } catch {}
          return;
        }
      }
    } catch {}
    setAnnouncement(null);
  };

  useEffect(() => {
    fetchAnnouncement();

    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setAnnouncement(e.detail);
        setIsDismissed(false);
      } else {
        fetchAnnouncement();
      }
    };

    window.addEventListener('md_announcement_updated', handleUpdate);
    return () => {
      window.removeEventListener('md_announcement_updated', handleUpdate);
    };
  }, []);

  if (!announcement || !announcement.enabled || !announcement.text || isDismissed) {
    return null;
  }

  const themeKey = (announcement.color || 'emerald') as keyof typeof COLOR_THEMES;
  const theme = COLOR_THEMES[themeKey] || COLOR_THEMES.emerald;

  const iconKey = (announcement.icon || 'megaphone') as keyof typeof ICON_MAP;
  const IconComponent = ICON_MAP[iconKey] || Megaphone;

  const fontClass = announcement.font === 'display'
    ? 'font-display font-bold'
    : announcement.font === 'mono'
    ? 'font-mono'
    : announcement.font === 'serif'
    ? 'font-serif'
    : 'font-sans';

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('md_dismissed_announcement_id', announcement.id);
    } catch {}
  };

  const handleActionClick = (e: React.MouseEvent) => {
    if (!announcement.linkUrl) return;
    if (announcement.linkUrl.startsWith('#')) {
      e.preventDefault();
      const el = document.querySelector(announcement.linkUrl);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="w-full mb-8 transition-all duration-300 animate-in fade-in slide-in-from-top-3">
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${theme.bg} ${theme.border} ${theme.glow}`}>
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${theme.accentLine}`} />

        <div className="px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner ${theme.iconColor}`}>
              <IconComponent className="w-4 h-4 animate-bounce" style={{ animationDuration: '2.5s' }} />
            </div>

            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
              {announcement.badge && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border shrink-0 ${theme.badgeBg}`}>
                  {announcement.badge}
                </span>
              )}

              <div
                className={`text-xs sm:text-sm text-zinc-100 leading-relaxed ${fontClass}`}
                dangerouslySetInnerHTML={{ __html: formatAnnouncementHtml(announcement.text) }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {announcement.linkUrl && (
              <a
                href={announcement.linkUrl}
                onClick={handleActionClick}
                target={announcement.linkUrl.startsWith('#') ? '_self' : '_blank'}
                rel={announcement.linkUrl.startsWith('#') ? undefined : 'noopener noreferrer'}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${theme.btnBg}`}
              >
                <span>{announcement.linkText || 'View More'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}

            {announcement.closable && (
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Dismiss"
                aria-label="Dismiss announcement"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
