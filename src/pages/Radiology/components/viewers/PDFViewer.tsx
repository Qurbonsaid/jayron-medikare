import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface PDFViewerProps {
  url: string;
  filename?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ url, filename }) => {
  const handleDownload = () => {
    downloadFile(url, filename);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          PDF юклаб олиш
        </Button>
      </div>
      
      <Card className="flex-1">
        <CardContent className="p-0 h-[70vh]">
          <iframe
            src={url}
            className="w-full h-full border-0 rounded-lg"
            title="PDF Viewer"
          />
        </CardContent>
      </Card>
    </div>
  );
};
