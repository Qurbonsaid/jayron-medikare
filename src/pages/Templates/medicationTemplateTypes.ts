import type { MedicationGetAllRes } from '@/app/api/medication/types';
import type { TFunction } from 'i18next';

export interface TemplateItem {
  medication_id: string;
  addons: string;
  frequency: number;
  duration: number;
  instructions: string;
}

export type MedicationOptionItem = MedicationGetAllRes['data'][number];

export type TemplateTranslator = TFunction<'templates'>;
