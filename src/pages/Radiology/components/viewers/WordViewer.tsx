import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2 } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';
import mammoth from 'mammoth';

interface WordViewerProps {
  url: string;
  filename?: string;
}

export const WordViewer: React.FC<WordViewerProps> = ({ url, filename }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadWordFile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the .docx file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert to HTML using mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);
        
        if (result.messages.length > 0) {
          console.warn('Mammoth warnings:', result.messages);
        }
      } catch (err) {
        console.error('❌ Word файлни юклашда хато:', err);
        setError('Файлни юклаб бўлмади. Пастдаги тугмадан юклаб олинг.');
      } finally {
        setLoading(false);
      }
    };

    loadWordFile();
  }, [url]);

  const handleDownload = () => {
    downloadFile(url, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Word ҳужжати юкланмоқда...</p>
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
      <div className="flex justify-end">
        <Button onClick={handleDownload} size="sm" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Word
        </Button>
      </div>
      
      <Card className="flex-1">
        <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
