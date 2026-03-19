import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useUserRating(noteId: string, userId: string | undefined) {
  return useQuery({
    queryKey: ["rating", noteId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("note_id", noteId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data?.rating ?? null;
    },
    enabled: !!userId,
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      userId,
      rating,
    }: {
      noteId: string;
      userId: string;
      rating: number;
    }) => {
      const { error } = await supabase
        .from("ratings")
        .upsert(
          { note_id: noteId, user_id: userId, rating },
          { onConflict: "note_id,user_id" }
        );

      if (error) throw error;
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
