import Appointments from '@/pages/Appointments/Appointments';
// import Dashboard from "@/pages/Dashboard";
import LabOrder from '@/pages/Diagnostika/LabOrder';
import LabResults from '@/pages/Diagnostika/LabResults';
import Inpatient from '@/pages/Inpatient/Inpatient';
import PatientPortal from '@/pages/PatientPortal';
import PatientProfile from '@/pages/Patients/PatientProfile';
import Patients from '@/pages/Patients/Patients';
import Radiology from '@/pages/Radiology/RadiologyNew';
import Reports from '@/pages/Reports';
import Templates from '@/pages/Templates';
import Settings from '@/pages/Tizim/Settings';
import { Navigate } from 'react-router-dom';
import Billing from './pages/Billing/Billing';
import DailyCheckup from './pages/DailyCheckup/DailyCheckup';
import AddDiagnostika from './pages/Diagnostika/AddDiagnostika';
import AnalysisParamsModal from './pages/Diagnostika/AnalysisParamsModal';
import Disease from './pages/Examination/Disease';
import ExaminationDetail from './pages/Examination/ExaminationDetail';
import Examinations from './pages/Examination/Examinations';
import Medication from './pages/Examination/Medication';
import NewVisit from './pages/Examination/NewVisit';
import Prescription from './pages/Examination/Prescription';
import Service from './pages/Examination/Service';
import History from './pages/History';
import { RoomCalendar, RoomsList } from './pages/InpatientCalendar';
import Medicine from './pages/Medicine/Medicine';
import RoomDetail from './pages/RoomDetail/RoomDetail';
import Rooms from './pages/Rooms/Rooms';
import Profil from './pages/Tizim/Profil';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  permission: string | null; // null = har kim ko'ra oladi
}

export const routers: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <Navigate to={'/patients'} />,
    permission: null,
  },
  { path: '/patients', element: <Patients />, permission: 'patient' },
  { path: '/patient/:id', element: <PatientProfile />, permission: 'patient' },
  { path: '/new-visit', element: <NewVisit />, permission: 'examination' },
  {
    path: '/examinations',
    element: <Examinations />,
    permission: 'examinations',
  },
  {
    path: '/examination/:id',
    element: <ExaminationDetail />,
    permission: 'examinations',
  },
  {
    path: '/appointments',
    element: <Appointments />,
    permission: 'examination',
  },
  {
    path: '/prescription',
    element: <Prescription />,
    permission: 'prescription',
  },
  { path: '/disease', element: <Disease />, permission: 'diagnosis' },
  { path: '/medication', element: <Medication />, permission: 'medication' },
  { path: '/service', element: <Service />, permission: 'service_type' },
  {
    path: '/add-diagnostika',
    element: <AddDiagnostika />,
    permission: 'analysis',
  },
  {
    path: '/analysisById/:id',
    element: <AnalysisParamsModal />,
    permission: 'analysis',
  },
  { path: '/lab-order', element: <LabOrder />, permission: 'patient_analysis' },
  {
    path: '/lab-results',
    element: <LabResults />,
    permission: 'patient_analysis',
  },
  { path: '/radiology', element: <Radiology />, permission: 'medical_image' },
  { path: '/inpatient', element: <Inpatient />, permission: 'room' },
  {
    path: '/inpatient-calendar',
    element: <RoomsList />,
    permission: 'room',
  },
  {
    path: '/inpatient-calendar/:corpusId/:roomId',
    element: <RoomCalendar />,
    permission: 'room',
  },
  { path: '/inpatient/:id', element: <Rooms />, permission: 'room' },
  { path: '/room/:id', element: <RoomDetail />, permission: 'room' },
  { path: '/medicine', element: <Medicine />, permission: 'medication' },
  {
    path: '/daily-checkup',
    element: <DailyCheckup />,
    permission: 'daily_checkup',
  },
  { path: '/billing', element: <Billing />, permission: 'billing' },
  { path: '/reports', element: <Reports />, permission: 'reports' },
  { path: '/templates', element: <Templates />, permission: 'templates' },
  { path: '/history', element: <History />, permission: 'examinations' },
  { path: '/settings', element: <Settings />, permission: 'ceo_only' },
  { path: '/profile', element: <Profil />, permission: null },
  { path: '/patient-portal', element: <PatientPortal />, permission: null },
];

