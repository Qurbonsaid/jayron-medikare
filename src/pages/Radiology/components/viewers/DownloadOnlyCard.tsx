import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { downloadFile, getFileIcon, getFileTypeName, FileType } from '@/lib/fileTypeUtils';
import { memo, useCallback } from 'react';

interface DownloadOnlyCardProps {
  url: string;
  filename?: string;
  fileType?: FileType | string;
}

export const DownloadOnlyCard: React.FC<DownloadOnlyCardProps> = memo(({ 
  url, 
  filename,
  fileType = 'other'
}) => {
  // MUHIM: handleDownload faqat tugma bosilganda ishlaydi, avtomatik emas!
  const handleDownload = useCallback(() => {
    downloadFile(url, filename);
  }, [url, filename]);

  const Icon = getFileIcon(fileType as FileType);
  const typeName = getFileTypeName(fileType as FileType);

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Icon className="w-16 h-16 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {filename || typeName}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Бу файлни браузерда кўриб бўлмайди. 
            Пастдаги тугмадан юклаб олинг ва мос дастур билан очинг.
          </p>
        </div>

        <Button onClick={handleDownload} size="lg" className="mt-4">
          <Download className="w-5 h-5 mr-2" />
          Файлни юклаб олиш
        </Button>
      </CardContent>
    </Card>
  );
});

DownloadOnlyCard.displayName = 'DownloadOnlyCard';
