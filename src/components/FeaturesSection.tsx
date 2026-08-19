import React from 'react';
import { Cpu, DownloadCloud, Layers, Headphones, FileCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-white" />,
      title: "0.00ms Idle Resmon",
      description: "Every single resource is heavily benchmarked and profiled. Zero unnecessary client threads, zero memory leaks, and buttery smooth 60+ FPS under heavy server loads."
    },
    {
      icon: <DownloadCloud className="w-6 h-6 text-white" />,
      title: "CFX Keymaster Instant Delivery",
      description: "Automatic and immediate asset granting through official Cfx.re Keymaster. Download your script and license within seconds after Tebex checkout."
    },
    {
      icon: <Layers className="w-6 h-6 text-white" />,
      title: "ESX & QBCore Native Support",
      description: "Engineered with modern multi-framework bridges. Compatible with ESX Legacy and QBCore (QB) environments out of the box."
    },
    {
      icon: <Headphones className="w-6 h-6 text-white" />,
      title: "24/7 Dedicated Discord Support",
      description: "Get direct developer help with setup, custom SQL migrations, bridge adjustments, and bug fixes straight in our active Discord community."
    },
    {
      icon: <FileCode className="w-6 h-6 text-white" />,
      title: "Clean & Documented Configs",
      description: "Extensive configuration files with clean Lua comments, editable NUI frontend code, and plug & play installation guides."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: "Verified Tebex Merchant",
      description: "100% secure payments handled via Tebex with official Rockstar Games & Cfx.re compliance. Supports Cards, PayPal, Paysafecard, and iDeal."
    }
  ];

  return (
    <section id="features-section" className="py-20 border-t border-white/10 relative overflow-hidden">

      <div className="ambient-glow -top-40 right-1/4 bg-white/5 opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400 mb-3 uppercase tracking-wider">
            <span>Enterprise Quality</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            WHY SERVERS CHOOSE <br />
            <span className="text-zinc-400">MD DEVELOPMENT</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            We build scripts that elevate player immersion without compromising server performance or stability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-zinc-900/40 border border-white/10 hover:border-white/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glass flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center mb-4 shadow-glow-sm">
                  {feat.icon}
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Production Ready</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
