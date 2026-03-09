/**
 * All Prescriptions PDF Component
 * Displays all prescriptions in a table format on an A4 page
 */

import { Settings } from '@/app/api/settingsApi/types.d';
import { Button } from '@/components/ui/button';
import { Document, Page, pdf } from '@react-pdf/renderer';
import { Text, View } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useGetAllSettingsQuery } from '@/app/api/settingsApi/settingsApi';
import {
  formatDate,
  formatPhone,
  getDiagnosis,
  styles,
} from './PDFUtils';
import { PDFContactFooter } from './PDFContactFooter';

interface AllPrescriptionsPDFProps {
  exam: any;
  prescriptions: any[];
  settings?: Settings;
}

/**
 * PDF component displaying all prescriptions in table format (A4 page)
 */
export const AllPrescriptionsPDF: React.FC<AllPrescriptionsPDFProps> = ({
  exam,
  prescriptions: propPrescriptions,
  settings,
}) => {
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
        {/* Header */}
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

        {/* Patient Information */}
        <View style={styles.patientInfo}>
          <Text style={styles.bold}>
            Bemor: {exam.patient_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Telefon: {formatPhone(exam.patient_id?.phone)}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Diagnoz: {getDiagnosis(exam.diagnosis)}
          </Text>
        </View>

        {/* Prescriptions Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            Retseptlar ({prescriptions.length} ta)
          </Text>

          {/* Table Header */}
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
            <View style={[styles.tableCol, { flex: 0.25 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>#</Text>
            </View>
            <View style={[styles.tableCol, { flex: 1.2 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>
                Dori nomi
              </Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.8 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>
                Qo'shimcha
              </Text>
            </View>
            <View style={[styles.tableCol, { flex: 1 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>
                Ko'rsatmalar
              </Text>
            </View>
            <View style={[styles.tableCol, { flex: 0.5 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>Kuniga</Text>
            </View>
            <View style={[styles.tableColLast, { flex: 0.5 }]}>
              <Text style={[styles.tableCell, { fontSize: 10 }]}>Muddati</Text>
            </View>
          </View>

          {/* Table Rows */}
          {prescriptions.map((prescription: any, index: number) => {
            const medication = prescription.medication_id;
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
                <View style={[styles.tableCol, { flex: 0.25 }]}>
                  <Text style={[styles.tableCell, { fontSize: 10 }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 10 },
                    ]}
                  >
                    {medication.name}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.8 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 10 },
                    ]}
                  >
                    {prescription.addons || '-'}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left', fontSize: 10 },
                    ]}
                  >
                    {instructions}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.5 }]}>
                  <Text style={[styles.tableCell, { fontSize: 10 }]}>
                    {frequency ? `${frequency} marta` : '-'}
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 0.5 }]}>
                  <Text style={[styles.tableCell, { fontSize: 10 }]}>
                    {duration ? `${duration} kun` : '-'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Signature */}
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

        <PDFContactFooter settings={settings} />
      </Page>
    </Document>
  );
};

// Download button component
interface AllPrescriptionsDownloadButtonProps {
  exam: any;
  prescriptions: any[] | undefined;
}

/**
 * Button component that triggers PDF generation and download of all prescriptions
 */
export const AllPrescriptionsDownloadButton: React.FC<
  AllPrescriptionsDownloadButtonProps
> = ({ exam, prescriptions }) => {
  const { t } = useTranslation('examination');
  const { data: settingsData } = useGetAllSettingsQuery();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    if (!exam || !prescriptions) {
      toast.error("Ma'lumotlar topilmadi");
      return;
    }

    try {
      setIsGenerating(true);
      toast.loading('PDF tayyorlanmoqda...');

      const blob = await pdf(
        <AllPrescriptionsPDF
          exam={exam}
          prescriptions={prescriptions}
          settings={settingsData?.data}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
      link.download = `Retseptlar_${cleanName}_${date}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss();
      toast.success('PDF yuklab olindi');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error('PDF tayyorlashda xatolik');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={isGenerating}
      size='sm'
      variant='outline'
    >
      <Download className='mr-2 h-4 w-4' />
      {t('downloadPrescriptions')}
    </Button>
  );
};
