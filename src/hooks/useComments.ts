import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Comment {
  id: string;
  note_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
}

export function useComments(noteId: string) {
  return useQuery({
    queryKey: ["comments", noteId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("note_id", noteId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile names separately
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);

      return data.map((comment) => ({
        ...comment,
        profiles: { display_name: profileMap.get(comment.user_id) || null },
      })) as Comment[];
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      userId,
      content,
    }: {
      noteId: string;
      userId: string;
      content: string;
    }) => {
      const { error } = await supabase.from("comments").insert({
        note_id: noteId,
        user_id: userId,
        content,
      });

      if (error) throw error;
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

  return useMutation({
    mutationFn: async ({ commentId, noteId }: { commentId: string; noteId: string }) => {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["comments", variables.noteId] });
      toast.success("Comment deleted!");
    },
  });
}
