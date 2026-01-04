import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExam: any;
  handleDelete: () => void;
  isDeleting: boolean;
}

const DeleteVisit = ({
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  selectedExam,
  handleDelete,
  isDeleting,
}: Props) => {
  const { t } = useTranslation('examinations');
  
  return (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='w-5 h-5 text-red-600' />
            {t('deleteModal.title')}
          </DialogTitle>
          <DialogDescription>
            {t('deleteModal.description')}
          </DialogDescription>
        </DialogHeader>

        {selectedExam && (
          <div className='py-4'>
            <div className='p-4 bg-muted rounded-lg space-y-2'>
              <p className='text-sm'>
                <span className='font-semibold'>{t('patient')}:</span>{' '}
                {selectedExam.patient_id.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>{t('doctor')}:</span>{' '}
                {selectedExam.doctor_id.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>{t('date')}:</span>{' '}
                {new Date(selectedExam.created_at).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('deleteModal.deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVisit;
