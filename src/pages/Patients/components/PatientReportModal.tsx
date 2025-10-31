import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { CalendarIcon, Download, FileText, Printer } from 'lucide-react';
import { useState } from 'react';

interface PatientReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  patientId: string;
}

const PatientReportModal = ({
  open,
  onOpenChange,
  patientName,
  patientId,
}: PatientReportModalProps) => {
  const [reportType, setReportType] = useState<string>('full');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedSections, setSelectedSections] = useState({
    generalInfo: true,
    medicalHistory: true,
    medications: true,
    allergies: true,
    familyHistory: true,
    visits: true,
    tests: true,
    prescriptions: true,
    vitalSigns: true,
  });

  const reportTypes = [
    { value: 'full', label: 'Тўлиқ ҳисобот' },
    { value: 'summary', label: 'Қисқача ҳисобот' },
    { value: 'medical', label: 'Тиббий тарих' },
    { value: 'visits', label: 'Ташрифлар' },
    { value: 'tests', label: 'Таҳлиллар' },
    { value: 'custom', label: 'Шахсий созланган' },
  ];

  const sections = [
    { key: 'generalInfo', label: 'Умумий маълумот' },
    { key: 'medicalHistory', label: 'Тиббий тарих' },
    { key: 'medications', label: 'Доимий дорилар' },
    { key: 'allergies', label: 'Аллергиялар' },
    { key: 'familyHistory', label: 'Оилавий тарих' },
    { key: 'visits', label: 'Ташрифлар' },
    { key: 'tests', label: 'Таҳлиллар' },
    { key: 'prescriptions', label: 'Рецептлар' },
    { key: 'vitalSigns', label: 'Витал белгилар' },
  ];

  const handleSectionToggle = (key: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleGenerateReport = (action: 'preview' | 'download' | 'print') => {
    // Mock report generation
    const reportData = {
      type: reportType,
      patient: { name: patientName, id: patientId },
      dateRange: { from: dateFrom, to: dateTo },
      sections: selectedSections,
      action,
    };

    console.log('Generating report:', reportData);

    if (action === 'preview') {
      // Open preview in new window/tab
      alert('Ҳисобот кўриниши очилмоқда...');
    } else if (action === 'download') {
      // Download PDF
      alert('Ҳисобот юкланмоқда...');
    } else if (action === 'print') {
      // Print
      alert('Чоп этиш ойнаси очилмоқда...');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold'>
            Бемор ҳисоботи
          </DialogTitle>
          <DialogDescription>
            {patientName} ({patientId}) учун ҳисобот тузиш
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Report Type */}
          <div className='grid gap-3'>
            <Label htmlFor='reportType' className='text-base font-semibold'>
              Ҳисобот тури
            </Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger id='reportType'>
                <SelectValue placeholder='Ҳисобот турини танланг' />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className='grid gap-3'>
            <Label className='text-base font-semibold'>Сана оралиғи</Label>
            <div className='grid grid-cols-2 gap-3'>
              <div className='grid gap-2'>
                <Label className='text-sm'>Бошланғич сана</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dateFrom ? (
                        format(dateFrom, 'PPP', { locale: uz })
                      ) : (
                        <span>Санани танланг</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      locale={uz}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='grid gap-2'>
                <Label className='text-sm'>Тугаш санаси</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {dateTo ? (
                        format(dateTo, 'PPP', { locale: uz })
                      ) : (
                        <span>Санани танланг</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      locale={uz}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Custom Sections */}
          {reportType === 'custom' && (
            <div className='grid gap-3'>
              <Label className='text-base font-semibold'>
                Қўшиладigan бўлимлар
              </Label>
              <Card className='p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {sections.map((section) => (
                    <div
                      key={section.key}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={section.key}
                        checked={
                          selectedSections[
                            section.key as keyof typeof selectedSections
                          ]
                        }
                        onCheckedChange={() => handleSectionToggle(section.key)}
                      />
                      <Label
                        htmlFor={section.key}
                        className='text-sm font-normal cursor-pointer'
                      >
                        {section.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Report Preview Info */}
          <Card className='bg-accent p-4'>
            <h4 className='font-semibold mb-2 flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              Ҳисобот маълумотлари
            </h4>
            <div className='space-y-1 text-sm text-muted-foreground'>
              <p>
                <span className='font-medium'>Бемор:</span> {patientName} (
                {patientId})
              </p>
              <p>
                <span className='font-medium'>Тури:</span>{' '}
                {reportTypes.find((t) => t.value === reportType)?.label}
              </p>
              {dateFrom && dateTo && (
                <p>
                  <span className='font-medium'>Даври:</span>{' '}
                  {format(dateFrom, 'dd.MM.yyyy')} -{' '}
                  {format(dateTo, 'dd.MM.yyyy')}
                </p>
              )}
              {reportType === 'custom' && (
                <p>
                  <span className='font-medium'>Танланган бўлимлар:</span>{' '}
                  {Object.values(selectedSections).filter(Boolean).length} та
                </p>
              )}
            </div>
          </Card>
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto'
          >
            Бекор қилиш
          </Button>
          <div className='flex gap-2 flex-1'>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleGenerateReport('preview')}
              className='flex-1'
            >
              <FileText className='w-4 h-4 mr-2' />
              Кўриш
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleGenerateReport('print')}
              className='flex-1'
            >
              <Printer className='w-4 h-4 mr-2' />
              Чоп этиш
            </Button>
            <Button
              type='button'
              onClick={() => handleGenerateReport('download')}
              className='gradient-primary flex-1'
            >
              <Download className='w-4 h-4 mr-2' />
              Юклаш
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientReportModal;
