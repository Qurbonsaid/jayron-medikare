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
import Medicine from './pages/Medicine/Medicine';
import RoomDetail from './pages/RoomDetail/RoomDetail';
import Rooms from './pages/Rooms/Rooms';
import Permissions from './pages/Tizim/Permissions';
import Profil from './pages/Tizim/Profil';

export const routers = [
  { path: '/dashboard', element: <Navigate to={'/patients'} /> },
  { path: '/patients', element: <Patients /> },
  { path: '/patient/:id', element: <PatientProfile /> },
  { path: '/new-visit', element: <NewVisit /> },
  { path: '/appointments', element: <Appointments /> },
  { path: '/prescription', element: <Prescription /> },
  { path: '/examinations', element: <Examinations /> },
  { path: '/examination/:id', element: <ExaminationDetail /> },
  { path: '/disease', element: <Disease /> },
  { path: '/medication', element: <Medication /> },
  { path: '/service', element: <Service /> },
  { path: '/add-diagnostika', element: <AddDiagnostika /> },
  { path: '/analysisById/:id', element: <AnalysisParamsModal /> },
  { path: '/lab-order', element: <LabOrder /> },
  { path: '/inpatient', element: <Inpatient /> },
  { path: '/inpatient/:id', element: <Rooms /> },
  { path: '/room/:id', element: <RoomDetail /> },
  { path: '/medicine', element: <Medicine /> },
  { path: '/lab-results', element: <LabResults /> },
  { path: '/billing', element: <Billing /> },
  { path: '/reports', element: <Reports /> },
  { path: '/radiology', element: <Radiology /> },
  { path: '/settings', element: <Settings /> },
  { path: '/profile', element: <Profil /> },
  { path: '/permissions', element: <Permissions /> },
  { path: '/patient-portal', element: <PatientPortal /> },
];

export const navigator = [
  {
    path: '/patients',
    to: null,
    title: 'Беморлар',
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
