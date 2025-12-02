import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Document,
  Font,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

// Kirill harflarini qo'llab-quvvatlovchi shriftni ro'yxatdan o'tkazish
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

// PDF uchun stillar (ExaminationPDF bilan bir xil)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottom: '1pt solid #000',
    paddingBottom: 3,
    width: '100%',
  },
  headerLeft: {
    flex: 1,
    textAlign: 'left',
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    textAlign: 'right',
  },
  clinicName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  documentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 9,
  },
  patientInfo: {
    marginBottom: 6,
    padding: 3,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    backgroundColor: '#e9ecef',
    padding: 2,
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 1,
  },
  signature: {
    marginTop: 8,
    paddingTop: 5,
    fontSize: 8,
  },
  tableContainer: {
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    alignItems: 'center',
    minHeight: 16,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableCol: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
  },
  tableColLast: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
  },
  tableCell: {
    fontSize: 7,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  gridItem: {
    width: '48%',
    marginBottom: 4,
    marginRight: '2%',
  },
  alertBox: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    borderLeftStyle: 'solid',
    padding: 4,
    marginBottom: 5,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    borderLeftStyle: 'solid',
    padding: 4,
    marginBottom: 5,
  },
});

// Sana formatini o'zgartirish
const formatDate = (date: Date | string): string => {
  if (!date) return "Ko'rsatilmagan";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// PDF hujjat komponenti
interface PatientPDFDocumentProps {
  patient: any;
  exams?: any[];
}

const PatientPDFDocument: React.FC<PatientPDFDocumentProps> = ({
  patient,
  exams = [],
}) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Sarlavha */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.clinicName}>Klinika "Jayron medservis"</Text>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.documentTitle}>BEMOR MA'LUMOTLARI</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
        </View>
      </View>

      {/* Bemor asosiy ma'lumotlari */}
      <View style={styles.patientInfo}>
        {/* To'liq ism - kattaroq va alohida qator */}
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
          {patient.fullname || "Noma'lum"}
        </Text>

        {/* Qisqa ma'lumotlar - bir qatorda */}
        <View
          style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 }}
        >
          <Text style={{ width: '25%', fontSize: 8 }}>
            ID: {patient.patient_id || '-'}
          </Text>
          <Text style={{ width: '25%', fontSize: 8 }}>
            Tug'ilgan: {formatDate(patient.date_of_birth)}
          </Text>
          <Text style={{ width: '25%', fontSize: 8 }}>
            Jinsi: {patient.gender === 'male' ? 'Erkak' : 'Ayol'}
          </Text>
          <Text style={{ width: '25%', fontSize: 8 }}>
            Email: {patient.email || '-'}
          </Text>
        </View>

        {/* Telefon va manzil */}
        <Text style={{ marginBottom: 1 }}>
          Telefon: {patient.phone || "Ko'rsatilmagan"}
        </Text>
        <Text>Manzil: {patient.address || "Ko'rsatilmagan"}</Text>
      </View>

      {/* Allergiyalar */}
      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={[styles.bold, { color: '#dc2626' }]}>ALLERGIYALAR:</Text>
          <Text>{patient.allergies.join(', ')}</Text>
        </View>
      )}

      {/* Diagnoz - faqat shifokor va diagnoz bo'lsa ko'rsatiladi */}
      {patient.diagnosis &&
        (patient.diagnosis.doctor_id?.fullname ||
          patient.diagnosis.diagnosis_id?.name) && (
          <View style={styles.infoBox}>
            <Text style={styles.bold}>Hozirgi diagnoz:</Text>
            {patient.diagnosis.diagnosis_id?.name && (
              <Text>
                {patient.diagnosis.diagnosis_id.name}
                {patient.diagnosis.diagnosis_id.code &&
                  ` (${patient.diagnosis.diagnosis_id.code})`}
              </Text>
            )}
            {patient.diagnosis.doctor_id?.fullname && (
              <Text style={{ fontSize: 8, marginTop: 2 }}>
                Shifokor: {patient.diagnosis.doctor_id.fullname}
              </Text>
            )}
          </View>
        )}

      {/* Doimiy dorilar */}
      {patient.regular_medications &&
        patient.regular_medications.length > 0 && (
          <View style={styles.tableContainer}>
            <Text style={styles.sectionTitle}>
              Doimiy dorilar ({patient.regular_medications.length} ta)
            </Text>
            <View
              style={[
                styles.tableRow,
                styles.tableHeader,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#000',
                  borderTopStyle: 'solid',
                  borderLeftWidth: 1,
                  borderLeftColor: '#000',
                  borderLeftStyle: 'solid',
                },
              ]}
            >
              <View style={[styles.tableCol, { flex: 0.3 }]}>
                <Text style={styles.tableCell}>#</Text>
              </View>
              <View style={[styles.tableCol, { flex: 1.5 }]}>
                <Text style={styles.tableCell}>Dori nomi</Text>
              </View>
              <View style={[styles.tableColLast, { flex: 1.2 }]}>
                <Text style={styles.tableCell}>Qabul tartibi</Text>
              </View>
            </View>
            {patient.regular_medications.map((med: any, idx: number) => (
              <View
                key={med._id || idx}
                style={[
                  styles.tableRow,
                  {
                    borderLeftWidth: 1,
                    borderLeftColor: '#000',
                    borderLeftStyle: 'solid',
                  },
                ]}
              >
                <View style={[styles.tableCol, { flex: 0.3 }]}>
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.5 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {med.medicine}
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 1.2 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {med.schedule}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

      {/* Ro'yxatga olish ma'lumotlari */}
      <View style={styles.patientInfo}>
        <Text style={styles.bold}>Ro'yxatga olish:</Text>
        <Text style={{ marginBottom: 1 }}>
          Ro'yxatdan o'tgan: {formatDate(patient.created_at)}
        </Text>
        <Text>Oxirgi yangilanish: {formatDate(patient.updated_at)}</Text>
      </View>

      {/* Ko'riklar jadvali */}
      {exams && exams.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            Ko'riklar tarixi ({exams.length} ta)
          </Text>
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              {
                borderTopWidth: 1,
                borderTopColor: '#000',
                borderTopStyle: 'solid',
                borderLeftWidth: 1,
                borderLeftColor: '#000',
                borderLeftStyle: 'solid',
              },
            ]}
          >
            <View style={[styles.tableCol, { flex: 0.3 }]}>
              <Text style={styles.tableCell}>#</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.8 }]}>
              <Text style={styles.tableCell}>Sana</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.2 }]}>
              <Text style={styles.tableCell}>Shifokor</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Holat</Text>
            </View>
            <View style={[styles.tableColLast, { flex: 1.5 }]}>
              <Text style={styles.tableCell}>Diagnoz</Text>
            </View>
          </View>
          {exams.slice(0, 10).map((exam: any, idx: number) => {
            const getDiagnosis = () => {
              if (!exam.diagnosis) return '-';
              if (typeof exam.diagnosis === 'string') return exam.diagnosis;
              return (
                exam.diagnosis.diagnosis_id?.name ||
                exam.diagnosis.description ||
                '-'
              );
            };
            const getStatus = () => {
              const statuses: Record<string, string> = {
                completed: 'Tugallangan',
                active: 'Faol',
                inactive: 'Faol emas',
              };
              return statuses[exam.status] || exam.status || '-';
            };
            return (
              <View
                key={exam._id || idx}
                style={[
                  styles.tableRow,
                  {
                    borderLeftWidth: 1,
                    borderLeftColor: '#000',
                    borderLeftStyle: 'solid',
                  },
                ]}
              >
                <View style={[styles.tableCol, { flex: 0.3 }]}>
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.8 }]}>
                  <Text style={styles.tableCell}>
                    {formatDate(exam.created_at)}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {exam.doctor_id?.fullname || "Noma'lum"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>{getStatus()}</Text>
                </View>
                <View style={[styles.tableColLast, { flex: 1.5 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 6 },
                    ]}
                  >
                    {getDiagnosis()}
                  </Text>
                </View>
              </View>
            );
          })}
          {exams.length > 10 && (
            <Text style={{ fontSize: 7, textAlign: 'center', marginTop: 2 }}>
              ... va yana {exams.length - 10} ta ko'rik
            </Text>
          )}
        </View>
      )}

      {/* Imzo */}
      <View style={styles.signature}>
        <Text>Ushbu hujjat avtomatik tarzda tuzilgan</Text>
        <Text style={{ marginTop: 2 }}>
          {new Date().getFullYear()} Jayron MediKare
        </Text>
      </View>
    </Page>
  </Document>
);

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
  const [isGenerating, setIsGenerating] = React.useState(false);

  const generatePDF = async () => {
    if (!patient) {
      toast.error("Bemor ma'lumotlari topilmadi");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading('PDF tayyorlanmoqda...');

      const blob = await pdf(
        <PatientPDFDocument patient={patient} exams={exams} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const patientName = patient.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Bemor_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF muvaffaqiyatli yuklandi!');
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      toast.dismiss();
      toast.error('PDF yaratishda xatolik yuz berdi');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Bemor ma'lumotlari - PDF</DialogTitle>
        </DialogHeader>

        <div className='py-4 text-center'>
          <p className='text-muted-foreground mb-4'>
            {patient?.fullname || 'Bemor'} uchun PDF hujjat yaratish
          </p>
          <p className='text-sm text-muted-foreground'>
            Hujjatda bemor shaxsiy ma'lumotlari, allergiyalar, diagnoz, doimiy
            dorilar va ko'riklar tarixi mavjud bo'ladi.
          </p>
        </div>

        <DialogFooter className='gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Yopish
          </Button>
          <Button
            onClick={generatePDF}
            className='gradient-primary'
            disabled={isGenerating}
          >
            <Download className='w-4 h-4 mr-2' />
            {isGenerating ? 'Yuklanmoqda...' : 'PDF yuklash'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientPDFModal;
