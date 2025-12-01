import {
  BarChart3,
  BedDouble,
  Calendar,
  CirclePlus,
  ClipboardCheck,
  FileEdit,
  HeartPulse,
  List,
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
  CalendarDays,
  Shield,
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
      { title: 'Янги кўрик', url: '/new-visit', icon: FileEdit },
      { title: 'Кўриклар', url: '/visits', icon: Calendar },
      // { title: 'Навбатлар', url: '/appointments', icon: Calendar },
      { title: 'Рецепт ёзиш', url: '/prescription', icon: Pill },
      { title: 'Касалликлар', url: '/disease', icon: HeartPulse },
      { title: 'Хизматлар', url: '/service', icon: ClipboardCheck },
      { title: 'Дори-дармонлар', url: '/medication', icon: PillBottle },
    ],
  },
  {
    id: 'diagnostics',
    title: 'ДИАГНОСТИКА',
    icon: Microscope,
    items: [
      { title: 'Диагностика қўшиш', url: '/add-diagnostika', icon: CirclePlus },
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
      { title: 'Стационар календари', url: '/inpatient-calendar', icon: CalendarDays },
      { title: 'Стационар бошқаруви', url: '/inpatient', icon: BedDouble },
      { title: 'Дори va lichenya Бериsh', url: '/medicine', icon: Pill },
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
  icon: Settings,
  items: [
    { title: 'Созламалар', url: '/settings', icon: Settings },
    { title: 'Профил', url: '/profile', icon: User },
    { title: 'Рухсатлар', url: '/permission', icon: Shield },
  ],
};
