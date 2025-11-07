import { useCreateExamMutation } from '@/app/api/examinationApi/examinationApi';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useGetUsersQuery } from '@/app/api/userApi/userApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
  Activity,
  FileText,
  Save,
  Search,
  User,
  UserCog,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const NewVisit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [subjective, setSubjective] = useState('');
  const [description, setDescription] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get patient ID from navigation state
  const patientIdFromState = location.state?.patientId;

  // Fetch all patients for search
  const { data: patientsData } = useGetAllPatientQuery({
    page: 1,
    limit: 100,
  });

  // Fetch selected patient details only when we have a selectedPatientId
  const { data: patientData } = useGetPatientByIdQuery(selectedPatientId, {
    skip: !selectedPatientId,
  });

  // Fetch doctors
  const { data: doctorsData } = useGetUsersQuery({
    page: 1,
    limit: 100,
    role: 'doctor',
  });

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const handleRequest = useHandleRequest();

  const patients = patientsData?.data || [];
  const doctors = doctorsData?.data || [];

  // Auto-select patient if coming from PatientProfile
  useEffect(() => {
    if (patientIdFromState && !selectedPatientId) {
      setSelectedPatientId(patientIdFromState);
      // Clear the state from location after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [patientIdFromState, selectedPatientId, navigate, location.pathname]);

  // Update patient state when patient data is loaded
  useEffect(() => {
    if (patientData?.data && selectedPatientId) {
      setPatient(patientData.data);
    }
  }, [patientData, selectedPatientId]);

  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setOpen(false);
  };

  const clearPatient = () => {
    setPatient(null);
    setSelectedPatientId('');
    setSearchQuery('');
    setOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      p.fullname.toLowerCase().includes(query) ||
      p.patient_id.toLowerCase().includes(query) ||
      p.phone.includes(query)
    );
  });

  const handleSave = async () => {
    if (!selectedPatientId) {
      toast.error('Илтимос, беморни танланг');
      return;
    }
    if (!selectedDoctorId) {
      toast.error('Илтимос, шифокорни танланг');
      return;
    }
    if (!subjective.trim()) {
      toast.error('Илтимос, бемор шикоятини киритинг');
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await createExam({
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          description: description,
        }).unwrap();
        console.log({
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          description: description,
        })
        return res;
      },
      onSuccess: () => {
        toast.success('Кўрик муваффақиятли яратилди');
        navigate('/dashboard');
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-5xl'>
        {/* Patient Search/Selection */}
        {!patient ? (
          <Card className='card-shadow mb-4 sm:mb-6'>
            <div className='p-4 sm:p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <User className='w-6 h-6 text-primary' />
                <h3 className='text-lg font-bold'>Беморни танланг</h3>
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between h-12'
                  >
                    <span className='flex items-center gap-2'>
                      <Search className='w-4 h-4' />
                      {'Беморни қидириш...'}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-[910px] p-0 relative -top-14'
                  align='start'
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder='Исм, ID ёки телефон орқали қидириш...'
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Бемор топилмади</CommandEmpty>
                      <CommandGroup>
                        {filteredPatients.map((p) => (
                          <CommandItem
                            key={p._id}
                            value={p._id}
                            onSelect={() => selectPatient(p._id)}
                          >
                            <div className='flex flex-col'>
                              <span className='font-medium'>{p.fullname}</span>
                              <span className='text-xs text-muted-foreground'>
                                ID: {p.patient_id} • {p.phone}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </Card>
        ) : (
          <>
            {/* Patient Banner */}
            <Card className='card-shadow mb-4 sm:mb-6 bg-gradient-to-r from-primary/5 to-primary/10'>
              <div className='p-4 sm:p-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    {/* Patient Info */}
                    <div>
                      <h2 className='text-lg sm:text-xl md:text-2xl font-bold mb-1'>
                        {patient.fullname}{' '}
                        <span className='text-muted-foreground text-sm sm:text-base'>
                          ({calculateAge(patient.date_of_birth)} ёш,{' '}
                          {patient.gender === 'male' ? 'Эркак' : 'Аёл'})
                        </span>
                      </h2>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        ID: {patient.patient_id} • {patient.phone}
                      </p>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        Сана:{' '}
                        {new Date().toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {patient?.allergies && patient.allergies.length > 0 && (
                        <div className='px-3 py-2 bg-danger/20 border border-danger rounded-lg mt-2'>
                          <p className='text-xs sm:text-sm font-semibold text-danger'>
                            ⚠ Аллергия: {patient.allergies.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Doctor Selection */}
                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <UserCog className='w-5 h-5 text-primary' />
                        <h3 className='font-semibold text-sm sm:text-base'>
                          Шифокорни танланг
                        </h3>
                      </div>
                      <Select
                        value={selectedDoctorId}
                        onValueChange={setSelectedDoctorId}
                      >
                        <SelectTrigger className='h-10 sm:h-12'>
                          <SelectValue placeholder='Шифокорни танланг...' />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor: any) => (
                            <SelectItem key={doctor._id} value={doctor._id}>
                              <div className='flex flex-col'>
                                <span className='font-medium'>
                                  {doctor.fullname}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {doctor.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* SOAP Form - Only show when patient is selected */}
        {patient && (
          <>
            <div className='space-y-4 sm:space-y-6'>
              {/* Subjective - Complaints */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg flex items-center justify-center'>
                      <FileText className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg sm:text-xl font-bold'>
                        S - Subjective
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        Бемор шикояти
                      </p>
                    </div>
                  </div>
                  <Textarea
                    placeholder='Беморнинг шикоятларини, симптомларини ва касаллик тарихини ёзинг...'
                    className='min-h-24 sm:min-h-32 text-sm sm:text-base'
                    value={subjective}
                    onChange={(e) => setSubjective(e.target.value)}
                  />
                </div>
              </Card>

              {/* Description */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <div className='flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4'>
                    <div className='w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg flex items-center justify-center'>
                      <Activity className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                    </div>
                    <div>
                      <h3 className='text-lg sm:text-xl font-bold'>
                        O - Objective
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        Кўрик натижаси ва таvsия
                      </p>
                    </div>
                  </div>
                  <Textarea
                    placeholder='Кўрик натижаларини, диагноз ва таvsияларни ёзинг...'
                    className='min-h-24 sm:min-h-32 text-sm sm:text-base'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className='mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
              <Button
                variant='outline'
                size='lg'
                onClick={clearPatient}
                className='w-full sm:w-auto text-sm sm:text-base'
                disabled={isCreating}
              >
                <X className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                Бекор қилиш
              </Button>
              <Button
                size='lg'
                className='gradient-success w-full sm:w-auto text-sm sm:text-base'
                onClick={handleSave}
                disabled={
                  isCreating ||
                  !selectedPatientId ||
                  !selectedDoctorId ||
                  !subjective.trim()
                }
              >
                <Save className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                {isCreating ? 'Сақланмоқда...' : 'Сақлаш'}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NewVisit;
