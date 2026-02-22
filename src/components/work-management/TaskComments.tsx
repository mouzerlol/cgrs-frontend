import { useState } from 'react';
import { TaskComment, BoardMember } from '@/types/work-management';
import { formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';
import { Avatar } from '@/components/design-system/Avatar';

interface TaskCommentsProps {
  comments: TaskComment[];
  onChange: (comments: TaskComment[]) => void;
  readonly?: boolean;
}

export default function TaskComments({ comments, onChange, readonly = false }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  
  // For the sake of the mock, assuming the current user is m1
  const currentUserId = 'm1';
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: TaskComment = {
      id: Math.random().toString(),
      authorId: currentUserId,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    
    onChange([...comments, comment]);
    setNewComment('');
  };

  const getAuthor = (authorId: string): BoardMember | undefined => {
    return mockData.members.find((m: any) => m.id === authorId);
  };

  const currentUser = getAuthor(currentUserId);

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => {
            const author = getAuthor(comment.authorId);
            return (
              <div key={comment.id} className="flex gap-4 group">
                <Avatar src={author?.avatar} alt={author?.name} size="sm" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-forest">{author?.name || 'Unknown User'}</span>
                    <span className="text-[10px] font-medium text-forest/30 uppercase tracking-wider">{formatRelativeDate(comment.createdAt)}</span>
                  </div>
                  <div className="text-sm text-forest/80 bg-white p-3.5 rounded-2xl rounded-tl-none border border-sage/20 shadow-sm group-hover:border-sage/40 transition-colors whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center bg-sage-light/20 rounded-2xl border border-dashed border-sage/30">
          <p className="text-sm text-forest/40 font-medium italic">No comments yet. Start the conversation!</p>
        </div>
      )}

      {!readonly && (
        <div className="flex gap-4 mt-8 pt-6 border-t border-sage/10">
          <Avatar src={currentUser?.avatar} alt="Current User" size="sm" />
          <div className="flex-1 relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-white text-sm text-forest/80 rounded-2xl border border-sage/30 p-4 pb-12 focus:outline-none focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/30 transition-all resize-none min-h-[110px]"
            />
            <div className="absolute bottom-3 right-3">
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-terracotta text-white text-xs font-bold px-5 py-2 rounded-xl shadow-lg shadow-terracotta/20 hover:bg-terracotta/90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
