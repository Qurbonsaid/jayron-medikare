import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { downloadFile } from '@/lib/fileTypeUtils';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// PDF.js worker - CDN dan yuklash
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  url: string;
  filename?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = memo(({ url, filename }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError('');
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF yuklashda xatolik:', error);
    setError('PDF файлни юклаб бўлмади');
    setLoading(false);
  }, []);

  const handleDownload = useCallback(() => {
    downloadFile(url, filename);
  }, [url, filename]);

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const rotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button onClick={handleDownload} variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            PDF юклаб олиш
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='w-full h-full flex flex-col gap-3'>
      {/* Controls */}
      <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg'>
        {/* Page Navigation */}
        <div className='flex items-center gap-1'>
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            size='sm'
            variant='outline'
          >
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <span className='text-sm px-2 min-w-[80px] text-center'>
            {pageNumber} / {numPages || '?'}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            size='sm'
            variant='outline'
          >
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        {/* Zoom & Rotate */}
        <div className='flex items-center gap-1'>
          <Button onClick={zoomOut} disabled={scale <= 0.5} size='sm' variant='outline'>
            <ZoomOut className='w-4 h-4' />
          </Button>
          <span className='text-sm px-2 min-w-[50px] text-center'>
            {Math.round(scale * 100)}%
          </span>
          <Button onClick={zoomIn} disabled={scale >= 3} size='sm' variant='outline'>
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button onClick={rotate} size='sm' variant='outline'>
            <RotateCw className='w-4 h-4' />
          </Button>
        </div>

        {/* Download */}
        <Button onClick={handleDownload} size='sm' variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>Юклаб олиш</span>
        </Button>
      </div>

      {/* PDF Document */}
      <Card className='flex-1 overflow-hidden'>
        <CardContent className='p-0 h-[60vh] overflow-auto flex justify-center'>
          {loading && (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center space-y-2'>
                <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
                <p className='text-sm text-muted-foreground'>
                  PDF юкланмоқда...
                </p>
              </div>
            </div>
          )}
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            className='flex justify-center'
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              loading={null}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </CardContent>
      </Card>
    </div>
  );
});

PDFViewer.displayName = 'PDFViewer';
