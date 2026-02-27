import Link from 'next/link';
import Button from '@/components/ui/Button';

interface BoardTopBarProps {
  onNewTask?: () => void;
  filterSlot?: React.ReactNode;
}

export default function BoardTopBar({ onNewTask, filterSlot }: BoardTopBarProps) {
  return (
    <div className="h-14 bg-forest/95 backdrop-blur-md border-b border-white/10 px-4 md:px-6 flex items-center justify-between shrink-0 text-bone z-10">
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/" className="font-display text-base font-medium tracking-wide leading-none flex items-center shrink-0 hover:opacity-80 transition-opacity text-bone">
          <span className="flex flex-col leading-tight">
            <span className="block whitespace-nowrap">CORONATION</span>
            <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
          </span>
        </Link>
        <div className="h-6 w-px bg-white/20 hidden sm:block"></div>
        <h1 className="font-display text-sm font-medium text-bone/90 hidden sm:block tracking-wide">Work Management</h1>
      </div>
      <div className="flex items-center gap-4">
        {filterSlot}
        <Button size="sm" className="bg-bone text-forest hover:bg-bone/90 font-medium shadow-sm transition-transform active:scale-95" onClick={onNewTask}>
          + New Task
        </Button>
      </div>
    </div>
  );
}
