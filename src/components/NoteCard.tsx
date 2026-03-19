import { Link } from "react-router-dom";
import { Download, FileText, Star, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useDownload } from "@/hooks/useDownload";
import { useIncrementDownload, Note } from "@/hooks/useNotes";
import { formatDistanceToNow } from "date-fns";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const incrementDownload = useIncrementDownload();
  const { downloadFile } = useDownload(); // TS hook

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    incrementDownload.mutate(note.id);
    await downloadFile(note.file_path, note.file_name);
  };

  const avgRating = note.average_rating ?? 0;
  const ratingCount = note.rating_count ?? 0;

  return (
    <Link to={`/note/${note.id}`}>
      <Card className="h-full hover-lift cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="mb-2 text-xs">
                Semester {note.semester}
              </Badge>
              <h3 className="font-display font-semibold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {note.title}
              </h3>
            </div>
            <FileText className="h-10 w-10 text-primary/20 flex-shrink-0" />
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {note.description || "No description provided"}
          </p>
          <Badge variant="outline" className="text-xs">
            {note.subject}
          </Badge>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 star-rating fill-current" />
              <span className="font-medium">
                {avgRating.toFixed(1)} ({ratingCount})
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{note.download_count}</span>
            </div>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-24">{note.uploader_name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-full gap-2"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
