import { GetOneBillingRes } from '@/app/api/billingApi/types';
import { Settings } from '@/app/api/settingsApi/types.d';
import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';

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

type BillingData = GetOneBillingRes['data'];
type ExaminationData = BillingData['examination_id'];

type ExaminationWithOptionalServices = ExaminationData & {
  services?: Array<{
    _id?: string;
    name?: string;
    code?: string;
    quantity?: number;
    price?: number;
    total_price?: number;
  }>;
};

type RoomWithEstimate = ExaminationData['rooms'][number] & {
  estimated_leave_time?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Roboto',
    fontSize: 9,
    lineHeight: 1.25,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingBottom: 6,
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  date: {
    fontSize: 9,
    textAlign: 'right',
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#f1f5f9',
    padding: 3,
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  infoItem: {
    width: '48%',
    marginBottom: 2,
  },
  label: {
    fontWeight: 'bold',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#f8fafc',
  },
  tableRow: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  cell: {
    padding: 3,
    borderRightWidth: 1,
    borderColor: '#334155',
    fontSize: 8,
  },
  cellLast: {
    padding: 3,
    fontSize: 8,
  },
  totalBox: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 6,
    backgroundColor: '#f8fafc',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalStrong: {
    fontWeight: 'bold',
    fontSize: 10,
  },
});

const getPaymentMethodDisplay = (method: string) => {
  const lowerMethod = method?.toLowerCase() || '';
  
  // Handle payment method types
  switch (lowerMethod) {
    case 'cash':
      return '💵 ' + 'Naqd';
    case 'card':
      return '💳 ' + 'Karta';
    case 'click':
      return '📱 Click';
    case 'online':
      return '📱 Online';
  }
  
  // Handle service types (payment purposes)
  switch (method) {
    case 'KORIK':
      return '💵 ' + 'Korikda';
    case 'XIZMAT':
      return '🏥 ' + 'Xizmat';
    case 'XONA':
      return '🛏️ ' + 'Xona';
    case 'TASVIR':
      return '🖼️ ' + 'Tasvir';
    case 'TAHLIL':
      return '🧪 ' + 'Tahlil';
    default:
      return '📱 ' + method;
  }
};

const formatDate = (value?: string | Date): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('uz-UZ');
};

const formatCurrency = (value?: number): string => {
  return `${new Intl.NumberFormat('uz-UZ').format(value || 0)} so'm`;
};

const renderEmpty = (text: string) => (
  <Text style={{ fontSize: 8, color: '#64748b' }}>{text}</Text>
);

interface BillingPDFDocumentProps {
  billing: BillingData;
  t: (key: string) => string;
  settings?: Settings;
}

