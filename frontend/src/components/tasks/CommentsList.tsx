import { useState } from 'react';
import { Comment } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { useAddComment, useDeleteComment } from '@/hooks/useTasks';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { formatDateTime } from '@/utils/date';
import { getInitials, getAvatarBg } from '@/utils/formatters';
import { MessageSquare, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface CommentsListProps {
  taskId: number;
  comments: Comment[];
  isLoading?: boolean;
}

export function CommentsList({ taskId, comments, isLoading }: CommentsListProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const addComment = useAddComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addComment.mutateAsync(text.trim());
    setText('');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteComment.mutateAsync(deleteId);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add comment */}
      <div className="flex gap-3">
        {user && (
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getAvatarBg(user.name))}>
            <span className="text-xs font-semibold text-white">{getInitials(user.name)}</span>
          </div>
        )}
        <div className="flex-1 space-y-2">
          <textarea
            rows={3}
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none transition-colors"
            aria-label="Comment text"
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!text.trim()}
              isLoading={addComment.isPending}
            >
              Add Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-6 w-6" />}
          title="No comments yet"
          description="Be the first to add a comment."
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              {comment.user && (
                <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', getAvatarBg(comment.user.name))}>
                  <span className="text-xs font-semibold text-white">{getInitials(comment.user.name)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comment.user?.name ?? 'Unknown'}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatDateTime(comment.created_at)}</span>
                  </div>
                  {(user?.id === comment.user?.id || user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                      onClick={() => setDeleteId(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1 rounded"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment?"
        isLoading={deleteComment.isPending}
      />
    </div>
  );
}
