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
import { useNavigate } from 'react-router-dom';

interface Props {
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedExam: any;
  handleEditFromDetail: () => void;
  handleDeleteFromDetail: () => void;
  handleCompleteExam: () => void;
  isCompleting: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

const VisitDetail = ({
  isDetailModalOpen,
  setIsDetailModalOpen,
  selectedExam,
  handleEditFromDetail,
  handleDeleteFromDetail,
  handleCompleteExam,
  isCompleting,
  canUpdate = true,
  canDelete = true,
}: Props) => {
  const navigate = useNavigate();
  return (
    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Кўрик Тафсилотлари</DialogTitle>
          <DialogDescription>
            Кўрик ва бемор ҳақида тўлиқ маълумот
          </DialogDescription>
        </DialogHeader>

        {selectedExam && (
          <div className='space-y-6 py-4'>
            {/* Patient Information */}
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold border-b pb-2'>
                Бемор Маълумотлари
              </h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Исм:</span>
                  <p className='font-medium'>
                    {selectedExam.patient_id?.fullname}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Телефон:</span>
                  <p className='font-medium'>
                    {selectedExam.patient_id?.phone}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Шифокор:</span>
                  <p className='font-medium'>
                    {selectedExam.doctor_id?.fullname}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground'>Статус:</span>
                  <div className='mt-1'>
                    {getStatusBadge(selectedExam.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Examination Details */}
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold border-b pb-2'>
                Кўрик Маълумотлари
              </h3>
              <div className='space-y-3 text-sm'>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    Шикоят:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.complaints || 'Киритилмаган'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    Ташхис:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.diagnosis?.name ||
                      selectedExam.diagnosis ||
                      'Киритилмаган'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    Тавсия:
                  </span>
                  <p className='font-medium bg-muted p-3 rounded-md'>
                    {selectedExam.description || 'Киритилмаган'}
                  </p>
                </div>
                <div>
                  <span className='text-muted-foreground block mb-1'>
                    Сана:
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
                    <span>Рецептлар</span>
                    <span className='text-sm font-normal text-muted-foreground'>
                      ({selectedExam.prescriptions.length} та)
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
                              Рецепт #{index + 1}
                            </span>
                          </div>
                          <div className='grid grid-cols-2 gap-3 text-sm'>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                Дори Номи:
                              </span>
                              <p className='font-semibold'>
                                {prescription.medication}
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                Дозаси:
                              </span>
                              <p className='font-semibold'>
                                {prescription.dosage} мг
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                Қабул Қилиш:
                              </span>
                              <p className='font-semibold'>
                                Кунига {prescription.frequency} марта
                              </p>
                            </div>
                            <div>
                              <span className='text-muted-foreground block mb-1'>
                                Муддати:
                              </span>
                              <p className='font-semibold'>
                                {prescription.duration} кун
                              </p>
                            </div>
                          </div>
                          {prescription.instructions && (
                            <div className='pt-2 border-t border-primary/10'>
                              <span className='text-muted-foreground text-xs block mb-1'>
                                Қўшимча Кўрсатмалар:
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
              <h3 className='text-lg font-semibold mb-3'>Ҳаракатлар</h3>
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
                  Рецепт Ёзиш
                </Button>
                {canDelete && (
                  <Button
                    variant='outline'
                    className='w-full text-red-600 hover:text-red-700'
                    onClick={handleDeleteFromDetail}
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Ўчириш
                  </Button>
                )}
                {canUpdate && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleEditFromDetail}
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Таҳрирлаш
                  </Button>
                )}
                <Button
                  variant='default'
                  className='w-full bg-green-600 hover:bg-green-700'
                  onClick={handleCompleteExam}
                  disabled={isCompleting || selectedExam.status === 'completed'}
                >
                  <CheckCircle2 className='w-4 h-4 mr-2' />
                  {isCompleting
                    ? 'Якунланмоқда...'
                    : selectedExam.status === 'completed'
                    ? 'Якунланган'
                    : 'Кўрикни Якунлаш'}
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
