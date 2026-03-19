import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Note } from "./useNotes";

export function useUserNotes(userId: string | undefined) {
  return useQuery({
    queryKey: ["userNotes", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("notes_with_stats")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Note[];
    },
    enabled: !!userId,
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      title,
      description,
      semester,
      subject,
    }: {
      noteId: string;
      title: string;
      description: string;
      semester: number;
      subject: string;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({
          title,
          description,
          semester,
          subject,
        })
        .eq("id", noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
      toast.success("Note updated successfully!");
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      // First get the note to find the file path
      const { data: note, error: fetchError } = await supabase
        .from("notes")
        .select("file_path")
        .eq("id", noteId)
        .single();

      if (fetchError) throw fetchError;

      // Delete the file from storage
      if (note?.file_path) {
        const { error: storageError } = await supabase.storage
          .from("notes")
          .remove([note.file_path]);
        
        if (storageError) {
          console.error("Storage deletion error:", storageError);
        }
      }

      // Delete the note record
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["userNotes"] });
      toast.success("Note deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });
}