const BillingPDFDocument = ({ billing, t, settings }: BillingPDFDocumentProps) => {
  const examination = billing.examination_id as ExaminationWithOptionalServices;
  const diagnosisText = examination?.diagnosis
    ? `${examination.diagnosis.name || '-'}${
        examination.diagnosis.code ? ` (${examination.diagnosis.code})` : ''
      }`
    : '-';
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.clinicName}>Klinika "Jayron medservis"</Text>
          </View>
          <View>
            <Text style={styles.title}>BILLING HISOBOTI</Text>
          </View>
          <View>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asosiy ma&apos;lumotlar</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Invoice ID: </Text>
              {billing._id}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Sana: </Text>
              {formatDate(billing.created_at)}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Bemor: </Text>
              {billing.patient_id?.fullname || '-'}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Telefon: </Text>
              {billing.patient_id?.phone || '-'}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Shifokor: </Text>
              {examination?.doctor_id?.fullname || '-'}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.label}>Diagnoz: </Text>
              {diagnosisText}
            </Text>
          </View>
        </View>

        {billing.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xizmatlar</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '42%' }]}>Nomi</Text>
              <Text style={[styles.cell, { width: '12%', textAlign: 'center' }]}>Soni</Text>
              <Text style={[styles.cell, { width: '20%', textAlign: 'right' }]}>Narxi</Text>
              <Text style={[styles.cellLast, { width: '26%', textAlign: 'right' }]}>Jami</Text>
            </View>
            {billing.services.map((service) => (
              <View key={service._id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '42%' }]}>{service.name || '-'}</Text>
                <Text style={[styles.cell, { width: '12%', textAlign: 'center' }]}>
                  {service.count || 0}
                </Text>
                <Text style={[styles.cell, { width: '20%', textAlign: 'right' }]}>
                  {formatCurrency(service.price)}
                </Text>
                <Text style={[styles.cellLast, { width: '26%', textAlign: 'right' }]}>
                  {formatCurrency(service.total_price)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {examination?.analyses && examination.analyses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tahlillar</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '32%' }]}>Turi</Text>
              <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>Holat</Text>
              <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>Daraja</Text>
              <Text style={[styles.cellLast, { width: '36%', textAlign: 'right' }]}>Sana</Text>
            </View>
            {examination.analyses.map((analysis) => (
              <View key={analysis._id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '32%' }]}>
                  {analysis.analysis_type?.name || '-'}
                </Text>
                <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>
                  {analysis.status || '-'}
                </Text>
                <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>
                  {analysis.level || '-'}
                </Text>
                <Text style={[styles.cellLast, { width: '36%', textAlign: 'right' }]}>
                  {formatDate(analysis.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {examination?.images && examination.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tasvirlar (Images)</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '45%' }]}>Turi</Text>
              <Text style={[styles.cell, { width: '20%', textAlign: 'center' }]}>Holat</Text>
              <Text style={[styles.cellLast, { width: '35%', textAlign: 'right' }]}>Sana</Text>
            </View>
            {examination.images.map((image) => (
              <View key={image._id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '45%' }]}>
                  {image.imaging_type_id?.name || '-'}
                </Text>
                <Text style={[styles.cell, { width: '20%', textAlign: 'center' }]}>
                  {image.status || '-'}
                </Text>
                <Text style={[styles.cellLast, { width: '35%', textAlign: 'right' }]}>
                  {formatDate(image.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {examination?.rooms && examination.rooms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xonalar</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '22%' }]}>Xona</Text>
              <Text style={[styles.cell, { width: '10%', textAlign: 'center' }]}>Qavat</Text>
              <Text style={[styles.cell, { width: '23%', textAlign: 'center' }]}>Kirgan sana</Text>
              <Text style={[styles.cell, { width: '23%', textAlign: 'center' }]}>Chiqish sana</Text>
              <Text style={[styles.cellLast, { width: '22%', textAlign: 'right' }]}>Narxi</Text>
            </View>
            {examination.rooms.map((room) => {
              const roomWithEstimate = room as RoomWithEstimate;
              return (
                <View key={room._id} style={styles.tableRow}>
                  <Text style={[styles.cell, { width: '22%' }]}>{room.room_name || '-'}</Text>
                  <Text style={[styles.cell, { width: '10%', textAlign: 'center' }]}>
                    {room.floor_number ?? '-'}
                  </Text>
                  <Text style={[styles.cell, { width: '23%', textAlign: 'center' }]}>
                    {formatDate(room.start_date)}
                  </Text>
                  <Text style={[styles.cell, { width: '23%', textAlign: 'center' }]}>
                    {room.end_date
                      ? formatDate(room.end_date)
                      : roomWithEstimate.estimated_leave_time
                        ? `ONGOING (${formatDate(roomWithEstimate.estimated_leave_time)})`
                        : 'ONGOING'}
                  </Text>
                  <Text style={[styles.cellLast, { width: '22%', textAlign: 'right' }]}>
                    {formatCurrency(room.room_price)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {examination?.service?.items && examination.service.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Muolaja xizmatlari</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '45%' }]}>Xizmat</Text>
              <Text style={[styles.cell, { width: '35%' }]}>Izoh</Text>
              <Text style={[styles.cellLast, { width: '20%', textAlign: 'center' }]}>Kunlar</Text>
            </View>
            {examination.service.items.map((item) => (
              <View key={item._id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '45%' }]}>
                  {item.service_type_id?.name || '-'}
                </Text>
                <Text style={[styles.cell, { width: '35%' }]}>
                  {item.notes || '-'}
                </Text>
                <Text style={[styles.cellLast, { width: '20%', textAlign: 'center' }]}>
                  {item.days?.filter((day) => day.date !== null).length || 0}
                </Text>
              </View>
            ))}
          </View>
        )}

        {examination.services && examination.services.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Examination services</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '48%' }]}>Nomi</Text>
              <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>Soni</Text>
              <Text style={[styles.cell, { width: '18%', textAlign: 'right' }]}>Narxi</Text>
              <Text style={[styles.cellLast, { width: '18%', textAlign: 'right' }]}>Jami</Text>
            </View>
            {examination.services.map((service, index) => (
              <View key={service._id || `${service.name}-${index}`} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '48%' }]}>{service.name || '-'}</Text>
                <Text style={[styles.cell, { width: '16%', textAlign: 'center' }]}>
                  {service.quantity ?? 1}
                </Text>
                <Text style={[styles.cell, { width: '18%', textAlign: 'right' }]}>
                  {formatCurrency(service.price)}
                </Text>
                <Text style={[styles.cellLast, { width: '18%', textAlign: 'right' }]}>
                  {formatCurrency(service.total_price)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {billing.payments && billing.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To&apos;lovlar tarixi</Text>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.cell, { width: '24%' }]}>To&apos;lov turi</Text>
              <Text style={[styles.cell, { width: '24%' }]}>Maqsadi</Text>
              <Text style={[styles.cell, { width: '26%', textAlign: 'center' }]}>Sana</Text>
              <Text style={[styles.cellLast, { width: '26%', textAlign: 'right' }]}>Miqdor</Text>
            </View>
            {billing.payments.map((payment) => (
              <View key={payment._id} style={styles.tableRow}>
                <Text style={[styles.cell, { width: '24%' }]}>{getPaymentMethodDisplay(payment.payment_method) || '-'}</Text>
                <Text style={[styles.cell, { width: '24%' }]}>{getPaymentMethodDisplay(payment.payment_type) || '-'}</Text>
                <Text style={[styles.cell, { width: '26%', textAlign: 'center' }]}>
                  {formatDate(payment.payment_date)}
                </Text>
                <Text style={[styles.cellLast, { width: '26%', textAlign: 'right' }]}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Umumiy summa</Text>
            <Text>{formatCurrency(billing.total_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>To&apos;langan</Text>
            <Text>{formatCurrency(billing.paid_amount)}</Text>
          </View>
          <View style={[styles.totalRow, { marginBottom: 0 }]}> 
            <Text style={styles.totalStrong}>Qarz</Text>
            <Text style={styles.totalStrong}>{formatCurrency(billing.debt_amount)}</Text>
          </View>
        </View>

        {settings?.contacts && settings.contacts.length > 0 && (
          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Aloqa ma&apos;lumotlari</Text>
            {settings.contacts.map((contact, index) => (
              <View key={index} style={{ marginBottom: 6 }}>
                <Text style={{ fontSize: 9, marginBottom: 2 }}>
                  <Text style={styles.label}>Ism: </Text>
                  {contact.full_name || '-'}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  <Text style={styles.label}>Telefon: </Text>
                  {contact.phone || '-'}
                </Text>
              </View>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};

export const downloadBillingPDF = async (
  billing: BillingData,
  t: (key: string) => string,
  settings?: Settings
) => {
  const blob = await pdf(
    <BillingPDFDocument billing={billing} t={t} settings={settings} />
  ).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const patientName = billing.patient_id?.fullname || 'patient';
  const cleanName = patientName.replace(/\s+/g, '_');
  const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
  link.download = `Billing_${cleanName}_${date}.pdf`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default BillingPDFDocument;
