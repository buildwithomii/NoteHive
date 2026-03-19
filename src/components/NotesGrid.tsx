import { Loader2, FileX } from "lucide-react";
import { NoteCard } from "@/components/NoteCard";
import { Note } from "@/hooks/useNotes";

interface NotesGridProps {
  notes: Note[] | undefined;
  isLoading: boolean;
}

export function NotesGrid({ notes, isLoading }: NotesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileX className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          No notes found
        </h3>
        <p className="text-muted-foreground max-w-md">
          Be the first to share notes! Sign in and upload your study materials to help fellow students.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note, index) => (
        <div
          key={note.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <NoteCard note={note} />
        </div>
      ))}
    </div>
  );
}
