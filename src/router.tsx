import ListIcon from '@/icons/ListIcon';
import Appointments from '@/pages/Appointments/Appointments';
import Billing from '@/pages/Billing';
import Dashboard from '@/pages/Dashboard';
import Inpatient from '@/pages/Inpatient';
import LabResults from '@/pages/LabResults';
import NewVisit from '@/pages/Examination/NewVisit';
import PatientPortal from '@/pages/PatientPortal';
import PatientProfile from '@/pages/Patients/PatientProfile';
import Patients from '@/pages/Patients/Patients';
import Prescription from '@/pages/Examination/Prescription';
import Radiology from '@/pages/Radiology';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import LabOrder from '@/pages/LabOrder';
import Visits from './pages/Examination/Visits';

export const routers = [
  { path: '/dashboard', element: <Dashboard /> },

  { path: '/patients', element: <Patients /> },
  { path: '/patient/:id', element: <PatientProfile /> },
  { path: '/new-visit', element: <NewVisit /> },
  { path: '/appointments', element: <Appointments /> },
  { path: '/visits', element: <Visits /> },
  { path: '/prescription', element: <Prescription /> },
  { path: '/lab-order', element: <LabOrder /> },
  { path: '/inpatient', element: <Inpatient /> },
  { path: '/lab-results', element: <LabResults /> },
  { path: '/billing', element: <Billing /> },
  { path: '/reports', element: <Reports /> },
  { path: '/radiology', element: <Radiology /> },
  { path: '/settings', element: <Settings /> },
  { path: '/patient-portal', element: <PatientPortal /> },
];

export const navigator = [
  {
    path: '/dashboard',
    to: null,
    title: 'Бош саҳифа',
  },
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
    title: (
      <div>
        <h1 className='text-xl font-bold'>Янги Кўрик</h1>
        <p className='text-sm text-muted-foreground'>SOAP Ёзув</p>
      </div>
    ),
  },
  {
    path: '/appointments',
    to: null,
    title: 'Учрашувлар',
  },
  {
    path: '/visits',
    to: null,
    title: null,
  },
  {
    path: '/prescription',
    to: null,
    title: 'Рецептлар',
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
    title: 'Ҳисоботлар',
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
    path: '/patient-portal',
    to: null,
    title: 'Бемор портали',
  },
];
import {
  BarChart3,
  BedDouble,
  Calendar,
  ClipboardCheck,
  FileEdit,
  List,
  Microscope,
  Pill,
  ScanLine,
  Settings as SettingIcon,
  Stethoscope,
  TestTube,
  Users,
  Wallet,
} from 'lucide-react';
export const menuCategories = [
  {
    id: 'patients',
    title: 'БЕМОРЛАР',
    icon: Users,
    items: [{ title: 'Беморлар рўйхати', url: '/patients', icon: List }],
  },
  {
    id: 'clinical',
    title: 'КЎРИКЛАР',
    icon: Stethoscope,
    items: [
      { title: 'Янги кўрик SOAP', url: '/new-visit', icon: FileEdit },
      { title: 'Навбатлар', url: '/appointments', icon: Calendar },
      { title: 'Кўриклар', url: '/visits', icon: Calendar },
      { title: 'Рецепт ёзиш', url: '/prescription', icon: Pill },
    ],
  },
  {
    id: 'diagnostics',
    title: 'ДИАГНОСТИКА',
    icon: Microscope,
    items: [
      { title: 'Таҳлил буюртмаси', url: '/lab-order', icon: TestTube },
      { title: 'Таҳлил натижалари', url: '/lab-results', icon: ClipboardCheck },
      { title: 'Рентген/МРТ/КТ', url: '/radiology', icon: ScanLine },
    ],
  },
  {
    id: 'inpatient',
    title: 'СТАЦИОНАР',
    icon: BedDouble,
    items: [
      { title: 'Стационар бошқаруви', url: '/inpatient', icon: BedDouble },
    ],
  },
  {
    id: 'finance',
    title: 'МОЛИЯ',
    icon: Wallet,
    items: [{ title: 'Ҳисоб-китоб', url: '/billing', icon: Wallet }],
  },
  {
    id: 'reports',
    title: 'ҲИСОБОТЛАР',
    icon: BarChart3,
    items: [{ title: 'Ҳисоботлар', url: '/reports', icon: BarChart3 }],
  },
];

export const systemMenu = {
  id: 'system',
  title: 'ТИЗИМ',
  icon: SettingIcon,
  items: [{ title: 'Созламалар', url: '/settings', icon: SettingIcon }],
};