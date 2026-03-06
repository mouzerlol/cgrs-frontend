'use client';

import SectionWrapper from './SectionWrapper';

interface BudgetSectionProps {
  content: { allocated?: number; spent?: number };
  isEditingLayout: boolean;
}

export default function BudgetSection({ content, isEditingLayout }: BudgetSectionProps) {
  const { allocated = 0, spent = 0 } = content;
  const percentage = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
  const isOverBudget = percentage > 100;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <SectionWrapper title="Budget" isEditingLayout={isEditingLayout}>
      <div className="space-y-3">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-2xl font-display font-semibold text-forest">
              {formatCurrency(allocated)}
            </span>
          </div>
          <p className="text-xs text-forest/50">Allocated budget</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-forest/60">
              {formatCurrency(spent)} spent
            </span>
            <span className={`text-xs font-medium ${isOverBudget ? 'text-red-500' : 'text-forest/70'}`}>
              {percentage}%
            </span>
          </div>
          <div className="h-2 bg-sage-light rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget ? 'bg-red-400' : percentage > 80 ? 'bg-amber' : 'bg-sage'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-forest/40">
          {formatCurrency(Math.max(allocated - spent, 0))} remaining
        </p>
      </div>
    </SectionWrapper>
  );
}
