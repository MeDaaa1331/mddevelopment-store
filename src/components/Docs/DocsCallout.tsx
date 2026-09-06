import React from 'react';
import { Info, AlertTriangle, Lightbulb, AlertOctagon, Layers } from 'lucide-react';
import { FormattedText } from './FormattedText';

interface DocsCalloutProps {
  type?: 'tip' | 'warning' | 'info' | 'danger' | 'ox';
  title?: string;
  message: string;
}

export const DocsCallout: React.FC<DocsCalloutProps> = ({ type = 'info', title, message }) => {
  const configs = {
    info: {
      bg: 'bg-cyan-950/20 border-cyan-500/30 text-cyan-200',
      iconColor: 'text-cyan-400',
      defaultTitle: 'NOTE',
      icon: Info,
    },
    tip: {
      bg: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200',
      iconColor: 'text-emerald-400',
      defaultTitle: 'PRO TIP',
      icon: Lightbulb,
    },
    warning: {
      bg: 'bg-amber-950/20 border-amber-500/30 text-amber-200',
      iconColor: 'text-amber-400',
      defaultTitle: 'WARNING',
      icon: AlertTriangle,
    },
    danger: {
      bg: 'bg-rose-950/20 border-rose-500/30 text-rose-200',
      iconColor: 'text-rose-400',
      defaultTitle: 'IMPORTANT',
      icon: AlertOctagon,
    },
    ox: {
      bg: 'bg-purple-950/20 border-purple-500/30 text-purple-200',
      iconColor: 'text-purple-400',
      defaultTitle: 'OX_LIB DEPENDENCY',
      icon: Layers,
    },
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div className={`my-4 p-4 rounded-xl border ${config.bg} backdrop-blur-sm flex items-start gap-3 shadow-lg`}>
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-xs leading-relaxed">
        <h5 className={`font-mono font-bold text-xs uppercase tracking-wider mb-1 ${config.iconColor}`}>
          {title || config.defaultTitle}
        </h5>
        <div className="text-zinc-300 font-sans">
          <FormattedText text={message} />
        </div>
      </div>
    </div>
  );
};
