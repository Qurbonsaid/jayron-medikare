import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface ExcelViewerProps {
  url: string;
  filename?: string;
}

export const ExcelViewer: React.FC<ExcelViewerProps> = ({ url, filename }) => {
  // Google Sheets Viewer URL for Excel files
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  const handleDownload = () => {
    downloadFile(url, filename);
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Excel юклаб олиш
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <iframe
            src={viewerUrl}
            className="w-full h-[70vh] border-0"
            title={filename || 'Excel Ҳужжат'}
          />
        </CardContent>
      </Card>
    </div>
  );
};
