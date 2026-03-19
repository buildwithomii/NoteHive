-- Create profiles table for user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create notes table
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
  subject TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Anyone can view notes
CREATE POLICY "Notes are viewable by everyone" 
ON public.notes FOR SELECT USING (true);

-- Authenticated users can upload notes
CREATE POLICY "Authenticated users can insert notes" 
ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" 
ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (note_id, user_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Ratings are viewable by everyone" 
ON public.ratings FOR SELECT USING (true);

-- Authenticated users can insert their rating
CREATE POLICY "Authenticated users can rate notes" 
ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own rating
CREATE POLICY "Users can update their own rating" 
ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can comment" 
ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes', 'notes', true);

-- Storage policies
CREATE POLICY "Anyone can view notes files"
ON storage.objects FOR SELECT
USING (bucket_id = 'notes');

CREATE POLICY "Authenticated users can upload notes files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own note files"
ON storage.objects FOR DELETE
USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_download_count(note_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.notes
  SET download_count = download_count + 1
  WHERE id = note_id;
END;
$$;

-- Create view for notes with average rating
CREATE OR REPLACE VIEW public.notes_with_stats AS
SELECT 
  n.*,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(DISTINCT r.id) as rating_count,
  p.display_name as uploader_name
FROM public.notes n
LEFT JOIN public.ratings r ON n.id = r.note_id
LEFT JOIN public.profiles p ON n.user_id = p.user_id
GROUP BY n.id, p.display_name;