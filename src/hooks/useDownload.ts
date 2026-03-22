import { toast } from "sonner";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

export function useDownload() {
  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const fileURL = await getDownloadURL(ref(storage, filePath));
      window.open(fileURL, '_blank');
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  return { downloadFile };
}