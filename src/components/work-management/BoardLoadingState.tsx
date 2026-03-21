import BoardColumnSkeleton from './BoardColumnSkeleton';

/**
 * Full board loading state with multiple column skeletons.
 * Used during initial page load.
 */
export default function BoardLoadingState() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <BoardColumnSkeleton key={i} />
      ))}
    </div>
  );
}
