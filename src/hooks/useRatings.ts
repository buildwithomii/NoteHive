import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export function useUserRating(noteId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["rating", noteId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const ratingRef = doc(db, `notes/${noteId}/ratings`, userId);
      const ratingSnap = await getDoc(ratingRef);
      if (!ratingSnap.exists()) return null;
      return ratingSnap.data().rating as number | null;
    },
    enabled: !!userId && !!noteId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      noteId,
      rating,
    }: {
      noteId: string;
      rating: number;
    }) => {
      if (!user) throw new Error('Must be logged in to rate');
      
      const ratingRef = doc(db, `notes/${noteId}/ratings`, user.uid);
      await updateDoc(ratingRef, {
        rating,
        updatedAt: new Date(),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ["rating", variables.noteId] });
      toast.success("Rating submitted!");
    },
    onError: (error) => {
      toast.error(`Failed to rate: ${error.message}`);
    },
  });
}

