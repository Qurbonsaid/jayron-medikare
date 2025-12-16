import Appointments from '@/pages/Appointments/Appointments';
import LabOrder from '@/pages/Diagnostika/LabOrder';
import LabResults from '@/pages/Diagnostika/LabResults';
import Inpatient from '@/pages/Inpatient/Inpatient';
import PatientPortal from '@/pages/PatientPortal';
import PatientProfile from '@/pages/Patients/PatientProfile';
import Patients from '@/pages/Patients/Patients';
import Radiology from '@/pages/Radiology/RadiologyNew';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Tizim/Settings';
import Billing from '../pages/Billing/Billing';
import DailyCheckup from '../pages/DailyCheckup/DailyCheckup';
import AddDiagnostika from '../pages/Diagnostika/AddDiagnostika';
import AnalysisParamsModal from '../pages/Diagnostika/AnalysisParamsModal';
import Disease from '../pages/Examination/Disease';
import ExaminationDetail from '../pages/Examination/ExaminationDetail';
import Examinations from '../pages/Examination/Examinations';
import Medication from '../pages/Examination/Medication';
import NewVisit from '../pages/Examination/NewVisit';
import Prescription from '../pages/Examination/Prescription';
import Service from '../pages/Examination/Service';
import { RoomCalendar, RoomsList } from '../pages/InpatientCalendar';
import Medicine from '../pages/Medicine/Medicine';
import RoomDetail from '../pages/RoomDetail/RoomDetail';
import Rooms from '../pages/Rooms/Rooms';
import Profil from '../pages/Tizim/Profil';
import { RoleConstants } from './Roles';
import { RoutePermissions } from './route-permissions';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  permission: RoleConstants[];
}

/**
 * Check if a path matches a route pattern
 * e.g., matchesRoutePattern('/patient/:id', '/patient/123') -> true
 * Also handles: matchesRoutePattern('/patient/:id', '/patient/:id') -> true
 */
const matchesRoutePattern = (pattern: string, path: string): boolean => {
  // Direct match (both are patterns or both are exact)
  if (pattern === path) {
    return true;
  }

  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    // If pattern part is a parameter like :id, it matches any path part
    if (part.startsWith(':')) {
      return true;
    }
    // Otherwise, must match exactly
    return part === pathParts[index];
  });
};

const selectPermission = (path: string) => {
  // First try exact match with GET method (for page access)
  const exactMatch = RoutePermissions.find(
    (el) => el.path === path && el.method === 'GET'
  );
  if (exactMatch) {
    return exactMatch.roles;
  }

  // If no exact match, try pattern matching with GET method
  const patternMatch = RoutePermissions.find(
    (el) => matchesRoutePattern(el.path, path) && el.method === 'GET'
  );
  if (patternMatch) {
    return patternMatch.roles;
  }

  // Fallback: return empty array if no permission found
  return [];
};

const baseRouters = [
  {
    path: '/patients',
    element: <Patients />,
  },
  {
    path: '/patient/:id',
    element: <PatientProfile />,
  },
  {
    path: '/new-visit',
    element: <NewVisit />,
  },
  {
    path: '/examinations',
    element: <Examinations />,
  },
  {
    path: '/examination/:id',
    element: <ExaminationDetail />,
  },
  {
    path: '/appointments',
    element: <Appointments />,
  },
  {
    path: '/prescription',
    element: <Prescription />,
  },
  {
    path: '/disease',
    element: <Disease />,
  },
  {
    path: '/medication',
    element: <Medication />,
  },
  {
    path: '/service',
    element: <Service />,
  },
  {
    path: '/add-diagnostika',
    element: <AddDiagnostika />,
  },
  {
    path: '/analysisById/:id',
    element: <AnalysisParamsModal />,
  },
  {
    path: '/lab-order',
    element: <LabOrder />,
  },
  {
    path: '/lab-results',
    element: <LabResults />,
  },
  {
    path: '/radiology',
    element: <Radiology />,
  },
  {
    path: '/inpatient',
    element: <Inpatient />,
  },
  {
    path: '/inpatient/:id',
    element: <Rooms />,
  },

  {
    path: '/inpatient-calendar',
    element: <RoomsList />,
  },
  {
    path: '/inpatient-calendar/:corpusId/:roomId',
    element: <RoomCalendar />,
  },

  {
    path: '/medicine',
    element: <Medicine />,
  },
  {
    path: '/room/:id',
    element: <RoomDetail />,
  },
  {
    path: '/daily-checkup',
    element: <DailyCheckup />,
  },
  {
    path: '/billing',
    element: <Billing />,
  },
  {
    path: '/reports',
    element: <Reports />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/profile',
    element: <Profil />,
  },
  {
    path: '/patient-portal',
    element: <PatientPortal />,
  },
] as const;

export const routers: RouteConfig[] = baseRouters.map((route) => ({
  ...route,
  permission: selectPermission(route.path),
}));

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
    title: 'Tаҳлил тури яратиш',
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
    path: '/patient-portal',
    to: null,
    title: 'Бемор портали',
  },
];
