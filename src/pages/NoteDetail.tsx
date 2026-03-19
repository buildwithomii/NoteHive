import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNote, useIncrementDownload } from "@/hooks/useNotes";
import { useUserRating, useSubmitRating } from "@/hooks/useRatings";
import { useAuth } from "@/hooks/useAuth";
import { useDownload } from "@/hooks/useDownload";
import { toast } from "sonner";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: note, isLoading, error } = useNote(id || "");
  const { data: userRating } = useUserRating(id || "", user?.id);
  const submitRating = useSubmitRating();
  const incrementDownload = useIncrementDownload();
  const { downloadFile } = useDownload();

  const handleDownload = async () => {
    if (!note) return;

    incrementDownload.mutate(note.id);
    await downloadFile(note.file_path, note.file_name);
  };

  const handleRating = (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate notes");
      return;
    }
    if (!id) return;

    submitRating.mutate({ noteId: id, userId: user.id, rating });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Note Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The note you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Notes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = note.average_rating ?? 0;
  const ratingCount = note.rating_count ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container py-8 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">Semester {note.semester}</Badge>
                  <Badge variant="outline">{note.subject}</Badge>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {note.title}
                </h1>
                {note.description && (
                  <p className="text-muted-foreground">{note.description}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <FileText className="h-16 w-16 text-primary/20" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <StarRating rating={Math.round(avgRating)} size="sm" />
                </div>
                <p className="text-lg font-semibold">{avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{ratingCount} ratings</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Download className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{note.download_count}</p>
                <p className="text-xs text-muted-foreground">downloads</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <User className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold truncate">
                  {note.uploader_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">uploader</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-semibold">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">uploaded</p>
              </div>
            </div>

            <Separator />

            {/* Download Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button size="lg" className="gap-2 w-full sm:w-auto" onClick={handleDownload}>
                <Download className="h-5 w-5" />
                Download PDF
              </Button>
              <p className="text-sm text-muted-foreground">
                {note.file_name} • {(note.file_size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <Separator />

            {/* Rating Section */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">Rate these notes</h3>
              {user ? (
                <div className="flex items-center gap-4">
                  <StarRating
                    rating={userRating || 0}
                    size="lg"
                    interactive
                    onRatingChange={handleRating}
                  />
                  {userRating && (
                    <span className="text-sm text-muted-foreground">
                      Your rating: {userRating} star{userRating !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to rate these notes
                </p>
              )}
            </div>

            <Separator />

            {/* Comments */}
            <CommentSection noteId={note.id} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