export const navigator = [
  {
    path: '/patients',
    to: null,
    title: 'Беморлар',
    titleKey: 'nav.patients',
  },
  {
    path: '/patient/:id',
    to: '/patients',
    title: 'Бемор профили',
    titleKey: 'nav.patientProfile',
  },
  {
    path: '/new-visit',
    to: null,
    title: 'Янги Кўрик',
    titleKey: 'nav.newVisit',
  },
  {
    path: '/appointments',
    to: null,
    title: 'Учрашувлар',
    titleKey: 'nav.appointments',
  },
  {
    path: '/prescription',
    to: null,
    title: 'Рецепт Ёзиш',
    titleKey: 'nav.prescription',
  },
  {
    path: '/examinations',
    to: null,
    title: 'Кўриклар',
    titleKey: 'nav.examinations',
  },
  {
    path: '/disease',
    to: null,
    title: 'Касалликлар',
    titleKey: 'nav.diseases',
  },
  {
    path: '/medication',
    to: null,
    title: 'Дори-дармонлар',
    titleKey: 'nav.medications',
  },
  {
    path: '/service',
    to: null,
    title: 'Хизматлар',
    titleKey: 'nav.services',
  },
  {
    path: '/examination/:id',
    to: '/examinations',
    title: 'Кўрик Тафсилотлари',
    titleKey: 'nav.examinationDetails',
  },
  {
    path: '/add-diagnostika',
    to: null,
    title: 'Диагностика қўшиш',
    titleKey: 'nav.addDiagnostics',
  },
  {
    path: '/analysisById/:id',
    to: null,
    title: 'Tahlil parametrlari',
    titleKey: 'nav.labResults',
  },
  {
    path: '/lab-order',
    to: null,
    title: 'Лаборатория буюртмаси',
    titleKey: 'nav.labOrder',
  },
  {
    path: '/inpatient',
    to: null,
    title: 'Стационар',
    titleKey: 'nav.inpatient',
  },
  {
    path: '/inpatient/:id',
    to: '/inpatient',
    title: 'Стационар',
    titleKey: 'nav.inpatient',
  },
  {
    path: '/inpatient-calendar/:corpusId/:roomId',
    to: '/inpatient-calendar',
    title: 'Хона Календари',
    titleKey: 'nav.room',
  },
  {
    path: '/inpatient/:id',
    to: '/inpatient',
    title: 'Стационар',
    titleKey: 'nav.inpatient',
  },
  {
    path: '/room/:id',
    to: -1,
    title: 'Стационар',
    titleKey: 'nav.room',
  },
  {
    path: '/medicine',
    to: null,
    title: 'Дори-дармонлар',
    titleKey: 'nav.medicine',
  },
  {
    path: '/daily-checkup',
    to: null,
    title: 'Кунлик кўрик',
    titleKey: 'nav.dailyCheckup',
  },
  {
    path: '/lab-results',
    to: null,
    title: 'Таҳлил натижалари',
    titleKey: 'nav.labResults',
  },
  {
    path: '/billing',
    to: null,
    title: 'Ҳисоб-китоб',
    titleKey: 'nav.billing',
  },
  {
    path: '/reports',
    to: null,
    title: 'Ҳисоботлар',
    titleKey: 'menu.reports',
  },
  {
    path: '/templates',
    to: null,
    title: 'Шаблонлар',
    titleKey: 'menu.templates',
  },
  {
    path: '/history',
    to: null,
    title: 'Тарих',
    titleKey: 'menu.history',
  },
  {
    path: '/radiology',
    to: null,
    title: 'Рентген',
    titleKey: 'nav.radiology',
  },
  {
    path: '/settings',
    to: null,
    title: 'Созламалар',
    titleKey: 'nav.settings',
  },
  {
    path: '/profile',
    to: null,
    title: 'Профил',
    titleKey: 'nav.profile',
  },
  {
    path: '/permissions',
    to: null,
    title: 'Рухсатлар',
    titleKey: 'settings.permissions',
  },
  {
    path: '/patient-portal',
    to: null,
    title: 'Бемор портали',
    titleKey: 'nav.patientPortal',
  },
];
