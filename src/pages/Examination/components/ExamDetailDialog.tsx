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
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getStatusBadge } from './StatusBadge';

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
      toast.error('Илтимос, шикоятни киритинг');
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
        toast.success('Кўрик муваффақиятли янгиланди');
        setIsEditMode(false);
        onSuccess?.();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || 'Хатолик юз берди');
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
        toast.success('Кўрик муваффақиятли ўчирилди');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
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
        toast.success('Кўрик муваффақиятли якунланди');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
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
              Кўрикни ўчириш
            </DialogTitle>
            <DialogDescription>
              Сиз ҳақиқатан ҳам бу кўрикни ўчирмоқчимисиз? Бу амални қайтариб
              бўлмайди.
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            <div className='p-4 bg-muted rounded-lg space-y-2'>
              <p className='text-sm'>
                <span className='font-semibold'>Бемор:</span>{' '}
                {exam.patient_id?.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>Шифокор:</span>{' '}
                {exam.doctor_id?.fullname}
              </p>
              <p className='text-sm'>
                <span className='font-semibold'>Сана:</span>{' '}
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
              Бекор қилиш
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Ўчирилмоқда...' : 'Ўчириш'}
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
            <DialogTitle>Кўрикни таҳрирлаш</DialogTitle>
            <DialogDescription>
              Кўрик маълумотларини ўзгартиринг
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            {/* Complaints */}
            <div className='space-y-2'>
              <Label>Шикоят</Label>
              <Textarea
                placeholder='Бемор шикоятини киритинг...'
                value={editForm.complaints}
                onChange={(e) =>
                  setEditForm({ ...editForm, complaints: e.target.value })
                }
                className='min-h-24'
              />
            </div>

            {/* Diagnosis */}
            <div className='space-y-2'>
              <Label>Ташхис</Label>
              <Select
                value={editForm.diagnosis}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, diagnosis: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Ташхисни танланг...' />
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
              <Label>Тавсия</Label>
              <Textarea
                placeholder='Кўрик натижаси ва тавсияларни киритинг...'
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
              Бекор қилиш
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
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
          <DialogTitle className='text-xl'>Кўрик Тафсилотлари</DialogTitle>
          <DialogDescription>
            Кўрик ва бемор ҳақида тўлиқ маълумот
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Patient Information */}
          <div className='space-y-3'>
            <h3 className='text-lg font-semibold border-b pb-2'>
              Бемор Маълумотлари
            </h3>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-muted-foreground'>Исм:</span>
                <p className='font-medium'>{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Телефон:</span>
                <p className='font-medium'>{exam.patient_id?.phone}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Шифокор:</span>
                <p className='font-medium'>{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <span className='text-muted-foreground'>Статус:</span>
                <div className='mt-1'>{getStatusBadge(exam.status)}</div>
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
                  {exam.complaints || 'Киритилмаган'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  Ташхис:
                </span>
                <p className='font-medium bg-muted p-3 rounded-md'>
                  {exam.diagnosis?.name || exam.diagnosis || 'Киритилмаган'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>
                  Тавсия:
                </span>
                <p className='font-medium bg-muted p-3 rounded-md'>
                  {exam.description || 'Киритилмаган'}
                </p>
              </div>
              <div>
                <span className='text-muted-foreground block mb-1'>Сана:</span>
                <p className='font-medium'>
                  {new Date(exam.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-2 pt-4 border-t'>
            <h3 className='text-lg font-semibold mb-3'>Ҳаракатлар</h3>
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
                Рецепт Ёзиш
              </Button>
              <Button variant='outline' className='w-full' onClick={handleEdit}>
                <Edit className='w-4 h-4 mr-2' />
                Таҳрирлаш
              </Button>
              <Button
                variant='outline'
                className='w-full text-red-600 hover:text-red-700'
                onClick={() => setIsDeleteConfirm(true)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Ўчириш
              </Button>
              <Button
                variant='default'
                className='w-full bg-green-600 hover:bg-green-700'
                onClick={handleComplete}
                disabled={isCompleting || exam.status === 'completed'}
              >
                <CheckCircle2 className='w-4 h-4 mr-2' />
                {isCompleting
                  ? 'Якунланмоқда...'
                  : exam.status === 'completed'
                  ? 'Якунланган'
                  : 'Кўрикни Якунлаш'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Ёпиш
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamDetailDialog;
