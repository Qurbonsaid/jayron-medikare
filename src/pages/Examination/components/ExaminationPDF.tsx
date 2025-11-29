import { Button } from '@/components/ui/button';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import React from 'react';

// PDF uchun stillar (yarim list A5)
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 15,
    fontFamily: 'Helvetica',
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
    marginBottom: '1px',
  },
  signature: {
    marginTop: 8,
    borderTop: '1pt solid #000',
    paddingTop: 5,
    fontSize: 8,
  },
  // Flex asosida jadval stillari
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
  },
  tableCell: {
    fontSize: 6,
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
  fullWidth: {
    width: '100%',
    marginRight: 0,
  },
});

// Bitta retsept uchun PDF komponenti
interface PrescriptionPDFProps {
  exam: any;
  prescription: any;
  index: number;
}

const PrescriptionPDF: React.FC<PrescriptionPDFProps> = ({
  exam,
  prescription,
  index,
}) => {
  // Sana formatini o'zgartirish
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Diagnozni olish
  const getDiagnosis = (): string => {
    if (!exam.diagnosis) return "Ko'rsatilmagan";
    if (typeof exam.diagnosis === 'string') return exam.diagnosis;
    return exam.diagnosis.name;
  };

  // Dori nomini olish
  const getMedicationName = (medication: any): string => {
    if (typeof medication === 'string') return medication;
    return `${medication.name} ${medication.dosage}${
      medication.dosage_unit || ''
    }`;
  };

  return (
    <Document>
      <Page size='A5' style={styles.page}>
        {/* Sarlavha */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.clinicName}>Klinika "Jayron medservis"</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.documentTitle}>RETSEPT</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(exam.created_at)}</Text>
          </View>
        </View>

        {/* Bemor ma'lumotlari */}
        <View style={styles.patientInfo}>
          <Text style={styles.bold}>
            Bemor: {exam.patient_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Telefon: {exam.patient_id?.phone || "Ko'rsatilmagan"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Shifokor: {exam.doctor_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>Diagnoz: {getDiagnosis()}</Text>
        </View>

        {/* Retsept ma'lumotlari */}
        <View>
          <Text style={styles.sectionTitle}>Retsept #{index + 1}</Text>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Dori:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getMedicationName(prescription.medication_id)}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.bold}>Qabul qilish:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                Kuniga {prescription.frequency} marta
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text style={styles.bold}>Muddati:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {prescription.duration} kun
              </Text>
            </View>

            {prescription.instructions && (
              <View style={[styles.gridItem, styles.fullWidth]}>
                <Text style={styles.bold}>Qo'shimcha ko'rsatmalar:</Text>
                <Text
                  style={{ fontSize: 8, marginTop: 2, textAlign: 'justify' }}
                >
                  {prescription.instructions}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Imzo */}
        <View style={styles.signature}>
          <Text>
            Shifokor:  {exam.doctor_id?.fullname || ''}
          </Text>
          <Text style={{ marginTop: 3 }}>Imzo: _________</Text>
          <Text style={{ marginTop: 3, fontSize: 7 }}>
            Telefon: {exam.doctor_id?.phone || "Ko'rsatilmagan"} | Qabul
            kunlari: Dushanba-Shanba
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Barcha retseptlar uchun jadval ko'rinishida PDF komponenti
interface AllPrescriptionsPDFProps {
  exam: any;
  prescriptions: any[];
}

const AllPrescriptionsPDF: React.FC<AllPrescriptionsPDFProps> = ({
  exam,
  prescriptions,
}) => {
  // Sana formatini o'zgartirish
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Diagnozni olish
  const getDiagnosis = (): string => {
    if (!exam.diagnosis) return "Ko'rsatilmagan";
    if (typeof exam.diagnosis === 'string') return exam.diagnosis;
    return exam.diagnosis.name;
  };

  // Dori nomini olish
  const getMedicationName = (medication: any): string => {
    if (typeof medication === 'string') return medication;
    return `${medication.name} ${medication.dosage || ''}${
      medication.dosage_unit || ''
    }`.trim();
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Sarlavha */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.clinicName}>Klinika "Jayron medservis"</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.documentTitle}>RETSEPTLAR RO'YXATI</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(exam.created_at)}</Text>
          </View>
        </View>

        {/* Bemor ma'lumotlari */}
        <View style={styles.patientInfo}>
          <Text style={styles.bold}>
            Bemor: {exam.patient_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Telefon: {exam.patient_id?.phone || "Ko'rsatilmagan"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>Diagnoz: {getDiagnosis()}</Text>
        </View>

        {/* Retseptlar jadvali */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            Retseptlar ({prescriptions.length} ta)
          </Text>

          {/* Jadval sarlavhasi */}
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
            <View style={[styles.tableCol, { flex: 0.8 }]}>
              <Text style={styles.tableCell}>Dozasi</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Kuniga</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Muddati</Text>
            </View>
            <View style={[styles.tableColLast, { flex: 1.2 }]}>
              <Text style={styles.tableCell}>Ko'rsatmalar</Text>
            </View>
          </View>

          {/* Jadval qatorlari */}
          {prescriptions.map((prescription: any, index: number) => {
            const medication = prescription.medication_id;
            const medicationName =
              typeof medication === 'object' && medication
                ? medication.name
                : "Noma'lum";
            const dosage =
              typeof medication === 'object' && medication
                ? `${medication.dosage || ''} ${
                    medication.dosage_unit || ''
                  }`.trim()
                : '';

            return (
              <View
                key={prescription._id || index}
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
                  <Text style={styles.tableCell}>{index + 1}</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.5 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {medicationName}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.8 }]}>
                  <Text style={styles.tableCell}>{dosage || '-'}</Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>
                    {prescription.frequency} marta
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>
                    {prescription.duration} kun
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 1.2 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 5 },
                    ]}
                  >
                    {prescription.instructions || '-'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Imzo */}
        <View style={styles.signature}>
          <Text>
            Shifokor: {exam.doctor_id?.fullname || '_________________________'}
          </Text>
          <Text style={{ marginTop: 3 }}>Imzo: _________</Text>
          <Text style={{ marginTop: 3, fontSize: 7 }}>
            Telefon: {exam.doctor_id?.phone || "Ko'rsatilmagan"} | Qabul
            kunlari: Dushanba-Shanba
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Ko'rik umumiy ma'lumotlari uchun PDF komponenti
interface ExaminationInfoPDFProps {
  exam: any;
}

const ExaminationInfoPDF: React.FC<ExaminationInfoPDFProps> = ({ exam }) => {
  // Sana formatini o'zgartirish
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Diagnozni olish
  const getDiagnosis = (): string => {
    if (!exam.diagnosis) return "Ko'rsatilmagan";
    if (typeof exam.diagnosis === 'string') return exam.diagnosis;
    return exam.diagnosis.name;
  };

  // Ko'rik turini olish
  const getTreatmentType = (): string => {
    const types: Record<string, string> = {
      stasionar: 'Statsionar',
      ambulator: 'Ambulator',
    };
    return (
      types[exam.treatment_type] || exam.treatment_type || "Ko'rsatilmagan"
    );
  };

  // Statusni olish
  const getStatus = (): string => {
    const statuses: Record<string, string> = {
      pending: 'Kutilmoqda',
      active: 'Faol',
      completed: 'Yakunlangan',
    };
    return statuses[exam.status] || exam.status || "Ko'rsatilmagan";
  };

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Sarlavha */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.clinicName}>Klinika "Jayron medservis"</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.documentTitle}>KO'RIK MA'LUMOTLARI</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>{formatDate(exam.created_at)}</Text>
          </View>
        </View>

        {/* Bemor ma'lumotlari */}
        <View style={styles.patientInfo}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
            BEMOR MA'LUMOTLARI
          </Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>F.I.O:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.fullname || "Noma`lum"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Telefon:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.phone || "Ko`rsatilmagan"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Tug'ilgan sana:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.birth_date
                  ? formatDate(exam.patient_id.birth_date)
                  : "Ko`rsatilmagan"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Manzil:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.address || "Ko`rsatilmagan"}
              </Text>
            </View>
          </View>
        </View>

        {/* Shifokor ma'lumotlari */}
        <View style={[styles.patientInfo, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
            SHIFOKOR MA'LUMOTLARI
          </Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>F.I.O:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.doctor_id?.fullname || "Noma`lum"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Telefon:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.doctor_id?.phone || "Ko`rsatilmagan"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Mutaxassislik:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.doctor_id?.specialization || "Ko`rsatilmagan"}
              </Text>
            </View>
          </View>
        </View>

        {/* Ko'rik ma'lumotlari */}
        <View style={[styles.patientInfo, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
            KO'RIK MA'LUMOTLARI
          </Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Ko'rik sanasi:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {formatDate(exam.created_at)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Ko'rik turi:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getTreatmentType()}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Holati:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>{getStatus()}</Text>
            </View>
          </View>

          <View style={[styles.gridItem, styles.fullWidth, { marginTop: 8 }]}>
            <Text style={styles.bold}>Shikoyat:</Text>
            <Text
              style={{
                fontSize: 9,
                marginTop: 2,
                textAlign: 'justify',
                lineHeight: 1.4,
              }}
            >
              {exam.complaints || "Ko``rsatilmagan"}
            </Text>
          </View>

          <View style={[styles.gridItem, styles.fullWidth, { marginTop: 8 }]}>
            <Text style={styles.bold}>Diagnoz:</Text>
            <Text
              style={{
                fontSize: 9,
                marginTop: 2,
                textAlign: 'justify',
                lineHeight: 1.4,
              }}
            >
              {getDiagnosis()}
            </Text>
          </View>

          <View style={[styles.gridItem, styles.fullWidth, { marginTop: 8 }]}>
            <Text style={styles.bold}>Tavsiya:</Text>
            <Text
              style={{
                fontSize: 9,
                marginTop: 2,
                textAlign: 'justify',
                lineHeight: 1.4,
              }}
            >
              {exam.description || "Ko`rsatilmagan"}
            </Text>
          </View>
        </View>

        {/* Xonalar ma'lumotlari (agar mavjud bo'lsa) */}
        {exam.rooms && exam.rooms.length > 0 && (
          <View style={[styles.patientInfo, { marginTop: 8 }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
              XONALAR MA'LUMOTLARI
            </Text>
            {exam.rooms.map((room: any, index: number) => (
              <View
                key={room._id || index}
                style={{
                  marginBottom: 6,
                  paddingBottom: 4,
                  borderBottomWidth: index < exam.rooms.length - 1 ? 1 : 0,
                  borderBottomColor: '#e0e0e0',
                  borderBottomStyle: 'solid',
                }}
              >
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Xona nomi:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.room_name || "Noma`lum"}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Qavat:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.floor_number || "Noma`lum"}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Narxi:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.room_price
                        ? `${room.room_price.toLocaleString()} so'm`
                        : "Noma`lum"}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Muddati:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.start_date
                        ? formatDate(room.start_date)
                        : "Noma`lum"}
                      {room.end_date && ` - ${formatDate(room.end_date)}`}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Xizmatlar (agar mavjud bo'lsa) */}
        {exam.services && exam.services.length > 0 && (
          <View style={[styles.tableContainer, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>
              XIZMATLAR ({exam.services.length} ta)
            </Text>

            {/* Jadval sarlavhasi */}
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
                <Text style={styles.tableCell}>Xizmat nomi</Text>
              </View>
              <View style={[styles.tableCol, { flex: 0.6 }]}>
                <Text style={styles.tableCell}>Miqdor</Text>
              </View>
              <View style={[styles.tableCol, { flex: 0.8 }]}>
                <Text style={styles.tableCell}>Narxi</Text>
              </View>
              <View style={[styles.tableColLast, { flex: 0.8 }]}>
                <Text style={styles.tableCell}>Holati</Text>
              </View>
            </View>

            {/* Jadval qatorlari */}
            {exam.services.map((service: any, index: number) => {
              const serviceName =
                typeof service.service_type_id === 'object' &&
                service.service_type_id
                  ? service.service_type_id.name
                  : "Noma`lum";
              const serviceStatus: Record<string, string> = {
                pending: 'Kutilmoqda',
                active: 'Faol',
                completed: 'Yakunlangan',
              };

              return (
                <View
                  key={service._id || index}
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
                    <Text style={styles.tableCell}>{index + 1}</Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 1.5 }]}>
                    <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                      {serviceName}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.6 }]}>
                    <Text style={styles.tableCell}>{service.quantity}</Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.8 }]}>
                    <Text style={styles.tableCell}>
                      {service.price?.toLocaleString() || '-'} so'm
                    </Text>
                  </View>
                  <View style={[styles.tableColLast, { flex: 0.8 }]}>
                    <Text style={styles.tableCell}>
                      {serviceStatus[service.status] || service.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Imzo */}
        <View style={styles.signature}>
          <Text>
            Shifokor: {exam.doctor_id?.fullname || '_________________________'}
          </Text>
          <Text style={{ marginTop: 3 }}>Imzo: _________</Text>
          <Text style={{ marginTop: 3, fontSize: 7 }}>
            Telefon: {exam.doctor_id?.phone || "Ko'rsatilmagan"} | Qabul
            kunlari: Dushanba-Shanba
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Ko'rik umumiy ma'lumotlarini PDF yuklab olish komponenti
interface ExaminationInfoDownloadButtonProps {
  exam: any;
}

const ExaminationInfoDownloadButton: React.FC<
  ExaminationInfoDownloadButtonProps
> = ({ exam }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownloadExaminationInfo = async () => {
    try {
      setIsGenerating(true);

      const blob = await pdf(<ExaminationInfoPDF exam={exam} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Fayl nomini yaratish
      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Korik_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      alert(
        "Ko'rik ma'lumotlarini yuklab olishda xatolik yuz berdi. Iltimos, qaytadan urinib koʼring."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownloadExaminationInfo}
      disabled={isGenerating}
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isGenerating ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
    </Button>
  );
};

// Barcha retseptlar uchun PDF yuklab olish komponenti
interface AllPrescriptionsDownloadButtonProps {
  exam: any;
}

const AllPrescriptionsDownloadButton: React.FC<
  AllPrescriptionsDownloadButtonProps
> = ({ exam }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownloadAllPrescriptions = async () => {
    if (!exam.prescriptions || exam.prescriptions.length === 0) {
      alert('Retseptlar mavjud emas');
      return;
    }

    try {
      setIsGenerating(true);

      const blob = await pdf(
        <AllPrescriptionsPDF exam={exam} prescriptions={exam.prescriptions} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Fayl nomini yaratish
      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Retseptlar_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      alert(
        'Retseptlar yuklab olishda xatolik yuz berdi. Iltimos, qaytadan urinib koʼring.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownloadAllPrescriptions}
      disabled={
        isGenerating || !exam.prescriptions || exam.prescriptions.length === 0
      }
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isGenerating ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
    </Button>
  );
};

export { AllPrescriptionsDownloadButton, ExaminationInfoDownloadButton };
export default AllPrescriptionsDownloadButton;
