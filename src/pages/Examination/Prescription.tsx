import {
  useAddServiceToExaminationMutation,
  useCreatePrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetAllExamsQuery,
  useGetOneExamQuery,
  useRemoveServiceFromExaminationMutation,
  useUpdatePrescriptionMutation,
} from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
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
import { AlertCircle, Edit, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Medication {
  id: string;
  medication_id: string;
  additionalInfo: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ServiceItem {
  id: string;
  service_id: string;
  frequency: number;
  duration: number;
  status: string;
  notes: string;
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
    frequency?: boolean;
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

  // Fetch services for search
  const { data: servicesData } = useGetAllServiceQuery({
    page: 1,
    limit: 100,
    search: serviceSearch,
  } as any);

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const [deletePrescription, { isLoading: isDeleting }] =
    useDeletePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] =
    useUpdatePrescriptionMutation();
  const [addServiceToExam, { isLoading: isAddingService }] =
    useAddServiceToExaminationMutation();
  const [removeServiceFromExam, { isLoading: isRemovingService }] =
    useRemoveServiceFromExaminationMutation();
  const handleRequest = useHandleRequest();

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
    const newService: ServiceItem = {
      id: Date.now().toString(),
      service_id: '',
      frequency: 1,
      duration: 1,
      status: 'pending',
      notes: '',
    };
    setServices([...services, newService]);
  };

  const updateServiceField = (
    id: string,
    field: keyof ServiceItem,
    value: string | number
  ) => {
    setServices(
      services.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv))
    );

    // Clear validation error when user selects/types
    if (
      (typeof value === 'string' && value.trim() !== '') ||
      (typeof value === 'number' && value > 0)
    ) {
      if (
        field === 'service_id' ||
        field === 'frequency' ||
        field === 'duration'
      ) {
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

      if (!srv.frequency || srv.frequency < 1) {
        srvErrors[srv.id].frequency = true;
        hasErrors = true;
      }

      if (!srv.duration || srv.duration < 1) {
        srvErrors[srv.id].duration = true;
        hasErrors = true;
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

    // Save each medication separately
    let medSuccessCount = 0;
    for (const med of medications) {
      await handleRequest({
        request: async () => {
          const res = await createPrescription({
            id: selectedExaminationId,
            body: {
              medication_id: med.medication_id,
              frequency: parseInt(med.frequency.replace(/\D/g, '')),
              duration: parseInt(med.duration.replace(/\D/g, '')),
              instructions: med.instructions,
            },
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          medSuccessCount++;
        },
        onError: (error) => {
          toast.error(error?.data?.error?.msg || `Дорини сақлашда хатолик`);
        },
      });
    }

    // Save each service separately
    let srvSuccessCount = 0;
    for (const srv of services) {
      // Get service details for price
      const serviceDetails = servicesData?.data?.find(
        (s: any) => s._id === srv.service_id
      );

      await handleRequest({
        request: async () => {
          const res = await addServiceToExam({
            id: selectedExaminationId,
            body: {
              service_type_id: srv.service_id,
              price: serviceDetails?.price || 0,
              frequency: srv.frequency,
              duration: srv.duration,
              status: srv.status as
                | 'active'
                | 'inactive'
                | 'completed'
                | 'deleted'
                | 'pending',
              notes: srv.notes,
            },
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          srvSuccessCount++;
        },
        onError: (error) => {
          toast.error(error?.data?.error?.msg || `Хизматни сақлашда хатолик`);
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

  const handleDeletePrescription = async (prescriptionId: string) => {
    if (!window.confirm('Бу рецептни ўчиришни хоҳлайсизми?')) {
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await deletePrescription({
          id: selectedExaminationId,
          prescription_id: prescriptionId,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Рецепт муваффақиятли ўчирилди');
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Рецептни ўчиришда хатолик');
      },
    });
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
          id: selectedExaminationId,
          prescription_id: prescriptionId,
          body: {
            medication_id: editPrescriptionForm.medication_id,
            frequency: parseInt(editPrescriptionForm.frequency),
            duration: parseInt(editPrescriptionForm.duration),
            instructions: editPrescriptionForm.instructions,
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
            {/* Patient Info Banner */}

            {/* Examination Info */}
            {examinationData && (
              <>
                <Card className='mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 to-primary/10 border-primary/20'>
                  <CardContent className='pt-4 sm:pt-6'>
                    <div className='flex flex-col sm:flex-row items-start justify-between gap-3'>
                      <div className='flex-1 w-full'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                          <div className='space-y-1'>
                            <Label className='text-xs sm:text-sm text-muted-foreground'>
                              Бемор Исми
                            </Label>
                            <p className='font-semibold text-sm sm:text-base break-words'>
                              {patient?.fullname || 'Маълумот йўқ'}
                            </p>
                          </div>
                          <div className='space-y-1'>
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
                          <div className='space-y-1'>
                            <Label className='text-xs sm:text-sm text-muted-foreground'>
                              Телефон
                            </Label>
                            <p className='font-semibold text-sm sm:text-base'>
                              {patient?.phone || 'Маълумот йўқ'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={clearSelection}
                        className='self-start sm:self-center'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className='mb-4 sm:mb-6'>
                  <CardHeader>
                    <CardTitle className='text-base sm:text-lg md:text-xl'>
                      Кўрик маълумоти
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3 sm:space-y-4'>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                        {/* <div className='space-y-1'>
                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                            Кўрик ID
                          </Label>
                          <p className='font-mono font-semibold text-xs sm:text-sm break-all'>
                            {examinationData.data._id || 'N/A'}
                          </p>
                        </div> */}
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
                      </div>
                      {examinationData.data.description && (
                        <div className='space-y-1'>
                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                            Тавсия
                          </Label>
                          <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                            {examinationData.data.description}
                          </p>
                        </div>
                      )}
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
            <Alert className='mb-4 sm:mb-6 border-destructive bg-destructive/10'>
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
            {/* <Card className='mb-4 sm:mb-6'>
              <CardHeader>
                <CardTitle>Дори Қидириш</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='relative'>
                  <Search className='absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
                  <Input
                    placeholder='Дори номини киритинг...'
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Delay to allow click event on dropdown items
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    className='pl-9 sm:pl-10 text-sm sm:text-base'
                  />
                  {showSuggestions && searchTerm && (
                    <div
                      className='absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto'
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                    >
                      {filteredDrugs.length > 0 ? (
                        filteredDrugs.map((drug, index) => (
                          <div
                            key={index}
                            className='px-3 sm:px-4 py-2 hover:bg-accent cursor-pointer text-sm transition-colors'
                            onClick={() => addDrugFromSearch(drug)}
                          >
                            <div className='flex items-center justify-between'>
                              <span>{drug}</span>
                              <Plus className='h-4 w-4 text-primary' />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='px-3 sm:px-4 py-2 text-sm text-muted-foreground'>
                          Дори топилмади
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card> */}

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
                                value={med.additionalInfo}
                                onChange={(e) =>
                                  updateMedication(
                                    med.id,
                                    'additionalInfo',
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
                                      <Button
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
                                      </Button>
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
            <Card className='mb-4 sm:mb-6'>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 space-y-2 sm:space-y-0'>
                <CardTitle className='text-base sm:text-lg md:text-xl'>
                  Хизматлар Рўйхати
                </CardTitle>
                <Button
                  onClick={addService}
                  size='sm'
                  className='w-full sm:w-auto text-xs sm:text-sm'
                >
                  <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  Хизмат Қўшиш
                </Button>
              </CardHeader>
              <CardContent className='space-y-3 sm:space-y-4'>
                {/* New Services */}
                {services.length > 0 && (
                  <div className='text-xs font-medium text-muted-foreground mb-2 mt-4'>
                    Янги хизматлар
                  </div>
                )}
                {services.length === 0 &&
                (!examinationData?.data?.services ||
                  examinationData.data.services.length === 0) ? (
                  <div className='text-center py-8 sm:py-12'>
                    <p className='text-muted-foreground text-sm sm:text-base mb-2'>
                      Ҳали хизматлар қўшилмаган
                    </p>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      "Хизмат Қўшиш" тугмасини босинг
                    </p>
                  </div>
                ) : (
                  services.map((srv, index) => (
                    <Card
                      key={srv.id}
                      className='border border-border shadow-sm'
                    >
                      <CardContent className='pt-3 sm:pt-4'>
                        <div className='flex items-center justify-between mb-3'>
                          <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
                            Янги хизмат #{index + 1}
                          </span>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeService(srv.id)}
                            className='h-8 w-8 p-0 text-destructive hover:text-destructive'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                        <div className='space-y-4'>
                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                            <div className='space-y-2'>
                              <Label className='text-xs sm:text-sm'>
                                Хизмат Тури{' '}
                                <span className='text-red-500'>*</span>
                              </Label>
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
                                <SelectTrigger
                                  className={`text-sm ${
                                    formErrors.services[srv.id]?.service_id
                                      ? 'border-red-500 focus:ring-red-500'
                                      : ''
                                  }`}
                                >
                                  <SelectValue placeholder='Хизмат турини танланг' />
                                </SelectTrigger>
                                <SelectContent>
                                  <div className='p-2'>
                                    <Input
                                      placeholder='Хизмат қидириш...'
                                      value={serviceSearch}
                                      onChange={(e) =>
                                        setServiceSearch(e.target.value)
                                      }
                                      className='text-sm mb-2'
                                    />
                                  </div>
                                  {servicesData?.data &&
                                  servicesData.data.length > 0 ? (
                                    servicesData.data.map((service: any) => (
                                      <SelectItem
                                        key={service._id}
                                        value={service._id}
                                      >
                                        {service.name} -{' '}
                                        {service.price?.toLocaleString()} сўм
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <div className='p-4 text-center text-sm text-muted-foreground'>
                                      Хизмат топилмади
                                    </div>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className='space-y-2'>
                              <Label className='text-xs sm:text-sm'>
                                Муддат (кун){' '}
                                <span className='text-red-500'>*</span>
                              </Label>
                              <Input
                                type='number'
                                min={0}
                                placeholder='Кун'
                                value={srv.duration}
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
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || parseFloat(val) >= 0) {
                                    updateServiceField(
                                      srv.id,
                                      'duration',
                                      val === '' ? 0 : parseInt(val)
                                    );
                                  }
                                }}
                                className={`text-sm ${
                                  formErrors.services[srv.id]?.duration
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                                }`}
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label className='text-xs sm:text-sm'>
                                Марта <span className='text-red-500'>*</span>
                              </Label>
                              <Select
                                value={srv.frequency.toString()}
                                onValueChange={(value) =>
                                  updateServiceField(
                                    srv.id,
                                    'frequency',
                                    parseFloat(value)
                                  )
                                }
                              >
                                <SelectTrigger
                                  className={`text-sm ${
                                    formErrors.services[srv.id]?.frequency
                                      ? 'border-red-500 focus:ring-red-500'
                                      : ''
                                  }`}
                                >
                                  <SelectValue placeholder='Танланг...' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='1'>1 марта</SelectItem>
                                  <SelectItem value='2'>2 марта</SelectItem>
                                  <SelectItem value='3'>3 марта</SelectItem>
                                  <SelectItem value='0.5'>
                                    2 кунда бир марта
                                  </SelectItem>
                                  <SelectItem value='0.33'>
                                    3 кунда бир марта
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className='space-y-2'>
                            <Label className='text-xs sm:text-sm'>Изоҳ</Label>
                            <Textarea
                              placeholder='Қўшимча изоҳ киритинг'
                              value={srv.notes}
                              onChange={(e) =>
                                updateServiceField(
                                  srv.id,
                                  'notes',
                                  e.target.value
                                )
                              }
                              rows={2}
                              className='text-sm'
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}

                {/* Existing Services */}
                {examinationData?.data?.services &&
                  examinationData.data.services.length > 0 && (
                    <>
                      <div className='text-xs font-medium text-muted-foreground mb-2'>
                        Мавжуд хизматлар ({examinationData.data.services.length}{' '}
                        та)
                      </div>
                      {examinationData.data.services.map(
                        (service: any, index: number) => (
                          <Card
                            key={service._id}
                            className='border border-border bg-primary/5'
                          >
                            <CardContent className='pt-3 sm:pt-4'>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='text-xs sm:text-sm font-medium text-primary'>
                                  Хизмат #{index + 1}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    service.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : service.status === 'active'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {service.status === 'completed'
                                    ? 'Якунланган'
                                    : service.status === 'active'
                                    ? 'Актив'
                                    : 'Кутилмоқда'}
                                </span>
                              </div>
                              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Хизмат номи
                                  </Label>
                                  <p className='text-sm font-medium'>
                                    {service.service_type_id?.name ||
                                      'Номаълум'}
                                  </p>
                                </div>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Нарх
                                  </Label>
                                  <p className='text-sm font-medium'>
                                    {service.price?.toLocaleString()} сўм
                                  </p>
                                </div>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Муддати(кун)
                                  </Label>
                                  <p className='text-sm font-medium'>
                                    {service.duration}
                                  </p>
                                </div>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Қабул Қилиш (кунига марта)
                                  </Label>
                                  <p className='text-sm font-medium'>
                                    {service.frequency}
                                  </p>
                                </div>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Жами
                                  </Label>
                                  <p className='text-sm font-medium text-primary'>
                                    {(
                                      service.price *
                                      service.duration *
                                      service.frequency
                                    )?.toLocaleString()}{' '}
                                    сўм
                                  </p>
                                </div>
                              </div>
                              {service.notes && (
                                <div className='mt-2'>
                                  <Label className='text-xs text-muted-foreground'>
                                    Изоҳ
                                  </Label>
                                  <p className='text-sm'>{service.notes}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )}
                    </>
                  )}
              </CardContent>
            </Card>

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
