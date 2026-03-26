import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc,
  addDoc, 
  serverTimestamp, 
  doc,
  updateDoc,
  increment
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import type { Timestamp } from "firebase/firestore";

export interface Note {
  id: string;
  uploadedBy: string;
  title: string;
  description: string | null;
  semester: number;
  subject: string;
  fileURL: string;
  fileName: string;
  fileSize: number;
  downloadCount: number;
  teacherName: string;
  createdAt: Timestamp;
  averageRating?: number;
  ratingCount?: number;
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
      let q = query(
        collection(db, "notes"), 
        orderBy("createdAt", "desc")
      );

      if (filters.semester) {
        q = query(q, where("semester", "==", filters.semester));
      }

      const snapshot = await getDocs(q);
      let notes = snapshot.docs.map((d) => ({ 
        id: d.id, 
        ...d.data() 
      } as Note));

      if (filters.search) {
        const lowerSearch = filters.search.toLowerCase();
        notes = notes.filter((note) =>
          note.title.toLowerCase().includes(lowerSearch) ||
          note.subject.toLowerCase().includes(lowerSearch) ||
          (note.description && note.description.toLowerCase().includes(lowerSearch))
        );
      }

      switch (filters.sortBy) {
        case "oldest":
          notes.sort((a, b) => (a.createdAt.seconds || 0) - (b.createdAt.seconds || 0));
          break;
        case "highest-rated":
          notes.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        case "most-downloaded":
          notes.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
          break;
      }

      return notes;
    },
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const noteRef = doc(db, "notes", id);
      const snapshot = await getDoc(noteRef);
      if (!snapshot.exists()) return null;
      return { id, ...snapshot.data() } as Note | null;
    },
    enabled: !!id,
  });
}

export function useUploadNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      semester,
      subject,
    }: {
      file: File;
      title: string;
      description: string;
      semester: number;
      subject: string;
    }) => {
      if (!user) {
        throw new Error('Must be logged in to upload');
      }

      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files allowed');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large (max 10MB)');
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `notes/${user.uid}/${fileName}`;

      const storageRef = ref(storage, filePath);
      const uploadSnapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(uploadSnapshot.ref);

      const noteData = {
        title,
        description,
        semester,
        subject,
        fileURL,
        fileName: file.name,
        fileSize: file.size,
        downloadCount: 0,
        uploadedBy: user.uid,
        uploaderEmail: user.email,
        teacherName: user.displayName || user.email?.split('@')[0] || 'Teacher',
        averageRating: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "notes"), noteData);
      return { id: docRef.id, ...noteData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast.success("Notes uploaded successfully!");
    },
    onError: (error) => {
      toast.error(`Upload failed: ${(error as Error).message}`);
    },
  });
}

export function useIncrementDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const noteRef = doc(db, "notes", noteId);
      await updateDoc(noteRef, {
        downloadCount: increment(1),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

