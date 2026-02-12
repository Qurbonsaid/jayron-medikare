import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import React from 'react';
import type {
  MedicationOptionItem,
  TemplateItem,
  TemplateTranslator,
} from '../medicationTemplateTypes';

interface MedicationTemplateFormProps {
  t: TemplateTranslator;
  readOnly?: boolean;
  templateName: string;
  templateItems: TemplateItem[];
  medicationSearch: string;
  allMedications: MedicationOptionItem[];
  isMedicationsLoading: boolean;
  hasMoreMedications: boolean;
  onTemplateNameChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: keyof TemplateItem,
    value: string | number
  ) => void;
  onMedicationSearchChange: (value: string) => void;
  onMedicationListScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}

export default function MedicationTemplateForm({
  t,
  readOnly = false,
  templateName,
  templateItems,
  medicationSearch,
  allMedications,
  isMedicationsLoading,
  hasMoreMedications,
  onTemplateNameChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMedicationSearchChange,
  onMedicationListScroll,
}: MedicationTemplateFormProps) {
  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>{t('fields.name', 'Шаблон номи')}</Label>
        <Input
          id='name'
          value={templateName}
          onChange={(event) => onTemplateNameChange(event.target.value)}
          placeholder={t('placeholders.name', 'Шаблон номини киритинг')}
          disabled={readOnly}
        />
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label>{t('fields.medications', 'Дорилар')}</Label>
          {!readOnly && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={onAddItem}
            >
              <Plus className='h-4 w-4 mr-1' />
              {t('buttons.addMedication', 'Дори қўшиш')}
            </Button>
          )}
        </div>

        {templateItems.map((item, index) => (
          <Card key={index} className='p-4'>
            <div className='space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <Label>{t('fields.medication', 'Дори')}</Label>
                    <ComboBox
                      value={item.medication_id}
                      onValueChange={(value) =>
                        onUpdateItem(index, 'medication_id', value)
                      }
                      disabled={readOnly}
                      placeholder={t(
                        'placeholders.selectMedication',
                        'Дори танланг'
                      )}
                      searchPlaceholder={t(
                        'placeholders.searchMedication',
                        'Дори қидириш...'
                      )}
                      emptyText={t('noMedications', 'Дорилар топилмади')}
                      loadingText={t('loading', 'Юкланмоқда...')}
                      searchValue={medicationSearch}
                      onSearchChange={onMedicationSearchChange}
                      options={allMedications.map((medication) => ({
                        value: medication._id,
                        label: medication.name,
                        sublabel: medication.form,
                      }))}
                      isLoading={isMedicationsLoading}
                      hasMore={hasMoreMedications}
                      onScroll={onMedicationListScroll}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.addons', 'Қўшимча')}</Label>
                    <Input
                      value={item.addons}
                      onChange={(event) =>
                        onUpdateItem(index, 'addons', event.target.value)
                      }
                      placeholder={t('placeholders.addons', 'Қўшимча')}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.frequency', 'Кунига неча марта')}</Label>
                    <Input
                      type='number'
                      min='1'
                      value={item.frequency}
                      onChange={(event) => {
                        const value = event.target.value;
                        const numValue =
                          value === ''
                            ? 1
                            : Math.max(1, parseInt(value, 10) || 1);
                        onUpdateItem(index, 'frequency', numValue);
                      }}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.duration', 'Неча кунга')}</Label>
                    <Input
                      type='number'
                      min='1'
                      value={item.duration}
                      onChange={(event) => {
                        const value = event.target.value;
                        const numValue =
                          value === ''
                            ? 1
                            : Math.max(1, parseInt(value, 10) || 1);
                        onUpdateItem(index, 'duration', numValue);
                      }}
                      disabled={readOnly}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <Label>{t('fields.instructions', 'Кўрсатмалар')}</Label>
                    <Input
                      value={item.instructions}
                      onChange={(event) =>
                        onUpdateItem(index, 'instructions', event.target.value)
                      }
                      placeholder={t(
                        'placeholders.instructions',
                        'Кўрсатмалар'
                      )}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {!readOnly && templateItems.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => onRemoveItem(index)}
                    className='ml-2'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
