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
  Settings,
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
  icon: Settings,
  items: [{ title: 'Созламалар', url: '/settings', icon: Settings }],
};