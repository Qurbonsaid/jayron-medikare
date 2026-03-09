/**
 * Examination PDF - Main Export File
 * This file now re-exports all PDF components from their individual files
 * for backward compatibility
 */

// Re-export all PDF components from their individual files
export { AllPrescriptionsPDF, AllPrescriptionsDownloadButton } from './AllPrescriptionsPDF';
export { ExaminationInfoPDF, ExaminationInfoDownloadButton } from './ExaminationInfoPDF';
export { ServicesPDF, ServicesDownloadButton } from './ServicesPDF';
export { NeurologicStatusPDF, NeurologicStatusDownloadButton } from './NeurologicStatusPDF';
export { PDFContactFooter } from './PDFContactFooter';
export { styles, formatPhone, formatDate, getDiagnosis, getTreatmentType, getTotalPrice, getStatus, getAge } from './PDFUtils';

// Default export for backward compatibility
export { AllPrescriptionsDownloadButton as default };
