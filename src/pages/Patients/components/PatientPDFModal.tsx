import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Printer } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

interface PatientPDFModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: any;
  exams?: any[];
}

const PatientPDFModal = ({
  open,
  onOpenChange,
  patient,
  exams = [],
}: PatientPDFModalProps) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!pdfRef.current) return;

    try {
      toast.loading('PDF тайёрланмоқда...');

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      // Download PDF
      pdf.save(`${patient.fullname}_malumotlari.pdf`);
      toast.dismiss();
      toast.success('PDF муваффақиятли юкланди!');
    } catch (error) {
      toast.dismiss();
      toast.error('PDF яратишда хато юз берди');
      console.error('PDF generation error:', error);
    }
  };

  const handlePrint = () => {
    if (!pdfRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Чоп этиш учун popup ochishga ruxsat bering');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${patient.fullname} - Бемор маълумотлари</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              line-height: 1.6;
            }
            @media print {
              body {
                padding: 10mm;
              }
            }
          </style>
        </head>
        <body>
          ${pdfRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Бемор маълумотлари - PDF кўриниши</DialogTitle>
        </DialogHeader>

        <div
          ref={pdfRef}
          className='bg-white p-8 space-y-6'
          style={{ color: '#000' }}
        >
          {/* Header */}
          <div className='text-center border-b-2 border-gray-800 pb-4'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              БЕМОР МАЪЛУМОТЛАРИ
            </h1>
            <p className='text-sm text-gray-600'>
              Тайёрланган сана: {new Date().toLocaleDateString('uz-UZ')}
            </p>
          </div>

          {/* Patient Basic Info */}
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
              Асосий маълумотлар
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Тўлиқ исми:</p>
                <p className='font-semibold text-gray-800'>
                  {patient.fullname}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Бемор ID:</p>
                <p className='font-semibold text-gray-800'>
                  {patient.patient_id}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Туғилган сана:</p>
                <p className='font-semibold text-gray-800'>
                  {new Date(patient.date_of_birth).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Жинси:</p>
                <p className='font-semibold text-gray-800'>
                  {patient.gender === 'male' ? 'Эркак' : 'Аёл'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Телефон:</p>
                <p className='font-semibold text-gray-800'>{patient.phone}</p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Email:</p>
                <p className='font-semibold text-gray-800 break-all'>
                  {patient.email || 'Кўрсатилмаган'}
                </p>
              </div>
              <div className='col-span-2'>
                <p className='text-sm text-gray-600 mb-1'>Манзил:</p>
                <p className='font-semibold text-gray-800'>{patient.address}</p>
              </div>
            </div>
          </div>

          {/* Passport Info */}
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
              Паспорт маълумотлари
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Паспорт серияси:</p>
                <p className='font-semibold text-gray-800'>
                  {patient.passport.series}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Паспорт рақами:</p>
                <p className='font-semibold text-gray-800'>
                  {patient.passport.number}
                </p>
              </div>
            </div>
          </div>

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-red-600 border-b border-red-300 pb-2'>
                ⚠️ АЛЛЕРГИЯЛАР
              </h2>
              <div className='bg-red-50 border-2 border-red-400 rounded p-4'>
                <p className='font-semibold text-red-800 text-lg'>
                  {patient.allergies.join(', ')}
                </p>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          {patient.diagnosis && (
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
                Диагноз
              </h2>
              <div className='bg-blue-50 border-l-4 border-blue-500 rounded p-4'>
                {patient.diagnosis.diagnosis_id?.name && (
                  <p className='font-bold text-gray-800 mb-1'>
                    {patient.diagnosis.diagnosis_id.name}
                    {patient.diagnosis.diagnosis_id.code && (
                      <span className='text-sm text-gray-600 ml-2'>
                        ({patient.diagnosis.diagnosis_id.code})
                      </span>
                    )}
                  </p>
                )}
                {patient.diagnosis.description && (
                  <p className='font-medium text-gray-800 mb-2'>
                    {patient.diagnosis.description}
                  </p>
                )}
                {patient.diagnosis.diagnosis_id?.description && (
                  <p className='text-sm text-gray-600 mb-2'>
                    {patient.diagnosis.diagnosis_id.description}
                  </p>
                )}
                {patient.diagnosis.doctor_id?.fullname && (
                  <p className='text-sm text-gray-600'>
                    Шифокор: {patient.diagnosis.doctor_id.fullname}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Regular Medications */}
          {patient.regular_medications &&
            patient.regular_medications.length > 0 && (
              <div className='space-y-4'>
                <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
                  Доимий дорилар
                </h2>
                <div className='space-y-3'>
                  {patient.regular_medications.map((med: any, idx: number) => (
                    <div
                      key={med._id || idx}
                      className='bg-gray-50 border border-gray-300 rounded p-3'
                    >
                      <p className='font-semibold text-gray-800'>
                        {idx + 1}. {med.medicine}
                      </p>
                      <p className='text-sm text-gray-600 mt-1'>
                        {med.schedule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Registration Info */}
          <div className='space-y-4'>
            <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
              Рўйхатга олиш маълумотлари
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>
                  Рўйхатдан ўтган сана:
                </p>
                <p className='font-semibold text-gray-800'>
                  {new Date(patient.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-600 mb-1'>
                  Охирги янгиланган сана:
                </p>
                <p className='font-semibold text-gray-800'>
                  {new Date(patient.updated_at).toLocaleString('uz-UZ')}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Visits/Examinations */}
          {exams && exams.length > 0 && (
            <div className='space-y-4'>
              <h2 className='text-xl font-bold text-gray-800 border-b border-gray-300 pb-2'>
                Кўриклар тарихи ({exams.length} та)
              </h2>
              <div className='space-y-3'>
                {exams.map((exam: any, idx: number) => (
                  <div
                    key={exam._id || idx}
                    className='bg-gray-50 border border-gray-300 rounded p-4'
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <p className='font-bold text-gray-800 text-lg'>
                          Кўрик #{idx + 1}
                        </p>
                        <p className='text-sm text-gray-600'>
                          {new Date(exam.created_at).toLocaleDateString(
                            'uz-UZ'
                          )}
                        </p>
                      </div>
                      <div className='text-right'>
                        <span
                          className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                            exam.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : exam.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : exam.status === 'inactive'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {exam.status === 'completed'
                            ? 'Тугалланган'
                            : exam.status === 'active'
                            ? 'Фаол'
                            : exam.status === 'inactive'
                            ? 'Фаол эмас'
                            : 'Ўчирилган'}
                        </span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>Шифокор:</p>
                          <p className='font-semibold text-gray-800'>
                            {exam.doctor_id?.fullname || 'Номаълум'}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>Бўлим:</p>
                          <p className='font-semibold text-gray-800'>
                            {exam.doctor_id?.section || '-'}
                          </p>
                        </div>
                      </div>

                      {exam.complaints && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>
                            Шикоятлар:
                          </p>
                          <p className='text-sm text-gray-800 bg-white p-2 rounded border border-gray-200'>
                            {exam.complaints}
                          </p>
                        </div>
                      )}

                      {exam.physical_examination && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>
                            Физик кўрик:
                          </p>
                          <p className='text-sm text-gray-800 bg-white p-2 rounded border border-gray-200'>
                            {exam.physical_examination}
                          </p>
                        </div>
                      )}

                      {exam.diagnosis && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>Диагноз:</p>
                          <p className='text-sm text-gray-800 bg-blue-50 p-2 rounded border border-blue-200 font-medium'>
                            {typeof exam.diagnosis === 'string'
                              ? exam.diagnosis
                              : exam.diagnosis.diagnosis_id?.name
                              ? `${exam.diagnosis.diagnosis_id.name}${exam.diagnosis.diagnosis_id.code ? ` (${exam.diagnosis.diagnosis_id.code})` : ''}`
                              : exam.diagnosis.description || 'Диагноз белгиланмаган'}
                          </p>
                        </div>
                      )}

                      {exam.treatment_plan && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>
                            Даволаш режаси:
                          </p>
                          <p className='text-sm text-gray-800 bg-white p-2 rounded border border-gray-200'>
                            {exam.treatment_plan}
                          </p>
                        </div>
                      )}

                      {exam.notes && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>
                            Қўшимча эслатмалар:
                          </p>
                          <p className='text-sm text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200'>
                            {exam.notes}
                          </p>
                        </div>
                      )}

                      {exam.prescriptions && exam.prescriptions.length > 0 && (
                        <div>
                          <p className='text-xs text-gray-600 mb-1'>
                            Рецептлар:
                          </p>
                          <div className='bg-white p-2 rounded border border-gray-200 space-y-1'>
                            {exam.prescriptions.map(
                              (prescription: any, pIdx: number) => (
                                <div
                                  key={pIdx}
                                  className='text-sm text-gray-800 flex items-start gap-2'
                                >
                                  <span className='text-blue-600 font-bold'>
                                    •
                                  </span>
                                  <span>
                                    {prescription.medicine || prescription.name}{' '}
                                    {prescription.dosage &&
                                      `- ${prescription.dosage}`}
                                    {prescription.frequency &&
                                      ` (${prescription.frequency})`}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='text-center text-sm text-gray-500 pt-6 border-t border-gray-300'>
            <p>Ушбу ҳужжат автоматик тарзда тузилган</p>
            <p className='mt-1'>© {new Date().getFullYear()} Jayron MediKare</p>
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Ёпиш
          </Button>
          <Button variant='outline' onClick={handlePrint}>
            <Printer className='w-4 h-4 mr-2' />
            Чоп этиш
          </Button>
          <Button onClick={generatePDF} className='gradient-primary'>
            <Download className='w-4 h-4 mr-2' />
            PDF юклаш
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientPDFModal;
