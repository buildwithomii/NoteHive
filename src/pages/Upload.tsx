import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload as UploadIcon, FileText, X, Loader2 } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useUploadNote } from "@/hooks/useNotes";
import { SEMESTERS, SUBJECTS_BY_SEMESTER, MAX_FILE_SIZE } from "@/lib/constants";
import { toast } from "sonner";

const uploadSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  semester: z.number().min(1).max(8),
  subject: z.string().min(1, "Please enter a subject"),
});

export default function Upload() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const uploadNote = useUploadNote();

  const [uploadType, setUploadType] = useState<'notes' | 'pyqs'>('notes');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to upload notes");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = uploadSchema.safeParse({
      title,
      description,
      semester,
      subject,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!user) {
      toast.error("Please sign in to upload");
      return;
    }

    setErrors({});

    uploadNote.mutate(
      {
        file,
        title,
        description,
        semester: semester!,
        subject,
        userId: user.uid,
        type: uploadType,
      },
      {
        onSuccess: () => {
          toast.success(`${
            uploadType === 'notes' ? 'Notes' : 'PYQs'
          } uploaded successfully!`);
          navigate("/");
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header />

      <main className="flex-1 container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <UploadIcon className="h-6 w-6" />
              Upload {uploadType === 'notes' ? 'Notes' : 'PYQs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Toggle */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <ToggleGroup 
                  type="single" 
                  value={uploadType}
                  onValueChange={(value) => setUploadType(value as 'notes' | 'pyqs')}
                  className="justify-center"
                >
                  <ToggleGroupItem value="notes" variant="outline" className="flex-1">
                    Notes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="pyqs" variant="outline" className="flex-1">
                    PYQs
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-10 w-10 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-foreground font-medium mb-1">
                      Drag & drop your PDF here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse (max 10MB)
                    </p>
                    <Input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      id="file-upload"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    />
                    <Button type="button" variant="outline" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Select PDF
                      </label>
                    </Button>
                  </>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder={`e.g., ${uploadType === 'notes' ? 'Data Structures Complete Notes' : 'CS PYQs 2023-2024'}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
placeholder={`Brief description of what's covered${uploadType === 'notes' ? ' in these notes' : ' in these questions'}`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Semester */}
              <div className="space-y-2">
                <Label>Semester *</Label>
                <Select
                  value={semester?.toString() || ""}
                  onValueChange={(val) => {
                    setSemester(parseInt(val));
                    setSubject("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <p className="text-sm text-destructive">{errors.semester}</p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures, Operating Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={uploadNote.isPending}
              >
                {uploadNote.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="h-4 w-4 mr-2" />
                    Upload {uploadType === 'notes' ? 'Notes' : 'PYQs'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

