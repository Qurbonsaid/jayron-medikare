import { Disease } from '@/app/api/diagnosisApi/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isEditModalOpen: boolean;
  setIsEditModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editForm: {
    complaints: string;
    description: string;
    diagnosis: string;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      complaints: string;
      description: string;
      diagnosis: string;
    }>
  >;
  diagnoses: Disease[];
  handleUpdate: () => void;
  isUpdating: boolean;
}

const EditVisit = ({
  isEditModalOpen,
  setIsEditModalOpen,
  editForm,
  setEditForm,
  diagnoses,
  handleUpdate,
  isUpdating,
}: Props) => {
  const { t } = useTranslation('examinations');

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{t('editModal.title')}</DialogTitle>
          <DialogDescription>{t('editModal.description')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Complaints */}
          <div className='space-y-2'>
            <Label>{t('complaint')}</Label>
            <Textarea
              placeholder={t('complaintPlaceholder')}
              value={editForm.complaints}
              onChange={(e) =>
                setEditForm({ ...editForm, complaints: e.target.value })
              }
              className='min-h-24'
            />
          </div>

          {/* Diagnosis */}
          <div className='space-y-2'>
            <Label>{t('diagnosis')}</Label>
            <Select
              value={editForm.diagnosis}
              onValueChange={(value) =>
                setEditForm({ ...editForm, diagnosis: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('diagnosisPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {diagnoses.map((diagnosis: any) => (
                  <SelectItem key={diagnosis._id} value={diagnosis._id}>
                    {diagnosis.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label>{t('recommendation')}</Label>
            <Textarea
              placeholder={t('recommendationPlaceholder')}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className='min-h-24'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setIsEditModalOpen(false)}
            disabled={isUpdating}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVisit;
