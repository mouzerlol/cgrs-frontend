'use client';

import Link from 'next/link';
import { MoreHorizontal, Link as LinkIcon, Trash2, Pencil } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useState, useRef, useEffect } from 'react';
import { Portfolio } from '@/types/portfolio';
import { BoardColor } from '@/types/work-management';
import { cn } from '@/lib/utils';

const colorStyles: Record<BoardColor, { bg: string; border: string; hover: string; badge: string }> = {
  sage: {
    bg: 'bg-sage-light',
    border: 'border-sage/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(168,181,160,0.3)] hover:-translate-y-1',
    badge: 'bg-forest/10 text-forest',
  },
  terracotta: {
    bg: 'bg-[#FBEBE6]',
    border: 'border-terracotta/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(217,93,57,0.2)] hover:-translate-y-1',
    badge: 'bg-terracotta/10 text-terracotta-dark',
  },
  forest: {
    bg: 'bg-forest-light/20',
    border: 'border-forest/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(26,34,24,0.2)] hover:-translate-y-1',
    badge: 'bg-forest/10 text-forest',
  },
  amber: {
    bg: 'bg-amber/10',
    border: 'border-amber/30',
    hover: 'hover:shadow-[0_20px_40px_rgba(212,160,90,0.2)] hover:-translate-y-1',
    badge: 'bg-amber/20 text-amber-dark',
  },
};

const lucideIconMap: Record<string, string> = {
  wallet: 'lucide:wallet',
  wrench: 'lucide:wrench',
  trees: 'lucide:trees',
  shield: 'lucide:shield',
  'party-popper': 'lucide:party-popper',
  megaphone: 'lucide:megaphone',
  settings: 'lucide:settings',
};

interface PortfolioCardProps {
  portfolio: Portfolio;
  onDelete?: (id: string) => void;
}

export default function PortfolioCard({ portfolio, onDelete }: PortfolioCardProps) {
  const styles = colorStyles[portfolio.color];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const iconName = lucideIconMap[portfolio.icon] || 'lucide:folder';

  return (
    <div className="relative group">
      <Link href={`/work-management/portfolios/${portfolio.id}`}>
        <div
          className={cn(
            'relative rounded-[20px] p-6 border transition-all duration-400 cursor-pointer',
            styles.bg,
            styles.border,
            styles.hover,
            'hover:border-sage'
          )}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center', styles.badge)}>
              <Icon icon={iconName} className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              {portfolio.linkedBoardIds.length > 0 && (
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1', styles.badge)}>
                  <LinkIcon className="w-3 h-3" />
                  {portfolio.linkedBoardIds.length}
                </span>
              )}
            </div>
          </div>

          <h3 className="font-display text-xl font-semibold text-forest mb-1.5 group-hover:text-terracotta transition-colors">
            {portfolio.name}
          </h3>

          <p className="text-forest/70 text-sm mb-4 line-clamp-2 leading-relaxed">
            {portfolio.description}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-forest/10 flex items-center justify-center text-xs font-semibold text-forest overflow-hidden">
                {portfolio.lead.avatar ? (
                  <img src={portfolio.lead.avatar} alt={portfolio.lead.name} className="w-full h-full object-cover" />
                ) : (
                  portfolio.lead.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <span className="text-xs text-forest/60">
                {portfolio.lead.name}
              </span>
            </div>
            {portfolio.coLead && (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-forest/10 flex items-center justify-center text-[10px] font-semibold text-forest overflow-hidden">
                  {portfolio.coLead.avatar ? (
                    <img src={portfolio.coLead.avatar} alt={portfolio.coLead.name} className="w-full h-full object-cover" />
                  ) : (
                    portfolio.coLead.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action menu button - sits outside the link */}
      <div className="absolute top-4 right-4 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-forest/40 hover:text-forest hover:bg-white/60 transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-sage/20 py-1.5 min-w-[140px] z-20">
            <Link
              href={`/work-management/portfolios/${portfolio.id}`}
              className="flex items-center gap-2 px-3 py-2 text-sm text-forest hover:bg-sage-light/50 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(portfolio.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
