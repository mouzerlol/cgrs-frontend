'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { Responsive, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { motion } from 'framer-motion';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Portfolio, DashboardSection } from '@/types/portfolio';
import { Board, Task } from '@/types/work-management';
import { SECTION_TYPE_CONFIGS } from '@/lib/portfolio';
import MissionSection from './sections/MissionSection';
import PeopleSection from './sections/PeopleSection';
import BudgetSection from './sections/BudgetSection';
import ServicesSection from './sections/ServicesSection';
import ServiceProvidersSection from './sections/ServiceProvidersSection';
import SystemsSection from './sections/SystemsSection';
import RelationshipsSection from './sections/RelationshipsSection';
import DocumentsSection from './sections/DocumentsSection';
import LinkedBoardsSection from './sections/LinkedBoardsSection';
import WorkInFlightSection from './sections/WorkInFlightSection';
import AddSectionModal from './AddSectionModal';
import { renderResizeHandle } from './ResizeHandle';

interface PortfolioPegboardProps {
  portfolio: Portfolio;
  boards: Board[];
  tasks: Task[];
  isEditingLayout: boolean;
  onLayoutChange: (sections: DashboardSection[]) => void;
  onSectionContentUpdate: (sectionId: string, content: Record<string, unknown>) => void;
  onAddSection: (section: DashboardSection) => void;
  onRemoveSection: (sectionId: string) => void;
}

