/**
 * Services PDF Component
 * Displays services list with pricing and status information
 */

import { Settings } from '@/app/api/settingsApi/types.d';
import { useGetAllSettingsQuery } from '@/app/api/settingsApi/settingsApi';
import { Button } from '@/components/ui/button';
import { Document, Page, pdf } from '@react-pdf/renderer';
import { Text, View } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatDate,
  formatPhone,
  getDiagnosis,
  styles,
} from './PDFUtils';
import { PDFContactFooter } from './PDFContactFooter';

interface ServicesPDFProps {
  exam: any;
  settings?: Settings;
}

/**
 * PDF component displaying services list with pricing and status information (A4 page)
 */
export const ServicesPDF: React.FC<ServicesPDFProps> = ({
  exam,
  settings,
}) => {
  // Check if patient is statsionar (inpatient)
  const isStatsionar = exam.treatment_type === 'stasionar';

  // Calculate total price
  const getTotalPrice = (): number => {
    // If statsionar, services are free
    if (isStatsionar) return 0;

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.clinicName}>
              Klinika "Jayron medservis"
            </Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.documentTitle}>XIZMATLAR RO'YXATI</Text>
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
            Shifokor: {exam.doctor_id?.fullname || "Noma'lum"}
          </Text>
          <Text style={{ marginBottom: '2px' }}>
            Diagnoz: {getDiagnosis(exam.diagnosis)}
          </Text>
        </View>

        {/* Services Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            Xizmatlar ({exam.services?.length || 0} ta)
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

          {/* Table Rows */}
          {exam.services?.map((service: any, index: number) => {
            const serviceType = service.service_type_id;
            const serviceName =
              typeof serviceType === 'object' && serviceType
                ? serviceType.name
                : serviceType || "Noma'lum";

            const servicePrice =
              typeof serviceType === 'object' && serviceType
                ? serviceType.price
                : service.price || 0;

            const quantity =
              service.quantity ??
              service.days?.filter(
                (day: any) =>
                  day.date !== null && day.date !== undefined
              ).length ??
              1;

            const serviceStatus: Record<string, string> = {
              pending: 'Kutilmoqda',
              active: 'Faol',
              completed: 'Yakunlangan',
            };
            const itemTotal = servicePrice * quantity;

            const displayPrice = isStatsionar
              ? 'Bepul'
              : servicePrice > 0
                ? `${servicePrice.toLocaleString()} so'm`
                : '-';

            const displayTotal = isStatsionar
              ? 'Bepul'
              : itemTotal > 0
                ? `${itemTotal.toLocaleString()} so'm`
                : `0 so'm`;

            const getStatus = (): string => {
              if (service.status) {
                return (
                  serviceStatus[service.status] || service.status
                );
              }
              if (service.days && service.days.length > 0) {
                const completedDays = service.days.filter(
                  (day: any) => day.is_completed
                ).length;
                if (
                  completedDays === service.days.length
                ) {
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
                  <Text style={styles.tableCell}>
                    {index + 1}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 2 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textAlign: 'left' },
                    ]}
                  >
                    {serviceName}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text style={styles.tableCell}>
                    {quantity}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text style={styles.tableCell}>
                    {displayPrice}
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text style={styles.tableCell}>
                    {displayTotal}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableColLast,
                    { flex: 0.8 },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {getStatus()}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Total Row */}
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
                  {
                    textAlign: 'right',
                    fontWeight: 'bold',
                  },
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
              <Text
                style={[
                  styles.tableCell,
                  { fontWeight: 'bold' },
                ]}
              >
                {isStatsionar
                  ? 'Bepul'
                  : `${getTotalPrice().toLocaleString()} so'm`}
              </Text>
            </View>
            <View style={[styles.tableColLast, { flex: 0.8 }]}>
              <Text style={styles.tableCell}></Text>
            </View>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text>
            Shifokor:{' '}
            {exam.doctor_id?.fullname ||
              '_________________________'}
          </Text>
          <Text style={{ marginTop: 3 }}>Imzo: _________</Text>
          <Text style={{ marginTop: 3, fontSize: 7 }}>
            Telefon: {formatPhone(exam.doctor_id?.phone)} |
            Qabul kunlari: Dushanba-Shanba
          </Text>
        </View>

        <PDFContactFooter settings={settings} />
      </Page>
    </Document>
  );
};

// Download button component
interface ServicesDownloadButtonProps {
  exam: any;
  services?: any[];
}

/**
 * Button component that triggers PDF generation and download of services list
 */
export const ServicesDownloadButton: React.FC<
  ServicesDownloadButtonProps
> = ({ exam, services: propServices }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { t } = useTranslation('common');
  const { data: settingsData } = useGetAllSettingsQuery();

  let allServices: any[] = propServices || exam.services || [];

  if (allServices.length > 0 && allServices[0]?.items) {
    allServices = allServices.flatMap(
      (serviceDoc: any) => serviceDoc.items || []
    );
  }

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

      const examWithServices = {
        ...exam,
        services: allServices,
      };
      const blob = await pdf(
        <ServicesPDF
          exam={examWithServices}
          settings={settingsData?.data}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const patientName = exam.patient_id?.fullname || 'bemor';
      const cleanName = patientName.replace(/\s+/g, '_');
      const date = new Date()
        .toLocaleDateString('uz-UZ')
        .replace(/\//g, '-');
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
      {isGenerating ? t('loadingText') : t('downloadPdf')}
    </Button>
  );
};
