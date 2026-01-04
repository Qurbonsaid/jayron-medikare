import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Loader2, Activity } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MDFXViewerProps {
  url: string;
  filename?: string;
}

interface MDFXData {
  patientInfo?: {
    name?: string;
    id?: string;
    birthDate?: string;
  };
  recordingInfo?: {
    date?: string;
    duration?: string;
    channels?: number;
  };
  rawContent?: string;
}

// MDFX faylni parse qilish (XML asosida)
const parseMDFX = (content: string): MDFXData => {
  const data: MDFXData = {};
  
  try {
    // XML parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/xml');
    
    // Patient info
    const patient = doc.querySelector('Patient, patient');
    if (patient) {
      data.patientInfo = {
        name: patient.querySelector('Name, name')?.textContent || undefined,
        id: patient.querySelector('ID, id')?.textContent || undefined,
        birthDate: patient.querySelector('BirthDate, birthdate')?.textContent || undefined,
      };
    }
    
    // Recording info
    const recording = doc.querySelector('Recording, recording');
    if (recording) {
      data.recordingInfo = {
        date: recording.querySelector('Date, date')?.textContent || undefined,
        duration: recording.querySelector('Duration, duration')?.textContent || undefined,
        channels: parseInt(recording.querySelector('Channels, channels')?.textContent || '0') || undefined,
      };
    }
  } catch {
    // Agar XML emas bo'lsa, raw content sifatida saqlash
    data.rawContent = content.substring(0, 2000); // Birinchi 2000 belgi
  }
  
  return data;
};

export const MDFXViewer: React.FC<MDFXViewerProps> = memo(({ url, filename }) => {
  const { t } = useTranslation('radiology');
  const [data, setData] = useState<MDFXData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadMDFXFile = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parsedData = parseMDFX(text);
        setData(parsedData);
      } catch (err) {
        console.error('MDFX yuklashda xatolik:', err);
        setError(t('viewers.mdfx.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadMDFXFile();
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
            {t('viewers.mdfx.loading')}
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
          {t('viewers.mdfx.download')}
        </Button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col gap-3'>
      {/* Header */}
      <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg'>
        <div className='flex items-center gap-2'>
          <Activity className='w-5 h-5 text-primary' />
          <span className='text-sm font-medium'>{t('viewers.mdfx.eegData')}</span>
        </div>
        <Button onClick={handleDownload} size='sm' variant='outline'>
          <Download className='w-4 h-4 mr-2' />
          <span className='hidden sm:inline'>{t('viewers.mdfx.download')}</span>
        </Button>
      </div>

      {/* Content */}
      <Card className='flex-1 overflow-hidden'>
        <CardContent className='p-4 sm:p-6 h-[60vh] overflow-auto'>
          {data?.patientInfo && (
            <div className='mb-6'>
              <h3 className='font-semibold mb-2 text-primary'>{t('viewers.mdfx.patientInfo')}</h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                {data.patientInfo.name && (
                  <>
                    <span className='text-muted-foreground'>{t('viewers.mdfx.name')}:</span>
                    <span>{data.patientInfo.name}</span>
                  </>
                )}
                {data.patientInfo.id && (
                  <>
                    <span className='text-muted-foreground'>ID:</span>
                    <span>{data.patientInfo.id}</span>
                  </>
                )}
                {data.patientInfo.birthDate && (
                  <>
                    <span className='text-muted-foreground'>{t('viewers.mdfx.birthDate')}:</span>
                    <span>{data.patientInfo.birthDate}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {data?.recordingInfo && (
            <div className='mb-6'>
              <h3 className='font-semibold mb-2 text-primary'>{t('viewers.mdfx.recordingInfo')}</h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                {data.recordingInfo.date && (
                  <>
                    <span className='text-muted-foreground'>{t('viewers.mdfx.date')}:</span>
                    <span>{data.recordingInfo.date}</span>
                  </>
                )}
                {data.recordingInfo.duration && (
                  <>
                    <span className='text-muted-foreground'>{t('viewers.mdfx.duration')}:</span>
                    <span>{data.recordingInfo.duration}</span>
                  </>
                )}
                {data.recordingInfo.channels && (
                  <>
                    <span className='text-muted-foreground'>{t('viewers.mdfx.channels')}:</span>
                    <span>{data.recordingInfo.channels}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {data?.rawContent && (
            <div>
              <h3 className='font-semibold mb-2 text-primary'>{t('viewers.mdfx.fileContent')}</h3>
              <pre className='text-xs bg-muted p-3 rounded-lg overflow-auto max-h-[300px] whitespace-pre-wrap'>
                {data.rawContent}
              </pre>
            </div>
          )}

          {!data?.patientInfo && !data?.recordingInfo && !data?.rawContent && (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <Activity className='w-16 h-16 text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>
                {t('viewers.mdfx.downloadHint')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

MDFXViewer.displayName = 'MDFXViewer';
