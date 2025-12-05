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
import { calculateAge } from './components/calculateAge';

const NewVisit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [subjective, setSubjective] = useState('');
  const [description, setDescription] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [treatmentType, setTreatmentType] = useState<'stasionar' | 'ambulator'>(
    'ambulator'
  );
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Infinite scroll states for patients
  const [patientPage, setPatientPage] = useState(1);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [hasMorePatients, setHasMorePatients] = useState(true);
  const [isLoadingMorePatients, setIsLoadingMorePatients] = useState(false);

  // Infinite scroll states for doctors
  const [doctorPage, setDoctorPage] = useState(1);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [hasMoreDoctors, setHasMoreDoctors] = useState(true);
  const [isLoadingMoreDoctors, setIsLoadingMoreDoctors] = useState(false);

  // Get patient ID from navigation state
  const patientIdFromState = location.state?.patientId;

  // Fetch all patients for search with pagination
  const { data: patientsData, isLoading: isLoadingPatients } =
    useGetAllPatientQuery({
      page: patientPage,
      limit: 20,
    });

  // Fetch selected patient details only when we have a selectedPatientId
  const { data: patientData } = useGetPatientByIdQuery(selectedPatientId, {
    skip: !selectedPatientId,
  });

  // Fetch doctors with pagination
  const { data: doctorsData, isLoading: isLoadingDoctors } = useGetUsersQuery({
    page: doctorPage,
    limit: 20,
    role: 'doctor',
  });

  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();
  const handleRequest = useHandleRequest();

  const patients = allPatients;
  const doctors = allDoctors;

  // Update patients list when new data arrives
  useEffect(() => {
    if (patientsData?.data) {
      if (patientPage === 1) {
        setAllPatients(patientsData.data);
      } else {
        setAllPatients((prev) => {
          const newData = patientsData.data.filter(
            (patient: any) => !prev.some((p) => p._id === patient._id)
          );
          return [...prev, ...newData];
        });
      }

      const totalPages = patientsData.pagination?.total_pages || 1;
      setHasMorePatients(patientPage < totalPages);
      setIsLoadingMorePatients(false);
    }
  }, [patientsData, patientPage]);

  // Update doctors list when new data arrives
  useEffect(() => {
    if (doctorsData?.data) {
      if (doctorPage === 1) {
        setAllDoctors(doctorsData.data);
      } else {
        setAllDoctors((prev) => {
          const newData = doctorsData.data.filter(
            (doc: any) => !prev.some((d) => d._id === doc._id)
          );
          return [...prev, ...newData];
        });
      }

      const totalPages = doctorsData.pagination?.total_pages || 1;
      setHasMoreDoctors(doctorPage < totalPages);
      setIsLoadingMoreDoctors(false);
    }
  }, [doctorsData, doctorPage]);

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
    setShowErrors(false);
    setOpen(true);
  };

  const loadMorePatients = () => {
    if (!isLoadingMorePatients && hasMorePatients && !isLoadingPatients) {
      setIsLoadingMorePatients(true);
      setPatientPage((prev) => prev + 1);
    }
  };

  const handlePatientScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasMorePatients && !isLoadingMorePatients) {
      loadMorePatients();
    }
  };

  const loadMoreDoctors = () => {
    if (!isLoadingMoreDoctors && hasMoreDoctors && !isLoadingDoctors) {
      setIsLoadingMoreDoctors(true);
      setDoctorPage((prev) => prev + 1);
    }
  };

  const handleDoctorScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasMoreDoctors && !isLoadingMoreDoctors) {
      loadMoreDoctors();
    }
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
    setShowErrors(true);

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
        const request = {
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          treatment_type: treatmentType,
        };
        if (description.trim()) {
          request['description'] = description;
        }
        const res = await createExam(request).unwrap();
        console.log({
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          description: description,
          treatment_type: treatmentType,
        });
        return res;
      },
      onSuccess: () => {
        toast.success('Кўрик муваффақиятли яратилди');
        navigate('/examinations');
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
                <User className='w-5 h-5 sm:w-6 sm:h-6 text-primary' />
                <h3 className='text-base sm:text-lg font-bold'>
                  Беморни танланг
                </h3>
              </div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={open}
                    className='w-full justify-between h-10 sm:h-12 text-sm sm:text-base'
                  >
                    <span className='flex items-center gap-2'>
                      <Search className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
                      <span className='truncate'>Беморни қидириш...</span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[910px] p-0'
                  align='start'
                  side='bottom'
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder='Исм, ID ёки телефон орқали қидириш...'
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      className='text-sm sm:text-base'
                    />
                    <CommandList onScroll={handlePatientScroll}>
                      <CommandEmpty className='py-6 text-sm sm:text-base'>
                        {isLoadingPatients
                          ? 'Юкланмоқда...'
                          : 'Бемор топилмади'}
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredPatients.map((p) => (
                          <CommandItem
                            key={p._id}
                            value={p._id}
                            onSelect={() => selectPatient(p._id)}
                            className='py-3'
                          >
                            <div className='flex flex-col w-full'>
                              <span className='font-medium text-sm sm:text-base'>
                                {p.fullname}
                              </span>
                              <span className='text-xs sm:text-sm text-muted-foreground'>
                                ID: {p.patient_id} • {p.phone}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                        {isLoadingMorePatients && (
                          <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                            Юкланмоқда...
                          </div>
                        )}
                        {!hasMorePatients && patients.length > 0 && (
                          <div className='px-2 py-2 text-center text-xs text-muted-foreground'>
                            Барча беморлар юкланди
                          </div>
                        )}
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
                      <p className='text-xs sm:text-base text-muted-foreground'>
                        ID: {patient.patient_id}
                      </p>
                      <p className='text-xs sm:text-base text-muted-foreground'>
                        Сана: {new Date().toLocaleDateString('uz-UZ')}
                      </p>
                      {patient?.allergies && patient.allergies.length > 0 && (
                        <div className='px-3 py-2 bg-danger/20 border border-danger rounded-lg mt-2'>
                          <p className='text-xs sm:text-sm font-semibold text-danger'>
                            ⚠ Аллергия: {patient.allergies.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Doctor Selection and Treatment Type in one row */}
                    <div className='flex flex-col lg:flex-row gap-4'>
                      <div className='flex-1'>
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
                          <SelectTrigger
                            className={`h-10 sm:h-12 ${
                              showErrors && !selectedDoctorId
                                ? 'border-red-500'
                                : ''
                            }`}
                          >
                            <SelectValue placeholder='Шифокорни танланг...' />
                          </SelectTrigger>
                          <SelectContent onScroll={handleDoctorScroll}>
                            {doctors.map((doctor: any) => (
                              <SelectItem key={doctor._id} value={doctor._id}>
                                <div className='flex flex-col items-start'>
                                  <span className='font-medium'>
                                    {doctor.fullname}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {doctor.email}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                            {isLoadingMoreDoctors && (
                              <div className='px-2 py-4 text-center text-sm text-muted-foreground'>
                                Юкланмоқда...
                              </div>
                            )}
                            {!hasMoreDoctors && doctors.length > 0 && (
                              <div className='px-2 py-2 text-center text-xs text-muted-foreground'>
                                Барча шифокорлар юкланди
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Treatment Type Switch */}
                      <div>
                        <h4 className='text-sm font-medium mb-2'>
                          Даволаш тури
                        </h4>
                        <div className='grid grid-cols-2 gap-1 border-2 border-blue-500 rounded-xl p-1'>
                          <button
                            type='button'
                            onClick={() => setTreatmentType('ambulator')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              treatmentType === 'ambulator'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            Амбулатор
                          </button>
                          <button
                            type='button'
                            onClick={() => setTreatmentType('stasionar')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              treatmentType === 'stasionar'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                          >
                            Стационар
                          </button>
                        </div>
                      </div>
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
                    className={`min-h-24 sm:min-h-32 text-sm sm:text-base ${
                      showErrors && !subjective.trim() ? 'border-red-500' : ''
                    }`}
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
                        Изоҳ
                      </p>
                    </div>
                  </div>
                  <Textarea
                    placeholder='Изоҳни ёзинг...'
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
                disabled={isCreating}
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
