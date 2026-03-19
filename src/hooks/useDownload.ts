import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDownload() {
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data } = supabase.storage.from("notes").getPublicUrl(filePath);
      
      if (!data.publicUrl) {
        toast.error("File URL not available");
        return;
      }

      // Test if file exists
      const response = await fetch(data.publicUrl);
      if (!response.ok) {
        toast.error("File not found or access denied");
        return;
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed");
    }
  };

  return { downloadFile };
}

