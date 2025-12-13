import { useGetAllExamsQuery } from '@/app/api/examinationApi/examinationApi';
import {
  useDeletePatientMutation,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import getUser from '@/hooks/getUser/getUser';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { useRouteActions } from '@/hooks/RBS';
import {
  AlertTriangle,
  Calendar,
  Edit,
  Eye,
  FileText,
  FileX,
  MapPin,
  Phone,
  Plus,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import PatientPDFModal from '../../components/PDF/PatientPDFModal';
import EditPatientModal from './components/EditPatientModal';
import NewVisitDialog from './components/NewVisitDialog';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  // RBS Permission checks
  const {
    canUpdate: canUpdatePatient,
    canDelete: canDeletePatient,
  } = useRouteActions('/patient/:id');
  const { canCreate: canCreateExam } = useRouteActions('/new-visit');

  const {
    data: patientData,
    refetch,
    isError,
    isLoading,
  } = useGetPatientByIdQuery(id, {
    skip: !id,
  });

  // Fetch patient exams
  const {
    data: examsData,
    isLoading: examsLoading,
    refetch: refetchExams,
  } = useGetAllExamsQuery(
    {
      patient_id: id,
      page: 1,
      limit: 100,
    },
    {
      skip: !id,
    }
  );

  if (isError) {
    navigate('/patients');
  }

  const [deletePatient] = useDeletePatientMutation();
  const handleRequest = useHandleRequest();
  const patient = patientData?.data;
  const exams = examsData?.data || [];

  const onDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deletePatient(id).unwrap();
        return res;
      },
      onSuccess: (data) => {
        toast.success(data?.message);
        setIsDeleteModalOpen(false);
        navigate('/patients');
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  const me = getUser();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container px-2 sm:px-2 lg:px-2 py-2 sm:py-2 lg:py-2'>
        {/* Patient Header Card */}
        <Card className='card-shadow mb-4 sm:mb-6 flex flex-wrap items-center justify-between p-2'>
          <div className='flex-shrink-0 mx-auto md:mx-0 flex space-x-3'>
            <div className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 gradient-primary rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold'>
              {patient.fullname
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-center md:text-left'>
                {patient.fullname}
              </h1>
              <div className='flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground justify-center md:justify-start'>
                <span>ID: {patient.patient_id}</span>
                <span>•</span>
                <span>
                  {new Date(patient.date_of_birth).toLocaleDateString('uz-UZ')}
                </span>
                <span>•</span>
                <span>{patient.gender === 'male' ? 'Эркак' : 'Аёл'}</span>
              </div>
              <div className='py-2 space-y-2'>
                <div className='flex items-center gap-2'>
                  <Phone className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0' />
                  <span className='text-sm sm:text-base'>{patient.phone}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <MapPin className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5' />
                  <span className='text-xs sm:text-sm text-center md:text-left'>
                    {patient.address}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Patient Info */}
          <div className='flex flex-wrap gap-2 mt-4 md:mt-0 justify-center md:justify-end lg:max-w-sm'>
            {canUpdatePatient && (
              <Button
                variant='outline'
                size='sm'
                className='flex-1 sm:flex-none'
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className='w-4 h-4 sm:mr-2' />
                <span className='hidden sm:inline'>Таҳрирлаш</span>
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              className='flex-1 sm:flex-none'
              onClick={() => setIsPDFModalOpen(true)}
            >
              <FileText className='w-4 h-4 sm:mr-2' />
              <span className='hidden sm:inline'>PDF кўриш</span>
            </Button>
            {canCreateExam && (
              <Button
                size='sm'
                className='gradient-primary px-6 text-md'
                onClick={() => setIsNewVisitOpen(true)}
              >
                <Plus className='w-4 h-4 sm:mr-2' />
                <span className='hidden sm:inline'>Янги Кўрик Яратиш</span>
              </Button>
            )}
            {canDeletePatient && (
              <Button
                variant='outline'
                size='sm'
                className='flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white hover:text-white'
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <FileX className='w-4 h-4 sm:mr-2' />
                <span className='hidden sm:inline'>Ўчириш</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Allergy Warning */}
        {patient.allergies && patient.allergies.length > 0 && (
          <Card className='bg-gradient-to-r from-danger/10 to-warning/10 border-danger mb-4 sm:mb-6 flex items-center gap-2 p-2'>
            <AlertTriangle className='w-6 h-6 sm:w-8 sm:h-8 text-danger flex-shrink-0' />
            <h3 className='font-bold text-base sm:text-lg mb-1'>
              АЛЛЕРГИЯЛАР:
            </h3>
            <p className='text-danger font-semibold text-sm sm:text-base'>
              {patient.allergies.join(', ')}
            </p>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue='general' className='space-y-4 sm:space-y-6'>
          <TabsList className='grid w-full grid-cols-2 h-auto gap-1'>
            <TabsTrigger
              value='general'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Умумий
            </TabsTrigger>
            <TabsTrigger
              value='visits'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Кўриклар
            </TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4 sm:space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Patient Information */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Бемор маълумотлари
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-sm text-muted-foreground'>
                        Паспорт серияси:
                      </span>
                      <span className='font-semibold'>
                        {patient.passport.series}
                      </span>
                    </div>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-sm text-muted-foreground'>
                        Паспорт рақами:
                      </span>
                      <span className='font-semibold'>
                        {patient.passport.number}
                      </span>
                    </div>
                    <div className='flex justify-between py-2 border-b'>
                      <span className='text-sm text-muted-foreground'>
                        Рўйхатдан ўтган сана:
                      </span>
                      <span className='font-semibold'>
                        {new Date(patient.created_at).toLocaleDateString(
                          'uz-UZ'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Medications */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Доимий Дорилар
                  </h3>
                  {patient.regular_medications &&
                  patient.regular_medications.length > 0 ? (
                    <div className='space-y-3'>
                      {patient.regular_medications.map((med, idx) => (
                        <div
                          key={med._id || idx}
                          className='p-3 bg-accent rounded-lg'
                        >
                          <h4 className='font-semibold text-sm sm:text-base'>
                            {med.medicine}
                          </h4>
                          <p className='text-xs sm:text-sm text-muted-foreground'>
                            {med.schedule}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-sm text-muted-foreground text-center py-4'>
                      Доимий дорилар йўқ
                    </p>
                  )}
                </div>
              </Card>

              {/* Diagnosis */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Диагноз
                  </h3>
                  {patient.diagnosis?.diagnosis_id ? (
                    <p className='p-3 bg-accent rounded-lg border-l-4 border-primary'>
                      <div className='flex items-start gap-2'>
                        <span className='text-primary mt-1'>•</span>
                        <div className='flex-1'>
                          {patient.diagnosis.diagnosis_id?.name && (
                            <p className='text-sm sm:text-base font-medium mb-1'>
                              {patient.diagnosis.diagnosis_id.name}
                              {patient.diagnosis.diagnosis_id?.code && (
                                <span className='text-xs text-muted-foreground ml-2'>
                                  ({patient.diagnosis.diagnosis_id.code})
                                </span>
                              )}
                            </p>
                          )}
                          {patient.diagnosis.diagnosis_id.description && (
                            <p className='text-xs sm:text-sm text-muted-foreground'>
                              {patient.diagnosis.diagnosis_id.description}
                            </p>
                          )}
                          {patient.diagnosis.doctor_id?.fullname && (
                            <p className='text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-2'>
                              <User className='w-3 h-3' />
                              {patient.diagnosis.doctor_id.fullname}
                            </p>
                          )}
                        </div>
                      </div>
                    </p>
                  ) : (
                    <p className='text-sm text-muted-foreground text-center py-4'>
                      Ҳали диагноз белгиланмаган
                    </p>
                  )}
                </div>
              </Card>

              {/* Additional Info */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Қўшимча маълумот
                  </h3>
                  <div className='space-y-3'>
                    <div className='p-3 bg-accent rounded-lg'>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Манзил
                      </p>
                      <p className='text-sm font-medium'>{patient.address}</p>
                    </div>
                    <div className='p-3 bg-accent rounded-lg'>
                      <p className='text-xs text-muted-foreground mb-1'>
                        Охирги янгиланган сана
                      </p>
                      <p className='text-sm font-medium'>
                        {new Date(patient.updated_at).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='visits'>
            <Card className='card-shadow'>
              {examsLoading ? (
                <div className='p-8 text-center'>
                  <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
                  <p className='text-muted-foreground'>Юкланмоқда...</p>
                </div>
              ) : exams.length === 0 ? (
                <div className='p-8 text-center'>
                  <FileText className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    Ташрифлар топилмади
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Бу бемор учун ҳали ташрифлар қайд қилинмаган
                  </p>
                  <Button
                    onClick={() => setIsNewVisitOpen(true)}
                    className='gradient-primary'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Янги Кўрик Яратиш
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className='hidden md:block overflow-x-auto'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Шифокор</TableHead>
                          <TableHead>Шикоят</TableHead>
                          <TableHead>Диагноз</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Сана</TableHead>
                          <TableHead className='text-right'>
                            Ҳаракатлар
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exams.map((exam: any) => (
                          <TableRow key={exam._id}>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <User className='w-4 h-4 text-muted-foreground' />
                                <span className='font-medium'>
                                  {exam.doctor_id.fullname}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className='text-sm line-clamp-2'>
                                {exam.complaints}
                              </span>
                            </TableCell>
                            <TableCell>
                              {exam.diagnosis?.diagnosis_id?.name ? (
                                <div className='text-sm'>
                                  <p className='font-medium line-clamp-1'>
                                    {exam.diagnosis.diagnosis_id.name}
                                  </p>
                                  {exam.diagnosis.diagnosis_id.code && (
                                    <p className='text-xs text-muted-foreground'>
                                      {exam.diagnosis.diagnosis_id.code}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className='text-xs text-muted-foreground mx-auto'>
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {(() => {
                                const statusConfig = {
                                  active: {
                                    text: 'Фаол',
                                    variant: 'default' as const,
                                  },
                                  completed: {
                                    text: 'Тугалланган',
                                    variant: 'secondary' as const,
                                  },
                                  inactive: {
                                    text: 'Фаол эмас',
                                    variant: 'outline' as const,
                                  },
                                  deleted: {
                                    text: 'Ўчирилган',
                                    variant: 'destructive' as const,
                                  },
                                };
                                const config =
                                  statusConfig[
                                    exam.status as keyof typeof statusConfig
                                  ] || statusConfig.active;
                                return (
                                  <Badge variant={config.variant}>
                                    {config.text}
                                  </Badge>
                                );
                              })()}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2 text-sm'>
                                <Calendar className='w-4 h-4 text-muted-foreground' />
                                {new Date(exam.created_at).toLocaleDateString(
                                  'uz-UZ'
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className='flex justify-end'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => {
                                    navigate(`/examination/${exam._id}`);
                                  }}
                                >
                                  <Eye className='w-4 h-4 mr-2' />
                                  Батафсил
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className='md:hidden space-y-3 p-4'>
                    {exams.map((exam: any) => (
                      <Card
                        key={exam._id}
                        className='hover:shadow-md transition-shadow'
                      >
                        <div className='p-4 space-y-3'>
                          {/* Doctor */}
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <User className='w-4 h-4 text-muted-foreground' />
                              <span className='font-medium text-sm'>
                                {exam.doctor_id.fullname}
                              </span>
                            </div>
                            {(() => {
                              const statusConfig = {
                                active: {
                                  text: 'Фаол',
                                  variant: 'default' as const,
                                },
                                completed: {
                                  text: 'Тугалланган',
                                  variant: 'secondary' as const,
                                },
                                inactive: {
                                  text: 'Фаол эмас',
                                  variant: 'outline' as const,
                                },
                                deleted: {
                                  text: 'Ўчирилган',
                                  variant: 'destructive' as const,
                                },
                              };
                              const config =
                                statusConfig[
                                  exam.status as keyof typeof statusConfig
                                ] || statusConfig.active;
                              return (
                                <Badge
                                  variant={config.variant}
                                  className='text-xs'
                                >
                                  {config.text}
                                </Badge>
                              );
                            })()}
                          </div>

                          {/* Complaint */}
                          <div>
                            <p className='text-xs text-muted-foreground mb-1'>
                              Шикоят:
                            </p>
                            <p className='text-sm line-clamp-2'>
                              {exam.complaints}
                            </p>
                          </div>

                          {/* Diagnosis */}
                          {exam.diagnosis?.diagnosis_id?.name && (
                            <div>
                              <p className='text-xs text-muted-foreground mb-1'>
                                Диагноз:
                              </p>
                              <p className='text-sm font-medium'>
                                {exam.diagnosis.diagnosis_id.name}
                                {exam.diagnosis.diagnosis_id.code && (
                                  <span className='text-xs text-muted-foreground ml-1'>
                                    ({exam.diagnosis.diagnosis_id.code})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {/* Date */}
                          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                            <Calendar className='w-3 h-3' />
                            {new Date(exam.created_at).toLocaleDateString(
                              'uz-UZ'
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            size='sm'
                            variant='outline'
                            className='w-full'
                            onClick={() => {
                              navigate(`/examination/${exam._id}`);
                            }}
                          >
                            <Eye className='w-4 h-4 mr-2' />
                            Батафсил
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {patient && (
          <>
            <EditPatientModal
              open={isEditModalOpen}
              onOpenChange={setIsEditModalOpen}
              patient={patient}
              onSuccess={refetch}
            />

            {/* Delete Confirmation Modal */}
            <Dialog
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className='flex items-center gap-2'>
                    <AlertTriangle className='w-5 h-5 text-red-600' />
                    Беморни ўчириш
                  </DialogTitle>
                  <DialogDescription>
                    Сиз ҳақиқатан ҳам бу беморни ўчирмоқчимисиз? Бу амал
                    қайтарилмайди ва барча маълумотлар ўчирилади.
                  </DialogDescription>
                </DialogHeader>

                <div className='py-4'>
                  <div className='p-4 bg-muted rounded-lg space-y-2'>
                    <p className='text-sm'>
                      <span className='font-semibold'>Бемор:</span>{' '}
                      {patient.fullname}
                    </p>
                    <p className='text-sm'>
                      <span className='font-semibold'>ID:</span>{' '}
                      {patient.patient_id}
                    </p>
                    <p className='text-sm'>
                      <span className='font-semibold'>Телефон:</span>{' '}
                      {patient.phone}
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Бекор қилиш
                  </Button>
                  <Button variant='destructive' onClick={onDelete}>
                    Ўчириш
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* New Visit Dialog */}
            <NewVisitDialog
              open={isNewVisitOpen}
              onOpenChange={setIsNewVisitOpen}
              preSelectedPatientId={id}
              onSuccess={refetchExams}
            />

            {/* PDF Preview Modal */}
            <PatientPDFModal
              open={isPDFModalOpen}
              onOpenChange={setIsPDFModalOpen}
              patient={patient}
              exams={exams}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default PatientProfile;
