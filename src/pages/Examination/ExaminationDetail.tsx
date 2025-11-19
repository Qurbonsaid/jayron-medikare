import { useGetAllDiagnosisQuery } from '@/app/api/diagnosisApi/diagnosisApi';
import {
  useCompleteExamsMutation,
  useDeleteExamMutation,
  useDeletePrescriptionMutation,
  useGetOneExamQuery,
  useUpdateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit,
  FilePlus,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const ExaminationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    complaints: '',
    description: '',
    diagnosis: '',
  });

  // Fetch examination details
  const {
    data: examData,
    isLoading,
    refetch,
  } = useGetOneExamQuery(id || '', {
    skip: !id,
  });

  const exam = examData?.data;

  // Fetch all diagnosis
  const { data: diagnosisData } = useGetAllDiagnosisQuery({});
  const diagnoses = diagnosisData?.data || [];

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [completeExam, { isLoading: isCompleting }] =
    useCompleteExamsMutation();
  const [deletePrescription, { isLoading: isDeletingPrescription }] =
    useDeletePrescriptionMutation();
  const handleRequest = useHandleRequest();

  // Update form when exam changes
  useEffect(() => {
    if (exam) {
      const diagnosisId =
        typeof exam.diagnosis === 'object' && exam.diagnosis?._id
          ? exam.diagnosis._id
          : typeof exam.diagnosis === 'string'
          ? exam.diagnosis
          : '';
      setEditForm({
        complaints: exam.complaints || '',
        description: exam.description || '',
        diagnosis: diagnosisId,
      });
    }
  }, [exam]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    const diagnosisId =
      typeof exam.diagnosis === 'object' && exam.diagnosis?._id
        ? exam.diagnosis._id
        : typeof exam.diagnosis === 'string'
        ? exam.diagnosis
        : '';
    setEditForm({
      complaints: exam.complaints || '',
      description: exam.description || '',
      diagnosis: diagnosisId,
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
        refetch();
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
        navigate(-1);
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
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!window.confirm('Бу рецептни ўчиришни хоҳлайсизми?')) {
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await deletePrescription({
          id: exam._id,
          prescription_id: prescriptionId,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Рецепт муваффақиятли ўчирилди');
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Рецептни ўчиришда хатолик');
      },
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>Кўрик топилмади</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Орқага
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Header */}
        {/* <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6'>
          <div className='flex items-center gap-3'>
            <Button variant='outline' size='icon' onClick={() => navigate(-1)}>
              <ArrowLeft className='w-4 h-4' />
            </Button>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold'>
                Кўрик Тафсилотлари
              </h1>
              <p className='text-sm text-muted-foreground mt-1'>
                Кўрик #{exam._id.slice(-6)}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            {getStatusBadge(exam.status)}
          </div>
        </div> */}

        {/* Patient Info Card */}
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle>Бемор Маълумотлари</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <Label className='text-muted-foreground'>Исм</Label>
                <p className='font-medium mt-1'>{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Телефон</Label>
                <p className='font-medium mt-1'>{exam.patient_id?.phone}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Шифокор</Label>
                <p className='font-medium mt-1'>{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Сана</Label>
                <p className='font-medium mt-1'>
                  {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  navigate('/prescription', {
                    state: { examinationId: exam._id },
                  });
                }}
              >
                <FilePlus className='w-4 h-4 mr-2' />
                Рецепт Ёзиш
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={handleEdit}
                disabled={isEditMode}
              >
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
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue='examination' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-4 h-auto gap-1'>
            <TabsTrigger
              value='examination'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Кўрик
            </TabsTrigger>
            <TabsTrigger
              value='prescriptions'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Рецептлар
            </TabsTrigger>
            <TabsTrigger
              value='visits'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Таҳлил
            </TabsTrigger>
            <TabsTrigger
              value='images'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Тасвирлар
            </TabsTrigger>
          </TabsList>

          {/* Examination Tab */}
          <TabsContent value='examination'>
            <Card>
              <CardHeader>
                <CardTitle>Кўрик Маълумотлари</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>Шикоят</Label>
                      <Textarea
                        placeholder='Бемор шикоятини киритинг...'
                        value={editForm.complaints}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            complaints: e.target.value,
                          })
                        }
                        className='min-h-24'
                      />
                    </div>

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
                            <SelectItem
                              key={diagnosis._id}
                              value={diagnosis._id}
                            >
                              {diagnosis.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-2'>
                      <Label>Тавсия</Label>
                      <Textarea
                        placeholder='Кўрик натижаси ва тавсияларни киритинг...'
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value,
                          })
                        }
                        className='min-h-24'
                      />
                    </div>

                    <div className='flex gap-3 justify-end'>
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
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-muted-foreground'>Шикоят</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {exam.complaints || 'Киритилмаган'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>Ташхис</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {typeof exam.diagnosis === 'object' &&
                        exam.diagnosis?.name
                          ? exam.diagnosis.name
                          : typeof exam.diagnosis === 'string'
                          ? exam.diagnosis
                          : 'Киритилмаган'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>Тавсия</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {exam.description || 'Киритилмаган'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value='prescriptions'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Рецептлар</span>
                  {exam.prescriptions && exam.prescriptions.length > 0 && (
                    <span className='text-sm font-normal text-muted-foreground'>
                      ({exam.prescriptions.length} та)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exam.prescriptions && exam.prescriptions.length > 0 ? (
                  <div className='space-y-4'>
                    {exam.prescriptions.map(
                      (prescription: any, index: number) => (
                        <Card
                          key={prescription._id}
                          className='border border-primary/10 bg-primary/5'
                        >
                          <CardContent className='pt-4'>
                            <div className='flex items-center justify-between mb-3'>
                              <span className='text-sm font-medium text-primary'>
                                Рецепт #{index + 1}
                              </span>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleDeletePrescription(prescription._id)
                                }
                                disabled={isDeletingPrescription}
                                className='h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </div>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Дори Номи
                                </Label>
                                <p className='font-semibold text-sm mt-1'>
                                  {prescription.medication}
                                </p>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Дозаси
                                </Label>
                                <p className='font-semibold text-sm mt-1'>
                                  {prescription.dosage} мг
                                </p>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Қабул Қилиш
                                </Label>
                                <p className='font-semibold text-sm mt-1'>
                                  Кунига {prescription.frequency} марта
                                </p>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Муддати
                                </Label>
                                <p className='font-semibold text-sm mt-1'>
                                  {prescription.duration} кун
                                </p>
                              </div>
                            </div>
                            {prescription.instructions && (
                              <div className='mt-3 pt-3 border-t border-primary/10'>
                                <Label className='text-xs text-muted-foreground'>
                                  Қўшимча Кўрсатмалар
                                </Label>
                                <p className='text-sm font-medium mt-1'>
                                  {prescription.instructions}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground mb-4'>
                      Ҳали рецептлар қўшилмаган
                    </p>
                    <Button
                      onClick={() => {
                        navigate('/prescription', {
                          state: { examinationId: exam._id },
                        });
                      }}
                    >
                      <FilePlus className='w-4 h-4 mr-2' />
                      Рецепт Ёзиш
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value='visits'>
            <Card>
              <CardHeader>
                <CardTitle>Ташрифлар Тарихи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-center py-8'>
                  <p className='text-muted-foreground'>
                    Ташрифлар тарихи тез орада қўшилади
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value='images'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Тасвирлар</span>
                  {exam.images && exam.images.length > 0 && (
                    <span className='text-sm font-normal text-muted-foreground'>
                      ({exam.images.length} та)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exam.images && exam.images.length > 0 ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {exam.images.map((image: string, index: number) => (
                      <div
                        key={index}
                        className='aspect-square rounded-lg overflow-hidden border'
                      >
                        <img
                          src={image}
                          alt={`Расм ${index + 1}`}
                          className='w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer'
                          onClick={() => window.open(image, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground'>
                      Ҳали тасвирлар қўшилмаган
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
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
      </main>
    </div>
  );
};

export default ExaminationDetail;
