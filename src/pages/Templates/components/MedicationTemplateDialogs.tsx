import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MedicationTemplateForm from './MedicationTemplateForm';
import type {
  MedicationOptionItem,
  TemplateItem,
  TemplateTranslator,
} from '../medicationTemplateTypes';
import type React from 'react';

interface MedicationTemplateDialogsProps {
  t: TemplateTranslator;
  templateName: string;
  templateItems: TemplateItem[];
  medicationSearch: string;
  allMedications: MedicationOptionItem[];
  isMedicationsLoading: boolean;
  hasMoreMedications: boolean;
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isViewOpen: boolean;
  isDeleteOpen: boolean;
  onCreateOpenChange: (value: boolean) => void;
  onEditOpenChange: (value: boolean) => void;
  onViewOpenChange: (value: boolean) => void;
  onDeleteOpenChange: (value: boolean) => void;
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
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCloseAndReset: () => void;
  onDeleteCancel: () => void;
}

export default function MedicationTemplateDialogs({
  t,
  templateName,
  templateItems,
  medicationSearch,
  allMedications,
  isMedicationsLoading,
  hasMoreMedications,
  isCreateOpen,
  isEditOpen,
  isViewOpen,
  isDeleteOpen,
  onCreateOpenChange,
  onEditOpenChange,
  onViewOpenChange,
  onDeleteOpenChange,
  onTemplateNameChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onMedicationSearchChange,
  onMedicationListScroll,
  onCreate,
  onEdit,
  onDelete,
  onCloseAndReset,
  onDeleteCancel,
}: MedicationTemplateDialogsProps) {
  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={onCreateOpenChange}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.create.title', 'Янги шаблон яратиш')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.create.description', 'Дорилар шаблонини яратинг')}
            </DialogDescription>
          </DialogHeader>

          <MedicationTemplateForm
            t={t}
            templateName={templateName}
            templateItems={templateItems}
            medicationSearch={medicationSearch}
            allMedications={allMedications}
            isMedicationsLoading={isMedicationsLoading}
            hasMoreMedications={hasMoreMedications}
            onTemplateNameChange={onTemplateNameChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onUpdateItem={onUpdateItem}
            onMedicationSearchChange={onMedicationSearchChange}
            onMedicationListScroll={onMedicationListScroll}
          />

          <DialogFooter>
            <Button variant='outline' onClick={onCloseAndReset}>
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button onClick={onCreate}>{t('buttons.save', 'Сақлаш')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={onEditOpenChange}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.edit.title', 'Шаблонни таҳрирлаш')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.edit.description', 'Шаблон маълумотларини янгиланг')}
            </DialogDescription>
          </DialogHeader>

          <MedicationTemplateForm
            t={t}
            templateName={templateName}
            templateItems={templateItems}
            medicationSearch={medicationSearch}
            allMedications={allMedications}
            isMedicationsLoading={isMedicationsLoading}
            hasMoreMedications={hasMoreMedications}
            onTemplateNameChange={onTemplateNameChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onUpdateItem={onUpdateItem}
            onMedicationSearchChange={onMedicationSearchChange}
            onMedicationListScroll={onMedicationListScroll}
          />

          <DialogFooter>
            <Button variant='outline' onClick={onCloseAndReset}>
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button onClick={onEdit}>{t('buttons.update', 'Янгилаш')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={onViewOpenChange}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.view.title', 'Шаблон тафсилотлари')}
            </DialogTitle>
          </DialogHeader>

          <MedicationTemplateForm
            t={t}
            readOnly
            templateName={templateName}
            templateItems={templateItems}
            medicationSearch={medicationSearch}
            allMedications={allMedications}
            isMedicationsLoading={isMedicationsLoading}
            hasMoreMedications={hasMoreMedications}
            onTemplateNameChange={onTemplateNameChange}
            onAddItem={onAddItem}
            onRemoveItem={onRemoveItem}
            onUpdateItem={onUpdateItem}
            onMedicationSearchChange={onMedicationSearchChange}
            onMedicationListScroll={onMedicationListScroll}
          />

          <DialogFooter>
            <Button onClick={onCloseAndReset}>{t('buttons.close', 'Ёпиш')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={onDeleteOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.delete.title', 'Шаблонни ўчириш')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'dialogs.delete.description',
                'Ҳақиқатан ҳам бу шаблонни ўчирмоқчимисиз? Бу амални қайтариб бўлмайди.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={onDeleteCancel}>
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button variant='destructive' onClick={onDelete}>
              {t('buttons.delete', 'Ўчириш')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
