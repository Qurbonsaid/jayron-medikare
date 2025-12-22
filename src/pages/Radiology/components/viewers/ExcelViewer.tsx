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
import { Download, Loader2 } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

interface ExcelViewerProps {
  url: string;
  filename?: string;
}

type CellValue = string | number | boolean | null | undefined;
type SheetRow = CellValue[];

export const ExcelViewer: React.FC<ExcelViewerProps> = memo(({ url, filename }) => {
  const [sheets, setSheets] = useState<{ name: string; data: SheetRow[] }[]>(
    []
  );
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

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
        setError('Файлни юклаб бўлмади. Пастдаги тугмадан юклаб олинг.');
      } finally {
        setLoading(false);
      }
    };

    loadExcelFile();
  }, [url]);

  const handleDownload = useCallback(() => {
    downloadFile(url, filename);
  }, [url, filename]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <div className='text-center space-y-2'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>
            Excel ҳужжати юкланмоқда...
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
            Ҳужжатни юклаб олиш
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentSheet = sheets[activeSheet];

  return (
    <div className='w-full h-full flex flex-col gap-4'>
      <div className='flex justify-between items-center'>
        <div className='flex gap-2'>
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
        <Button onClick={handleDownload} size='sm' variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          Excel юклаб олиш
        </Button>
      </div>

      <Card className='flex-1'>
        <CardContent className='p-0 max-h-[65vh] overflow-auto'>
          {currentSheet && currentSheet.data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {currentSheet.data[0].map(
                    (cell: CellValue, index: number) => (
                      <TableHead key={index} className='font-bold'>
                        {cell || `Column ${index + 1}`}
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
          ) : (
            <div className='p-6 text-center text-muted-foreground'>
              No data in this sheet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ExcelViewer.displayName = 'ExcelViewer';
