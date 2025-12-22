import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';
import { memo, useCallback, useEffect, useState } from 'react';
import mammoth from 'mammoth';

interface WordViewerProps {
  url: string;
  filename?: string;
}

export const WordViewer: React.FC<WordViewerProps> = memo(({ url, filename }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState<number>(100);

  useEffect(() => {
    const loadWordDocument = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtmlContent(result.value);

        if (result.messages.length > 0) {
          console.warn('Mammoth warnings:', result.messages);
        }
      } catch (err) {
        console.error('Word yuklashda xatolik:', err);
        setError('Word ҳужжатни юклаб бўлмади');
      } finally {
        setLoading(false);
      }
    };

    loadWordDocument();
  }, [url]);

  const handleDownload = useCallback(() => {
    downloadFile(url, filename);
  }, [url, filename]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 10, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 10, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(100);
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center space-y-2'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>
            Word ҳужжат юкланмоқда...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
        <p className='text-destructive'>{error}</p>
        <Button onClick={handleDownload} variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          Юклаб олиш
        </Button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col gap-3'>
      {/* Controls */}
      <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg'>
        <div className='flex items-center gap-1'>
          <Button onClick={zoomOut} disabled={scale <= 50} size='sm' variant='outline'>
            <ZoomOut className='w-4 h-4' />
          </Button>
          <span className='text-sm px-2 min-w-[50px] text-center'>{scale}%</span>
          <Button onClick={zoomIn} disabled={scale >= 200} size='sm' variant='outline'>
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button onClick={resetZoom} size='sm' variant='outline' title='Qayta tiklash'>
            <RotateCcw className='w-4 h-4' />
          </Button>
        </div>
        <Button onClick={handleDownload} size='sm' variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>Юклаб олиш</span>
        </Button>
      </div>

      {/* Content */}
      <Card className='flex-1 overflow-hidden'>
        <CardContent className='p-4 sm:p-6 h-[60vh] overflow-auto'>
          <div
            className='prose prose-sm sm:prose max-w-none dark:prose-invert origin-top-left transition-transform'
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top left' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>
    </div>
  );
});

WordViewer.displayName = 'WordViewer';
