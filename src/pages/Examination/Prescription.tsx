import {
  useCreatePrescriptionMutation,
  useGetAllExamsQuery,
  useGetOneExamQuery,
} from '@/app/api/examinationApi/examinationApi';
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
import { AlertCircle, Loader2, Plus, Printer, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Medication {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface ValidationErrors {
  [key: string]: {
    drug?: boolean;
    dosage?: boolean;
    frequency?: boolean;
    duration?: boolean;
  };
}

interface FormValidationErrors {
  medications: ValidationErrors;
  instructions?: boolean;
}

const Prescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergyWarning, setAllergyWarning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({
    medications: {},
    instructions: false,
  });

  // Patient selection states
  const [patient, setPatient] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedExaminationId, setSelectedExaminationId] =
    useState<string>('');

  // Get examination ID from navigation state
  const examinationIdFromState = location.state?.examinationId;

  // Fetch all active examinations
  const { data: examinationsData, isLoading: isLoadingExaminations } =
    useGetAllExamsQuery({
      page: 1,
      limit: 100,
      status: 'active',
    });

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

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const handleRequest = useHandleRequest();

  const examinations = examinationsData?.data || [];

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
    if (examinationData && patientData?.data) {
      setPatient(patientData.data);
      setSelectedPatientId(patientData.data._id);
      // Check for allergies
      if (patientData.data.allergies && patientData.data.allergies.length > 0) {
        setAllergyWarning(true);
      }
    }
  }, [examinationData, patientData]);

  // Mock drug database
  // const drugDatabase = [
  //   'Парацетамол 500мг',
  //   'Ибупрофен 400мг',
  //   'Амоксициллин 500мг',
  //   'Азитромицин 250мг',
  //   'Омепразол 20мг',
  //   'Метформин 500мг',
  //   'Аспирин 100мг',
  //   'Диклофенак 50мг',
  //   'Цефтриаксон 1г',
  //   'Дексаметазон 4мг',
  // ];

  // const filteredDrugs = drugDatabase.filter((drug) =>
  //   drug.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const clearSelection = () => {
    setPatient(null);
    setSelectedPatientId('');
    setSelectedExaminationId('');
    setAllergyWarning(false);
    setMedications([]);
    setAdditionalInstructions('');
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
      drug: '',
      dosage: '',
      frequency: '',
      duration: '',
    };
    setMedications([...medications, newMed]);
  };

  const addDrugFromSearch = (drugName: string) => {
    const newMed: Medication = {
      id: Date.now().toString(),
      drug: drugName,
      dosage: '',
      frequency: '',
      duration: '',
    };
    setMedications([...medications, newMed]);
    setSearchTerm('');
    setShowSuggestions(false);
    toast.success(`${drugName} рўйхатга қўшилди`);
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

    // Check allergy with patient's allergies
    if (
      field === 'drug' &&
      patient?.allergies &&
      patient.allergies.length > 0
    ) {
      const hasAllergy = patient.allergies.some((allergy: string) =>
        value.toLowerCase().includes(allergy.toLowerCase())
      );
      if (hasAllergy) {
        toast.warning(
          `ОГОҲЛАНТИРИШ: Беморда ${value} га аллергия бўлиши мумкин!`
        );
      }
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

    // Validate additional instructions (optional but show warning if too short)
    const instructionsError = additionalInstructions.trim() === '';

    // Validate each medication and collect errors
    const errors: ValidationErrors = {};
    let hasErrors = false;

    for (const med of medications) {
      errors[med.id] = {};

      // Check if drug name is filled
      if (!med.drug || med.drug.trim() === '') {
        errors[med.id].drug = true;
        hasErrors = true;
      }

      // Check if dosage is filled and valid
      if (!med.dosage || med.dosage.trim() === '') {
        errors[med.id].dosage = true;
        hasErrors = true;
      } else {
        const dosage = parseFloat(med.dosage);
        if (isNaN(dosage) || dosage <= 0) {
          errors[med.id].dosage = true;
          hasErrors = true;
        }
      }

      // Check if frequency is selected
      if (!med.frequency || med.frequency.trim() === '') {
        errors[med.id].frequency = true;
        hasErrors = true;
      }

      // Check if duration is filled and valid
      if (!med.duration || med.duration.trim() === '') {
        errors[med.id].duration = true;
        hasErrors = true;
      } else {
        const duration = parseInt(med.duration);
        if (isNaN(duration) || duration <= 0) {
          errors[med.id].duration = true;
          hasErrors = true;
        }
      }
    }

    if (hasErrors || instructionsError) {
      setFormErrors({
        medications: errors,
        instructions: instructionsError,
      });
      toast.error('Илтимос, барча майдонларни тўлдиринг');
      return;
    }

    // Additional validations after basic checks
    for (const med of medications) {
      const dosage = parseFloat(med.dosage);
      if (dosage > 10000) {
        toast.error(
          `"${med.drug}" учун доза жуда катта (10000 мг дан ошмаслиги керак)`
        );
        return;
      }

      const duration = parseInt(med.duration);
      if (duration > 365) {
        toast.error(
          `"${med.drug}" учун муддат жуда узун (365 кундан ошмаслиги керак)`
        );
        return;
      }
    }

    // Check for duplicate medications
    const drugNames = medications.map((med) => med.drug.toLowerCase().trim());
    const duplicates = drugNames.filter(
      (name, index) => drugNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      toast.error(
        `Такрорланган дори: "${duplicates[0]}". Ҳар бир дори фақат бир марта қўшилиши керак.`
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
              medication: med.drug,
              dosage: parseInt(med.dosage),
              frequency: parseInt(med.frequency.replace(/\D/g, '')),
              duration: parseInt(med.duration.replace(/\D/g, '')),
              instructions: additionalInstructions,
            },
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          successCount++;
        },
        onError: (error) => {
          toast.error(
            error?.data?.error?.msg || `${med.drug} сақлашда хатолик`
          );
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
                <SelectContent>
                  {examinations.length === 0 ? (
                    <div className='px-2 py-6 text-center text-sm text-muted-foreground'>
                      Актив кўриклар топилмади
                    </div>
                  ) : (
                    examinations.map((exam: any) => (
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
                            • {exam.complaints?.slice(0, 50) || 'Шикоят йўқ'}...
                          </span>
                        </div>
                      </SelectItem>
                    ))
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
                        <div className='space-y-1'>
                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                            Кўрик ID
                          </Label>
                          <p className='font-mono font-semibold text-xs sm:text-sm break-all'>
                            {examinationData.data._id || 'N/A'}
                          </p>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs sm:text-sm text-muted-foreground'>
                            Шифокор
                          </Label>
                          <p className='font-semibold text-sm sm:text-base break-words'>
                            {examinationData.data.doctor_id?.fullname ||
                              'Номаълум'}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          Шикоят
                        </Label>
                        <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                          {examinationData.data.complaints || 'Маълумот йўқ'}
                        </p>
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
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                          <div className='sm:col-span-2 lg:col-span-1'>
                            <Label className='text-xs sm:text-sm'>
                              Дори Номи <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              value={med.drug}
                              onChange={(e) =>
                                updateMedication(med.id, 'drug', e.target.value)
                              }
                              placeholder='Дори номи'
                              className={`text-sm mt-1 ${
                                formErrors.medications[med.id]?.drug
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : ''
                              }`}
                            />
                          </div>
                          <div>
                            <Label className='text-xs sm:text-sm'>
                              Дозаси (мг){' '}
                              <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              type='number'
                              value={med.dosage}
                              onChange={(e) =>
                                updateMedication(
                                  med.id,
                                  'dosage',
                                  e.target.value
                                )
                              }
                              placeholder='500'
                              className={`text-sm mt-1 ${
                                formErrors.medications[med.id]?.dosage
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : ''
                              }`}
                            />
                          </div>
                          <div>
                            <Label className='text-xs sm:text-sm'>
                              Қабул Қилиш{' '}
                              <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                              value={med.frequency}
                              onValueChange={(value) =>
                                updateMedication(med.id, 'frequency', value)
                              }
                            >
                              <SelectTrigger
                                className={`text-sm mt-1 ${
                                  formErrors.medications[med.id]?.frequency
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                                }`}
                              >
                                <SelectValue placeholder='Танланг' />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='1x'>
                                  Кунига 1 марта
                                </SelectItem>
                                <SelectItem value='2x'>
                                  Кунига 2 марта
                                </SelectItem>
                                <SelectItem value='3x'>
                                  Кунига 3 марта
                                </SelectItem>
                                <SelectItem value='4x'>
                                  Кунига 4 марта
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className='text-xs sm:text-sm'>
                              Муддати (кун){' '}
                              <span className='text-red-500'>*</span>
                            </Label>
                            <Input
                              type='number'
                              value={med.duration}
                              onChange={(e) =>
                                updateMedication(
                                  med.id,
                                  'duration',
                                  e.target.value
                                )
                              }
                              placeholder='7'
                              className={`text-sm mt-1 ${
                                formErrors.medications[med.id]?.duration
                                  ? 'border-red-500 focus-visible:ring-red-500'
                                  : ''
                              }`}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Additional Instructions */}
            <Card className='mb-4 sm:mb-6'>
              <CardHeader>
                <CardTitle className='text-base sm:text-lg md:text-xl'>
                  Қўшимча Кўрсатмалар
                  <span className='text-red-500 ml-1'>*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder='Бемор учун махсус кўрсатмалар ёки огоҳлантиришлар...'
                  rows={4}
                  value={additionalInstructions}
                  onChange={(e) => {
                    setAdditionalInstructions(e.target.value);
                    // Clear error when user types
                    if (e.target.value.trim() !== '') {
                      setFormErrors((prev) => ({
                        ...prev,
                        instructions: false,
                      }));
                    }
                  }}
                  className={`text-sm sm:text-base resize-none ${
                    formErrors.instructions ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.instructions && (
                  <p className='text-red-500 text-xs sm:text-sm mt-2'>
                    Қўшимча кўрсатмалар киритиш шарт
                  </p>
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
