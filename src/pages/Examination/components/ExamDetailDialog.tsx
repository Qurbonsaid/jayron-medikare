import { useGetAllDiagnosisQuery } from '@/app/api/diagnosisApi/diagnosisApi';
import {
  useCompleteExamsMutation,
  useDeleteExamMutation,
  useUpdateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
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
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  FilePlus,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getStatusBadge } from '../../../components/common/StatusBadge';

interface ExamDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exam: any;
  onSuccess?: () => void;
}

const ExamDetailDialog = ({
  open,
  onOpenChange,
  exam,
  onSuccess,
}: ExamDetailDialogProps) => {
  const { t } = useTranslation(['examinations', 'common']);
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    complaints: '',
    description: '',
    diagnosis: '',
  });

  // Fetch all diagnosis
  const { data: diagnosisData } = useGetAllDiagnosisQuery({});
  const diagnoses = diagnosisData?.data || [];

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [completeExam, { isLoading: isCompleting }] =
    useCompleteExamsMutation();
  const handleRequest = useHandleRequest();

  // Update form when exam changes
  useEffect(() => {
    if (exam && open) {
      setEditForm({
        complaints: exam.complaints || '',
        description: exam.description || '',
        diagnosis: exam.diagnosis?._id || exam.diagnosis || '',
      });
      setIsEditMode(false);
      setIsDeleteConfirm(false);
    }
  }, [exam, open]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({
      complaints: exam.complaints || '',
      description: exam.description || '',
      diagnosis: exam.diagnosis?._id || exam.diagnosis || '',
    });
  };

  const handleUpdate = async () => {
    if (!editForm.complaints.trim()) {
      toast.error(t('detail.enterComplaint'));
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updateExam({
          id: exam._id,
          body: {
            patient_id: exam.patient_id._id,
            diagnosis: editForm.diagnosis,
            complaints: editForm.complaints,
            description: editForm.description,
          },
        });
        return res;
      },
      onSuccess: () => {
        toast.success(t('detail.examUpdated'));
        setIsEditMode(false);
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || t('detail.errorOccurred'));
      },
    });
  };

  const handleDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deleteExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('detail.examDeleted'));
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || t('detail.errorOccurred'));
      },
    });
  };

  const handleComplete = async () => {
    await handleRequest({
      request: async () => {
        const res = await completeExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('detail.examCompleted'));
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || t('detail.errorOccurred'));
      },
    });
  };

  if (!exam) return null;

  // Delete Confirmation View
  if (isDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5 text-red-600' />
              {t('detail.deleteExamination')}
            </DialogTitle>
            <DialogDescription>
              {t('detail.deleteConfirmation')}
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <div className='p-4 bg-muted rounded-lg space-y-2'>
              <p className='text-sm'>
                <span className='font-semibold'>{t('detail.patient')}:</span>{' '}
                {exam.patient_id?.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>{t('detail.doctor')}:</span>{' '}
                {exam.doctor_id?.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>{t('detail.date')}:</span>{' '}
                {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDeleteConfirm(false)}
              disabled={isDeleting}
            >
              {t('common:cancel')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? t('detail.deleting') : t('common:delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Edit Mode View
  if (isEditMode) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{t('detail.editExamination')}</DialogTitle>
            <DialogDescription>{t('detail.editDescription')}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            {/* Complaints */}
            <div className='space-y-2'>
              <Label>{t('detail.complaint')}</Label>
              <Textarea
                placeholder={t('detail.enterComplaintPlaceholder')}
                value={editForm.complaints}
                onChange={(e) =>
                  setEditForm({ ...editForm, complaints: e.target.value })
                }
                className='min-h-24'
              />
            </div>

            {/* Diagnosis */}
            <div className='space-y-2'>
              <Label>{t('detail.diagnosis')}</Label>
              <Select
                value={editForm.diagnosis}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, diagnosis: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('detail.selectDiagnosis')} />
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
              <Label>{t('detail.recommendation')}</Label>
              <Textarea
                placeholder={t('detail.enterRecommendationPlaceholder')}
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
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              {t('common:cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? t('common:saving') : t('common:save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Detail View (Default)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>
            {t('detail.examinationDetails')}
          </DialogTitle>
          <DialogDescription>{t('detail.fullPatientInfo')}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Patient Information */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              {t('detail.patientInfo')}
            </h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>
                  {t('detail.name')}:
                </span>
                <p className='font-medium'>{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  {t('detail.phone')}:
                </span>
                <p className='font-medium'>{exam.patient_id?.phone}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  {t('detail.doctor')}:
                </span>
                <p className='font-medium'>{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>
                  {t('detail.status')}:
                </span>
                <div className='mt-1'>{getStatusBadge(exam.status)}</div>
              </div>
            </div>
          </div>

          {/* Examination Details */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              {t('detail.examInfo')}
            </h3>
            <div className='space-y-3 text-sm'>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  {t('detail.complaint')}:
                </span>
                <p className='font-medium bg-muted p-3 rounded-md'>
                  {exam.complaints || t('detail.notEntered')}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  {t('detail.diagnosis')}:
                </span>
                <p className='font-medium bg-muted p-3 rounded-md'>
                  {exam.diagnosis?.name ||
                    exam.diagnosis ||
                    t('detail.notEntered')}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  {t('detail.recommendation')}:
                </span>
                <p className='font-medium bg-muted p-3 rounded-md'>
                  {exam.description || t('detail.notEntered')}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  {t('detail.date')}:
                </span>
                <p className='font-medium'>
                  {new Date(exam.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>

          {/* Prescriptions List */}
          {exam.prescriptions && exam.prescriptions.length > 0 && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold border-b pb-2 flex items-center justify-between'>
                <span>{t('detail.prescriptions')}</span>
                <span className='text-sm font-normal text-muted-foreground'>
                  ({exam.prescriptions.length} {t('detail.items')})
                </span>
              </h3>
              <div className='space-y-3'>
                {exam.prescriptions.map((prescription: any, index: number) => (
                  <div
                    key={prescription._id}
                    className='p-4 bg-primary/5 border border-primary/10 rounded-lg space-y-3'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-medium text-primary'>
                        {t('detail.prescriptionNumber', { number: index + 1 })}
                      </span>
                    </div>
                    <div className='grid grid-cols-2 gap-3 text-sm'>
                      <div>
                        <span className='text-muted-foreground block mb-1'>
                          {t('detail.medicationName')}:
                        </span>
                        <p className='font-semibold'>
                          {prescription.medication}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground block mb-1'>
                          {t('detail.dosage')}:
                        </span>
                        <p className='font-semibold'>
                          {prescription.dosage} {t('detail.mg')}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground block mb-1'>
                          {t('detail.intake')}:
                        </span>
                        <p className='font-semibold'>
                          {t('detail.timesPerDay', {
                            count: prescription.frequency,
                          })}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground block mb-1'>
                          {t('detail.duration')}:
                        </span>
                        <p className='font-semibold'>
                          {prescription.duration} {t('detail.days')}
                        </p>
                      </div>
                    </div>
                    {prescription.instructions && (
                      <div className='pt-2 border-t border-primary/10'>
                        <span className='text-muted-foreground text-xs block mb-1'>
                          {t('detail.additionalInstructions')}:
                        </span>
                        <p className='text-sm font-medium'>
                          {prescription.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='space-y-2 pt-4 border-t'>
            <h3 className='text-lg font-semibold mb-3'>
              {t('detail.actions')}
            </h3>
            <div className='grid grid-cols-2 gap-3'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  onOpenChange(false);
                  navigate('/prescription', {
                    state: { examinationId: exam._id },
                  });
                }}
              >
                <FilePlus className='w-4 h-4 mr-2' />
                {t('detail.writePrescription')}
              </Button>
              <Button variant='outline' className='w-full' onClick={handleEdit}>
                <Edit className='w-4 h-4 mr-2' />
                {t('common:edit')}
              </Button>
              <Button
                variant='outline'
                className='w-full text-red-600 hover:text-red-700'
                onClick={() => setIsDeleteConfirm(true)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                {t('common:delete')}
              </Button>
              <Button
                variant='default'
                className='w-full bg-green-600 hover:bg-green-700'
                onClick={handleComplete}
                disabled={isCompleting || exam.status === 'completed'}
              >
                <CheckCircle2 className='w-4 h-4 mr-2' />
                {isCompleting
                  ? t('detail.completing')
                  : exam.status === 'completed'
                  ? t('detail.completed')
                  : t('detail.completeExamination')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamDetailDialog;
