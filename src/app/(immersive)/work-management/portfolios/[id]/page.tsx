'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Pencil, Check } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import dynamic from 'next/dynamic';

const PortfolioPegboard = dynamic(
  () => import('@/components/portfolio/PortfolioPegboard'),
  { ssr: false }
);
import Button from '@/components/ui/Button';
import portfoliosData from '@/data/portfolios.json';
import boardsData from '@/data/boards.json';
import mockTaskData from '@/data/work-management.json';
import { Portfolio, DashboardSection } from '@/types/portfolio';
import { Board, Task } from '@/types/work-management';

const allBoards = boardsData.boards as unknown as Board[];
const allTasks = mockTaskData.tasks as unknown as Task[];

const lucideIconMap: Record<string, string> = {
  wallet: 'lucide:wallet',
  wrench: 'lucide:wrench',
  trees: 'lucide:trees',
  shield: 'lucide:shield',
  'party-popper': 'lucide:party-popper',
  megaphone: 'lucide:megaphone',
  settings: 'lucide:settings',
};

export default function PortfolioDashboardPage() {
  const params = useParams();
  const portfolioId = params.id as string;

  const initialPortfolio = portfoliosData.portfolios.find(
    p => p.id === portfolioId
  ) as unknown as Portfolio | undefined;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(initialPortfolio || null);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  // Store layout before editing so we can cancel
  const [savedSections, setSavedSections] = useState<DashboardSection[] | null>(null);

  const handleEnterEditMode = () => {
    if (portfolio) {
      setSavedSections([...portfolio.sections]);
    }
    setIsEditingLayout(true);
  };

  const handleSaveLayout = () => {
    setSavedSections(null);
    setIsEditingLayout(false);
  };

  const handleCancelLayout = () => {
    if (savedSections && portfolio) {
      setPortfolio({ ...portfolio, sections: savedSections });
    }
    setSavedSections(null);
    setIsEditingLayout(false);
  };

  const handleLayoutChange = useCallback(
    (updatedSections: DashboardSection[]) => {
      setPortfolio(prev => prev ? { ...prev, sections: updatedSections } : null);
    },
    []
  );

  const handleSectionContentUpdate = useCallback(
    (sectionId: string, content: Record<string, unknown>) => {
      setPortfolio(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, content } : s
          ),
        };
      });
    },
    []
  );

  const handleAddSection = useCallback(
    (section: DashboardSection) => {
      setPortfolio(prev => {
        if (!prev) return null;
        return { ...prev, sections: [...prev.sections, section] };
      });
    },
    []
  );

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      setPortfolio(prev => {
        if (!prev) return null;
        return {
          ...prev,
          sections: prev.sections.map(s =>
            s.id === sectionId ? { ...s, visible: false } : s
          ),
        };
      });
    },
    []
  );

  if (!portfolio) {
    return (
      <div className="h-full w-full flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Portfolio Not Found"
          showBackButton
          backHref="/work-management/portfolios"
          backLabel="Portfolios"
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-forest/50">This portfolio could not be found.</p>
        </div>
      </div>
    );
  }

  const iconName = lucideIconMap[portfolio.icon] || 'lucide:folder';

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title=""
        showBackButton
        backHref="/work-management/portfolios"
        backLabel="Portfolios"
        actions={isEditingLayout ? [] : []}
      >
        {/* Custom title with icon */}
        <div className="flex items-center gap-2 mr-auto">
          <Icon icon={iconName} className="w-4 h-4 text-bone/70" />
          <span className="font-display text-sm font-medium text-bone tracking-wide">
            {portfolio.name}
          </span>
        </div>

        {/* Layout edit controls */}
        <div className="flex items-center gap-2 ml-auto">
          {isEditingLayout ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelLayout}
                className="!px-3 !py-1.5 !text-xs font-bold !text-bone/70 hover:!text-bone hover:!bg-bone/10"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveLayout}
                className="!px-3 !py-1.5 !text-xs font-bold"
              >
                <Check className="w-3 h-3 mr-1" />
                Done
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnterEditMode}
              className="!px-3 !py-1.5 !text-xs font-bold !text-bone/70 hover:!text-bone hover:!bg-bone/10"
            >
              <Pencil className="w-3 h-3 mr-1.5" />
              Edit Layout
            </Button>
          )}
        </div>
      </WorkManagementNavBar>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto mt-4 md:mt-6 p-4 md:p-6 lg:p-8 pt-6 md:pt-8 lg:pt-10 bg-sage-light border border-sage/30 shadow-sm rounded-[10px]">
          <PortfolioPegboard
            portfolio={portfolio}
            boards={allBoards}
            tasks={allTasks}
            isEditingLayout={isEditingLayout}
            onLayoutChange={handleLayoutChange}
            onSectionContentUpdate={handleSectionContentUpdate}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
          />
        </div>
      </main>
    </div>
  );
}
