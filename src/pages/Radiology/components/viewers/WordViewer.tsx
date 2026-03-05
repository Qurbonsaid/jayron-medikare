import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import mammoth from 'mammoth';

interface WordViewerProps {
  url: string;
  filename?: string;
  isFullscreen?: boolean;
}

export const WordViewer: React.FC<WordViewerProps> = memo(({ url, filename, isFullscreen }) => {
  const { t } = useTranslation('radiology');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [scale, setScale] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  // Ctrl+Scroll zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setScale((prev) => Math.max(50, Math.min(200, prev + delta)));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
  }, []);

  const handleDragMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft = dragStartRef.current.scrollLeft - (e.clientX - dragStartRef.current.x);
    el.scrollTop = dragStartRef.current.scrollTop - (e.clientY - dragStartRef.current.y);
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

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
        setError(t('viewer.wordLoadError'));
      } finally {
        setLoading(false);
      }
    };

    loadWordDocument();
  }, [url, t]);

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
            {t('viewer.wordLoading')}
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
          {t('viewer.download')}
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className='h-full flex flex-col gap-2'>
      {/* Controls */}
      <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg flex-shrink-0'>
        <div className='flex items-center gap-1'>
          <Button onClick={zoomOut} disabled={scale <= 50} size='sm' variant='outline'>
            <ZoomOut className='w-4 h-4' />
          </Button>
          <span className='text-sm px-2 min-w-[50px] text-center'>{scale}%</span>
          <Button onClick={zoomIn} disabled={scale >= 200} size='sm' variant='outline'>
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button onClick={resetZoom} size='sm' variant='outline' title={t('viewer.resetZoom')}>
            <RotateCcw className='w-4 h-4' />
          </Button>
        </div>
        <Button onClick={handleDownload} size='sm' variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>{t('viewer.download')}</span>
        </Button>
      </div>

      {/* Content */}
      <Card className='flex-1 overflow-hidden'>
        <CardContent
          ref={scrollRef}
          className={`p-4 sm:p-6 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[55vh] sm:h-[60vh] xl:h-[70vh]'} overflow-auto select-none`}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className='prose prose-sm sm:prose max-w-none dark:prose-invert origin-top-left'
            style={{
              transform: `scale(${scale / 100})`,
              transformOrigin: 'top left',
              minWidth: scale > 100 ? `${scale}%` : '100%',
              minHeight: scale > 100 ? `${scale}%` : 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </CardContent>
      </Card>
    </div>
  );
});

WordViewer.displayName = 'WordViewer';
