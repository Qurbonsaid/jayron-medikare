/**
 * Examination Info PDF Component
 * Displays comprehensive examination information including patient details, services, prescriptions, and analyses
 */

import { Settings } from '@/app/api/settingsApi/types.d';
import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
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
  getTreatmentType,
  styles,
} from './PDFUtils';
import { PDFContactFooter } from './PDFContactFooter';

interface ExaminationInfoPDFProps {
  exam: any;
  settings?: Settings;
}

/**
 * PDF component showing examination details including patient info, complaints, diagnosis, services, prescriptions, and analyses
 */
export const ExaminationInfoPDF: React.FC<ExaminationInfoPDFProps> = ({
  exam,
  settings,
}) => {
  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {/* Header */}
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

        {/* Patient Information */}
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

        {/* Examination Information */}
        <View style={[styles.patientInfo, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
            KO'RIK MA'LUMOTLARI
          </Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Ko'rik turi:</Text>
              <Text style={{ fontSize: 9, marginTop: 1 }}>
                {getTreatmentType(exam.treatment_type)}
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
              {getDiagnosis(exam.diagnosis)}
            </Text>
          </View>
        </View>

        {/* Room Information (if available) */}
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
                  borderBottomWidth:
                    index < exam.rooms.length - 1 ? 1 : 0,
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

        {/* Services (if available) */}
        {(() => {
          let allServices: any[] = exam.services || [];
          if (allServices.length > 0 && allServices[0]?.items) {
            allServices = allServices.flatMap(
              (serviceDoc: any) => serviceDoc.items || []
            );
          }
          if (allServices.length === 0 && exam.service?.items) {
            allServices = exam.service.items;
          }

          const isStatsionar = exam.treatment_type === 'stasionar';

          if (allServices.length === 0) return null;

          return (
            <View style={[styles.tableContainer, { marginTop: 8 }]}>
              <Text style={styles.sectionTitle}>
                XIZMATLAR ({allServices.length} ta)
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

              {allServices.map((service: any, index: number) => {
                const serviceName =
                  typeof service.service_type_id === 'object' &&
                  service.service_type_id
                    ? service.service_type_id.name
                    : 'Noma`lum';

                const servicePrice =
                  typeof service.service_type_id === 'object' &&
                  service.service_type_id
                    ? service.service_type_id.price
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

                const displayPrice = isStatsionar
                  ? 'Bepul'
                  : servicePrice > 0
                    ? `${servicePrice.toLocaleString()} so'm`
                    : '-';

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
                    <View style={[styles.tableCol, { flex: 0.8 }]}>
                      <Text style={styles.tableCell}>
                        {displayPrice}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.tableColLast,
                        { flex: 0.8 },
                      ]}
                    >
                      <Text style={styles.tableCell}>
                        {serviceStatus[service.status] ||
                          service.status ||
                          'Faol'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {/* Prescriptions (if available) */}
        {(() => {
          let prescriptionItems: any[] = [];
          if (exam.prescription?.items && exam.prescription.items.length > 0) {
            prescriptionItems = exam.prescription.items;
          } else if (exam.prescriptions && exam.prescriptions.length > 0) {
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
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    #
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1.2 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    Dori nomi
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.8 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    Qo'shimcha
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 0.6 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    Kuniga
                  </Text>
                </View>
                <View style={[styles.tableCol, { flex: 1 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    Ko'rsatmalar
                  </Text>
                </View>
                <View style={[styles.tableColLast, { flex: 0.6 }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontSize: 10 },
                    ]}
                  >
                    Muddati
                  </Text>
                </View>
              </View>

              {prescriptionItems.map((prescription: any, index: number) => {
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
                    <View style={[styles.tableCol, { flex: 0.3 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          { fontSize: 10 },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1.2 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            textAlign: 'left',
                            fontSize: 10,
                          },
                        ]}
                      >
                        {medication.name}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 0.8 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            textAlign: 'left',
                            fontSize: 10,
                          },
                        ]}
                      >
                        {prescription.addons || '-'}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 0.6 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          { fontSize: 10 },
                        ]}
                      >
                        {frequency
                          ? `${frequency} marta`
                          : '-'}
                      </Text>
                    </View>
                    <View style={[styles.tableCol, { flex: 1 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          {
                            textAlign: 'left',
                            fontSize: 10,
                          },
                        ]}
                      >
                        {instructions}
                      </Text>
                    </View>
                    <View style={[styles.tableColLast, { flex: 0.6 }]}>
                      <Text
                        style={[
                          styles.tableCell,
                          { fontSize: 10 },
                        ]}
                      >
                        {duration
                          ? `${duration} kun`
                          : '-'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

        {/* Analyses (if available) */}
        {exam.analyses && exam.analyses.length > 0 && (
          <View style={[styles.tableContainer, { marginTop: 8 }]}>
            <Text style={styles.sectionTitle}>
              TAHLILLAR ({exam.analyses.length} ta)
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
              <View style={[styles.tableCol, { flex: 1.2 }]}>
                <Text style={styles.tableCell}>
                  Tahlil turi
                </Text>
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

            {exam.analyses.map((analysis: any, index: number) => {
              const paramType = analysis.analysis_parameter_type;
              const paramValue = analysis.analysis_parameter_value;
              const isNewStructure =
                paramType && typeof paramType === 'object';

              const analysisTypeName = isNewStructure
                ? typeof analysis.analysis_type === 'object'
                  ? analysis.analysis_type?.name
                  : analysis.analysis_type || "Noma'lum"
                : typeof analysis.analysis_type === 'object'
                  ? analysis.analysis_type?.name
                  : analysis.analysis_type || "Noma'lum";

              const parameterName = isNewStructure
                ? paramType?.name || "Noma'lum"
                : '-';

              const resultValue = isNewStructure
                ? paramValue || '-'
                : analysis.level || '-';

              const normalRange =
                isNewStructure && paramType
                  ? `${paramType.min_value || ''} - ${
                      paramType.max_value || ''
                    } ${paramType.unit || ''}`.trim()
                  : '-';

              const statusMap: Record<string, string> = {
                pending: 'Kutilmoqda',
                active: 'Faol',
                completed: 'Tayyor',
              };
              const status =
                statusMap[analysis.status] ||
                analysis.status ||
                '-';

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
                    <Text style={styles.tableCell}>
                      {index + 1}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 1.2 }]}>
                    <Text
                      style={[
                        styles.tableCell,
                        { textAlign: 'left' },
                      ]}
                    >
                      {analysisTypeName}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 1.2 }]}>
                    <Text
                      style={[
                        styles.tableCell,
                        { textAlign: 'left' },
                      ]}
                    >
                      {parameterName}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.8 }]}>
                    <Text style={styles.tableCell}>
                      {resultValue}
                    </Text>
                  </View>
                  <View style={[styles.tableCol, { flex: 0.8 }]}>
                    <Text
                      style={[
                        styles.tableCell,
                        { fontSize: 5 },
                      ]}
                    >
                      {normalRange}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.tableColLast,
                      { flex: 0.7 },
                    ]}
                  >
                    <Text style={styles.tableCell}>
                      {status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
interface ExaminationInfoDownloadButtonProps {
  exam: any;
  services?: any[];
}

/**
 * Button component that triggers PDF generation and download of examination information
 */
export const ExaminationInfoDownloadButton: React.FC<
  ExaminationInfoDownloadButtonProps
> = ({ exam, services: propServices }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { t } = useTranslation('common');
  const { data: settingsData } = useGetAllSettingsQuery();
  const patientId = exam?.patient_id?._id || exam?.patient_id;
  const { data: patientData } = useGetPatientByIdQuery(patientId, {
    skip: !patientId,
  });

  const patient = patientData?.data || exam?.patient_id || {};

  const handleDownloadExaminationInfo = async () => {
    try {
      setIsGenerating(true);

      let allServices: any[] = propServices || exam.services || [];
      if (allServices.length > 0 && allServices[0]?.items) {
        allServices = allServices.flatMap(
          (serviceDoc: any) => serviceDoc.items || []
        );
      }
      if (allServices.length === 0 && exam.service?.items) {
        allServices = exam.service.items;
      }

      const examWithPatient = {
        ...exam,
        patient_id: patient,
        services: allServices,
      };

      const blob = await pdf(
        <ExaminationInfoPDF
          exam={examWithPatient}
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
      {isGenerating ? t('loadingText') : t('downloadPdf')}
    </Button>
  );
};
