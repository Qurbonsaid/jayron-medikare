import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { downloadFile } from '@/lib/fileTypeUtils';
import { Download, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';

interface ExcelViewerProps {
  url: string;
  filename?: string;
  isFullscreen?: boolean;
}

type CellValue = string | number | boolean | null | undefined;
type SheetRow = CellValue[];

export const ExcelViewer: React.FC<ExcelViewerProps> = memo(({ url, filename, isFullscreen }) => {
  const { t } = useTranslation('radiology');
  const [sheets, setSheets] = useState<{ name: string; data: SheetRow[] }[]>(
    []
  );
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
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

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 10, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 10, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(100);
  }, []);

  useEffect(() => {
    const loadExcelFile = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch the Excel file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Parse with xlsx
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Convert all sheets to JSON
        const sheetsData = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          }) as SheetRow[];
          return { name: sheetName, data };
        });

        setSheets(sheetsData);
      } catch (err) {
        setError(t('viewers.excel.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [url, t]);

  const handleDownload = useCallback(() => {
    downloadFile(url, filename);
  }, [url, filename]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center space-y-2'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>
            {t('viewers.excel.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button onClick={handleDownload} variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            {t('viewers.excel.downloadDocument')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentSheet = sheets[activeSheet];

  return (
    <div ref={containerRef} className='w-full h-full flex flex-col gap-2'>
      <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg flex-shrink-0'>
        <div className='flex gap-2 flex-wrap'>
          {sheets.map((sheet, index) => (
            <Button
              key={index}
              onClick={() => setActiveSheet(index)}
              size='sm'
              variant={activeSheet === index ? 'default' : 'outline'}
            >
              {sheet.name}
            </Button>
          ))}
        </div>
        <div className='flex items-center gap-1'>
          <Button onClick={zoomOut} disabled={scale <= 50} size='sm' variant='outline'>
            <ZoomOut className='w-4 h-4' />
          </Button>
          <span className='text-sm px-2 min-w-[50px] text-center'>{scale}%</span>
          <Button onClick={zoomIn} disabled={scale >= 200} size='sm' variant='outline'>
            <ZoomIn className='w-4 h-4' />
          </Button>
          <Button onClick={resetZoom} size='sm' variant='outline'>
            <RotateCcw className='w-4 h-4' />
          </Button>
          <Button onClick={handleDownload} size='sm' variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>{t('viewers.excel.downloadExcel')}</span>
          </Button>
        </div>
      </div>

      <Card className='flex-1'>
        <CardContent
          ref={scrollRef}
          className={`p-0 ${isFullscreen ? 'max-h-[calc(100vh-120px)]' : 'max-h-[55vh] sm:max-h-[60vh] xl:max-h-[70vh]'} overflow-auto select-none`}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {currentSheet && currentSheet.data.length > 0 ? (
            <div style={{ transform: `scale(${scale / 100})`, transformOrigin: 'top left', minWidth: scale > 100 ? `${scale}%` : '100%' }}>
            <Table>
              <TableHeader>
                <TableRow>
                  {currentSheet.data[0].map(
                    (cell: CellValue, index: number) => (
                      <TableHead key={index} className='font-bold'>
                        {cell || `${t('viewers.excel.column')} ${index + 1}`}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSheet.data
                  .slice(1)
                  .map((row: SheetRow, rowIndex: number) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell: CellValue, cellIndex: number) => (
                        <TableCell key={cellIndex}>
                          {cell !== null && cell !== undefined
                            ? String(cell)
                            : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <div className='p-6 text-center text-muted-foreground'>
              {t('viewers.excel.noData')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ExcelViewer.displayName = 'ExcelViewer';
