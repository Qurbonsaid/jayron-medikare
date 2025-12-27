import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import uzCyrlCommon from './locales/uz-Cyrl/common.json';
import uzCyrlSidebar from './locales/uz-Cyrl/sidebar.json';
import uzCyrlLogin from './locales/uz-Cyrl/login.json';
import uzCyrlPatients from './locales/uz-Cyrl/patients.json';
import uzCyrlExaminations from './locales/uz-Cyrl/examinations.json';
import uzCyrlBilling from './locales/uz-Cyrl/billing.json';
import uzCyrlReports from './locales/uz-Cyrl/reports.json';
import uzCyrlSettings from './locales/uz-Cyrl/settings.json';
import uzCyrlDashboard from './locales/uz-Cyrl/dashboard.json';
import uzCyrlRadiology from './locales/uz-Cyrl/radiology.json';
import uzCyrlInpatient from './locales/uz-Cyrl/inpatient.json';
import uzCyrlMedication from './locales/uz-Cyrl/medication.json';
import uzCyrlDiagnostics from './locales/uz-Cyrl/diagnostics.json';
import uzCyrlPatientPortal from './locales/uz-Cyrl/patientPortal.json';
import uzCyrlAppointments from './locales/uz-Cyrl/appointments.json';

import uzLatnCommon from './locales/uz-Latn/common.json';
import uzLatnSidebar from './locales/uz-Latn/sidebar.json';
import uzLatnLogin from './locales/uz-Latn/login.json';
import uzLatnPatients from './locales/uz-Latn/patients.json';
import uzLatnExaminations from './locales/uz-Latn/examinations.json';
import uzLatnBilling from './locales/uz-Latn/billing.json';
import uzLatnReports from './locales/uz-Latn/reports.json';
import uzLatnSettings from './locales/uz-Latn/settings.json';
import uzLatnDashboard from './locales/uz-Latn/dashboard.json';
import uzLatnRadiology from './locales/uz-Latn/radiology.json';
import uzLatnInpatient from './locales/uz-Latn/inpatient.json';
import uzLatnMedication from './locales/uz-Latn/medication.json';
import uzLatnDiagnostics from './locales/uz-Latn/diagnostics.json';
import uzLatnPatientPortal from './locales/uz-Latn/patientPortal.json';
import uzLatnAppointments from './locales/uz-Latn/appointments.json';

import enCommon from './locales/en/common.json';
import enSidebar from './locales/en/sidebar.json';
import enLogin from './locales/en/login.json';
import enPatients from './locales/en/patients.json';
import enExaminations from './locales/en/examinations.json';
import enBilling from './locales/en/billing.json';
import enReports from './locales/en/reports.json';
import enSettings from './locales/en/settings.json';
import enDashboard from './locales/en/dashboard.json';
import enRadiology from './locales/en/radiology.json';
import enInpatient from './locales/en/inpatient.json';
import enMedication from './locales/en/medication.json';
import enDiagnostics from './locales/en/diagnostics.json';
import enPatientPortal from './locales/en/patientPortal.json';
import enAppointments from './locales/en/appointments.json';

import ruCommon from './locales/ru/common.json';
import ruSidebar from './locales/ru/sidebar.json';
import ruLogin from './locales/ru/login.json';
import ruPatients from './locales/ru/patients.json';
import ruExaminations from './locales/ru/examinations.json';
import ruBilling from './locales/ru/billing.json';
import ruReports from './locales/ru/reports.json';
import ruSettings from './locales/ru/settings.json';
import ruDashboard from './locales/ru/dashboard.json';
import ruRadiology from './locales/ru/radiology.json';
import ruInpatient from './locales/ru/inpatient.json';
import ruMedication from './locales/ru/medication.json';
import ruDiagnostics from './locales/ru/diagnostics.json';
import ruPatientPortal from './locales/ru/patientPortal.json';
import ruAppointments from './locales/ru/appointments.json';

export const resources = {
  'uz-Cyrl': {
    common: uzCyrlCommon,
    sidebar: uzCyrlSidebar,
    login: uzCyrlLogin,
    patients: uzCyrlPatients,
    examinations: uzCyrlExaminations,
    billing: uzCyrlBilling,
    reports: uzCyrlReports,
    settings: uzCyrlSettings,
    dashboard: uzCyrlDashboard,
    radiology: uzCyrlRadiology,
    inpatient: uzCyrlInpatient,
    medication: uzCyrlMedication,
    diagnostics: uzCyrlDiagnostics,
    patientPortal: uzCyrlPatientPortal,
    appointments: uzCyrlAppointments,
  },
  'uz-Latn': {
    common: uzLatnCommon,
    sidebar: uzLatnSidebar,
    login: uzLatnLogin,
    patients: uzLatnPatients,
    examinations: uzLatnExaminations,
    billing: uzLatnBilling,
    reports: uzLatnReports,
    settings: uzLatnSettings,
    dashboard: uzLatnDashboard,
    radiology: uzLatnRadiology,
    inpatient: uzLatnInpatient,
    medication: uzLatnMedication,
    diagnostics: uzLatnDiagnostics,
    patientPortal: uzLatnPatientPortal,
    appointments: uzLatnAppointments,
  },
  en: {
    common: enCommon,
    sidebar: enSidebar,
    login: enLogin,
    patients: enPatients,
    examinations: enExaminations,
    billing: enBilling,
    reports: enReports,
    settings: enSettings,
    dashboard: enDashboard,
    radiology: enRadiology,
    inpatient: enInpatient,
    medication: enMedication,
    diagnostics: enDiagnostics,
    patientPortal: enPatientPortal,
    appointments: enAppointments,
  },
  ru: {
    common: ruCommon,
    sidebar: ruSidebar,
    login: ruLogin,
    patients: ruPatients,
    examinations: ruExaminations,
    billing: ruBilling,
    reports: ruReports,
    settings: ruSettings,
    dashboard: ruDashboard,
    radiology: ruRadiology,
    inpatient: ruInpatient,
    medication: ruMedication,
    diagnostics: ruDiagnostics,
    patientPortal: ruPatientPortal,
    appointments: ruAppointments,
  },
};

export const languages = [
  { code: 'uz-Cyrl', name: 'Ўзбекча (Кирилл)', flag: '🇺🇿' },
  { code: 'uz-Latn', name: "O'zbekcha (Lotin)", flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'uz-Cyrl',
    defaultNS: 'common',
    ns: [
      'common',
      'sidebar',
      'login',
      'patients',
      'examinations',
      'billing',
      'reports',
      'settings',
      'dashboard',
      'radiology',
      'inpatient',
      'medication',
      'diagnostics',
      'patientPortal',
      'appointments',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
