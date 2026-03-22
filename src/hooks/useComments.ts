import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export interface Comment {
  id: string;
  note_id: string;
  userId: string;
  content: string;
  createdAt: any;
  userName?: string;
}

export function useComments(noteId: string) {
  return useQuery({
    queryKey: ["comments", noteId],
    queryFn: async () => {
      const commentsQuery = query(
        collection(db, `notes/${noteId}/comments`),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(commentsQuery);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          note_id: noteId,
          userId: data.userId,
          content: data.content,
          createdAt: data.createdAt,
        } as Comment;
      });
    },
    enabled: !!noteId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      noteId,
      content,
    }: {
      noteId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Must be logged in to comment');
      
      await addDoc(collection(db, `notes/${noteId}/comments`), {
        userId: user.uid,
        content,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.noteId] });
      toast.success("Comment added!");
    },
    onError: (error) => {
      toast.error(`Failed to comment: ${error.message}`);
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ commentId, noteId }: { commentId: string; noteId: string }) => {
      if (!user) throw new Error('Must be logged in to delete comment');
      
      const commentRef = doc(db, `notes/${noteId}/comments`, commentId);
      await deleteDoc(commentRef);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.noteId] });
      toast.success("Comment deleted!");
    },
  });
}

