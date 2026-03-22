import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
}

export function PdfPreviewModal({ isOpen, onClose, fileUrl, fileName }: PdfPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Preview: {fileName}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <iframe
            src={fileUrl}
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            title={fileName}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}