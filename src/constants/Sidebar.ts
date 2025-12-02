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
  Shield,
  Stethoscope,
  TestTube,
  User,
  Users,
  Wallet,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission: string | null;
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
        permission: 'patients',
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
        permission: 'examination',
      },
      {
        title: 'Кўриклар',
        url: '/visits',
        icon: Calendar,
        permission: 'examination',
      },
      {
        title: 'Рецепт ёзиш',
        url: '/prescription',
        icon: Pill,
        permission: 'prescription',
      },
      {
        title: 'Касалликлар',
        url: '/disease',
        icon: HeartPulse,
        permission: 'disease',
      },
      {
        title: 'Хизматлар',
        url: '/service',
        icon: ClipboardCheck,
        permission: 'service',
      },
      {
        title: 'Дори-дармонлар',
        url: '/medication',
        icon: PillBottle,
        permission: 'medication',
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
        permission: 'diagnostic',
      },
      {
        title: 'Таҳлил буюртмаси',
        url: '/lab-order',
        icon: TestTube,
        permission: 'lab_order',
      },
      {
        title: 'Таҳлил натижалари',
        url: '/lab-results',
        icon: ClipboardCheck,
        permission: 'lab_results',
      },
      {
        title: 'Рентген/МРТ/КТ',
        url: '/radiology',
        icon: ScanLine,
        permission: 'radiology',
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
        permission: 'inpatient',
      },
      {
        title: 'Стационар бошқаруви',
        url: '/inpatient',
        icon: BedDouble,
        permission: 'inpatient',
      },
      {
        title: 'Дори va lichenya Бериsh',
        url: '/medicine',
        icon: Pill,
        permission: 'medicine',
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
        permission: 'billing',
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
        permission: 'reports',
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
      permission: 'settings',
    },
    { title: 'Профил', url: '/profile', icon: User, permission: null }, // har kim ko'ra oladi
    {
      title: 'Рухсатлар',
      url: '/permissions',
      icon: Shield,
      permission: 'permissions',
    },
  ],
};
