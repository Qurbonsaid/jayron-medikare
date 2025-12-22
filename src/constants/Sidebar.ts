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

export interface MenuItem {
  title: string;
  titleKey: string;
  url: string;
  icon: LucideIcon;
  permission: string | null;
}

export interface MenuCategory {
  id: string;
  title: string;
  titleKey: string;
  icon: LucideIcon;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'patients',
    title: 'БЕМОРЛАР',
    titleKey: 'categories.patients',
    icon: Users,
    items: [
      {
        title: 'Беморлар рўйхати',
        titleKey: 'menu.patientList',
        url: '/patients',
        icon: List,
        permission: 'patient',
      },
    ],
  },
  {
    id: 'clinical',
    title: 'КЎРИКЛАР',
    titleKey: 'categories.examinations',
    icon: Stethoscope,
    items: [
      {
        title: 'Янги кўрик',
        titleKey: 'menu.newExamination',
        url: '/new-visit',
        icon: FileEdit,
        permission: 'examination',
      },
      {
        title: 'Кўриклар',
        titleKey: 'menu.examinations',
        url: '/examinations',
        icon: Calendar,
        permission: 'examinations',
      },
      {
        title: 'Рецепт ёзиш',
        titleKey: 'menu.writePrescription',
        url: '/prescription',
        icon: Pill,
        permission: 'prescription',
      },
      {
        title: 'Касалликлар',
        titleKey: 'menu.diseases',
        url: '/disease',
        icon: HeartPulse,
        permission: 'diagnosis',
      },
      {
        title: 'Хизматлар',
        titleKey: 'menu.services',
        url: '/service',
        icon: ClipboardCheck,
        permission: 'service_type',
      },
      {
        title: 'Дори-дармонлар',
        titleKey: 'menu.medications',
        url: '/medication',
        icon: PillBottle,
        permission: 'medication',
      },
    ],
  },
  {
    id: 'diagnostics',
    title: 'ДИАГНОСТИКА',
    titleKey: 'categories.diagnostics',
    icon: Microscope,
    items: [
      {
        title: 'Таҳлил тури қўшиш',
        titleKey: 'menu.addAnalysisType',
        url: '/add-diagnostika',
        icon: CirclePlus,
        permission: 'analysis',
      },
      {
        title: 'Таҳлил буюртмаси',
        titleKey: 'menu.labOrder',
        url: '/lab-order',
        icon: TestTube,
        permission: 'patient_analysis',
      },
      {
        title: 'Таҳлил натижалари',
        titleKey: 'menu.labResults',
        url: '/lab-results',
        icon: ClipboardCheck,
        permission: 'patient_analysis',
      },
      {
        title: 'Рентген/МРТ/КТ',
        titleKey: 'menu.radiology',
        url: '/radiology',
        icon: ScanLine,
        permission: 'medical_image',
      },
    ],
  },
  {
    id: 'inpatient',
    title: 'СТАЦИОНАР',
    titleKey: 'categories.inpatient',
    icon: BedDouble,
    items: [
      {
        title: 'Стационар календари',
        titleKey: 'menu.inpatientCalendar',
        url: '/inpatient-calendar',
        icon: CalendarDays,
        permission: 'booking',
      },
      {
        title: 'Стационар бошқаруви',
        titleKey: 'menu.inpatientManagement',
        url: '/inpatient',
        icon: BedDouble,
        permission: 'corpus',
      },
      {
        title: 'Дори бериш',
        titleKey: 'menu.medicineDistribution',
        url: '/medicine',
        icon: Pill,
        permission: 'medication',
      },
      {
        title: 'Кунлик кўрик',
        titleKey: 'menu.dailyCheckup',
        url: '/daily-checkup',
        icon: ClipboardCheck,
        permission: 'daily_checkup',
      },
    ],
  },
  {
    id: 'finance',
    title: 'МОЛИЯ',
    titleKey: 'categories.finance',
    icon: Wallet,
    items: [
      {
        title: 'Ҳисоб-китоб',
        titleKey: 'menu.billing',
        url: '/billing',
        icon: Wallet,
        permission: 'billing',
      },
    ],
  },
  {
    id: 'reports',
    title: 'ҲИСОБОТЛАР',
    titleKey: 'categories.reports',
    icon: BarChart3,
    items: [
      {
        title: 'Ҳисоботлар',
        titleKey: 'menu.reports',
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
  titleKey: 'categories.system',
  icon: Settings,
  items: [
    {
      title: 'Созламалар',
      titleKey: 'menu.settings',
      url: '/settings',
      icon: Settings,
      permission: 'ceo_only',
    },
    { title: 'Профил', titleKey: 'menu.profile', url: '/profile', icon: User, permission: null }, // har kim ko'ra oladi
  ],
};
