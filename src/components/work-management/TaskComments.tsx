import { useState } from 'react';
import { TaskComment, BoardMember } from '@/types/work-management';
import { formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';

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

  return (
    <div className="space-y-4 mt-6">
      <h4 className="font-body text-xs text-forest/50 uppercase tracking-wider mb-2">Comments</h4>
      
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => {
            const author = getAuthor(comment.authorId);
            return (
              <div key={comment.id} className="flex gap-3">
                <img 
                  src={author?.avatar || 'https://via.placeholder.com/150'} 
                  alt={author?.name || 'Unknown User'} 
                  className="w-8 h-8 rounded-full object-cover shrink-0" 
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-forest">{author?.name || 'Unknown User'}</span>
                    <span className="text-xs text-forest/50">{formatRelativeDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-forest/80 bg-sage-light/10 p-3 rounded-lg border border-sage/20 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-forest/50 italic mb-4">No comments yet.</p>
      )}

      {!readonly && (
        <div className="flex gap-3 mt-4">
          <img 
            src={getAuthor(currentUserId)?.avatar || 'https://via.placeholder.com/150'} 
            alt="Current User" 
            className="w-8 h-8 rounded-full object-cover shrink-0" 
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-white text-sm text-forest/80 rounded-lg border border-sage/30 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-none"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="bg-terracotta text-white text-xs font-medium px-4 py-1.5 rounded-full hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}