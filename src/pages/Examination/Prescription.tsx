import {
  useAddServiceMutation,
  useGetAllExamsQuery,
  useGetOneExamQuery,
} from '@/app/api/examinationApi/examinationApi';
import type { Prescription } from '@/app/api/examinationApi/types';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
import {
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
} from '@/app/api/prescription/prescriptionApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  Edit,
  Loader2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Medication {
  id: string;
  medication_id: string;
  additionalInfo: string;
  frequency: string;
  duration: string;
  instructions: string;
  addons: string;
}

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

interface ValidationErrors {
  [key: string]: {
    medication_id?: boolean;
    frequency?: boolean;
    duration?: boolean;
    instructions?: boolean;
  };
}

interface ServiceValidationErrors {
  [key: string]: {
    service_id?: boolean;
    duration?: boolean;
  };
}

interface FormValidationErrors {
  medications: ValidationErrors;
  services: ServiceValidationErrors;
}

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allergyWarning, setAllergyWarning] = useState(false);
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({
    medications: {},
    services: {},
  });
  const [serviceSearch, setServiceSearch] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const [servicePage, setServicePage] = useState(1);
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [hasMoreServices, setHasMoreServices] = useState(true);

  // Common service settings
  const [serviceDuration, setServiceDuration] = useState<number>(7);
  const [serviceStartDate, setServiceStartDate] = useState<Date | null>(
    new Date()
  );

  // Prescription editing states
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [editPrescriptionForm, setEditPrescriptionForm] = useState({
    medication_id: '',
    frequency: '',
    duration: '',
    instructions: '',
  });
  const [editMedicationSearch, setEditMedicationSearch] = useState('');

  // Patient selection states
  const [patient, setPatient] = useState<any>(null);
  const [selectedExaminationId, setSelectedExaminationId] =
    useState<string>('');

  // Medication search states
  const [medicationSearch, setMedicationSearch] = useState('');
  const [selectedMedicationForNew, setSelectedMedicationForNew] =
    useState<string>('');

  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [allExaminations, setAllExaminations] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  // Get examination ID from navigation state
  const examinationIdFromState = location.state?.examinationId;

  // Fetch active examinations with pagination
  const { data: examinationsData, isLoading: isLoadingExaminations } =
    useGetAllExamsQuery({
      page: page,
      limit: 20,
      status: 'pending',
      _key: queryKey, // This forces new query when key changes
    } as any);

  // Fetch selected examination details
  const { data: examinationData, isLoading: isLoadingExamination } =
    useGetOneExamQuery(selectedExaminationId, {
      skip: !selectedExaminationId,
    });

  console.log(examinationData);

  // Fetch patient details when examination is selected
  const { data: patientData, isLoading: isLoadingPatient } =
    useGetPatientByIdQuery(examinationData?.data.patient_id?._id || '', {
      skip: !examinationData?.data.patient_id?._id,
    });

  // Fetch medications for search
  const { data: medicationsData } = useGetAllMedicationsQuery({
    page: 1,
    limit: 100,
    search: medicationSearch || undefined,
  });

  // Debounce service search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  // Fetch services for search with paging
  const { data: servicesData, isFetching: isFetchingServices } =
    useGetAllServiceQuery({
      page: servicePage,
      limit: 20,
      search: debouncedServiceSearch || undefined,
    } as any);

  // Reset paging when search changes
  useEffect(() => {
    setServicePage(1);
    setServiceOptions([]);
    setHasMoreServices(true);
  }, [debouncedServiceSearch]);

  // Append fetched services to options list
  useEffect(() => {
    if (servicesData?.data) {
      setServiceOptions((prev) => {
        const incoming = servicesData.data;
        const merged = servicePage === 1 ? incoming : [...prev, ...incoming];
        const seen = new Set<string>();
        return merged.filter((s: any) => {
          if (!s?._id) return false;
          if (seen.has(s._id)) return false;
          seen.add(s._id);
          return true;
        });
      });

      const pages = servicesData.pagination?.pages || 1;
      const current = servicesData.pagination?.page || servicePage;
      setHasMoreServices(current < pages);
    }
  }, [servicesData, servicePage]);

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] =
    useUpdatePrescriptionMutation();
  const [addServiceToExam, { isLoading: isAddingService }] =
    useAddServiceMutation();
  const handleRequest = useHandleRequest();

  const availableMedications = medicationsData?.data || [];
  const availableServices = serviceOptions;

  // Update examinations list when new data arrives
  useEffect(() => {
    console.log('Examinations Data:', examinationsData);
    console.log('Current Page:', page);

    if (examinationsData?.data && Array.isArray(examinationsData.data)) {
      console.log('Data length:', examinationsData.data.length);

      if (page === 1) {
        setAllExaminations(examinationsData.data);
      } else {
        setAllExaminations((prev) => {
          const newData = examinationsData.data.filter(
            (exam: any) => !prev.some((e) => e._id === exam._id)
          );
          return [...prev, ...newData];
        });
      }

      // Check if there are more pages
      const totalPages = examinationsData.pagination?.total_pages || 1;
      setHasMore(page < totalPages);
      setIsLoadingMore(false);
    } else {
      console.log('No data or data is not an array');
      setIsLoadingMore(false);
    }
  }, [examinationsData, page]);

  const examinations = allExaminations;

  // Check if any data is loading
  const isLoading =
    isLoadingExaminations || isLoadingExamination || isLoadingPatient;

  // Auto-select examination if coming from another page
  useEffect(() => {
    if (examinationIdFromState && !selectedExaminationId) {
      setSelectedExaminationId(examinationIdFromState);
    }
  }, [examinationIdFromState, selectedExaminationId]);

  // Update patient state when examination and patient data are loaded
  useEffect(() => {
    if (selectedExaminationId && examinationData && patientData?.data) {
      setPatient(patientData.data);
      // setSelectedPatientId(patientData.data._id);
      // Check for allergies
      if (patientData.data.allergies && patientData.data.allergies.length > 0) {
        setAllergyWarning(true);
      }
    }
  }, [selectedExaminationId, examinationData, patientData]);

  const clearSelection = () => {
    setPatient(null);
    setSelectedExaminationId('');
    setAllergyWarning(false);
    setMedications([]);
    setServices([]);
    setFormErrors({
      medications: {},
      services: {},
    });
    // Clear navigation state first
    if (examinationIdFromState) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Reset pagination
    setAllExaminations([]);
    setHasMore(true);
    setPage(1);
    // Change query key to force new query and bypass cache
    setQueryKey((prev) => prev + 1);
  };

  const loadMoreExaminations = () => {
    if (!isLoadingMore && hasMore && !isLoadingExaminations) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasMore && !isLoadingMore) {
      loadMoreExaminations();
    }
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return 0;
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

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      medication_id: '',
      additionalInfo: '',
      frequency: '',
      duration: '',
      instructions: '',
      addons: '',
    };
    setMedications([...medications, newMed]);
  };

  const updateMedication = (
    id: string,
    field: keyof Medication,
    value: string
  ) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );

    // Clear validation error when user types
    if (value.trim() !== '') {
      setFormErrors((prev) => ({
        ...prev,
        medications: {
          ...prev.medications,
          [id]: {
            ...prev.medications[id],
            [field]: false,
          },
        },
      }));
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  // Service handlers
  const addService = () => {
    // Mark all days by default
    const allDays = Array.from({ length: serviceDuration }, (_, i) => i + 1);
    const newService: ServiceItem = {
      id: Date.now().toString(),
      service_id: '',
      notes: '',
      markedDays: allDays,
    };
    setServices([...services, newService]);
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

  const updateServiceField = (
    id: string,
    field: keyof ServiceItem,
    value: string
  ) => {
    setServices(
      services.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv))
    );

    // Clear validation error
    if (value.trim() !== '') {
      if (field === 'service_id') {
        setFormErrors((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            [id]: {
              ...prev.services[id],
              [field]: false,
            },
          },
        }));
      }
    }
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

  const handlePrint = () => {
    window.print();
  };

  const handleSavePrescription = async () => {
    // Validate examination selection
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    // Validate that at least one medication or service is added
    if (medications.length === 0 && services.length === 0) {
      toast.error('Илтимос, камида битта дори ёки хизмат қўшинг');
      return;
    }

    // Validate each medication and collect errors
    const medErrors: ValidationErrors = {};
    const srvErrors: ServiceValidationErrors = {};
    let hasErrors = false;

    for (const med of medications) {
      medErrors[med.id] = {};

      // Check if medication is selected
      if (!med.medication_id || med.medication_id.trim() === '') {
        medErrors[med.id].medication_id = true;
        hasErrors = true;
      }

      // Check if frequency is selected
      if (!med.frequency || med.frequency.trim() === '') {
        medErrors[med.id].frequency = true;
        hasErrors = true;
      }

      // Check if duration is filled
      if (!med.duration || med.duration.trim() === '') {
        medErrors[med.id].duration = true;
        hasErrors = true;
      }

      // Check if instructions are filled
      if (!med.instructions || med.instructions.trim() === '') {
        medErrors[med.id].instructions = true;
        hasErrors = true;
      }
    }

    // Validate services
    for (const srv of services) {
      srvErrors[srv.id] = {};

      if (!srv.service_id || srv.service_id.trim() === '') {
        srvErrors[srv.id].service_id = true;
        hasErrors = true;
      }
    }

    // Validate common service settings
    if (services.length > 0) {
      if (!serviceDuration || serviceDuration < 1) {
        toast.error('Илтимос, хизмат муддатини киритинг');
        return;
      }
      if (!serviceStartDate) {
        toast.error('Илтимос, бошланиш санасини танланг');
        return;
      }
    }

    if (hasErrors) {
      setFormErrors({
        medications: medErrors,
        services: srvErrors,
      });
      toast.error('Илтимос, барча майдонларни тўлдиринг');
      return;
    }

    // Check for duplicate medications
    if (medications.length > 0) {
      const medicationIds = medications.map((med) =>
        med.medication_id.toLowerCase().trim()
      );
      const duplicates = medicationIds.filter(
        (id, index) => medicationIds.indexOf(id) !== index
      );
      if (duplicates.length > 0) {
        toast.error(
          'Такрорланган дори. Ҳар бир дори фақат бир марта қўшилиши керак.'
        );
        return;
      }
    }

    // Check for duplicate services
    if (services.length > 0) {
      const serviceIds = services.map((srv) =>
        srv.service_id.toLowerCase().trim()
      );
      const duplicates = serviceIds.filter(
        (id, index) => serviceIds.indexOf(id) !== index
      );
      if (duplicates.length > 0) {
        toast.error(
          'Такрорланган хизмат. Ҳар бир хизмат фақат бир марта қўшилиши керак.'
        );
        return;
      }
    }

    // Save all medications at once
    let medSuccessCount = 0;
    if (medications.length > 0) {
      const medicationItems = medications.map((med) => ({
        medication_id: med.medication_id,
        frequency: parseInt(med.frequency) || 0,
        duration: parseInt(med.duration) || 0,
        instructions: med.instructions,
        addons: med.addons || '',
      }));

      await handleRequest({
        request: async () => {
          const res = await createPrescription({
            examination_id: selectedExaminationId,
            items: medicationItems,
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          medSuccessCount = medications.length;
        },
        onError: (error) => {
          toast.error(error?.data?.error?.msg || `Дориларни сақлашда хатолик`);
        },
      });
    }

    // Save all services at once
    let srvSuccessCount = 0;
    if (services.length > 0) {
      // Generate days for each service based on common duration and start date
      const serviceItems = services.map((srv) => {
        const allDays = generateDays(serviceDuration, serviceStartDate);
        const markedDays = srv.markedDays || [];
        // Only include marked days, or all days if none are marked
        const daysToSave =
          markedDays.length > 0
            ? allDays.filter((day) => markedDays.includes(day.day))
            : allDays;

        return {
          service_type_id: srv.service_id,
          days: daysToSave,
          notes: srv.notes,
        };
      });

      await handleRequest({
        request: async () => {
          const res = await addServiceToExam({
            examination_id: selectedExaminationId,
            duration: serviceDuration,
            items: serviceItems,
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          srvSuccessCount = services.length;
        },
        onError: (error) => {
          toast.error(
            error?.data?.error?.msg || `Хизматларни сақлашда хатолик`
          );
        },
      });
    }

    const totalItems = medications.length + services.length;
    const totalSuccess = medSuccessCount + srvSuccessCount;

    if (totalSuccess === totalItems) {
      toast.success(
        `${medSuccessCount} та дори ва ${srvSuccessCount} та хизмат муваффақиятли сақланди`
      );
      navigate(-1);
    } else if (totalSuccess > 0) {
      toast.warning(`${totalSuccess}/${totalItems} та элемент сақланди`);
    }
  };

  const startEditPrescription = (prescription: any) => {
    setEditingPrescriptionId(prescription._id);
    // Extract medication_id - it may be an object (populated) or a string
    const medId =
      typeof prescription.medication_id === 'object' &&
      prescription.medication_id !== null
        ? prescription.medication_id._id
        : prescription.medication_id || '';
    setEditPrescriptionForm({
      medication_id: medId,
      frequency: prescription.frequency?.toString() || '',
      duration: prescription.duration?.toString() || '',
      instructions: prescription.instructions || '',
    });
    setEditMedicationSearch('');
  };

  const cancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    setEditPrescriptionForm({
      medication_id: '',
      frequency: '',
      duration: '',
      instructions: '',
    });
    setEditMedicationSearch('');
  };

  const handleUpdatePrescription = async (prescriptionId: string) => {
    if (!editPrescriptionForm.medication_id.trim()) {
      toast.error('Илтимос, дорини танланг');
      return;
    }
    if (
      !editPrescriptionForm.frequency ||
      parseInt(editPrescriptionForm.frequency) <= 0
    ) {
      toast.error('Илтимос, қабул қилиш частотасини киритинг');
      return;
    }
    if (
      !editPrescriptionForm.duration ||
      parseInt(editPrescriptionForm.duration) <= 0
    ) {
      toast.error('Илтимос, даволаш муддатини киритинг');
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updatePrescription({
          id: prescriptionId,
          body: {
            items: [
              {
                _id: prescriptionId,
                medication_id: editPrescriptionForm.medication_id,
                frequency: parseInt(editPrescriptionForm.frequency),
                duration: parseInt(editPrescriptionForm.duration),
                instructions: editPrescriptionForm.instructions,
                addons: '',
              },
            ],
          },
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Рецепт муваффақиятли янгиланди');
        setEditPrescriptionForm({
          medication_id: '',
          frequency: '',
          duration: '',
          instructions: '',
        });
        setEditMedicationSearch('');
        setEditingPrescriptionId(null);
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Рецептни янгилашда хатолик');
      },
    });
  };

  return (
    <div className='min-h-screen bg-background p-3 sm:p-4 md:p-6 lg:p-8'>
      <div className='max-w-5xl mx-auto'>
        {/* Loading Spinner */}
        {isLoading && (
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='text-center'>
              <Loader2 className='h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary mx-auto mb-4' />
              <p className='text-sm sm:text-base text-muted-foreground'>
                Маълумотлар юкланмоқда...
              </p>
            </div>
          </div>
        )}

        {/* Examination Selection */}
        {!isLoading && !selectedExaminationId ? (
          <Card className='mb-4 sm:mb-6'>
            <CardHeader>
              <CardTitle>Кўрикни танланг</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedExaminationId}
                onValueChange={setSelectedExaminationId}
              >
                <SelectTrigger className='h-10 sm:h-12'>
                  <SelectValue placeholder='Кўрикни танланг...' />
                </SelectTrigger>
                <SelectContent
                  className='max-h-[300px]'
                  onScroll={handleScroll}
                >
                  {isLoadingExaminations && examinations.length === 0 ? (
                    <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                      <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                      Юкланмоқда...
                    </div>
                  ) : examinations.length === 0 ? (
                    <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                      Актив кўриклар топилмади
                    </div>
                  ) : (
                    <>
                      {examinations.map((exam: any) => (
                        <SelectItem key={exam._id} value={exam._id}>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {exam.patient_id?.fullname || 'Номаълум'} -{' '}
                              {exam.doctor_id?.fullname || 'Номаълум'}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              Кўрик #{exam._id?.slice(-6) || 'N/A'} •{' '}
                              {exam.created_at
                                ? new Date(exam.created_at).toLocaleDateString(
                                    'uz-UZ'
                                  )
                                : 'Маълумот йўқ'}{' '}
                              • {exam.complaints?.slice(0, 50) || 'Шикоят йўқ'}
                              ...
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                      {isLoadingMore && (
                        <div className='px-2 py-4 text-center'>
                          <Loader2 className='h-4 w-4 animate-spin mx-auto text-primary' />
                          <p className='text-xs text-muted-foreground mt-2'>
                            Юкланмоқда...
                          </p>
                        </div>
                      )}
                      {!hasMore && examinations.length > 0 && (
                        <div className='px-2 py-2 text-center text-xs text-muted-foreground'>
                          Барча кўриклар юкланди
                        </div>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Examination Info */}
            {examinationData && (
              <>
                <Card className='mb-3 bg-gradient-to-r from-primary/10 to-primary/10 border-primary/20'>
                  <CardContent className='pt-4 sm:pt-6 relative'>
                    <div className='flex flex-col sm:flex-row items-start justify-between gap-3'>
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Бемор Исми
                        </Label>
                        <p className='font-semibold text-sm sm:text-base break-words'>
                          {patient?.fullname || 'Маълумот йўқ'}
                        </p>
                      </div>
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Туғилган Сана
                        </Label>
                        <p className='font-semibold text-sm sm:text-base'>
                          {patient?.date_of_birth ? (
                            <>
                              {new Date(
                                patient.date_of_birth
                              ).toLocaleDateString('uz-UZ')}{' '}
                              <span className='text-muted-foreground'>
                                ({calculateAge(patient.date_of_birth)} ёш)
                              </span>
                            </>
                          ) : (
                            'Маълумот йўқ'
                          )}
                        </p>
                      </div>
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Телефон
                        </Label>
                        <p className='font-semibold text-sm sm:text-base'>
                          {patient?.phone || 'Маълумот йўқ'}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={clearSelection}
                        className='absolute right-2 top-2'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className='mb-3'>
                  <CardHeader className='p-5 max-sm:pb-2'>
                    <CardTitle className='text-base sm:text-lg'>
                      Кўрик маълумоти
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-5 pt-0'>
                    <div className='flex sm:justify-between items-center flex-col sm:flex-row max-sm:items-start'>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Шифокор
                        </Label>
                        <p className='font-semibold text-sm sm:text-base break-words'>
                          {examinationData.data.doctor_id?.fullname ||
                            'Номаълум'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Шикоят
                        </Label>
                        <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                          {examinationData.data.complaints || 'Маълумот йўқ'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Тавсия
                        </Label>
                        <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                          {examinationData.data?.description || 'Маълумот йўқ'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Allergy Warning */}
        {!isLoading &&
          patient &&
          allergyWarning &&
          patient.allergies &&
          patient.allergies.length > 0 && (
            <Alert className='mb-3 border-destructive bg-destructive/10'>
              <AlertCircle className='h-4 w-4 sm:h-5 sm:w-5 text-destructive' />
              <AlertDescription className='text-destructive font-semibold text-xs sm:text-sm'>
                ОГОҲЛАНТИРИШ: Беморда {patient.allergies.join(', ')}
                га аллергия бор!
              </AlertDescription>
            </Alert>
          )}

        {/* Show forms only when examination is selected */}
        {!isLoading && selectedExaminationId && patient && (
          <>
            {/* Drug Search */}

            {/* Medications List */}
            <Card className='mb-4 sm:mb-6'>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 space-y-2 sm:space-y-0'>
                <CardTitle className='text-base sm:text-lg md:text-xl'>
                  Дорилар Рўйхати
                </CardTitle>
                <Button
                  onClick={addMedication}
                  size='sm'
                  className='w-full sm:w-auto text-xs sm:text-sm'
                >
                  <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  Дори Қўшиш
                </Button>
              </CardHeader>
              <CardContent className='space-y-3 sm:space-y-4'>
                {/* New Medications */}
                {medications.length > 0 && (
                  <div className='text-xs font-medium text-muted-foreground mb-2 mt-4'>
                    Янги дорилар
                  </div>
                )}
                {medications.length === 0 &&
                (!examinationData?.data?.prescriptions ||
                  examinationData.data.prescriptions.length === 0) ? (
                  <div className='text-center py-8 sm:py-12'>
                    <p className='text-muted-foreground text-sm sm:text-base mb-2'>
                      Ҳали дорилар қўшилмаган
                    </p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      "Дори Қўшиш" тугмасини босинг
                    </p>
                  </div>
                ) : (
                  medications.map((med, index) => (
                    <Card
                      key={med.id}
                      className='border border-border shadow-sm'
                    >
                      <CardContent className='pt-3 sm:pt-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
                            Дори #{index + 1}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeMedication(med.id)}
                            className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='space-y-3 sm:space-y-4'>
                          {/* First row: Dori and Qo'shimcha */}
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                            <div>
                              <Label className='text-xs sm:text-sm'>
                                Дори <span className='text-red-500'>*</span>
                              </Label>
                              <Select
                                value={med.medication_id}
                                onValueChange={(value) =>
                                  updateMedication(
                                    med.id,
                                    'medication_id',
                                    value
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={`text-sm mt-1 ${
                                    formErrors.medications[med.id]
                                      ?.medication_id
                                      ? 'border-red-500 focus:ring-red-500'
                                      : ''
                                  }`}
                                >
                                  <SelectValue placeholder='Дорини танланг' />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className='p-2'>
                                    <Input
                                      placeholder='Дори қидириш...'
                                      value={medicationSearch}
                                      onChange={(e) =>
                                        setMedicationSearch(e.target.value)
                                      }
                                      className='text-sm mb-2'
                                    />
                                  </div>
                                  {medicationsData?.data &&
                                  medicationsData.data.length > 0 ? (
                                    medicationsData.data.map(
                                      (medication: any) => (
                                        <SelectItem
                                          key={medication._id}
                                          value={medication._id}
                                        >
                                          <div className='flex flex-col'>
                                            <span className='font-medium'>
                                              {medication.name}
                                            </span>
                                            <span className='text-xs text-muted-foreground'>
                                              {medication.dosage}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      )
                                    )
                                  ) : (
                                    <div className='p-4 text-center text-sm text-muted-foreground'>
                                      Дори топилмади
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className='text-xs sm:text-sm'>
                                Қўшимча
                              </Label>
                              <Input
                                placeholder='Қўшимча маълумот...'
                                value={med.addons}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'addons',
                                    e.target.value
                                  )
                                }
                                className='text-sm mt-1'
                              />
                            </div>
                          </div>
                          {/* Second row: Muddat, Qabul qilish, Ko'rsatmalar */}
                          <div className='flex items-start gap-3'>
                            <div className='w-28 shrink-0'>
                              <Label className='text-xs sm:text-sm'>
                                Муддат (кун){' '}
                                <span className='text-red-500'>*</span>
                              </Label>
                              <Input
                                type='number'
                                min='0'
                                placeholder='7'
                                value={med.duration}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === ',' ||
                                    e.key === 'e' ||
                                    e.key === 'E' ||
                                    e.key === '+' ||
                                    e.key === '-'
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'duration',
                                    e.target.value
                                  )
                                }
                                className={`text-sm mt-1 ${
                                  formErrors.medications[med.id]?.duration
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                                }`}
                              />
                            </div>
                            <div className='w-24 shrink-0'>
                              <Label className='text-xs sm:text-sm'>
                                Марта/кун{' '}
                                <span className='text-red-500'>*</span>
                              </Label>
                              <Input
                                type='number'
                                min='0'
                                placeholder='3'
                                value={med.frequency}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === ',' ||
                                    e.key === 'e' ||
                                    e.key === 'E' ||
                                    e.key === '+' ||
                                    e.key === '-'
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'frequency',
                                    e.target.value
                                  )
                                }
                                className={`text-sm mt-1 ${
                                  formErrors.medications[med.id]?.frequency
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                                }`}
                              />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <Label className='text-xs sm:text-sm'>
                                Қўшимча Кўрсатмалар{' '}
                                <span className='text-red-500'>*</span>
                              </Label>
                              <Input
                                value={med.instructions}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'instructions',
                                    e.target.value
                                  )
                                }
                                placeholder='Овқатдан кейин...'
                                className={`text-sm mt-1 ${
                                  formErrors.medications[med.id]?.instructions
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {/* Existing Prescriptions */}
                {examinationData?.data?.prescriptions &&
                  examinationData.data.prescriptions.length > 0 && (
                    <>
                      <div className='text-xs font-medium text-muted-foreground mb-2'>
                        Мавжуд рецептлар (
                        {examinationData.data.prescriptions.length} та)
                      </div>
                      {examinationData.data.prescriptions.map(
                        (prescription: any, index: number) => (
                          <Card
                            key={prescription._id}
                            className='border border-border bg-primary/5'
                          >
                            <CardContent className='pt-3 sm:pt-4'>
                              {editingPrescriptionId === prescription._id ? (
                                // Edit mode
                                <div className='space-y-4'>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div className='space-y-2 sm:col-span-2'>
                                      <Label className='text-xs sm:text-sm'>
                                        Дори Номи *
                                      </Label>
                                      <Select
                                        value={
                                          editPrescriptionForm.medication_id
                                        }
                                        onValueChange={(value) =>
                                          setEditPrescriptionForm({
                                            ...editPrescriptionForm,
                                            medication_id: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder='Дорини танланг' />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <div className='p-2'>
                                            <Input
                                              placeholder='Қидириш...'
                                              value={editMedicationSearch}
                                              onChange={(e) =>
                                                setEditMedicationSearch(
                                                  e.target.value
                                                )
                                              }
                                              className='mb-2'
                                            />
                                          </div>
                                          {medicationsData?.data
                                            ?.filter((med: any) =>
                                              editMedicationSearch
                                                ? med.name
                                                    .toLowerCase()
                                                    .includes(
                                                      editMedicationSearch.toLowerCase()
                                                    )
                                                : true
                                            )
                                            .map((medication: any) => (
                                              <SelectItem
                                                key={medication._id}
                                                value={medication._id}
                                              >
                                                {medication.name} -{' '}
                                                {medication.dosage}
                                              </SelectItem>
                                            ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className='space-y-2'>
                                      <Label className='text-xs sm:text-sm'>
                                        Муддати (кун) *
                                      </Label>
                                      <Input
                                        type='number'
                                        min='0'
                                        placeholder='Даволаш муддати'
                                        value={editPrescriptionForm.duration}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === ',' ||
                                            e.key === 'e' ||
                                            e.key === 'E' ||
                                            e.key === '+' ||
                                            e.key === '-'
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        onChange={(e) =>
                                          setEditPrescriptionForm({
                                            ...editPrescriptionForm,
                                            duration: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                    <div className='space-y-2'>
                                      <Label className='text-xs sm:text-sm'>
                                        Кунига (марта) *
                                      </Label>
                                      <Input
                                        type='number'
                                        min='0'
                                        placeholder='Қабул қилиш'
                                        value={editPrescriptionForm.frequency}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === ',' ||
                                            e.key === 'e' ||
                                            e.key === 'E' ||
                                            e.key === '+' ||
                                            e.key === '-'
                                          ) {
                                            e.preventDefault();
                                          }
                                        }}
                                        onChange={(e) =>
                                          setEditPrescriptionForm({
                                            ...editPrescriptionForm,
                                            frequency: e.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                  <div className='space-y-2'>
                                    <Label className='text-xs sm:text-sm'>
                                      Қўшимча Кўрсатмалар
                                    </Label>
                                    <Textarea
                                      placeholder='Қўшимча кўрсатмалар киритинг'
                                      value={editPrescriptionForm.instructions}
                                      onChange={(e) =>
                                        setEditPrescriptionForm({
                                          ...editPrescriptionForm,
                                          instructions: e.target.value,
                                        })
                                      }
                                      rows={2}
                                    />
                                  </div>
                                  <div className='flex gap-2 justify-end'>
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={cancelEditPrescription}
                                      disabled={isUpdating}
                                    >
                                      <X className='w-4 h-4 mr-2' />
                                      Бекор
                                    </Button>
                                    <Button
                                      size='sm'
                                      onClick={() =>
                                        handleUpdatePrescription(
                                          prescription._id
                                        )
                                      }
                                      disabled={isUpdating}
                                    >
                                      {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // View mode
                                <>
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='text-xs sm:text-sm font-medium text-primary'>
                                      Дори #{index + 1}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'>
                                        Сақланган
                                      </span>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          startEditPrescription(prescription)
                                        }
                                        disabled={
                                          editingPrescriptionId !== null
                                        }
                                        className='h-7 w-7 p-0'
                                      >
                                        <Edit className='h-3.5 w-3.5' />
                                      </Button>
                                      {/* <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleDeletePrescription(
                                            prescription._id
                                          )
                                        }
                                        disabled={isDeleting}
                                        className='h-7 w-7 p-0 text-destructive hover:text-destructive'
                                      >
                                        <Trash2 className='h-3.5 w-3.5' />
                                      </Button> */}
                                    </div>
                                  </div>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Дори номи
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {typeof prescription.medication_id ===
                                        'object'
                                          ? prescription.medication_id?.name
                                          : 'Номаълум'}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Қабул қилиш
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {prescription.frequency} марта/кун
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Муддат
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {prescription.duration} кун
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Кўрсатмалар
                                      </Label>
                                      <p className='text-sm'>
                                        {prescription.instructions || '-'}
                                      </p>
                                    </div>
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )}
                    </>
                  )}
              </CardContent>
            </Card>

            {/* Services List */}
            <div className='space-y-3 border rounded-lg p-4 bg-muted/30'>
              <div className='flex items-center justify-between'>
                <Label className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-primary' />
                  Хизматлар
                </Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addService}
                  className='gap-1'
                >
                  <Plus className='w-4 h-4' />
                  Хизмат қўшиш
                </Button>
              </div>

              {services.length === 0 ? (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  Хизматлар қўшилмаган
                </p>
              ) : (
                <div className='space-y-3'>
                  {/* Common Settings */}
                  <div className='flex items-end gap-2 p-2 bg-muted/30 rounded-lg border'>
                    <div className='w-28'>
                      <Label className='text-xs font-medium'>
                        Муддат (кун)
                      </Label>
                      <Input
                        type='number'
                        min={1}
                        max={30}
                        value={serviceDuration}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 7;
                          if (val >= 1 && val <= 30) {
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
                                  const isEveryOtherDay = adjustedMarked.every(
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
                        className='h-8 text-xs mt-1'
                      />
                    </div>
                    <div className='flex-1'>
                      <Label className='text-xs font-medium'>
                        Бошланиш санаси
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
                          Ҳар куни
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
                          2 кунда бир
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
                            Хизмат
                          </th>
                          {Array.from(
                            { length: Math.min(serviceDuration, 8) },
                            (_, i) => (
                              <th
                                key={i}
                                className='border px-1 py-1.5 text-center font-semibold min-w-[70px]'
                              >
                                {i + 1}
                              </th>
                            )
                          )}
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
                                      <Select
                                        value={srv.service_id}
                                        onValueChange={(value) =>
                                          updateServiceField(
                                            srv.id,
                                            'service_id',
                                            value
                                          )
                                        }
                                      >
                                        <SelectTrigger className='h-7 text-xs border-0 shadow-none min-w-[140px]'>
                                          <SelectValue placeholder='Танланг...' />
                                        </SelectTrigger>
                                        <SelectContent
                                          onScroll={(e) => {
                                            const target =
                                              e.target as HTMLDivElement;
                                            const bottom =
                                              target.scrollHeight -
                                                target.scrollTop -
                                                target.clientHeight <
                                              10;
                                            if (
                                              bottom &&
                                              hasMoreServices &&
                                              !isFetchingServices
                                            ) {
                                              setServicePage(
                                                (prev) => prev + 1
                                              );
                                            }
                                          }}
                                        >
                                          <div className='p-2'>
                                            <Input
                                              placeholder='Қидириш...'
                                              value={serviceSearch}
                                              onChange={(e) =>
                                                setServiceSearch(e.target.value)
                                              }
                                              className='text-sm mb-2'
                                            />
                                          </div>
                                          {availableServices.map((s: any) => (
                                            <SelectItem
                                              key={s._id}
                                              value={s._id}
                                            >
                                              {s.name} -{' '}
                                              {new Intl.NumberFormat(
                                                'uz-UZ'
                                              ).format(s.price)}{' '}
                                              сўм
                                            </SelectItem>
                                          ))}
                                          {!isFetchingServices &&
                                            availableServices.length === 0 && (
                                              <div className='px-2 py-4 text-xs text-muted-foreground text-center'>
                                                Хизмат топилмади
                                              </div>
                                            )}
                                          {isFetchingServices && (
                                            <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
                                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                              Юкланмоқда...
                                            </div>
                                          )}
                                        </SelectContent>
                                      </Select>
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
                                          <div className='flex items-center justify-center'>
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
                                              {day.day}-кун:{' '}
                                              {new Date(
                                                day.date
                                              ).toLocaleDateString('uz-UZ')}
                                              {isMarked && ' ✓'}
                                            </div>
                                          </div>
                                        ) : (
                                          <span className='text-muted-foreground'>
                                            —
                                          </span>
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
            <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3'>
              <Button
                variant='outline'
                className='w-full sm:w-auto text-sm'
                onClick={clearSelection}
                disabled={isCreating || isAddingService}
              >
                Бекор Қилиш
              </Button>
              <Button
                className='w-full sm:w-auto text-sm'
                onClick={handleSavePrescription}
                disabled={
                  isCreating ||
                  isAddingService ||
                  (medications.length === 0 && services.length === 0) ||
                  !selectedExaminationId
                }
              >
                {isCreating || isAddingService
                  ? 'Сақланмоқда...'
                  : 'Тасдиқлаш ва Сақлаш'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Prescription;
