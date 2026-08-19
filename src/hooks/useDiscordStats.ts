import { useState, useEffect } from 'react';
import { TEBEX_CONFIG } from '../config/tebex';

interface DiscordStats {
  totalMembers: number;
  onlineMembers: number;
  serverName: string;
  iconUrl: string | null;
  isLoading: boolean;
}

export function useDiscordStats(): DiscordStats {
  const [stats, setStats] = useState<DiscordStats>({
    totalMembers: 213,
    onlineMembers: 54,
    serverName: 'MD Development',
    iconUrl: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const discordUrl = TEBEX_CONFIG.discordUrl || 'https://discord.gg/Ze4m2Uyxjw';
    const inviteCode = discordUrl.split('/').pop()?.trim() || 'Ze4m2Uyxjw';

    const fetchDiscordStats = async () => {
      try {
        const res = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const guild = data.guild || {};
            const iconUrl = guild.id && guild.icon
              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
              : null;

            setStats({
              totalMembers: Number(data.approximate_member_count) || 213,
              onlineMembers: Number(data.approximate_presence_count) || 54,
              serverName: guild.name || 'MD Development',
              iconUrl,
              isLoading: false,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setStats(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    fetchDiscordStats();

    const interval = setInterval(fetchDiscordStats, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return stats;
}
