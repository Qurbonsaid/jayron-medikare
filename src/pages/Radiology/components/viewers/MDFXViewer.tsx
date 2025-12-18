import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface MDFXViewerProps {
  url: string;
  filename?: string;
}

export const MDFXViewer: React.FC<MDFXViewerProps> = ({ url, filename }) => {
  const handleDownload = () => {
    downloadFile(url, filename);
  };

  return (
    <div className="h-full space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          MDFX юклаб олиш
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <iframe
            src={url}
            className="w-full h-[70vh] border-0"
            title={filename || 'MDFX Файл'}
          />
        </CardContent>
      </Card>
    </div>
  );
};
