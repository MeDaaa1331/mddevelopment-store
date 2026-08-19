import React, { useState } from 'react';
import { ChevronDown, MessageSquare } from 'lucide-react';
import { FAQ_ITEMS } from '../services/sampleData';
import { useDiscordStats } from '../hooks/useDiscordStats';

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const DISCORD_LINK = 'https://discord.gg/Ze4m2Uyxjw';
  const discordStats = useDiscordStats();

  const toggleFAQ = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section id="faq-section" className="py-20 border-t border-white/10 relative overflow-hidden">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400 mb-3 uppercase tracking-wider">
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            EVERYTHING YOU NEED TO KNOW
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Got questions about licenses, installation, or support? We've got you covered.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl bg-zinc-900/40 border border-white/10 overflow-hidden transition-all duration-200 hover:border-white/20"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 text-white hover:text-zinc-200 transition-colors duration-200"
                >
                  <span className="font-display font-semibold text-sm sm:text-base">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 pt-3 animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-6 rounded-2xl bg-zinc-900/60 border border-white/10 text-center flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:border-white/20">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm text-white">Still have a question?</h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {discordStats.onlineMembers} Online
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Our support is available on Discord • Join <span className="text-zinc-200 font-semibold font-mono">{discordStats.totalMembers}</span> community members
            </p>
          </div>
          <a
            href={DISCORD_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all duration-200 flex items-center gap-2 shrink-0 shadow-glow-sm hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-black" />
            <span>Join Discord Support</span>
          </a>
        </div>

      </div>
    </section>
  );
};
