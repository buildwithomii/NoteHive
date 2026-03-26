import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Note } from "./useNotes";

export function useUserNotes(userId: string | undefined) {
  return useQuery({
    queryKey: ["userNotes", userId],
    queryFn: async () => {
      if (!userId) return [];
      console.log('Fetching user notes for UID:', userId);
      
      const q = query(
        collection(db, "notes"),
        where("uploadedBy", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const notes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      console.log('Fetched notes:', notes);
      return notes;
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
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        title,
        description,
        semester,
        subject,
      });
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
      const noteRef = doc(db, "notes", noteId);
      const noteSnap = await getDoc(noteRef);
      if (!noteSnap.exists()) throw new Error("Note not found");

      const note = noteSnap.data() as Note;
      if (note.fileURL) {
        try {
          const storageRef = ref(storage, note.fileURL);
          await deleteObject(storageRef);
        } catch (error) {
          console.error("Storage deletion error:", error);
        }
      }

      await deleteDoc(noteRef);
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

