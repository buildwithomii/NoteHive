import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Note {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  semester: number;
  subject: string;
  file_path: string;
  file_name: string;
  file_size: number;
  download_count: number;
  created_at: string;
  average_rating?: number;
  rating_count?: number;
  uploader_name?: string;
}

export interface NoteFilters {
  semester?: number;
  search?: string;
  sortBy?: "newest" | "oldest" | "highest-rated" | "most-downloaded";
}

export function useNotes(filters: NoteFilters = {}) {
  return useQuery({
    queryKey: ["notes", filters],
    queryFn: async () => {
      let query = supabase
        .from("notes_with_stats")
        .select("*");

      if (filters.semester) {
        query = query.eq("semester", filters.semester);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      switch (filters.sortBy) {
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "highest-rated":
          query = query.order("average_rating", { ascending: false });
          break;
        case "most-downloaded":
          query = query.order("download_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Note[];
    },
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes_with_stats")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Note | null;
    },
    enabled: !!id,
  });
}

export function useUploadNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      semester,
      subject,
      userId,
    }: {
      file: File;
      title: string;
      description: string;
      semester: number;
      subject: string;
      userId: string;
    }) => {
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("notes")
        .insert({
          user_id: userId,
          title,
          description,
          semester,
          subject,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Notes uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });
}

export function useIncrementDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.rpc("increment_download_count", {
        note_id: noteId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
