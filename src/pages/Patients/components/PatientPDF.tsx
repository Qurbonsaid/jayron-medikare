import { Button } from '@/components/ui/button';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
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

// PDF uchun stillar
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottom: '2pt solid #000',
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    textAlign: 'right',
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    padding: 8,
  },
  section: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1pt solid #ccc',
    paddingBottom: 4,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '35%',
    fontWeight: 'bold',
    color: '#555',
  },
  value: {
    width: '65%',
    color: '#000',
  },
  fullRow: {
    marginBottom: 4,
  },
  alertBox: {
    backgroundColor: '#fee2e2',
    borderLeft: '4pt solid #ef4444',
    padding: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderLeft: '4pt solid #0284c7',
    padding: 8,
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1pt solid #ccc',
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    marginBottom: 6,
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
          <Text style={{ fontSize: 8, color: '#666' }}>
            Tibbiy axborot tizimi
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={{ fontSize: 9 }}>Sana: {formatDate(new Date())}</Text>
        </View>
      </View>

      {/* Hujjat sarlavhasi */}
      <Text style={styles.documentTitle}>BEMOR MA'LUMOTLARI</Text>

      {/* Asosiy ma'lumotlar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shaxsiy ma'lumotlar</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>To'liq ismi:</Text>
              <Text style={styles.value}>{patient.fullname || "Noma'lum"}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Bemor ID:</Text>
              <Text style={styles.value}>
                {patient.patient_id || "Ko'rsatilmagan"}
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Tug'ilgan sana:</Text>
              <Text style={styles.value}>
                {formatDate(patient.date_of_birth)}
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Jinsi:</Text>
              <Text style={styles.value}>
                {patient.gender === 'male' ? 'Erkak' : 'Ayol'}
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Telefon:</Text>
              <Text style={styles.value}>
                {patient.phone || "Ko'rsatilmagan"}
              </Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>
                {patient.email || "Ko'rsatilmagan"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.fullRow}>
          <View style={styles.row}>
            <Text style={styles.label}>Manzil:</Text>
            <Text style={styles.value}>
              {patient.address || "Ko'rsatilmagan"}
            </Text>
          </View>
        </View>
      </View>

      {/* Allergiyalar */}
      {patient.allergies && patient.allergies.length > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>⚠ ALLERGIYALAR</Text>
          <Text>{patient.allergies.join(', ')}</Text>
        </View>
      )}

      {/* Diagnoz */}
      {patient.diagnosis && (
        <View style={styles.infoBox}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Diagnoz:</Text>
          {patient.diagnosis.diagnosis_id?.name && (
            <Text>
              {patient.diagnosis.diagnosis_id.name}
              {patient.diagnosis.diagnosis_id.code &&
                ` (${patient.diagnosis.diagnosis_id.code})`}
            </Text>
          )}
          {patient.diagnosis.description && (
            <Text style={{ marginTop: 2 }}>
              {patient.diagnosis.description}
            </Text>
          )}
          {patient.diagnosis.doctor_id?.fullname && (
            <Text style={{ fontSize: 8, marginTop: 4, color: '#666' }}>
              Shifokor: {patient.diagnosis.doctor_id.fullname}
            </Text>
          )}
        </View>
      )}

      {/* Dorimiy dorilar */}
      {patient.regular_medications &&
        patient.regular_medications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doimiy dorilar</Text>
            {patient.regular_medications.map((med: any, idx: number) => (
              <View key={med._id || idx} style={{ marginBottom: 4 }}>
                <Text>
                  {idx + 1}. {med.medicine} - {med.schedule}
                </Text>
              </View>
            ))}
          </View>
        )}

      {/* Ro'yxatga olish ma'lumotlari */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ro'yxatga olish</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Ro'yxatdan o'tgan:</Text>
              <Text style={styles.value}>{formatDate(patient.created_at)}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <View style={styles.row}>
              <Text style={styles.label}>Oxirgi yangilanish:</Text>
              <Text style={styles.value}>{formatDate(patient.updated_at)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ko'riklar soni */}
      {exams && exams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ko'riklar tarixi ({exams.length} ta)
          </Text>
          {exams.slice(0, 5).map((exam: any, idx: number) => (
            <View
              key={exam._id || idx}
              style={{
                marginBottom: 6,
                paddingBottom: 6,
                borderBottom:
                  idx < Math.min(exams.length, 5) - 1
                    ? '1pt solid #eee'
                    : 'none',
              }}
            >
              <View style={styles.row}>
                <Text style={{ fontWeight: 'bold', width: '20%' }}>
                  #{idx + 1}
                </Text>
                <Text style={{ width: '30%' }}>
                  {formatDate(exam.created_at)}
                </Text>
                <Text style={{ width: '50%' }}>
                  Shifokor: {exam.doctor_id?.fullname || "Noma'lum"}
                </Text>
              </View>
              {exam.diagnosis && (
                <Text style={{ fontSize: 9, color: '#666', marginLeft: 10 }}>
                  Diagnoz:{' '}
                  {typeof exam.diagnosis === 'string'
                    ? exam.diagnosis
                    : exam.diagnosis.diagnosis_id?.name ||
                      exam.diagnosis.description ||
                      '-'}
                </Text>
              )}
            </View>
          ))}
          {exams.length > 5 && (
            <Text style={{ fontSize: 8, color: '#666', textAlign: 'center' }}>
              ... va yana {exams.length - 5} ta ko'rik
            </Text>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Ushbu hujjat avtomatik tarzda tuzilgan | {new Date().getFullYear()}{' '}
          Jayron MediKare
        </Text>
      </View>
    </Page>
  </Document>
)

// PDF yuklab olish tugmasi komponenti
interface PatientPDFButtonProps {
  patient: any;
  exams?: any[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const PatientPDFButton: React.FC<PatientPDFButtonProps> = ({
  patient,
  exams = [],
  variant = 'outline',
  size = 'sm',
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { t } = useTranslation('common');

  const handleDownload = async () => {
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

      // Fayl nomini yaratish
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
    <Button
      variant={variant}
      size={size}
      className={`flex-1 sm:flex-none ${className}`}
      onClick={handleDownload}
      disabled={isGenerating}
    >
      <Download className='w-4 h-4 sm:mr-2' />
      <span className='hidden sm:inline'>
        {isGenerating ? t('loadingText') : t('downloadPdf')}
      </span>
    </Button>
  );
};

export default PatientPDFButton;
