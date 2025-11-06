import {
  useDeletePatientMutation,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import getUser from '@/hooks/getUser/getUser';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import RBS from '@/hooks/RBS/Role_Based_Security';
import {
  AlertTriangle,
  Edit,
  FileText,
  FileX,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import EditPatientModal from './components/EditPatientModal';
import PatientReportModal from './components/PatientReportModal';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const {
    data: patientData,
    refetch,
    isError,
    isLoading,
  } = useGetPatientByIdQuery(id, {
    skip: !id,
  });

  if (isError) {
    navigate('/patients');
  }

  const [deletePatient] = useDeletePatientMutation();
  const handleRequest = useHandleRequest();
  const patient = patientData?.data;

  const handleEditSuccess = () => {
    refetch();
  };

  const onDelete = async (id: string) => {
    await handleRequest({
      request: async () => {
        const res = await deletePatient(id).unwrap();
        return res;
      },
      onSuccess: (data) => {
        toast.success(data?.message);
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
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Profile Photo */}
              <div className='flex-shrink-0 mx-auto md:mx-0'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 gradient-primary rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold'>
                  {patient.fullname
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              </div>

              {/* Patient Info */}
              <div className='flex-1'>
                <div className='flex flex-col md:flex-row justify-between mb-4'>
                  <div>
                    <h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-center md:text-left'>
                      {patient.fullname}
                    </h1>
                    <div className='flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground justify-center md:justify-start'>
                      <span>
                        {new Date(patient.date_of_birth).toLocaleDateString(
                          'uz-UZ'
                        )}
                      </span>
                      <span>•</span>
                      <span>{patient.gender === 'male' ? 'Эркак' : 'Аёл'}</span>
                      <span>•</span>
                      <span>ID: {patient.patient_id}</span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2 mt-4 md:mt-0 justify-center md:justify-end lg:max-w-md'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Таҳрирлаш</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      <FileText className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Ҳисобот</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                      onClick={() => window.print()}
                    >
                      <Printer className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Чоп этиш</span>
                    </Button>
                    <RBS role={me.role} allowed={['ceo']}>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 sm:flex-none bg-red-500 text-white'
                        onClick={() => onDelete(id)}
                      >
                        <FileX className='w-4 h-4 sm:mr-2' />
                        <span className='hidden sm:inline'>Ўчириш</span>
                      </Button>
                    </RBS>
                    <Button
                      size='sm'
                      className='gradient-primary px-6 text-md'
                      onClick={() =>
                        navigate('/new-visit', { state: { patientId: id } })
                      }
                    >
                      <Plus className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Янги Кўрик Яратиш</span>
                      
                    </Button>
                  </div>
                </div>
              </div>

              <div className='mt-4 sm:mt-6 flex justify-center'></div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 mt-4 px-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Phone className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0' />
                <span className='text-sm sm:text-base'>{patient.phone}</span>
              </div>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Mail className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0' />
                <span className='text-sm sm:text-base break-all'>
                  {patient.email}
                </span>
              </div>
              <div className='flex items-start gap-2 justify-center md:justify-start sm:col-span-2 lg:col-span-1'>
                <MapPin className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5' />
                <span className='text-xs sm:text-sm text-center md:text-left'>
                  {patient.address}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Allergy Warning */}
        {patient.allergies && patient.allergies.length > 0 && (
          <Card className='bg-gradient-to-r from-danger/10 to-warning/10 border-danger mb-4 sm:mb-6'>
            <div className='p-3 sm:p-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <AlertTriangle className='w-6 h-6 sm:w-8 sm:h-8 text-danger flex-shrink-0' />
                <div>
                  <h3 className='font-bold text-base sm:text-lg mb-1'>
                    АЛЛЕРГИЯЛАР:
                  </h3>
                  <p className='text-danger font-semibold text-sm sm:text-base'>
                    {patient.allergies.join(', ')}
                  </p>
                </div>
              </div>
            </div>
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
              Ташрифлар
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
                  {patient.diagnosis && patient.diagnosis.length > 0 ? (
                    <ul className='space-y-2'>
                      {patient.diagnosis.map((item, idx) => (
                        <li
                          key={idx}
                          className='flex items-start gap-2 py-2 border-b last:border-0'
                        >
                          <span className='text-primary mt-1'>•</span>
                          <span className='text-sm sm:text-base flex-1'>
                            {item.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-sm text-muted-foreground text-center py-4'>
                      Диагноз қўйилмаган
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
                        Email
                      </p>
                      <p className='text-sm font-medium break-all'>
                        {patient.email || 'Кўрсатилмаган'}
                      </p>
                    </div>
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
              <div className='p-4 sm:p-6 text-center text-sm sm:text-base text-muted-foreground'>
                Ташрифлар тарихи...
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {patient && (
          <EditPatientModal
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            patient={patient}
            onSuccess={handleEditSuccess}
          />
        )}

        <PatientReportModal
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          patientName={patient.fullname}
          patientId={patient.patient_id}
        />
      </main>
    </div>
  );
};

export default PatientProfile;
