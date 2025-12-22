import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';
import { memo, useCallback, useEffect, useState } from 'react';

interface RTFViewerProps {
  url: string;
  filename?: string;
}

// RTF dan oddiy text ajratib olish
const parseRTFToText = (rtfContent: string): string => {
  // RTF control wordlarni olib tashlash
  const text = rtfContent
    // RTF header va font table olib tashlash
    .replace(/\\fonttbl[^}]*}/gi, '')
    .replace(/\\colortbl[^}]*}/gi, '')
    .replace(/\\stylesheet[^}]*}/gi, '')
    // Maxsus belgilar
    .replace(/\\par\b/gi, '\n')
    .replace(/\\line\b/gi, '\n')
    .replace(/\\tab\b/gi, '\t')
    // Unicode belgilar
    .replace(/\\u(\d+)\??/gi, (_, code) => String.fromCharCode(parseInt(code)))
    // Hex encoded characters
    .replace(/\\'([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Control wordlarni olib tashlash
    .replace(/\\[a-z]+\d*\s?/gi, '')
    // Qavslarni olib tashlash
    .replace(/[{}]/g, '')
    // Ortiqcha bo'shliqlarni tozalash
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  return text;
};

export const RTFViewer: React.FC<RTFViewerProps> = memo(({ url, filename }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState<number>(100);

  useEffect(() => {
    const loadRTFDocument = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        // RTF formatini tekshirish
        if (!text.startsWith('{\\rtf')) {
          throw new Error('Noto\'g\'ri RTF format');
        }

        const parsedText = parseRTFToText(text);
        setContent(parsedText);
      } catch (err) {
        console.error('RTF yuklashda xatolik:', err);
        setError('RTF ҳужжатни юклаб бўлмади');
      } finally {
        setLoading(false);
      }
    };

    loadRTFDocument();
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
            RTF ҳужжат юкланмоқда...
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
          <pre
            className='whitespace-pre-wrap font-sans text-sm leading-relaxed origin-top-left transition-transform'
            style={{ 
              transform: `scale(${scale / 100})`, 
              transformOrigin: 'top left',
              fontSize: `${14 * scale / 100}px`
            }}
          >
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
});

RTFViewer.displayName = 'RTFViewer';
