import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
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

// Telefon raqamini +998 91 123 45 67 formatiga o'zgartirish
const formatPhone = (phone: string | undefined): string => {
  if (!phone) return "Ko'rsatilmagan";
  // Faqat raqamlarni olish
  const digits = phone.replace(/\D/g, '');
  // 998 bilan boshlanmasa, 998 qo'shish
  const fullNumber = digits.startsWith('998') ? digits : `998${digits}`;
  // Agar 12 ta raqam bo'lsa formatlash
  if (fullNumber.length === 12) {
    return `+${fullNumber.slice(0, 3)} ${fullNumber.slice(
      3,
      5
    )} ${fullNumber.slice(5, 8)} ${fullNumber.slice(8, 10)} ${fullNumber.slice(
      10,
      12
    )}`;
  }
  // Aks holda asl qiymatni qaytarish
  return phone;
};

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

// PDF uchun stillar (yarim list A5)
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
    marginBottom: '1px',
  },
  signature: {
    marginTop: 8,
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
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderRightStyle: 'solid',
  },
  tableCell: {
    fontSize: 8,
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

// Barcha retseptlar uchun jadval ko'rinishida PDF komponenti
interface AllPrescriptionsPDFProps {
  exam: any;
  prescriptions: any[];
}

const AllPrescriptionsPDF: React.FC<AllPrescriptionsPDFProps> = ({
  exam,
  prescriptions: propPrescriptions,
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

  // Flatten prescriptions if they contain items arrays
  let prescriptions = propPrescriptions || [];
  if (prescriptions.length > 0 && prescriptions[0]?.items) {
    prescriptions = prescriptions.flatMap((presc: any) => presc.items || []);
  }

  // Also check exam.prescription.items as fallback
  if (prescriptions.length === 0 && exam.prescription?.items) {
    prescriptions = exam.prescription.items;
  }

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
            Telefon: {formatPhone(exam.patient_id?.phone)}
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
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={styles.tableCell}>Dori nomi</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.2 }]}>
              <Text style={styles.tableCell}>Ko'rsatmalar</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Kuniga</Text>
            </View>
            <View style={[styles.tableColLast, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Muddati</Text>
            </View>
          </View>

          {/* Jadval qatorlari */}
          {prescriptions.map((prescription: any, index: number) => {
            // Prescriptions are already flattened, so use directly
            const medication = prescription.medication_id;
            const medicationName =
              typeof medication === 'object' && medication
                ? medication.name
                : medication || "Noma'lum";
            const dosage =
              typeof medication === 'object' && medication
                ? `${medication.dosage || ''} ${
                    medication.dosage_unit || ''
                  }`.trim()
                : '';
            const medicationWithDosage = dosage
              ? `${medicationName} - ${dosage}`
              : medicationName;

            // Get frequency, duration, instructions
            const frequency = prescription.frequency ?? 0;
            const duration = prescription.duration ?? 0;
            const instructions = prescription.instructions || '-';

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
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {medicationWithDosage}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 8 },
                    ]}
                  >
                    {instructions}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>
                    {frequency ? `${frequency} marta` : '-'}
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>
                    {duration ? `${duration} kun` : '-'}
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
            Telefon: {formatPhone(exam.doctor_id?.phone)} | Qabul kunlari:
            Dushanba-Shanba
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
                {exam.patient_id?.fullname || 'Noma`lum'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Telefon:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {formatPhone(exam.patient_id?.phone)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Tug'ilgan sana:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.date_of_birth
                  ? formatDate(exam.patient_id.date_of_birth)
                  : exam.patient_id?.birth_date
                  ? formatDate(exam.patient_id.birth_date)
                  : 'Ko`rsatilmagan'}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Manzil:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.address || 'Ko`rsatilmagan'}
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
              <Text style={styles.bold}>Ko'rik turi:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getTreatmentType()}
              </Text>
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
              {exam.complaints || 'Ko``rsatilmagan'}
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
                      {room.room_name || 'Noma`lum'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Qavat:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.floor_number || 'Noma`lum'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Narxi:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.room_price
                        ? `${room.room_price.toLocaleString()} so'm`
                        : 'Noma`lum'}
                    </Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.bold}>Muddati:</Text>
                    <Text style={{ fontSize: 9, marginTop: 2 }}>
                      {room.start_date
                        ? formatDate(room.start_date)
                        : 'Noma`lum'}
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
                  : 'Noma`lum';
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

        {/* Retseptlar (agar mavjud bo'lsa) */}
        {(() => {
          // Get prescriptions from exam.prescription.items or exam.prescriptions
          let prescriptionItems: any[] = [];
          if (exam.prescription?.items && exam.prescription.items.length > 0) {
            prescriptionItems = exam.prescription.items;
          } else if (exam.prescriptions && exam.prescriptions.length > 0) {
            // If prescriptions is array of GetOnePresc objects, extract items
            if (exam.prescriptions[0]?.items) {
              prescriptionItems = exam.prescriptions.flatMap(
                (presc: any) => presc.items || []
              );
            } else {
              prescriptionItems = exam.prescriptions;
            }
          }

          if (prescriptionItems.length === 0) return null;

          return (
            <View style={[styles.tableContainer, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>
                RETSEPTLAR ({prescriptionItems.length} ta)
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
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text style={styles.tableCell}>Dori nomi</Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>Kuniga</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text style={styles.tableCell}>Ko'rsatmalar</Text>
                </View>
                <View style={[styles.tableColLast, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>Muddati</Text>
                </View>
              </View>

              {/* Jadval qatorlari */}
              {prescriptionItems.map((prescription: any, index: number) => {
                const medication = prescription.medication_id;
                const medicationName =
                  typeof medication === 'object' && medication
                    ? medication.name
                    : medication || "Noma'lum";
                const dosage =
                  typeof medication === 'object' && medication
                    ? `${medication.dosage || ''} ${
                        medication.dosage_unit || ''
                      }`.trim()
                    : '';
                const medicationWithDosage = dosage
                  ? `${medicationName} - ${dosage}`
                  : medicationName;

                const frequency = prescription.frequency ?? 0;
                const duration = prescription.duration ?? 0;
                const instructions = prescription.instructions || '-';

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
                    <View style={[styles.tableCol, { flex: 2 }]}>
                      <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                        {medicationWithDosage}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 0.6 }]}>
                      <Text style={styles.tableCell}>
                        {frequency ? `${frequency} marta` : '-'}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.2 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          { textAlign: 'left', fontSize:8 },
                        ]}
                      >
                        {instructions}
                      </Text>
                    </View>
                    <View style={[styles.tableColLast, { flex: 0.6 }]}>
                      <Text style={styles.tableCell}>
                        {duration ? `${duration} kun` : '-'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {/* Analizlar (agar mavjud bo'lsa) */}
        {exam.analyses && exam.analyses.length > 0 && (
          <View style={[styles.tableContainer, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>
              TAHLILLAR ({exam.analyses.length} ta)
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
              <View style={[styles.tableCol, { flex: 1.2 }]}>
                <Text style={styles.tableCell}>Tahlil turi</Text>
              </View>
              <View style={[styles.tableCol, { flex: 1.2 }]}>
                <Text style={styles.tableCell}>Parametr</Text>
              </View>
              <View style={[styles.tableCol, { flex: 0.8 }]}>
                <Text style={styles.tableCell}>Natija</Text>
              </View>
              <View style={[styles.tableCol, { flex: 0.8 }]}>
                <Text style={styles.tableCell}>Norma</Text>
              </View>
              <View style={[styles.tableColLast, { flex: 0.7 }]}>
                <Text style={styles.tableCell}>Holati</Text>
              </View>
            </View>

            {/* Jadval qatorlari */}
            {exam.analyses.map((analysis: any, index: number) => {
              const paramType = analysis.analysis_parameter_type;
              const paramValue = analysis.analysis_parameter_value;
              const isNewStructure = paramType && typeof paramType === 'object';

              // Tahlil turi nomi
              const analysisTypeName = isNewStructure
                ? (typeof analysis.analysis_type === 'object'
                    ? analysis.analysis_type?.name
                    : analysis.analysis_type) || "Noma'lum"
                : (typeof analysis.analysis_type === 'object'
                    ? analysis.analysis_type?.name
                    : analysis.analysis_type) || "Noma'lum";

              // Parametr nomi
              const parameterName = isNewStructure
                ? paramType?.name || "Noma'lum"
                : '-';

              // Natija qiymati
              const resultValue = isNewStructure
                ? paramValue || '-'
                : analysis.level || '-';

              // Norma diapazoni
              const normalRange =
                isNewStructure && paramType
                  ? `${paramType.min_value || ''} - ${
                      paramType.max_value || ''
                    } ${paramType.unit || ''}`.trim()
                  : '-';

              // Holat
              const statusMap: Record<string, string> = {
                pending: 'Kutilmoqda',
                active: 'Faol',
                completed: 'Tayyor',
              };
              const status =
                statusMap[analysis.status] || analysis.status || '-';

              return (
                <View
                  key={analysis._id || index}
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
                  <View style={[styles.tableCol, { flex: 1.2 }]}>
                    <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                      {analysisTypeName}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 1.2 }]}>
                    <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                      {parameterName}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.8 }]}>
                    <Text style={styles.tableCell}>{resultValue}</Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.8 }]}>
                    <Text style={[styles.tableCell, { fontSize: 5 }]}>
                      {normalRange}
                    </Text>
                  </View>
                  <View style={[styles.tableColLast, { flex: 0.7 }]}>
                    <Text style={styles.tableCell}>{status}</Text>
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
            Telefon: {formatPhone(exam.doctor_id?.phone)} | Qabul kunlari:
            Dushanba-Shanba
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
  const patientId = exam?.patient_id?._id || exam?.patient_id;
  const { data: patientData } = useGetPatientByIdQuery(patientId, {
    skip: !patientId,
  });

  // Prefer fresh patient data from get-one endpoint, fallback to exam.patient_id
  const patient = patientData?.data || exam?.patient_id || {};

  const handleDownloadExaminationInfo = async () => {
    try {
      setIsGenerating(true);
      const examWithPatient = { ...exam, patient_id: patient };

      const blob = await pdf(
        <ExaminationInfoPDF exam={examWithPatient} />
      ).toBlob();
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
  prescriptions?: any[];
}

const AllPrescriptionsDownloadButton: React.FC<
  AllPrescriptionsDownloadButtonProps
> = ({ exam, prescriptions: propPrescriptions }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Use prop prescriptions or fall back to exam.prescriptions
  // If prescriptions is array of GetOnePresc objects, extract items from each
  let prescriptions = propPrescriptions || exam.prescriptions || [];

  // If prescriptions contains objects with 'items' array, flatten them
  if (prescriptions.length > 0 && prescriptions[0]?.items) {
    prescriptions = prescriptions.flatMap((presc: any) => presc.items || []);
  }

  // Also check exam.prescription.items as fallback
  if (prescriptions.length === 0 && exam.prescription?.items) {
    prescriptions = exam.prescription.items;
  }

  const handleDownloadAllPrescriptions = async () => {
    if (prescriptions.length === 0) {
      alert('Retseptlar mavjud emas');
      return;
    }

    try {
      setIsGenerating(true);

      const blob = await pdf(
        <AllPrescriptionsPDF exam={exam} prescriptions={prescriptions} />
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
      disabled={isGenerating || prescriptions.length === 0}
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isGenerating ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
    </Button>
  );
};

// Xizmatlar uchun PDF komponenti
interface ServicesPDFProps {
  exam: any;
}

const ServicesPDF: React.FC<ServicesPDFProps> = ({ exam }) => {
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDiagnosis = (): string => {
    if (!exam.diagnosis) return "Ko'rsatilmagan";
    if (typeof exam.diagnosis === 'string') return exam.diagnosis;
    return exam.diagnosis.name;
  };

  // Jami narxni hisoblash
  const getTotalPrice = (): number => {
    if (!exam.services || exam.services.length === 0) return 0;
    return exam.services.reduce((total: number, service: any) => {
      const serviceType = service.service_type_id;
      const servicePrice =
        typeof serviceType === 'object' && serviceType
          ? serviceType.price
          : service.price || 0;
      const quantity =
        service.quantity ??
        service.days?.filter(
          (day: any) => day.date !== null && day.date !== undefined
        ).length ??
        1;
      return total + servicePrice * quantity;
    }, 0);
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
            <Text style={styles.documentTitle}>XIZMATLAR RO'YXATI</Text>
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
            Telefon: {formatPhone(exam.patient_id?.phone)}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Shifokor: {exam.doctor_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>Diagnoz: {getDiagnosis()}</Text>
        </View>

        {/* Xizmatlar jadvali */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            Xizmatlar ({exam.services?.length || 0} ta)
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
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text style={styles.tableCell}>Xizmat nomi</Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}>Miqdor</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={styles.tableCell}>Narxi</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={styles.tableCell}>Jami</Text>
            </View>
            <View style={[styles.tableColLast, { flex: 0.8 }]}>
              <Text style={styles.tableCell}>Holati</Text>
            </View>
          </View>

          {/* Jadval qatorlari */}
          {exam.services?.map((service: any, index: number) => {
            // Handle service_type_id - can be object or string
            const serviceType = service.service_type_id;
            const serviceName =
              typeof serviceType === 'object' && serviceType
                ? serviceType.name
                : serviceType || "Noma'lum";

            // Get price from service_type_id or service itself
            const servicePrice =
              typeof serviceType === 'object' && serviceType
                ? serviceType.price
                : service.price || 0;

            // Get quantity - can be from days array length or quantity field
            const quantity =
              service.quantity ??
              service.days?.filter(
                (day: any) => day.date !== null && day.date !== undefined
              ).length ??
              1;

            const serviceStatus: Record<string, string> = {
              pending: 'Kutilmoqda',
              active: 'Faol',
              completed: 'Yakunlangan',
            };
            const itemTotal = servicePrice * quantity;

            // Get status - check if service has status field, otherwise check days completion
            const getStatus = (): string => {
              if (service.status) {
                return serviceStatus[service.status] || service.status;
              }
              // If no status, check if all days are completed
              if (service.days && service.days.length > 0) {
                const completedDays = service.days.filter(
                  (day: any) => day.is_completed
                ).length;
                if (completedDays === service.days.length) {
                  return 'Yakunlangan';
                } else if (completedDays > 0) {
                  return 'Faol';
                }
              }
              return 'Faol';
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
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text style={[styles.tableCell, { textAlign: 'left' }]}>
                    {serviceName}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>{quantity}</Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text style={styles.tableCell}>
                    {servicePrice > 0
                      ? `${servicePrice.toLocaleString()} so'm`
                      : '-'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text style={styles.tableCell}>
                    {itemTotal > 0
                      ? `${itemTotal.toLocaleString()} so'm`
                      : `0 so'm`}
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 0.8 }]}>
                  <Text style={styles.tableCell}>{getStatus()}</Text>
                </View>
              </View>
            );
          })}

          {/* Jami qator */}
          <View
            style={[
              styles.tableRow,
              styles.tableHeader,
              {
                borderLeftWidth: 1,
                borderLeftColor: '#000',
                borderLeftStyle: 'solid',
              },
            ]}
          >
            <View style={[styles.tableCol, { flex: 0.3 }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { flex: 2 }]}>
              <Text
                style={[
                  styles.tableCell,
                  { textAlign: 'right', fontWeight: 'bold' },
                ]}
              >
                JAMI:
              </Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.6 }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={styles.tableCell}></Text>
            </View>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>
                {getTotalPrice().toLocaleString()} so'm
              </Text>
            </View>
            <View style={[styles.tableColLast, { flex: 0.8 }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        </View>

        {/* Imzo */}
        <View style={styles.signature}>
          <Text>
            Shifokor: {exam.doctor_id?.fullname || '_________________________'}
          </Text>
          <Text style={{ marginTop: 3 }}>Imzo: _________</Text>
          <Text style={{ marginTop: 3, fontSize: 7 }}>
            Telefon: {formatPhone(exam.doctor_id?.phone)} | Qabul kunlari:
            Dushanba-Shanba
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// Xizmatlar uchun PDF yuklab olish komponenti
interface ServicesDownloadButtonProps {
  exam: any;
  services?: any[];
}

const ServicesDownloadButton: React.FC<ServicesDownloadButtonProps> = ({
  exam,
  services: propServices,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  // Flatten services if they contain items arrays (GetOneServiceRes format)
  let allServices: any[] = propServices || exam.services || [];

  // If services contains objects with 'items' array, flatten them
  if (allServices.length > 0 && allServices[0]?.items) {
    allServices = allServices.flatMap(
      (serviceDoc: any) => serviceDoc.items || []
    );
  }

  // Also check exam.service.items as fallback
  if (allServices.length === 0 && exam.service?.items) {
    allServices = exam.service.items;
  }

  const handleDownloadServices = async () => {
    if (allServices.length === 0) {
      alert('Xizmatlar mavjud emas');
      return;
    }

    try {
      setIsGenerating(true);

      // Create exam object with services from props
      const examWithServices = { ...exam, services: allServices };
      const blob = await pdf(<ServicesPDF exam={examWithServices} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Fayl nomini yaratish
      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Xizmatlar_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      alert(
        'Xizmatlar yuklab olishda xatolik yuz berdi. Iltimos, qaytadan urinib koʼring.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownloadServices}
      disabled={isGenerating || allServices.length === 0}
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isGenerating ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
    </Button>
  );
};

// Неврологик статус uchun PDF komponenti
interface NeurologicStatusPDFProps {
  exam: any;
  neurologic: any;
}

const neurologicFieldLabels: Record<string, string> = {
  meningeal_symptoms: 'Менингеальные симптомы',
  i_para_n_olfactorius: 'I пара – n.olfactorius',
  ii_para_n_opticus: 'II пара – n. opticus',
  iii_para_n_oculomotorius: 'III пара – n. oculomotorius',
  iv_para_n_trochlearis: 'IV пара – n. trochlearis',
  v_para_n_trigeminus: 'V пара – n. trigeminus',
  vi_para_n_abducens: 'VI пара – n. abducens',
  vii_para_n_fascialis: 'VII пара – n. facialis',
  viii_para_n_vestibulocochlearis: 'VIII пара – n. vestibulocochlearis',
  ix_para_n_glossopharyngeus: 'IX пара – n. glossopharyngeus',
  x_para_n_vagus: 'X пара – n. vagus',
  xi_para_n_accessorius: 'XI пара – n. accessorius',
  xii_para_n_hypoglossus: 'XII пара – n. hypoglossus',
  motor_system: 'Координаторная сфера',
  sensory_sphere: 'Высшие мозговые функции',
  coordination_sphere: 'Синдромологический диагноз, обоснование',
  higher_brain_functions: 'Топический диагноз и его обоснование',
  syndromic_diagnosis_justification: 'Синдромологический диагноз',
  topical_diagnosis_justification: 'Топический диагноз',
};

// Неврологик статус maydonlari tartibi
const neurologicFieldOrder = [
  'meningeal_symptoms',
  'i_para_n_olfactorius',
  'ii_para_n_opticus',
  'iii_para_n_oculomotorius',
  'iv_para_n_trochlearis',
  'v_para_n_trigeminus',
  'vi_para_n_abducens',
  'vii_para_n_fascialis',
  'viii_para_n_vestibulocochlearis',
  'ix_para_n_glossopharyngeus',
  'x_para_n_vagus',
  'xi_para_n_accessorius',
  'xii_para_n_hypoglossus',
  'motor_system',
  'sensory_sphere',
  'coordination_sphere',
  'higher_brain_functions',
  'syndromic_diagnosis_justification',
  'topical_diagnosis_justification',
];

const NeurologicStatusPDF: React.FC<NeurologicStatusPDFProps> = ({
  exam,
  neurologic,
}) => {
  const formatDate = (date: Date | string): string => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDiagnosis = (): string => {
    if (!exam.diagnosis) return "Ko'rsatilmagan";
    if (typeof exam.diagnosis === 'string') return exam.diagnosis;
    return exam.diagnosis.name;
  };

  // Yoshni hisoblash
  const getAge = (): string => {
    if (!exam.patient_id?.birth_date) return "Noma'lum";
    const birthDate = new Date(exam.patient_id.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} yosh`;
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
            <Text style={styles.documentTitle}>НЕВРОЛОГИК СТАТУС</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>
              {formatDate(neurologic.created_at || exam.created_at)}
            </Text>
          </View>
        </View>

        {/* Bemor ma'lumotlari */}
        <View style={styles.patientInfo}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Bemor F.I.O:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.fullname || "Noma'lum"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Yoshi:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>{getAge()}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Telefon:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.phone || "Ko'rsatilmagan"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Manzil:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.address || "Ko'rsatilmagan"}
              </Text>
            </View>
          </View>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Diagnoz:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getDiagnosis()}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Shifokor:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.doctor_id?.fullname || "Noma'lum"}
                {exam.doctor_id?.specialization &&
                  ` (${exam.doctor_id.specialization})`}
              </Text>
            </View>
          </View>
        </View>

        {/* Неврологик статус ma'lumotlari */}
        <View style={[styles.patientInfo, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>
            НЕВРОЛОГИК ТЕКШИРУВ
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {neurologicFieldOrder.map((field, index) => {
              const value = neurologic[field];
              if (!value) return null;
              return (
                <View
                  key={field}
                  style={{
                    width: '48%',
                    marginRight: index % 2 === 0 ? '4%' : 0,
                    marginBottom: 6,
                    paddingBottom: 4,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#e0e0e0',
                    borderBottomStyle: 'solid',
                  }}
                >
                  <Text style={[styles.bold, { fontSize: 8, color: '#333' }]}>
                    {neurologicFieldLabels[field] || field}:
                  </Text>
                  <Text
                    style={{
                      fontSize: 8,
                      marginTop: 1,
                      lineHeight: 1.3,
                    }}
                  >
                    {value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Неврологик статус uchun PDF yuklab olish komponenti
interface NeurologicStatusDownloadButtonProps {
  exam: any;
  neurologic: any;
}

const NeurologicStatusDownloadButton: React.FC<
  NeurologicStatusDownloadButtonProps
> = ({ exam, neurologic }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownloadNeurologicStatus = async () => {
    if (!neurologic) {
      alert('Неврологик статус mavjud emas');
      return;
    }

    try {
      setIsGenerating(true);

      const blob = await pdf(
        <NeurologicStatusPDF exam={exam} neurologic={neurologic} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Fayl nomini yaratish
      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Nevrologik_Status_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF yaratishda xatolik:', error);
      alert(
        'Неврологик статус yuklab olishda xatolik yuz berdi. Iltimos, qaytadan urinib koʼring.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={handleDownloadNeurologicStatus}
      disabled={isGenerating || !neurologic}
      className='flex items-center gap-2'
    >
      <Download className='h-4 w-4' />
      {isGenerating ? 'Yuklanmoqda...' : 'PDF Yuklab olish'}
    </Button>
  );
};

export {
  AllPrescriptionsDownloadButton,
  ExaminationInfoDownloadButton,
  NeurologicStatusDownloadButton,
  ServicesDownloadButton,
};
export default AllPrescriptionsDownloadButton;