export default function PortfolioPegboard({
  portfolio,
  boards,
  tasks,
  isEditingLayout,
  onLayoutChange,
  onSectionContentUpdate,
  onAddSection,
  onRemoveSection,
}: PortfolioPegboardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { width, containerRef, mounted } = useContainerWidth();

  const visibleSections = portfolio.sections.filter(s => s.visible);
  const existingSectionTypes = visibleSections.map(s => s.sectionType);
  const availableSectionTypes = SECTION_TYPE_CONFIGS.filter(c => !existingSectionTypes.includes(c.type));

  // Track whether a drag is in progress to avoid syncing mid-drag
  const isDraggingRef = useRef(false);

  // Build react-grid-layout layouts from section data, enforcing minimum sizes
  const layouts = useMemo(() => {
    const getMinSize = (sectionType: string) => {
      const config = SECTION_TYPE_CONFIGS.find(c => c.type === sectionType);
      return config?.minSize ?? { w: 1, h: 1 };
    };

    const lg = visibleSections.map(section => {
      const min = getMinSize(section.sectionType);
      return {
        i: section.id,
        x: section.gridPosition.x,
        y: section.gridPosition.y,
        w: Math.max(section.gridSize.w, min.w),
        h: Math.max(section.gridSize.h, min.h),
        minW: min.w,
        minH: min.h,
        maxW: 4,
        static: !isEditingLayout,
      };
    });

    const md = visibleSections.map((section, idx) => {
      const min = getMinSize(section.sectionType);
      return {
        i: section.id,
        x: 0,
        y: idx * 2,
        w: Math.min(Math.max(section.gridSize.w, min.w), 2),
        h: Math.max(section.gridSize.h, min.h),
        minW: min.w,
        minH: min.h,
        maxW: 2,
        static: !isEditingLayout,
      };
    });

    const sm = visibleSections.map((section, idx) => {
      const min = getMinSize(section.sectionType);
      return {
        i: section.id,
        x: 0,
        y: idx * 2,
        w: 1,
        h: Math.max(section.gridSize.h, min.h),
        minW: 1,
        minH: min.h,
        maxW: 1,
        static: true,
      };
    });

    return { lg, md, sm };
  }, [visibleSections, isEditingLayout]);

  const syncLayout = useCallback(
    (layout: Layout) => {
      const updatedSections = portfolio.sections.map(section => {
        const layoutItem = layout.find((l: LayoutItem) => l.i === section.id);
        if (!layoutItem) return section;
        return {
          ...section,
          gridPosition: { x: layoutItem.x, y: layoutItem.y },
          gridSize: { w: layoutItem.w, h: layoutItem.h },
        };
      });
      onLayoutChange(updatedSections);
    },
    [portfolio.sections, onLayoutChange]
  );

  const handleLayoutChange = useCallback(
    (layout: Layout) => {
      if (isDraggingRef.current || isResizingRef.current) return;
      syncLayout(layout);
    },
    [syncLayout]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStart = useCallback((..._args: any[]) => {
    isDraggingRef.current = true;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragStop = useCallback(
    (layout: Layout, ..._args: any[]) => {
      isDraggingRef.current = false;
      syncLayout(layout);
    },
    [syncLayout]
  );

  const isResizingRef = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleResizeStart = useCallback((..._args: any[]) => {
    isResizingRef.current = true;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleResizeStop = useCallback(
    (layout: Layout, ..._args: any[]) => {
      isResizingRef.current = false;
      syncLayout(layout);
    },
    [syncLayout]
  );

  const renderSection = (section: DashboardSection) => {
    const commonProps = { isEditingLayout };

    switch (section.sectionType) {
      case 'mission':
        return (
          <MissionSection
            content={section.content as { text?: string }}
            onUpdate={(content) => onSectionContentUpdate(section.id, content)}
            {...commonProps}
          />
        );
      case 'people':
        return (
          <PeopleSection
            lead={portfolio.lead}
            coLead={portfolio.coLead}
            members={portfolio.members}
            {...commonProps}
          />
        );
      case 'budget':
        return (
          <BudgetSection
            content={section.content as { allocated?: number; spent?: number }}
            {...commonProps}
          />
        );
      case 'services':
        return (
          <ServicesSection
            content={section.content as { items?: [] }}
            {...commonProps}
          />
        );
      case 'service-providers':
        return (
          <ServiceProvidersSection
            content={section.content as { providers?: [] }}
            {...commonProps}
          />
        );
      case 'systems':
        return (
          <SystemsSection
            content={section.content as { items?: [] }}
            {...commonProps}
          />
        );
      case 'relationships':
        return (
          <RelationshipsSection
            content={section.content as { items?: [] }}
            {...commonProps}
          />
        );
      case 'documents':
        return (
          <DocumentsSection
            content={section.content as { items?: [] }}
            {...commonProps}
          />
        );
      case 'linked-boards':
        return (
          <LinkedBoardsSection
            linkedBoardIds={portfolio.linkedBoardIds}
            boards={boards}
            portfolioTag={portfolio.tag}
            {...commonProps}
          />
        );
      case 'work-in-flight':
        return (
          <WorkInFlightSection
            linkedBoardIds={portfolio.linkedBoardIds}
            boards={boards}
            tasks={tasks}
            portfolioTag={portfolio.tag}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Grid dot pattern background in edit mode */}
      {isEditingLayout && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(168,181,160,0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      )}

      {mounted && (
        <Responsive
          layouts={layouts}
          breakpoints={{ lg: 996, md: 768, sm: 0 }}
          cols={{ lg: 4, md: 2, sm: 1 }}
          width={width}
          rowHeight={120}
          margin={[16, 16] as const}
          containerPadding={[0, 0] as const}
          compactor={verticalCompactor}
          dragConfig={{ enabled: isEditingLayout, handle: '.drag-handle' }}
          resizeConfig={{
            enabled: isEditingLayout,
            handles: ['se', 'e', 's'],
            handleComponent: renderResizeHandle,
          }}
          onLayoutChange={handleLayoutChange}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onResizeStart={handleResizeStart}
          onResizeStop={handleResizeStop}
        >
          {visibleSections.map((section, index) => (
            <div key={section.id} className="z-10 h-full w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="h-full w-full"
              >
                {renderSection(section)}
              </motion.div>
            </div>
          ))}
        </Responsive>
      )}

      {/* Add section button in edit mode */}
      {isEditingLayout && availableSectionTypes.length > 0 && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full mt-4 py-4 rounded-[16px] border-2 border-dashed border-sage/30 text-forest/40 hover:text-forest hover:border-terracotta hover:bg-terracotta/5 transition-all text-sm font-medium"
        >
          + Add Section
        </button>
      )}

      <AddSectionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        availableTypes={availableSectionTypes}
        onAdd={onAddSection}
      />
    </div>
  );
}
