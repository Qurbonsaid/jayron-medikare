import {
  useCreatePrescriptionMutation,
  useDeletePrescriptionMutation,
  useGetAllExamsQuery,
  useGetOneExamQuery,
  useUpdatePrescriptionMutation,
} from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
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
import {
  AlertCircle,
  Edit,
  Loader2,
  Plus,
  Printer,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Medication {
  id: string;
  medication_id: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface ValidationErrors {
  [key: string]: {
    medication_id?: boolean;
    frequency?: boolean;
    duration?: boolean;
    instructions?: boolean;
  };
}

interface FormValidationErrors {
  medications: ValidationErrors;
}

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergyWarning, setAllergyWarning] = useState(false);
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({
    medications: {},
  });

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

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const [deletePrescription, { isLoading: isDeleting }] =
    useDeletePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] =
    useUpdatePrescriptionMutation();
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
    setFormErrors({
      medications: {},
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

  const handlePrint = () => {
    window.print();
  };

  const handleSavePrescription = async () => {
    // Validate examination selection
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    // Validate medications list
    if (medications.length === 0) {
      toast.error('Илтимос, камида битта дори қўшинг');
      return;
    }

    // Validate each medication and collect errors
    const errors: ValidationErrors = {};
    let hasErrors = false;

    for (const med of medications) {
      errors[med.id] = {};

      // Check if medication is selected
      if (!med.medication_id || med.medication_id.trim() === '') {
        errors[med.id].medication_id = true;
        hasErrors = true;
      }

      // Check if frequency is selected
      if (!med.frequency || med.frequency.trim() === '') {
        errors[med.id].frequency = true;
        hasErrors = true;
      }

      // Check if duration is filled
      if (!med.duration || med.duration.trim() === '') {
        errors[med.id].duration = true;
        hasErrors = true;
      }

      // Check if instructions are filled
      if (!med.instructions || med.instructions.trim() === '') {
        errors[med.id].instructions = true;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFormErrors({
        medications: errors,
      });
      toast.error('Илтимос, барча майдонларни тўлдиринг');
      return;
    }

    // Check for duplicate medications
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

    // Save each medication separately
    let successCount = 0;
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
          successCount++;
        },
        onError: (error) => {
          toast.error(error?.data?.error?.msg || `Дорини сақлашда хатолик`);
        },
      });
    }

    if (successCount === medications.length) {
      toast.success(`${successCount} та дори муваффақиятли сақланди`);
      navigate(-1);
    } else if (successCount > 0) {
      toast.warning(`${successCount}/${medications.length} та дори сақланди`);
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

        {/* Header */}
        {!isLoading && (
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3'>
            {patient && (
              <>
                <div>
                  <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-foreground'>
                    Рецепт Ёзиш
                  </h1>
                  <p className='text-muted-foreground mt-1 text-sm sm:text-base'>
                    Янги рецепт яратиш
                  </p>
                </div>
                <div className='flex gap-2 sm:gap-3 w-full sm:w-auto'>
                  <Button
                    variant='outline'
                    onClick={handlePrint}
                    className='flex-1 sm:flex-none text-sm'
                  >
                    <Printer className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                    <span className='hidden sm:inline'>Чоп Этиш</span>
                    <span className='sm:hidden'>Чоп</span>
                  </Button>
                </div>
              </>
            )}
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

                {/* Existing Prescriptions */}
                {examinationData.data.prescriptions &&
                  examinationData.data.prescriptions.length > 0 && (
                    <Card className='mb-4 sm:mb-6 border-primary/20'>
                      <CardHeader>
                        <CardTitle className='text-base sm:text-lg md:text-xl flex items-center gap-2'>
                          <span>Мавжуд Рецептлар</span>
                          <span className='text-sm font-normal text-muted-foreground'>
                            ({examinationData.data.prescriptions.length} та)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='space-y-3 sm:space-y-4'>
                          {examinationData.data.prescriptions.map(
                            (prescription, index) => (
                              <Card
                                key={prescription._id}
                                className='border border-primary/10 bg-primary/5'
                              >
                                <CardContent className='pt-3 sm:pt-4'>
                                  {editingPrescriptionId ===
                                  prescription._id ? (
                                    <div className='space-y-4'>
                                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        <div className='space-y-2 sm:col-span-2'>
                                          <Label>Дори Номи *</Label>
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
                                              <SelectValue placeholder='Дорини танланг'>
                                                {editPrescriptionForm.medication_id
                                                  ? `${
                                                      medicationsData?.data?.find(
                                                        (m: any) =>
                                                          m._id ===
                                                          editPrescriptionForm.medication_id
                                                      )?.name
                                                    } - ${
                                                      medicationsData?.data?.find(
                                                        (m: any) =>
                                                          m._id ===
                                                          editPrescriptionForm.medication_id
                                                      )?.dosage
                                                    }` || 'Дорини танланг'
                                                  : 'Дорини танланг'}
                                              </SelectValue>
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
                                          <Label>Кунига (марта) *</Label>
                                          <Input
                                            type='number'
                                            placeholder='Қабул қилиш'
                                            value={
                                              editPrescriptionForm.frequency
                                            }
                                            onChange={(value) =>
                                              setEditPrescriptionForm({
                                                ...editPrescriptionForm,
                                                frequency: value.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div className='space-y-2'>
                                          <Label>Муддати (кун) *</Label>
                                          <Input
                                            type='number'
                                            placeholder='Даволаш муддати'
                                            value={
                                              editPrescriptionForm.duration
                                            }
                                            onChange={(value) =>
                                              setEditPrescriptionForm({
                                                ...editPrescriptionForm,
                                                duration: value.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className='space-y-2'>
                                        <Label>Қўшимча Кўрсатмалар</Label>
                                        <Textarea
                                          placeholder='Қўшимча кўрсатмалар киритинг'
                                          value={
                                            editPrescriptionForm.instructions
                                          }
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
                                          onClick={cancelEditPrescription}
                                          disabled={isUpdating}
                                        >
                                          <X className='w-4 h-4 mr-2' />
                                          Бекор қилиш
                                        </Button>
                                        <Button
                                          onClick={() =>
                                            handleUpdatePrescription(
                                              prescription._id
                                            )
                                          }
                                          disabled={isUpdating}
                                        >
                                          {isUpdating
                                            ? 'Сақланмоқда...'
                                            : 'Сақлаш'}
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className='flex items-center justify-between mb-3'>
                                        <span className='text-xs sm:text-sm font-medium text-primary'>
                                          Рецепт #{index + 1}
                                        </span>
                                        <div className='flex gap-2'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              startEditPrescription(
                                                prescription
                                              )
                                            }
                                            disabled={
                                              editingPrescriptionId !== null
                                            }
                                            className='h-8 w-8 p-0'
                                          >
                                            <Edit className='h-4 w-4' />
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
                                            className='h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10'
                                          >
                                            <Trash2 className='h-4 w-4' />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                                        <div>
                                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                                            Дори Номи
                                          </Label>
                                          <p className='font-semibold text-sm sm:text-base mt-1'>
                                            {typeof prescription.medication_id ===
                                              'object' &&
                                            prescription.medication_id !== null
                                              ? prescription.medication_id.name
                                              : 'Маълумот йўқ'}
                                            {typeof prescription.medication_id ===
                                              'object' &&
                                              prescription.medication_id !==
                                                null &&
                                              prescription.medication_id
                                                .dosage &&
                                              ` - ${prescription.medication_id.dosage}`}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                                            Қабул Қилиш
                                          </Label>
                                          <p className='font-semibold text-sm sm:text-base mt-1'>
                                            Кунига {prescription.frequency}{' '}
                                            марта
                                          </p>
                                        </div>
                                      </div>
                                      {prescription.instructions && (
                                        <div className='mt-3 sm:mt-4 p-3 bg-background rounded-md'>
                                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                                            Қўшимча Кўрсатмалар
                                          </Label>
                                          <p className='text-sm sm:text-base mt-1 whitespace-pre-wrap'>
                                            {prescription.instructions}
                                          </p>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                {medications.length === 0 ? (
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
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                          <div className='sm:col-span-2'>
                            <Label className='text-xs sm:text-sm'>
                              Дори <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                              value={med.medication_id}
                              onValueChange={(value) =>
                                updateMedication(med.id, 'medication_id', value)
                              }
                            >
                              <SelectTrigger
                                className={`text-sm mt-1 ${
                                  formErrors.medications[med.id]?.medication_id
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
                              Қабул Қилиш (кунига марта){' '}
                              <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              type='number'
                              placeholder='Қабул қилиш'
                              value={med.frequency}
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
                          <div>
                            <Label className='text-xs sm:text-sm'>
                              Муддати (кун){' '}
                              <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              type='number'
                              placeholder='Даволаш муддати'
                              value={med.duration}
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
                        </div>
                        <div className='mt-3 sm:mt-4'>
                          <Label className='text-xs sm:text-sm'>
                            Қўшимча Кўрсатмалар{' '}
                            <span className='text-red-500'>*</span>
                          </Label>
                          <Textarea
                            value={med.instructions}
                            onChange={(e) =>
                              updateMedication(
                                med.id,
                                'instructions',
                                e.target.value
                              )
                            }
                            placeholder='Ушбу дори учун махсус кўрсатмалар...'
                            rows={2}
                            className={`text-sm mt-1 resize-none ${
                              formErrors.medications[med.id]?.instructions
                                ? 'border-red-500 focus-visible:ring-red-500'
                                : ''
                            }`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3'>
              <Button
                variant='outline'
                className='w-full sm:w-auto text-sm'
                onClick={clearSelection}
                disabled={isCreating}
              >
                Бекор Қилиш
              </Button>
              <Button
                className='w-full sm:w-auto text-sm'
                onClick={handleSavePrescription}
                disabled={
                  isCreating ||
                  medications.length === 0 ||
                  !selectedExaminationId
                }
              >
                {isCreating ? 'Сақланмоқда...' : 'Тасдиқлаш ва Сақлаш'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Prescription;
