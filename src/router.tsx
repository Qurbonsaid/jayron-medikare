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
import Settings from '@/pages/Tizim/Settings';
import { Navigate } from 'react-router-dom';
import Billing from './pages/Billing/Billing';
import AddDiagnostika from './pages/Diagnostika/AddDiagnostika';
import AnalysisParamsModal from './pages/Diagnostika/AnalysisParamsModal';
import Disease from './pages/Examination/Disease';
import ExaminationDetail from './pages/Examination/ExaminationDetail';
import Examinations from './pages/Examination/Examinations';
import Medication from './pages/Examination/Medication';
import NewVisit from './pages/Examination/NewVisit';
import Prescription from './pages/Examination/Prescription';
import Service from './pages/Examination/Service';
import { RoomCalendar, RoomsList } from './pages/InpatientCalendar';
import Medicine from './pages/Medicine/Medicine';
import RoomDetail from './pages/RoomDetail/RoomDetail';
import Rooms from './pages/Rooms/Rooms';
import Permissions from './pages/Tizim/Permissions';
import Profil from './pages/Tizim/Profil';
import DailyCheckup from './pages/DailyCheckup/DailyCheckup'

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
    permission: 'examination',
  },
  {
    path: '/examination/:id',
    element: <ExaminationDetail />,
    permission: 'examination',
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
  {path:"/daily-checkup",element:<DailyCheckup/> , permission:"daily_checkup"},
  { path: '/billing', element: <Billing />, permission: 'billing' },
  { path: '/reports', element: <Reports />, permission: 'reports' },
  { path: '/settings', element: <Settings />, permission: 'ceo_only' },
  { path: '/profile', element: <Profil />, permission: null },
  { path: '/permissions', element: <Permissions />, permission: 'ceo_only' },
  { path: '/patient-portal', element: <PatientPortal />, permission: null },
];

export const navigator = [
  {
    path: '/patients',
    to: null,
    title: 'Беморлар рўйхати',
  },
  {
    path: '/patient/:id',
    to: '/patients',
    title: 'Бемор профили',
  },
  {
    path: '/new-visit',
    to: null,
    title: 'Янги Кўрик',
  },
  {
    path: '/appointments',
    to: null,
    title: 'Учрашувлар',
  },
  {
    path: '/prescription',
    to: null,
    title: (
      <>
        <div className='flex items-center gap-4'>
          <div>
            <h1 className='text-xl font-bold'>Рецепт Ёзиш</h1>
            <p className='text-sm text-muted-foreground'>Янги рецепт яратиш</p>
          </div>
        </div>
      </>
    ),
  },
  {
    path: '/examinations',
    to: null,
    title: 'Кўриклар',
  },
  {
    path: '/disease',
    to: null,
    title: 'Касалликлар',
  },
  {
    path: '/medication',
    to: null,
    title: 'Дори-дармонлар',
  },
  {
    path: '/service',
    to: null,
    title: 'Хизматлар',
  },
  {
    path: '/examination/:id',
    to: '/examinations',
    title: 'Кўрик Тафсилотлари',
  },
  {
    path: '/add-diagnostika',
    to: null,
    title: 'Диагностика қўшиш',
  },
  {
    path: '/analysisById/:id',
    to: null,
    title: 'Tahlil parametrlari',
  },
  {
    path: '/lab-order',
    to: null,
    title: 'Лаборатория буюртмаси',
  },
  {
    path: '/inpatient',
    to: null,
    title: 'Стационар',
  },
  {
    path: '/inpatient/:id',
    to: '/inpatient',
    title: 'Стационар',
  },
  {
    path: '/inpatient-calendar/:corpusId/:roomId',
    to: '/inpatient-calendar',
    title: 'Хона Календари',
  },
  {
    path: '/inpatient/:id',
    to: '/inpatient',
    title: 'Стационар',
  },
  {
    path: '/room/:id',
    to: -1,
    title: 'Стационар',
  },
  {
    path: '/medicine',
    to: null,
    title: 'Дори-дармонлар',
  },
  {
    path: '/daily-checkup',
    to: null,
    title: 'Кунлик кўрик',
  },
  {
    path: '/lab-results',
    to: null,
    title: 'Таҳлил натижалари',
  },
  {
    path: '/billing',
    to: null,
    title: 'Ҳисоб-китоб',
  },
  {
    path: '/reports',
    to: null,
    // title: "Ҳисоботлар",
  },
  {
    path: '/radiology',
    to: null,
    title: 'Рентген',
  },
  {
    path: '/settings',
    to: null,
    title: (
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-xl font-bold'>Созламалар</h1>
          <p className='text-sm text-muted-foreground'>
            Тизим ва фойдаланувчи созламалари
          </p>
        </div>
      </div>
    ),
  },
  {
    path: '/profile',
    to: null,
    title: 'Профил',
  },
  {
    path: '/permissions',
    to: null,
    title: (
      <div className='flex items-center gap-4'>
        <div>
          <h1 className='text-xl font-bold'>Рухсатлар</h1>
          <p className='text-sm text-muted-foreground'>
            Тизим рухсатларини бошқариш
          </p>
        </div>
      </div>
    ),
  },
  {
    path: '/patient-portal',
    to: null,
    title: 'Бемор портали',
  },
];
