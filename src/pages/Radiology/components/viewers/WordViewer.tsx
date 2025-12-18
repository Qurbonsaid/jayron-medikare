import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface WordViewerProps {
  url: string;
  filename?: string;
}

export const WordViewer: React.FC<WordViewerProps> = ({ url, filename }) => {
  // Google Docs Viewer URL for Word documents
  const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  const handleDownload = () => {
    downloadFile(url, filename);
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Word юклаб олиш
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <iframe
            src={viewerUrl}
            className="w-full h-[70vh] border-0"
            title={filename || 'Word Ҳужжат'}
          />
        </CardContent>
      </Card>
    </div>
  );
};
