'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import BoardCard from '@/components/work-management/BoardCard';
import CreateBoardModal from '@/components/work-management/CreateBoardModal';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import Card from '@/components/ui/Card';
import { useBoards, useCreateBoard } from '@/hooks/useBoards';
import type { Board } from '@/types/work-management';

export default function BoardsListPage() {
  const { data: boards = [], isLoading, error } = useBoards();
  const createBoard = useCreateBoard();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateBoard = (newBoard: Omit<Board, 'id' | 'task_count' | 'created_at' | 'updated_at'>) => {
    createBoard.mutate(newBoard, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Boards"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
          actions={[
            {
              label: '+ Create Board',
              onClick: () => setIsCreateModalOpen(true),
              variant: 'primary',
            },
          ]}
        />
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[200px] rounded-[20px] bg-sage/10 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
        <WorkManagementNavBar
          title="Boards"
          showBackButton
          backHref="/work-management"
          backLabel="Work Management"
        />
        <main className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center">
          <Card variant="sage" className="p-12 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="font-display text-2xl text-forest mb-2">Failed to load boards</h2>
            <p className="text-forest/60 mb-6">
              Please try refreshing the page
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      <WorkManagementNavBar
        title="Boards"
        showBackButton
        backHref="/work-management"
        backLabel="Work Management"
        actions={[
          {
            label: '+ Create Board',
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
            {boards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Card variant="sage" className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h2 className="font-display text-2xl text-forest mb-2">No boards yet</h2>
                  <p className="text-forest/60 mb-6">
                    Create your first board to start managing tasks
                  </p>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boards.map((board, index) => (
                  <motion.div
                    key={board.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <BoardCard board={board} />
                  </motion.div>
                ))}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: boards.length * 0.1 }}
                >
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full h-full min-h-[200px] rounded-[20px] border-2 border-dashed border-sage/40 flex flex-col items-center justify-center gap-3 text-forest/50 hover:text-forest hover:border-terracotta hover:bg-terracotta/5 transition-all group bg-bone"
                  >
                    <div className="w-14 h-14 rounded-full bg-sage-light flex items-center justify-center group-hover:bg-terracotta/10 transition-colors">
                      <span className="text-2xl">+</span>
                    </div>
                    <span className="font-medium">Create New Board</span>
                  </button>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
}
