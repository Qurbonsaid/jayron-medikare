/**
 * PDF Utility Functions and Shared Styles
 * Shared across all PDF components
 */

import { Font, StyleSheet } from '@react-pdf/renderer';

// Register Roboto font for Cyrillic/multilingual support
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

// PDF styles - shared across all PDF components
export const styles = StyleSheet.create({
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
    lineHeight: 0.7,
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
    alignItems: 'stretch',
    minHeight: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  tableCol: {
    flex: 1,
    padding: 2,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
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
    lineHeight: 1.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  gridItem: {
    width: '48%',
    marginBottom: 1,
    marginRight: '2%',
  },
  fullWidth: {
    width: '100%',
    marginRight: 0,
  },
});

// Helper function to format phone numbers
export const formatPhone = (phone: string | undefined): string => {
  if (!phone) return "Ko'rsatilmagan";
  // Extract only digits
  const digits = phone.replace(/\D/g, '');
  // Add 998 if not present
  const fullNumber = digits.startsWith('998') ? digits : `998${digits}`;
  // Format only if 12 digits
  if (fullNumber.length === 12) {
    return `+${fullNumber.slice(0, 3)} ${fullNumber.slice(3, 5)} ${fullNumber.slice(5, 8)} ${fullNumber.slice(8, 10)} ${fullNumber.slice(10, 12)}`;
  }
  // Return original if can't be formatted
  return phone;
};

// Helper function to format dates
export const formatDate = (date: Date | string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Helper function to get diagnosis text
export const getDiagnosis = (diagnosis: any): string => {
  if (!diagnosis) return 'Belgilanmagan';

  if (Array.isArray(diagnosis)) {
    if (diagnosis.length === 0) return 'Belgilanmagan';
    return diagnosis
      .map((d: any) => (typeof d === 'object' ? d.name : d))
      .filter((name: string) => name && name.trim())
      .join(', ');
  }

  if (typeof diagnosis === 'string') {
    return diagnosis.trim() || 'Belgilanmagan';
  }

  return diagnosis.name || 'Belgilanmagan';
};

// Helper function to get treatment type
export const getTreatmentType = (treatment_type: string): string => {
  const types: Record<string, string> = {
    stasionar: 'Statsionar',
    ambulator: 'Ambulator',
  };
  return types[treatment_type] || treatment_type || "Ko'rsatilmagan";
};

// Helper function to get total price
export const getTotalPrice = (services: any[]): number => {
  if (!Array.isArray(services)) return 0;
  return services.reduce((sum: number, service: any) => {
    return sum + (service.total_price || service.price || 0);
  }, 0);
};

// Helper function to get status text
export const getStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    completed: 'Tugallandi',
    pending: 'Kutilmoqda',
    cancelled: 'Bekor qilindi',
  };
  return statuses[status] || status || 'Noma\'lum';
};

// Helper function to calculate age
export const getAge = (date_of_birth: string | Date): string => {
  const today = new Date();
  const birthDate = new Date(date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age.toString();
};
