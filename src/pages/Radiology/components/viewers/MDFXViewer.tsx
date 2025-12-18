import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, FileText } from 'lucide-react';
import { downloadFile } from '@/lib/fileTypeUtils';

interface MDFXViewerProps {
  url: string;
  filename?: string;
}

interface PatientData {
  [key: string]: string | number | undefined;
}

export const MDFXViewer: React.FC<MDFXViewerProps> = ({ url, filename }) => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [rawXML, setRawXML] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showRawXML, setShowRawXML] = useState(false);

  useEffect(() => {
    const loadMDFXFile = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch the MDFX (XML) file
        const response = await fetch(url);
        const text = await response.text();
        setRawXML(text);
        
        // Parse XML to extract patient information
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
          throw new Error('Invalid XML format');
        }
        
        // Extract patient data from XML
        const data: PatientData = {};
        
        // Common patient fields to extract
        const fields = [
          'PatientName',
          'PatientID',
          'PatientBirthDate',
          'PatientSex',
          'StudyDate',
          'StudyTime',
          'StudyDescription',
          'InstitutionName',
          'ReferringPhysicianName',
          'PerformingPhysicianName',
          'StudyID',
          'AccessionNumber',
          'Modality',
          'SeriesDescription'
        ];
        
        fields.forEach(field => {
          const element = xmlDoc.querySelector(field) || xmlDoc.querySelector(`[name="${field}"]`);
          if (element) {
            data[field] = element.textContent || '';
          }
        });
        
        // Try to get any additional attributes from root element
        const rootElement = xmlDoc.documentElement;
        if (rootElement) {
          Array.from(rootElement.attributes).forEach(attr => {
            if (!data[attr.name]) {
              data[attr.name] = attr.value;
            }
          });
        }
        
        setPatientData(data);
      } catch (err) {
        setError('MDFX файлни юклаб бўлмади. Пастдаги тугмадан юклаб олинг.');
      } finally {
        setLoading(false);
      }
    };

    loadMDFXFile();
  }, [url]);

  const handleDownload = () => {
    downloadFile(url, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">MDFX файли юкланмоқда...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            MDFX файлни юклаб олиш
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium">EEG Medical File (MDFX)</p>
            <p className="text-xs text-muted-foreground">
              Extracted patient information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowRawXML(!showRawXML)} 
            size="sm" 
            variant="outline"
          >
            {showRawXML ? 'Show Parsed Data' : 'Show Raw XML'}
          </Button>
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      {showRawXML ? (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Raw XML Content</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-4 rounded">
              {rawXML}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto">
            {patientData && Object.keys(patientData).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(patientData).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-base">{value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No structured data found in this medical file.</p>
                <p className="text-sm mt-2">Click "Show Raw XML" to view the file content.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
