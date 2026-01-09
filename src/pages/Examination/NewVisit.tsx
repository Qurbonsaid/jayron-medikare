import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

import { useCreateExamWithPrescriptionAndServiceMutation } from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { useGetUsersQuery } from '@/app/api/userApi/userApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsTablet } from '@/hooks/use-tablet';
import { format } from 'date-fns';
import {
  Activity,
  FileText,
  Pill,
  Plus,
  Save,
  Search,
  Trash2,
  User,
  UserCog,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { calculateAge } from './components/calculateAge';

const NewVisit = () => {
  const { t } = useTranslation('examinations');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isSmallDevice = isMobile || isTablet;

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

  // Prescription states
  interface MedicationItem {
    id: string;
    medication_id: string;
    additionalInfo: string;
    frequency: string;
    duration: string;
    instructions: string;
    addons: string;
  }
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [medicationSearch, setMedicationSearch] = useState('');

  // Medication infinite scroll states
  const [medicationOptions, setMedicationOptions] = useState<any[]>([]);
  const [medicationPage, setMedicationPage] = useState(1);
  const [hasMoreMedications, setHasMoreMedications] = useState(true);
  const [isLoadingMoreMedications, setIsLoadingMoreMedications] =
    useState(false);

  // Service states
  interface ServiceDay {
    day: number;
    date: Date | null;
  }

  interface ServiceItem {
    id: string;
    service_id: string;
    notes: string;
    markedDays: number[]; // Array of day numbers that are marked
  }
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>(
    {}
  );
  const [serviceDuration, setServiceDuration] = useState<number>(7);
  const [serviceStartDate, setServiceStartDate] = useState<Date | null>(
    new Date()
  );

  // Service infinite scroll states
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [servicePage, setServicePage] = useState(1);
  const [hasMoreServices, setHasMoreServices] = useState(true);
  const [isLoadingMoreServices, setIsLoadingMoreServices] = useState(false);

  // Doctor search state
  const [doctorSearch, setDoctorSearch] = useState('');

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
      has_examination: false,
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

  const [createExamWithPrescriptionAndService, { isLoading: isCreating }] =
    useCreateExamWithPrescriptionAndServiceMutation();
  const handleRequest = useHandleRequest();

  // Fetch medications with pagination
  const { data: medicationsData, isFetching: isFetchingMedications } =
    useGetAllMedicationsQuery({
      page: medicationPage,
      limit: 20,
      search: medicationSearch || undefined,
    });

  // Fetch services with pagination
  const { data: servicesData, isFetching: isFetchingServices } =
    useGetAllServiceQuery({
      page: servicePage,
      limit: 20,
    } as any);

  const patients = allPatients;
  const doctors = allDoctors;

  // Reset medication pagination when search changes
  useEffect(() => {
    setMedicationPage(1);
    setMedicationOptions([]);
    setHasMoreMedications(true);
  }, [medicationSearch]);

  // Build medicationOptions incrementally when new data arrives
  useEffect(() => {
    const data = medicationsData?.data || [];
    const totalPages = medicationsData?.pagination?.total_pages || 1;
    setHasMoreMedications(medicationPage < totalPages);

    if (medicationPage === 1) {
      setMedicationOptions(data);
    } else if (Array.isArray(data) && data.length > 0) {
      setMedicationOptions((prev) => {
        const ids = new Set(prev.map((m: any) => m._id));
        const appended = data.filter((m: any) => !ids.has(m._id));
        return [...prev, ...appended];
      });
    }
    if (!isFetchingMedications) {
      setIsLoadingMoreMedications(false);
    }
  }, [medicationsData, medicationPage, isFetchingMedications]);

  // Build serviceOptions incrementally when new data arrives
  useEffect(() => {
    const data = servicesData?.data || [];
    const totalPages = servicesData?.pagination?.total_pages || 1;
    setHasMoreServices(servicePage < totalPages);

    if (servicePage === 1) {
      setServiceOptions(data);
    } else if (Array.isArray(data) && data.length > 0) {
      setServiceOptions((prev) => {
        const ids = new Set(prev.map((s: any) => s._id));
        const appended = data.filter((s: any) => !ids.has(s._id));
        return [...prev, ...appended];
      });
    }
    if (!isFetchingServices) {
      setIsLoadingMoreServices(false);
    }
  }, [servicesData, servicePage, isFetchingServices]);

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

  const filteredDoctors = doctors.filter((d) => {
    const query = doctorSearch.toLowerCase().trim();
    if (!query) return true;

    return d.fullname.toLowerCase().includes(query) || d.phone?.includes(query);
  });

  // Medication handlers
  const addMedication = () => {
    setMedications([
      ...medications,
      {
        id: Date.now().toString(),
        medication_id: '',
        additionalInfo: '',
        frequency: '',
        duration: '',
        instructions: '',
        addons: '',
      },
    ]);
  };

  const updateMedication = (
    id: string,
    field: keyof MedicationItem,
    value: string
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  // Service handlers
  const addService = () => {
    // Mark all days by default
    const allDays = Array.from({ length: serviceDuration }, (_, i) => i + 1);
    setServices([
      ...services,
      {
        id: Date.now().toString(),
        service_id: '',
        notes: '',
        markedDays: allDays,
      },
    ]);
  };

  // Generate days array based on duration and start date
  const generateDays = (
    duration: number,
    startDate: Date | null
  ): ServiceDay[] => {
    return Array.from({ length: duration }, (_, i) => {
      if (!startDate) {
        return { day: i + 1, date: null };
      }
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return { day: i + 1, date };
    });
  };

  const updateService = (
    id: string,
    field: keyof ServiceItem,
    value: string
  ) => {
    setServices(
      services.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv))
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((srv) => srv.id !== id));
  };

  const toggleDayMark = (serviceId: string, dayNumber: number) => {
    setServices(
      services.map((srv) => {
        if (srv.id === serviceId) {
          const markedDays = srv.markedDays || [];
          if (markedDays.includes(dayNumber)) {
            return {
              ...srv,
              markedDays: markedDays.filter((d) => d !== dayNumber),
            };
          } else {
            return { ...srv, markedDays: [...markedDays, dayNumber] };
          }
        }
        return srv;
      })
    );
  };

  const markEveryOtherDay = () => {
    setServices(
      services.map((srv) => {
        const everyOtherDay = Array.from(
          { length: serviceDuration },
          (_, i) => i + 1
        ).filter((day) => day % 2 === 1); // Mark odd days: 1, 3, 5, 7...
        return { ...srv, markedDays: everyOtherDay };
      })
    );
  };

  const markEveryDay = () => {
    setServices(
      services.map((srv) => {
        const allDays = Array.from(
          { length: serviceDuration },
          (_, i) => i + 1
        ); // Mark all days: 1, 2, 3, 4...
        return { ...srv, markedDays: allDays };
      })
    );
  };

  const handleSave = async () => {
    setShowErrors(true);

    if (!selectedPatientId) {
      toast.error(t('newVisit.selectPatientError'));
      return;
    }
    if (!selectedDoctorId) {
      toast.error(t('newVisit.selectDoctorError'));
      return;
    }
    if (!subjective.trim()) {
      toast.error(t('newVisit.enterComplaintError'));
      return;
    }

    // Prepare prescription_data
    const prescriptionItems = medications
      .filter((med) => med.medication_id)
      .map((med) => ({
        medication_id: med.medication_id,
        frequency: parseInt(med.frequency) || 1,
        duration: parseInt(med.duration) || 1,
        instructions: med.instructions,
        addons: med.addons || '',
      }));

    // Prepare service_data
    let serviceData: {
      duration: number;
      items: Array<{
        service_type_id: string;
        notes: string;
        days: Array<{ day: number; date: string | null }>;
      }>;
    } | null = null;

    if (services.length > 0 && serviceDuration && serviceStartDate) {
      const serviceItems = services.map((srv) => {
        const allDays = generateDays(serviceDuration, serviceStartDate);
        const markedDays = srv.markedDays || [];
        // Include all days, but set date to null for unmarked days
        const daysToSave = allDays.map((day) => ({
          day: day.day,
          date:
            markedDays.includes(day.day) && day.date
              ? format(day.date, 'yyyy-MM-dd')
              : null,
        }));

        return {
          service_type_id: srv.service_id,
          days: daysToSave,
          notes: srv.notes,
        };
      });

      serviceData = {
        duration: serviceDuration,
        items: serviceItems,
      };
    }

    await handleRequest({
      request: async () => {
        const request: any = {
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          treatment_type: treatmentType,
        };

        if (description.trim()) {
          request.description = description;
        }

        // Only include prescription_data if there are prescription items
        if (prescriptionItems.length > 0) {
          request.prescription_data = {
            items: prescriptionItems,
          };
        }

        // Only include service_data if there are services
        if (serviceData && serviceData.items.length > 0) {
          request.service_data = serviceData;
        }

        const res = await createExamWithPrescriptionAndService(
          request
        ).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('newVisit.examCreated'));
        navigate('/examinations');
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || t('errorOccurred'));
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
                  {t('newVisit.selectPatient')}
                </h3>
              </div>
              <div className='space-y-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder={t('newVisit.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-9 h-10 sm:h-12 text-sm sm:text-base'
                  />
                </div>
                <Card>
                  <div
                    className='max-h-[400px] overflow-auto'
                    onScroll={handlePatientScroll}
                  >
                    {isLoadingPatients && filteredPatients.length === 0 ? (
                      <div className='p-6 text-center text-sm text-muted-foreground'>
                        {t('newVisit.loading')}
                      </div>
                    ) : filteredPatients.length === 0 ? (
                      <div className='p-6 text-center text-sm text-muted-foreground'>
                        {t('newVisit.patientNotFound')}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('newVisit.fullname')}</TableHead>
                            <TableHead>{t('newVisit.id')}</TableHead>
                            <TableHead>{t('phone')}</TableHead>
                            <TableHead>{t('newVisit.gender')}</TableHead>
                            <TableHead className='text-right'>
                              {t('newVisit.action')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPatients.map((p) => (
                            <TableRow
                              key={p._id}
                              className='cursor-pointer hover:bg-accent'
                              onClick={() => selectPatient(p._id)}
                            >
                              <TableCell className='font-medium'>
                                {p.fullname}
                              </TableCell>
                              <TableCell>{p.patient_id}</TableCell>
                              <TableCell>{p.phone}</TableCell>
                              <TableCell>
                                {p.gender === 'male'
                                  ? t('newVisit.male')
                                  : t('newVisit.female')}
                              </TableCell>
                              <TableCell className='text-right'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectPatient(p._id);
                                  }}
                                >
                                  {t('newVisit.select')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                    {isLoadingMorePatients && (
                      <div className='p-4 text-center text-sm text-muted-foreground'>
                        {t('newVisit.loading')}
                      </div>
                    )}
                    {!hasMorePatients && filteredPatients.length > 0 && (
                      <div className='p-2 text-center text-xs text-muted-foreground'>
                        {t('newVisit.allPatientsLoaded')}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
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
                          ({calculateAge(patient.date_of_birth)}{' '}
                          {t('newVisit.age')},{' '}
                          {patient.gender === 'male'
                            ? t('newVisit.male')
                            : t('newVisit.female')}
                          )
                        </span>
                      </h2>
                      <p className='text-xs sm:text-base text-muted-foreground'>
                        ID: {patient.patient_id}
                      </p>
                      <p className='text-xs sm:text-base text-muted-foreground'>
                        {t('date')}: {new Date().toLocaleDateString('uz-UZ')}
                      </p>
                      {patient?.allergies && patient.allergies.length > 0 && (
                        <div className='px-3 py-2 bg-danger/20 border border-danger rounded-lg mt-2'>
                          <p className='text-xs sm:text-sm font-semibold text-danger'>
                            ⚠ {t('newVisit.allergy')}:{' '}
                            {patient.allergies.join(', ')}
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
                            {t('newVisit.selectDoctor')}
                          </h3>
                        </div>
                        <ComboBox
                          value={selectedDoctorId}
                          onValueChange={setSelectedDoctorId}
                          options={filteredDoctors.map((doctor: any) => ({
                            value: doctor._id,
                            label: doctor.fullname,
                            sublabel: doctor.email,
                          }))}
                          placeholder={t('newVisit.selectDoctorPlaceholder')}
                          searchPlaceholder={t('newVisit.searchDoctor')}
                          searchValue={doctorSearch}
                          onSearchChange={setDoctorSearch}
                          onScroll={handleDoctorScroll}
                          isLoading={isLoadingMoreDoctors}
                          hasMore={hasMoreDoctors}
                          autoFocus={!isSmallDevice}
                          className={`h-10 sm:h-12 ${
                            showErrors && !selectedDoctorId
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                      </div>

                      {/* Treatment Type Switch */}
                      <div>
                        <h4 className='text-sm font-medium mb-2'>
                          {t('newVisit.treatmentType')}
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
                            {t('newVisit.ambulatory')}
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
                            {t('newVisit.stationary')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* SOAP Form - Only show when patient is selected */}
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
                        {t('newVisit.subjective')}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {t('newVisit.patientComplaint')}
                      </p>
                    </div>
                  </div>
                  <Textarea
                    placeholder={t('newVisit.subjectivePlaceholder')}
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
                        {t('newVisit.objective')}
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        {t('newVisit.description')}
                      </p>
                    </div>
                  </div>
                  <Textarea
                    placeholder={t('newVisit.descriptionPlaceholder')}
                    className='min-h-24 sm:min-h-32 text-sm sm:text-base'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </Card>

              {/* Prescriptions Section */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-2 sm:gap-3'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg flex items-center justify-center'>
                        <Pill className='w-4 h-4 sm:w-5 sm:h-5 text-white' />
                      </div>
                      <div>
                        <h3 className='text-lg sm:text-xl font-bold'>
                          {t('newVisit.prescriptions')}
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                          {t('newVisit.medicationsForPatient')}
                        </p>
                      </div>
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addMedication}
                      className='gap-1'
                    >
                      <Plus className='w-4 h-4' />
                      {t('newVisit.addMedication')}
                    </Button>
                  </div>

                  {medications.length === 0 ? (
                    <p className='text-sm text-muted-foreground text-center py-4'>
                      {t('newVisit.noMedications')}
                    </p>
                  ) : (
                    <div className='space-y-3'>
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className='p-3 bg-muted/30 rounded-lg border space-y-2'
                        >
                          {/* First row: Dori, Qo'shimchalar, Trash */}
                          <div className='flex items-center gap-2'>
                            <div className='flex-1 min-w-0'>
                              <label className='text-xs mb-1 block font-medium'>
                                {t('newVisit.medication')}
                              </label>
                              <ComboBox
                                value={med.medication_id}
                                onValueChange={(value) =>
                                  updateMedication(
                                    med.id,
                                    'medication_id',
                                    value
                                  )
                                }
                                options={medicationOptions.map(
                                  (medication: any) => ({
                                    value: medication._id,
                                    label: medication.name,
                                    sublabel: medication.dosage,
                                  })
                                )}
                                placeholder={t('newVisit.selectMedication')}
                                searchPlaceholder={t(
                                  'newVisit.searchMedication'
                                )}
                                emptyText={t('newVisit.medicationNotFound')}
                                loadingText={t('newVisit.loading')}
                                searchValue={medicationSearch}
                                onSearchChange={(value) => {
                                  setMedicationSearch(value);
                                  setMedicationPage(1);
                                  setMedicationOptions([]);
                                  setHasMoreMedications(true);
                                }}
                                onScroll={(e) => {
                                  const target = e.target as HTMLDivElement;
                                  const atBottom =
                                    target.scrollHeight - target.scrollTop <=
                                    target.clientHeight + 10;
                                  if (
                                    atBottom &&
                                    hasMoreMedications &&
                                    !isLoadingMoreMedications &&
                                    !isFetchingMedications
                                  ) {
                                    setIsLoadingMoreMedications(true);
                                    setMedicationPage((prev) => prev + 1);
                                  }
                                }}
                                isLoading={isFetchingMedications}
                                hasMore={hasMoreMedications}
                                autoFocus={!isSmallDevice}
                                className='h-9'
                              />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <label className='text-xs mb-1 block font-medium'>
                                {t('newVisit.additionalInfo')}
                              </label>
                              <Input
                                placeholder={t(
                                  'newVisit.additionalInfoPlaceholder'
                                )}
                                className='h-9'
                                value={med.additionalInfo}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'additionalInfo',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className='shrink-0 flex items-center pt-5'>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50'
                                onClick={() => removeMedication(med.id)}
                              >
                                <Trash2 className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                          {/* Second row: Marta, Kun, Qo'llanish */}
                          <div className='flex items-center gap-2'>
                            <div className='w-20 shrink-0'>
                              <label className='text-xs mb-1 block font-medium'>
                                {t('newVisit.day')}
                              </label>
                              <Input
                                type='number'
                                placeholder='7'
                                className='h-9'
                                min={0}
                                value={med.duration}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'duration',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className='w-20 shrink-0'>
                              <label className='text-xs mb-1 block font-medium'>
                                {t('newVisit.timesPerDay')}
                              </label>
                              <Input
                                type='number'
                                placeholder='3'
                                className='h-9'
                                min={0}
                                value={med.frequency}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'frequency',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <label className='text-xs mb-1 block font-medium'>
                                {t('newVisit.usage')}
                              </label>
                              <Input
                                placeholder={t('newVisit.usagePlaceholder')}
                                className='h-9'
                                value={med.instructions}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'instructions',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Services Section */}
              <div className='space-y-3 border rounded-lg p-4 bg-muted/30'>
                <div className='flex items-center justify-between'>
                  <Label className='flex items-center gap-2'>
                    <Activity className='w-4 h-4 text-primary' />
                    {t('newVisit.services')}
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addService}
                    className='gap-1'
                  >
                    <Plus className='w-4 h-4' />
                    {t('newVisit.addService')}
                  </Button>
                </div>

                {services.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    {t('newVisit.noServices')}
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {/* Common Settings */}
                    <div className='flex items-end gap-2 p-2 bg-muted/30 rounded-lg border'>
                      <div className='w-28'>
                        <Label className='text-xs font-medium'>
                          {t('newVisit.durationDays')}
                        </Label>
                        <Input
                          type='number'
                          min={1}
                          max={30}
                          value={
                            serviceDuration === 0
                              ? ''
                              : serviceDuration.toString()
                          }
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            // Allow empty string for deletion - set to 0 temporarily
                            if (inputValue === '') {
                              setServiceDuration(0);
                              return;
                            }

                            const val = parseInt(inputValue);
                            // Only update if valid number and within range
                            if (!isNaN(val) && val >= 1 && val <= 30) {
                              setServiceDuration(val);
                              // Auto-adjust marked days when duration changes
                              setServices(
                                services.map((srv) => {
                                  const currentMarked = srv.markedDays || [];
                                  // Keep only marked days that are within new duration
                                  const adjustedMarked = currentMarked.filter(
                                    (day) => day <= val
                                  );
                                  // If pattern is every other day, extend pattern to new duration
                                  if (adjustedMarked.length > 0) {
                                    const isEveryOtherDay =
                                      adjustedMarked.every(
                                        (day, idx) =>
                                          idx === 0 ||
                                          day === adjustedMarked[idx - 1] + 2
                                      );
                                    if (
                                      isEveryOtherDay &&
                                      adjustedMarked[0] === 1
                                    ) {
                                      // Extend pattern for new days
                                      const newMarked = Array.from(
                                        { length: val },
                                        (_, i) => i + 1
                                      ).filter((day) => day % 2 === 1);
                                      return { ...srv, markedDays: newMarked };
                                    }
                                  }
                                  return { ...srv, markedDays: adjustedMarked };
                                })
                              );
                            }
                          }}
                          onBlur={(e) => {
                            // If empty or invalid on blur, set to default 7
                            const inputValue = e.target.value;
                            const val = parseInt(inputValue);
                            if (
                              inputValue === '' ||
                              isNaN(val) ||
                              val < 1 ||
                              val > 30
                            ) {
                              setServiceDuration(7);
                            }
                          }}
                          className='h-8 text-xs mt-1'
                        />
                      </div>
                      <div className='flex-1'>
                        <Label className='text-xs font-medium'>
                          {t('newVisit.startDate')}
                        </Label>
                        <Input
                          type='date'
                          value={
                            serviceStartDate
                              ? serviceStartDate.toISOString().split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            setServiceStartDate(
                              e.target.value ? new Date(e.target.value) : null
                            )
                          }
                          className='h-8 text-xs mt-1'
                        />
                      </div>

                      {/* Quick Mark Buttons */}
                      <div className='shrink-0 flex gap-2'>
                        <div>
                          <Label className='text-xs font-medium text-transparent'>
                            &nbsp;
                          </Label>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={markEveryDay}
                            className='h-8 text-sm mt-1'
                            disabled={services.length === 0}
                          >
                            {t('newVisit.everyDay')}
                          </Button>
                        </div>
                        <div>
                          <Label className='text-xs font-medium text-transparent'>
                            &nbsp;
                          </Label>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={markEveryOtherDay}
                            className='h-8 text-sm mt-1'
                            disabled={services.length === 0}
                          >
                            {t('newVisit.everyOtherDay')}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Services Table */}
                    <div className='overflow-x-auto max-h-[400px] scroll-auto'>
                      <table className='w-full border-collapse border text-xs'>
                        <thead className='sticky top-0 bg-background z-10'>
                          <tr className='bg-muted/50'>
                            <th className='border px-2 py-1.5 text-left font-semibold min-w-[150px] sticky left-0 bg-muted/50 z-20'>
                              {t('newVisit.service')}
                            </th>
                            {Array.from({ length: 8 }, (_, i) => (
                              <th
                                key={i}
                                className='border px-1 py-1.5 text-center font-semibold min-w-[70px]'
                              ></th>
                            ))}
                            <th className='border px-1 py-1.5 text-center font-semibold w-10 sticky right-0 bg-muted/50 z-20'></th>
                          </tr>
                        </thead>
                        <tbody>
                          {services.map((srv) => {
                            const days = generateDays(
                              serviceDuration,
                              serviceStartDate
                            );
                            const markedDays = srv.markedDays || [];

                            // Split days into chunks of 8
                            const daysPerRow = 8;
                            const dayChunks: ServiceDay[][] = [];
                            for (let i = 0; i < days.length; i += daysPerRow) {
                              dayChunks.push(days.slice(i, i + daysPerRow));
                            }

                            return (
                              <React.Fragment key={srv.id}>
                                {dayChunks.map((chunk, chunkIndex) => (
                                  <tr
                                    key={`${srv.id}-${chunkIndex}`}
                                    className='hover:bg-muted/30'
                                  >
                                    {chunkIndex === 0 && (
                                      <td
                                        className='border px-1 py-1 sticky left-0 bg-background z-10'
                                        rowSpan={dayChunks.length}
                                      >
                                        <ComboBox
                                          value={srv.service_id}
                                          onValueChange={(value) =>
                                            updateService(
                                              srv.id,
                                              'service_id',
                                              value
                                            )
                                          }
                                          options={(() => {
                                            const searchQuery = (
                                              serviceSearch[srv.id] || ''
                                            )
                                              .toLowerCase()
                                              .trim();
                                            const selectedServiceIds = services
                                              .filter(
                                                (s) =>
                                                  s.service_id &&
                                                  s.id !== srv.id
                                              )
                                              .map((s) => s.service_id);
                                            const filtered = searchQuery
                                              ? serviceOptions.filter(
                                                  (s: any) =>
                                                    !selectedServiceIds.includes(
                                                      s._id
                                                    ) &&
                                                    (s.name
                                                      ?.toLowerCase()
                                                      .includes(searchQuery) ||
                                                      s.code
                                                        ?.toLowerCase()
                                                        .includes(searchQuery))
                                                )
                                              : serviceOptions.filter(
                                                  (s: any) =>
                                                    !selectedServiceIds.includes(
                                                      s._id
                                                    )
                                                );
                                            return filtered.map((s: any) => ({
                                              value: s._id,
                                              label: `${
                                                s.name
                                              } - ${new Intl.NumberFormat(
                                                'uz-UZ'
                                              ).format(s.price)} ${t(
                                                'newVisit.sum'
                                              )}`,
                                            }));
                                          })()}
                                          placeholder={t(
                                            'newVisit.selectService'
                                          )}
                                          searchPlaceholder={t(
                                            'newVisit.searchService'
                                          )}
                                          emptyText={t(
                                            'newVisit.serviceNotFound'
                                          )}
                                          loadingText={t('newVisit.loading')}
                                          searchValue={
                                            serviceSearch[srv.id] || ''
                                          }
                                          onSearchChange={(value) =>
                                            setServiceSearch((prev) => ({
                                              ...prev,
                                              [srv.id]: value,
                                            }))
                                          }
                                          onScroll={(e) => {
                                            const target =
                                              e.target as HTMLDivElement;
                                            const atBottom =
                                              target.scrollHeight -
                                                target.scrollTop <=
                                              target.clientHeight + 10;
                                            if (
                                              atBottom &&
                                              hasMoreServices &&
                                              !isLoadingMoreServices &&
                                              !isFetchingServices
                                            ) {
                                              setIsLoadingMoreServices(true);
                                              setServicePage(
                                                (prev) => prev + 1
                                              );
                                            }
                                          }}
                                          isLoading={isFetchingServices}
                                          hasMore={hasMoreServices}
                                          autoFocus={!isSmallDevice}
                                          className='h-7 text-xs border-0 shadow-none min-w-[140px]'
                                        />
                                      </td>
                                    )}
                                    {chunk.map((day, i) => {
                                      const isMarked = markedDays.includes(
                                        day.day
                                      );
                                      return (
                                        <td
                                          key={i}
                                          className='border px-1 py-1 text-center group relative cursor-pointer hover:bg-blue-50 min-w-[70px]'
                                          onClick={() =>
                                            toggleDayMark(srv.id, day.day)
                                          }
                                        >
                                          {day.date ? (
                                            <div className='flex flex-col items-center justify-center'>
                                              <span className='text-[10px] text-muted-foreground font-bold'>
                                                {t('newVisit.dayN', {
                                                  n: day.day,
                                                })}
                                              </span>
                                              <span
                                                className={`px-1.5 py-0.5 rounded ${
                                                  isMarked
                                                    ? 'bg-blue-500 text-white font-semibold'
                                                    : ''
                                                }`}
                                              >
                                                {format(day.date, 'dd/MM')}
                                              </span>
                                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none text-xs'>
                                                {t('newVisit.dayN', {
                                                  n: day.day,
                                                })}
                                                :{' '}
                                                {new Date(
                                                  day.date
                                                ).toLocaleDateString('uz-UZ')}
                                                {isMarked && ' ✓'}
                                              </div>
                                            </div>
                                          ) : (
                                            <div className='flex flex-col items-center justify-center'>
                                              <span className='text-[10px] text-muted-foreground font-bold'>
                                                {t('newVisit.dayN', {
                                                  n: day.day,
                                                })}
                                              </span>
                                              <span className='text-muted-foreground'>
                                                —
                                              </span>
                                            </div>
                                          )}
                                        </td>
                                      );
                                    })}
                                    {/* Fill empty cells if chunk has less than 8 items */}
                                    {chunk.length < daysPerRow &&
                                      Array.from(
                                        { length: daysPerRow - chunk.length },
                                        (_, i) => (
                                          <td
                                            key={`empty-${i}`}
                                            className='border px-1 py-1'
                                          ></td>
                                        )
                                      )}
                                    {chunkIndex === 0 && (
                                      <td
                                        className='border px-1 py-1 text-center sticky right-0 bg-background z-10'
                                        rowSpan={dayChunks.length}
                                      >
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='sm'
                                          onClick={() => removeService(srv.id)}
                                          className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                        >
                                          <Trash2 className='w-3 h-3' />
                                        </Button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
                  {t('newVisit.cancelBtn')}
                </Button>
                <Button
                  size='lg'
                  className='gradient-success w-full sm:w-auto text-sm sm:text-base'
                  onClick={handleSave}
                  disabled={isCreating}
                >
                  <Save className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                  {isCreating ? t('newVisit.savingBtn') : t('newVisit.saveBtn')}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NewVisit;
