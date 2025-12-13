import {
  BarChart3,
  BedDouble,
  Calendar,
  CalendarDays,
  CirclePlus,
  ClipboardCheck,
  FileEdit,
  HeartPulse,
  List,
  LucideIcon,
  Microscope,
  Pill,
  PillBottle,
  ScanLine,
  Settings,
  Stethoscope,
  TestTube,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { RoleConstants } from './Roles';

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: RoleConstants[] | null;
}

export interface MenuCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'patients',
    title: 'БЕМОРЛАР',
    icon: Users,
    items: [
      {
        title: 'Беморлар рўйхати',
        url: '/patients',
        icon: List,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
    ],
  },
  {
    id: 'clinical',
    title: 'КЎРИКЛАР',
    icon: Stethoscope,
    items: [
      {
        title: 'Янги кўрик',
        url: '/new-visit',
        icon: FileEdit,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
      },
      {
        title: 'Кўриклар',
        url: '/examinations',
        icon: Calendar,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN],
      },
      {
        title: 'Рецепт ёзиш',
        url: '/prescription',
        icon: Pill,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Касалликлар',
        url: '/disease',
        icon: HeartPulse,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Хизматлар',
        url: '/service',
        icon: ClipboardCheck,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Дори-дармонлар',
        url: '/medication',
        icon: PillBottle,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.PHARMACIST,
          RoleConstants.RECEPTIONIST,
        ],
      },
    ],
  },
  {
    id: 'diagnostics',
    title: 'ДИАГНОСТИКА',
    icon: Microscope,
    items: [
      {
        title: 'Диагностика қўшиш',
        url: '/add-diagnostika',
        icon: CirclePlus,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
      },
      {
        title: 'Таҳлил буюртмаси',
        url: '/lab-order',
        icon: TestTube,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN, RoleConstants.DOCTOR],
      },
      {
        title: 'Таҳлил натижалари',
        url: '/lab-results',
        icon: ClipboardCheck,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Рентген/МРТ/КТ',
        url: '/radiology',
        icon: ScanLine,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
    ],
  },
  {
    id: 'inpatient',
    title: 'СТАЦИОНАР',
    icon: BedDouble,
    items: [
      {
        title: 'Стационар календари',
        url: '/inpatient-calendar',
        icon: CalendarDays,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Стационар бошқаруви',
        url: '/inpatient',
        icon: BedDouble,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Дори va lichenya Бериsh',
        url: '/medicine',
        icon: Pill,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.PHARMACIST,
          RoleConstants.RECEPTIONIST,
        ],
      },
      {
        title: 'Кунлик кўрик',
        url: '/daily-checkup',
        icon: ClipboardCheck,
        roles: [
          RoleConstants.CEO,
          RoleConstants.ADMIN,
          RoleConstants.DOCTOR,
          RoleConstants.NURSE,
          RoleConstants.RECEPTIONIST,
        ],
      },
    ],
  },
  {
    id: 'finance',
    title: 'МОЛИЯ',
    icon: Wallet,
    items: [
      {
        title: 'Ҳисоб-китоб',
        url: '/billing',
        icon: Wallet,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN],
      },
    ],
  },
  {
    id: 'reports',
    title: 'ҲИСОБОТЛАР',
    icon: BarChart3,
    items: [
      {
        title: 'Ҳисоботлар',
        url: '/reports',
        icon: BarChart3,
        roles: [RoleConstants.CEO, RoleConstants.ADMIN],
      },
    ],
  },
];

export const systemMenu: MenuCategory = {
  id: 'system',
  title: 'ТИЗИМ',
  icon: Settings,
  items: [
    {
      title: 'Созламалар',
      url: '/settings',
      icon: Settings,
      roles: [RoleConstants.CEO],
    },
    {
      title: 'Профил',
      url: '/profile',
      icon: User,
      roles: null, // har kim ko'ra oladi
    },
  ],
};
