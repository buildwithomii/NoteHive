import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useComments, useAddComment, useDeleteComment, Comment } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";

interface CommentSectionProps {
  noteId: string;
}

export function CommentSection({ noteId }: CommentSectionProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(noteId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    addComment.mutate(
      { noteId, userId: user.id, content: newComment.trim() },
      { onSuccess: () => setNewComment("") }
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments ({comments?.length || 0})
      </h3>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Share your thoughts about these notes..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newComment.trim() || addComment.isPending}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          Sign in to leave a comment.
        </p>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading comments...</p>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              noteId={noteId}
              currentUserId={user?.id}
              onDelete={() => deleteComment.mutate({ commentId: comment.id, noteId })}
            />
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  noteId: string;
  currentUserId?: string;
  onDelete: () => void;
}) {
  const isOwner = currentUserId === comment.user_id;

  return (
    <div className="bg-muted/50 p-3 rounded-lg">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {comment.profiles?.display_name || "Anonymous"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        {isOwner && (
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-6 w-6 p-0">
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>
      <p className="text-sm text-foreground">{comment.content}</p>
    </div>
  );
}
