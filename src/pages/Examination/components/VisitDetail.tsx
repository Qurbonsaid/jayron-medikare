import { ExamDataItem } from '@/app/api/examinationApi/types';
import { getStatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, Edit, FilePlus, Trash2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExam: ExamDataItem | null;
  handleEditFromDetail: () => void;
  handleDeleteFromDetail: () => void;
  handleCompleteExam: () => void;
  isCompleting: boolean;
}

const VisitDetail = ({
  isDetailModalOpen,
  setIsDetailModalOpen,
  selectedExam,
  handleEditFromDetail,
  handleDeleteFromDetail,
  handleCompleteExam,
  isCompleting,
}: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation('examinations');

  return (
    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>
            {t('detailModal.title')}
          </DialogTitle>
          <DialogDescription>{t('detailModal.description')}</DialogDescription>
        </DialogHeader>

        {selectedExam && (
          <div className='space-y-6 py-4'>
            {/* Patient Information */}
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold border-b pb-2'>
                {t('detailModal.patientInfo')}
              </h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>{t('name')}:</span>
                  <p className='font-medium'>
                    {selectedExam.patient_id?.fullname}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>{t('phone')}:</span>
                  <p className='font-medium'>
                    {selectedExam.patient_id?.phone}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>{t('doctor')}:</span>
                  <p className='font-medium'>
                    {selectedExam.doctor_id?.fullname}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>{t('status')}:</span>
                  <div className='mt-1'>
                    {getStatusBadge(selectedExam.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Details */}
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold border-b pb-2'>
                {t('detailModal.examInfo')}
              </h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    {t('complaint')}:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.complaints || t('notEntered')}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    {t('diagnosis')}:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.diagnosis?.name ||
                      selectedExam.diagnosis ||
                      t('notEntered')}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    {t('recommendation')}:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.description || t('notEntered')}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    {t('date')}:
                  </span>
                  <p className='font-medium'>
                    {new Date(selectedExam.created_at).toLocaleString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescriptions List */}
            {selectedExam.prescriptions &&
              selectedExam.prescriptions.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='text-lg font-semibold border-b pb-2 flex items-center justify-between'>
                    <span>{t('prescriptions')}</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      ({selectedExam.prescriptions.length} {t('count')})
                    </span>
                  </h3>
                  <div className='space-y-3'>
                    {selectedExam.prescriptions.map(
                      (prescription: any, index: number) => (
                        <div
                          key={prescription._id}
                          className='p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-3'
                        >
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-medium text-primary'>
                              {t('prescription')} #{index + 1}
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                {t('medicineName')}:
                              </span>
                              <p className='font-semibold'>
                                {prescription.medication}
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                {t('dosage')}:
                              </span>
                              <p className='font-semibold'>
                                {prescription.dosage} {t('mg')}
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                {t('intake')}:
                              </span>
                              <p className='font-semibold'>
                                {t('timesPerDay', {
                                  count: prescription.frequency,
                                })}
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                {t('duration')}:
                              </span>
                              <p className='font-semibold'>
                                {prescription.duration} {t('days')}
                              </p>
                            </div>
                          </div>
                          {prescription.instructions && (
                            <div className='pt-2 border-t border-primary/10'>
                              <span className='text-muted-foreground text-xs block mb-1'>
                                {t('additionalInstructions')}:
                              </span>
                              <p className='text-sm font-medium'>
                                {prescription.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Action Buttons */}
            <div className='space-y-2 pt-4 border-t'>
              <h3 className='text-lg font-semibold mb-3'>{t('actions')}</h3>
              <div className='grid grid-cols-2 gap-3'>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    navigate('/prescription', {
                      state: { examinationId: selectedExam._id },
                    });
                  }}
                >
                  <FilePlus className='w-4 h-4 mr-2' />
                  {t('writePrescription')}
                </Button>
                <Button
                  variant='outline'
                  className='w-full text-red-600 hover:text-red-700'
                  onClick={handleDeleteFromDetail}
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  {t('delete')}
                </Button>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleEditFromDetail}
                >
                  <Edit className='w-4 h-4 mr-2' />
                  {t('edit')}
                </Button>
                <Button
                  variant='default'
                  className='w-full bg-green-600 hover:bg-green-700'
                  onClick={handleCompleteExam}
                  disabled={isCompleting || selectedExam.status === 'completed'}
                >
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  {isCompleting
                    ? t('completing')
                    : selectedExam.status === 'completed'
                    ? t('completed')
                    : t('completeExam')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitDetail;
