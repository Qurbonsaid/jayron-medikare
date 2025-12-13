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
import { RoutePermissions } from './route-permissions';

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: RoleConstants[];
}

export interface MenuCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const baseMenuCategories: MenuCategory[] = [
  {
    id: 'patients',
    title: 'БЕМОРЛАР',
    icon: Users,
    items: [
      {
        title: 'Беморлар рўйхати',
        url: '/patients',
        icon: List,
        roles: [],
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
        roles: [],
      },
      {
        title: 'Кўриклар',
        url: '/examinations',
        icon: Calendar,
        roles: [],
      },
      {
        title: 'Рецепт ёзиш',
        url: '/prescription',
        icon: Pill,
        roles: [],
      },
      {
        title: 'Касалликлар',
        url: '/disease',
        icon: HeartPulse,
        roles: [],
      },
      {
        title: 'Хизматлар',
        url: '/service',
        icon: ClipboardCheck,
        roles: [],
      },
      {
        title: 'Дори-дармонлар',
        url: '/medication',
        icon: PillBottle,
        roles: [],
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
        roles: [],
      },
      {
        title: 'Таҳлил буюртмаси',
        url: '/lab-order',
        icon: TestTube,
        roles: [],
      },
      {
        title: 'Таҳлил натижалари',
        url: '/lab-results',
        icon: ClipboardCheck,
        roles: [],
      },
      {
        title: 'Рентген/МРТ/КТ',
        url: '/radiology',
        icon: ScanLine,
        roles: [],
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
        roles: [],
      },
      {
        title: 'Стационар бошқаруви',
        url: '/inpatient',
        icon: BedDouble,
        roles: [],
      },
      {
        title: 'Дори va lichenya Бериsh',
        url: '/medicine',
        icon: Pill,
        roles: [],
      },
      {
        title: 'Кунлик кўрик',
        url: '/daily-checkup',
        icon: ClipboardCheck,
        roles: [],
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
        roles: [],
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
        roles: [],
      },
    ],
  },
];

export const baseSystemMenu: MenuCategory = {
  id: 'system',
  title: 'ТИЗИМ',
  icon: Settings,
  items: [
    {
      title: 'Созламалар',
      url: '/settings',
      icon: Settings,
      roles: [],
    },
    {
      title: 'Профил',
      url: '/profile',
      icon: User,
      roles: [], // har kim ko'ra oladi
    },
  ],
};

const selectPermission = (path: string): RoleConstants[] => {
  return (
    RoutePermissions.find((el) => el.path === path && el.method === 'GET')
      ?.roles || []
  );
};

export const systemMenu: MenuCategory = {
  ...baseSystemMenu,
  items: baseSystemMenu.items.map((item) => ({
    ...item,
    roles: selectPermission(item.url),
  })),
};

export const menuCategories: MenuCategory[] = baseMenuCategories.map(
  (category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      roles: selectPermission(item.url),
    })),
  })
);
