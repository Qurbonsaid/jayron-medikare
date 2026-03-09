/**
 * Neurologic Status PDF Component
 * Displays neurological examination status with cranial nerves assessment
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
  getAge,
  getDiagnosis,
  styles,
} from './PDFUtils';
import { PDFContactFooter } from './PDFContactFooter';

interface NeurologicStatusPDFProps {
  exam: any;
  neurologic: any;
  settings?: Settings;
}

// Field labels for neurological examination
const neurologicFieldLabels: Record<string, string> = {
  meningeal_symptoms: 'Менингеальные симптомы',
  i_para_n_olfactorius: 'I пара – n.olfactorius',
  ii_para_n_opticus: 'II пара – n. opticus',
  iii_para_n_oculomotorius: 'III пара – n. oculomotorius',
  iv_para_n_trochlearis: 'IV пара – n. trochlearis',
  v_para_n_trigeminus: 'V пара – n. trigeminus',
  vi_para_n_abducens: 'VI пара – n. abducens',
  vii_para_n_fascialis: 'VII пара – n. facialis',
  viii_para_n_vestibulocochlearis:
    'VIII пара – n. vestibulocochlearis',
  ix_para_n_glossopharyngeus: 'IX пара – n. glossopharyngeus',
  x_para_n_vagus: 'X пара – n. vagus',
  xi_para_n_accessorius: 'XI пара – n. accessorius',
  xii_para_n_hypoglossus: 'XII пара – n. hypoglossus',
  motor_system: 'Координаторная сфера',
  sensory_sphere: 'Высшие мозговые функции',
  coordination_sphere:
    'Синдромологический диагноз, обоснование',
  higher_brain_functions:
    'Топический диагноз и его обоснование',
  syndromic_diagnosis_justification:
    'Синдромологический диагноз',
  topical_diagnosis_justification: 'Топический диагноз',
};

// Field order for display
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

/**
 * PDF component displaying neurological examination status with cranial nerves assessment
 */
export const NeurologicStatusPDF: React.FC<
  NeurologicStatusPDFProps
> = ({ exam, neurologic, settings }) => {
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
            <Text style={styles.documentTitle}>
              НЕВРОЛОГИК СТАТУС
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.date}>
              {formatDate(
                neurologic.created_at || exam.created_at
              )}
            </Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.patientInfo}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Bemor F.I.O:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.fullname ||
                  "Noma'lum"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Yoshi:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getAge(
                  exam.patient_id?.birth_date ||
                    exam.patient_id?.date_of_birth
                )}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Telefon:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.phone ||
                  "Ko'rsatilmagan"}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Manzil:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {exam.patient_id?.address ||
                  "Ko'rsatilmagan"}
              </Text>
            </View>
          </View>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.bold}>Diagnoz:</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                {getDiagnosis(exam.diagnosis)}
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

        {/* Neurological Examination Data */}
        <View style={[styles.patientInfo, { marginTop: 8 }]}>
          <Text
            style={[
              styles.sectionTitle,
              { marginBottom: 6 },
            ]}
          >
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
                  <Text
                    style={[
                      styles.bold,
                      { fontSize: 8, color: '#333' },
                    ]}
                  >
                    {neurologicFieldLabels[field] ||
                      field}
                    :
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

        <PDFContactFooter settings={settings} />
      </Page>
    </Document>
  );
};

// Download button component
interface NeurologicStatusDownloadButtonProps {
  exam: any;
  neurologic: any;
}

/**
 * Button component that triggers PDF generation and download of neurological status report
 */
export const NeurologicStatusDownloadButton: React.FC<
  NeurologicStatusDownloadButtonProps
> = ({ exam, neurologic }) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { t } = useTranslation('common');
  const { data: settingsData } = useGetAllSettingsQuery();

  const handleDownloadNeurologicStatus = async () => {
    if (!neurologic) {
      alert('Неврологик статус mavjud emas');
      return;
    }

    try {
      setIsGenerating(true);

      const blob = await pdf(
        <NeurologicStatusPDF
          exam={exam}
          neurologic={neurologic}
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
      {isGenerating ? t('loadingText') : t('downloadPdf')}
    </Button>
  );
};
