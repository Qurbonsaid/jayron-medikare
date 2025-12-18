import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface RTFViewerProps {
  url: string;
  filename?: string;
}

export const RTFViewer: React.FC<RTFViewerProps> = ({ url, filename }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadRTFFile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the RTF file
        const response = await fetch(url);
        const text = await response.text();
        
        // For now, display raw content (RTF parsing is complex)
        // In production, you might want to use a library like rtf-parser
        setContent(text);
      } catch (err) {
        console.error('❌ RTF файлни юклашда хато:', err);
        setError('Файлни юклаб бўлмади. Пастдаги тугмадан юклаб олинг.');
      } finally {
        setLoading(false);
      }
    };

    loadRTFFile();
  }, [url]);

  const handleDownload = () => {
    downloadFile(url, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">RTF ҳужжати юкланмоқда...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Ҳужжатни юклаб олиш
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          RTF Document (Raw View)
        </p>
        <Button onClick={handleDownload} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download RTF
        </Button>
      </div>
      
      <Card className="flex-1">
        <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded">
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
