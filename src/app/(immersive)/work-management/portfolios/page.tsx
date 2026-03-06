'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import CreatePortfolioModal from '@/components/portfolio/CreatePortfolioModal';
import portfoliosData from '@/data/portfolios.json';
import { Portfolio } from '@/types/portfolio';

export default function PortfoliosListPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(portfoliosData.portfolios as unknown as Portfolio[]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setPortfolios(prev => prev.filter(p => p.id !== id));
  };

  const handleCreate = (newPortfolio: Portfolio) => {
    setPortfolios(prev => [...prev, newPortfolio]);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Portfolios"
        showBackButton
        backHref="/work-management"
        backLabel="Work Management"
        actions={[
          {
            label: '+ New Portfolio',
            onClick: () => setIsCreateModalOpen(true),
            variant: 'primary',
          },
        ]}
      />

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((portfolio, index) => (
                <motion.div
                  key={portfolio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <PortfolioCard portfolio={portfolio} onDelete={handleDelete} />
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: portfolios.length * 0.08 }}
              >
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full h-full min-h-[200px] rounded-[20px] border-2 border-dashed border-sage/40 flex flex-col items-center justify-center gap-3 text-forest/50 hover:text-forest hover:border-terracotta hover:bg-terracotta/5 transition-all group bg-bone"
                >
                  <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center group-hover:bg-terracotta/10 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="font-medium">Add Portfolio</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
