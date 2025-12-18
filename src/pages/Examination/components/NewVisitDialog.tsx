import {
  useAddServiceMutation,
  useCreateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
import { useCreatePrescriptionMutation } from '@/app/api/prescription/prescriptionApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { useGetUsersQuery } from '@/app/api/userApi/userApi';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  FileText,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  User,
  UserCog,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { calculateAge } from './calculateAge';

interface NewVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  preSelectedPatientId?: string;
}

const NewVisitDialog = ({
  open,
  onOpenChange,
  onSuccess,
  preSelectedPatientId,
}: NewVisitDialogProps) => {
  const [subjective, setSubjective] = useState('');
  const [description, setDescription] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [treatmentType, setTreatmentType] = useState<'ambulator' | 'stasionar'>(
    'ambulator'
  );

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

  // Service states
  interface ServiceDay {
    day: number;
    date: Date | null;
  }

  interface ServiceItem {
    id: string;
    service_id: string;
    duration: number;
    notes: string;
    days: ServiceDay[];
  }
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');

  // Fetch all patients for search
  const { data: patientsData } = useGetAllPatientQuery({
    page: 1,
    limit: 100,
  });

  // Fetch selected patient details
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
  const [createPrescription] = useCreatePrescriptionMutation();
  const [addServiceToExam] = useAddServiceMutation();
  const handleRequest = useHandleRequest();

  // Fetch medications
  const { data: medicationsData } = useGetAllMedicationsQuery({
    page: 1,
    limit: 100,
    search: medicationSearch || undefined,
  });

  // Fetch services
  const { data: servicesData } = useGetAllServiceQuery({
    page: 1,
    limit: 100,
    search: serviceSearch || undefined,
  } as any);

  const availableMedications = medicationsData?.data || [];
  const availableServices = servicesData?.data || [];

  const patients = patientsData?.data || [];
  const doctors = doctorsData?.data || [];

  // Auto-select patient if provided
  useEffect(() => {
    if (preSelectedPatientId && open) {
      setSelectedPatientId(preSelectedPatientId);
    }
  }, [preSelectedPatientId, open]);

  // Update patient state when patient data is loaded
  useEffect(() => {
    if (patientData?.data && selectedPatientId) {
      setPatient(patientData.data);
    }
  }, [patientData, selectedPatientId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSubjective('');
        setDescription('');
        setPatient(null);
        setSelectedPatientId('');
        setSelectedDoctorId('');
        setSearchQuery('');
        setShowErrors(false);
        setTreatmentType('ambulator');
        setMedications([]);
        setServices([]);
        setMedicationSearch('');
        setServiceSearch('');
      }, 200);
    }
  }, [open]);

  const selectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setPopoverOpen(false);
  };

  const clearPatient = () => {
    setPatient(null);
    setSelectedPatientId('');
    setSearchQuery('');
    setShowErrors(false);
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
    const defaultDuration = 7;
    setServices([
      ...services,
      {
        id: Date.now().toString(),
        service_id: '',
        duration: defaultDuration,
        notes: '',
        days: Array.from({ length: defaultDuration }, (_, i) => ({
          day: i + 1,
          date: null,
        })),
      },
    ]);
  };

  // Generate days array based on duration
  const generateDays = (duration: number): ServiceDay[] => {
    return Array.from({ length: duration }, (_, i) => ({
      day: i + 1,
      date: null,
    }));
  };

  // Update service duration and regenerate days
  const updateServiceDuration = (id: string, newDuration: number) => {
    setServices(
      services.map((srv) =>
        srv.id === id
          ? {
              ...srv,
              duration: newDuration,
              days: generateDays(newDuration),
            }
          : srv
      )
    );
  };

  // Update a specific day's date
  const updateServiceDayDate = (
    serviceId: string,
    dayIndex: number,
    date: Date | null
  ) => {
    setServices(
      services.map((srv) =>
        srv.id === serviceId
          ? {
              ...srv,
              days: srv.days.map((d, i) =>
                i === dayIndex ? { ...d, date } : d
              ),
            }
          : srv
      )
    );
  };

  const updateService = (
    id: string,
    field: keyof ServiceItem,
    value: string | number | ServiceDay[]
  ) => {
    setServices(
      services.map((srv) => (srv.id === id ? { ...srv, [field]: value } : srv))
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((srv) => srv.id !== id));
  };

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
        const request: any = {
          patient_id: selectedPatientId,
          doctor_id: selectedDoctorId,
          complaints: subjective,
          treatment_type: treatmentType,
        };
        if (description.trim()) {
          request.description = description;
        }
        const res = await createExam(request).unwrap();
        return res;
      },
      onSuccess: async (data: any) => {
        const examId = data?.data?._id;

        // Save prescriptions
        for (const med of medications) {
          if (med.medication_id) {
            try {
              await createPrescription({
                examination_id: examId,
                items: [
                  {
                    medication_id: med.medication_id,
                    frequency: parseInt(med.frequency) || 1,
                    duration: parseInt(med.duration) || 1,
                    instructions: med.instructions,
                    addons: med.addons || '',
                  },
                ],
              }).unwrap();
            } catch (error) {
              console.error('Рецепт сақлашда хатолик:', error);
            }
          }
        }

        // Save services
        for (const srv of services) {
          if (srv.service_id) {
            try {
              await addServiceToExam({
                examination_id: examId,
                duration: srv.duration,
                items: [
                  {
                    service_type_id: srv.service_id,
                    days: srv.days.map((d) => ({
                      day: d.day,
                      date: d.date,
                    })),
                    notes: srv.notes,
                  },
                ],
              }).unwrap();
            } catch (error) {
              console.error('Хизмат сақлашда хатолик:', error);
            }
          }
        }

        toast.success('Кўрик муваффақиятли яратилди');
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Янги Кўрик Яратиш</DialogTitle>
          <DialogDescription>
            Бемор ва шифокорни танлаб, кўрик маълумотларини киритинг
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Patient Search/Selection */}
          {!patient ? (
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <User className='w-4 h-4 text-primary' />
                Беморни танланг
              </Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={popoverOpen}
                    className='w-full justify-between h-12'
                  >
                    <span className='flex items-center gap-2'>
                      <Search className='w-4 h-4' />
                      <span className='truncate'>Беморни қидириш...</span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
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
                            <div className='flex flex-col w-full'>
                              <span className='font-medium'>{p.fullname}</span>
                              <span className='text-sm text-muted-foreground'>
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
          ) : (
            <>
              {/* Patient Info Banner */}
              <div className='bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <h3 className='font-bold text-lg mb-1'>
                      {patient.fullname}
                      <span className='text-muted-foreground text-sm ml-2'>
                        ({calculateAge(patient.date_of_birth)} ёш,{' '}
                        {patient.gender === 'male' ? 'Эркак' : 'Аёл'})
                      </span>
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      ID: {patient.patient_id} • {patient.phone}
                    </p>
                    {patient?.allergies && patient.allergies.length > 0 && (
                      <div className='px-3 py-2 bg-red-50 border border-red-200 rounded-lg mt-2'>
                        <p className='text-sm font-semibold text-red-600'>
                          ⚠ Аллергия: {patient.allergies.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearPatient}
                    disabled={isCreating}
                  >
                    Ўзгартириш
                  </Button>
                </div>
              </div>

              {/* Doctor Selection and Treatment Type in one row */}
              <div className='flex items-end gap-4'>
                <div className='flex-1 space-y-2'>
                  <Label className='flex items-center gap-2'>
                    <UserCog className='w-4 h-4 text-primary' />
                    Шифокорни танланг
                  </Label>
                  <Select
                    value={selectedDoctorId}
                    onValueChange={setSelectedDoctorId}
                  >
                    <SelectTrigger
                      className={`h-12 ${
                        showErrors && !selectedDoctorId ? 'border-red-500' : ''
                      }`}
                    >
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
                              {doctor.section || 'Мутахассислик кўрсатилмаган'}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label className='flex items-center gap-2'>
                    <Stethoscope className='w-4 h-4 text-primary' />
                    Даволаш тури
                  </Label>
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

              {/* Subjective - Complaints */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-primary' />
                  Бемор шикояти (Subjective)
                </Label>
                <Textarea
                  placeholder='Беморнинг шикоятларини, симптомларини ва касаллик тарихини ёзинг...'
                  className={`min-h-24 ${
                    showErrors && !subjective.trim() ? 'border-red-500' : ''
                  }`}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className='space-y-2'>
                <Label className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-primary' />
                  Изоҳ (Objective)
                </Label>
                <Textarea
                  placeholder='Изоҳни ёзинг...'
                  className='min-h-24'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Prescriptions Section */}
              <div className='space-y-3 border rounded-lg p-4 bg-muted/30'>
                <div className='flex items-center justify-between'>
                  <Label className='flex items-center gap-2'>
                    <Pill className='w-4 h-4 text-primary' />
                    Рецептлар (Дорилар)
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addMedication}
                    className='gap-1'
                  >
                    <Plus className='w-4 h-4' />
                    Дори қўшиш
                  </Button>
                </div>

                {medications.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    Дорилар қўшилмаган
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className='p-3 bg-background rounded-lg border space-y-2'
                      >
                        {/* First row: Dori, Qo'shimchalar, Trash */}
                        <div className='flex items-center gap-2'>
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>Дори</Label>
                            <Select
                              value={med.medication_id}
                              onValueChange={(value) =>
                                updateMedication(med.id, 'medication_id', value)
                              }
                            >
                              <SelectTrigger className='h-9'>
                                <SelectValue placeholder='Дорини танланг...' />
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
                                {availableMedications.length > 0 ? (
                                  availableMedications.map((m: any) => (
                                    <SelectItem key={m._id} value={m._id}>
                                      <div className='flex flex-col'>
                                        <span className='font-medium'>
                                          {m.name}
                                        </span>
                                        <span className='text-xs text-muted-foreground'>
                                          {m.dosage}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className='p-4 text-center text-sm text-muted-foreground'>
                                    Дори топилмади
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>
                              Қўшимчалар
                            </Label>
                            <Input
                              placeholder='Қўшимча маълумот...'
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
                            <Label className='text-xs mb-1 block'>
                              Марта/кун
                            </Label>
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
                          <div className='w-20 shrink-0'>
                            <Label className='text-xs mb-1 block'>Кун</Label>
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
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>
                              Қўлланиш
                            </Label>
                            <Input
                              placeholder='Овқатдан кейин...'
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

              {/* Services Section */}
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
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className='p-3 bg-background rounded-lg border space-y-3'
                      >
                        {/* Service Selection and Duration Row */}
                        <div className='flex items-center gap-2'>
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>Хизмат</Label>
                            <Select
                              value={srv.service_id}
                              onValueChange={(value) =>
                                updateService(srv.id, 'service_id', value)
                              }
                            >
                              <SelectTrigger className='h-9'>
                                <SelectValue placeholder='Хизматни танланг...' />
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
                                {availableServices.length > 0 ? (
                                  availableServices.map((s: any) => (
                                    <SelectItem key={s._id} value={s._id}>
                                      <div className='flex flex-col'>
                                        <span className='font-medium'>
                                          {s.name}
                                        </span>
                                        <span className='text-xs text-muted-foreground'>
                                          {new Intl.NumberFormat(
                                            'uz-UZ'
                                          ).format(s.price)}{' '}
                                          сўм
                                        </span>
                                      </div>
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
                          <div className='w-24 shrink-0'>
                            <Label className='text-xs mb-1 block'>
                              Муддат (кун)
                            </Label>
                            <Input
                              type='number'
                              placeholder='7'
                              className='h-9'
                              min={1}
                              max={30}
                              value={srv.duration}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                if (val >= 0 && val <= 30) {
                                  updateServiceDuration(srv.id, val);
                                }
                              }}
                            />
                          </div>
                          <div className='shrink-0 flex items-center pt-5'>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50'
                              onClick={() => removeService(srv.id)}
                            >
                              <Trash2 className='w-4 h-4' />
                            </Button>
                          </div>
                        </div>

                        {/* Days Table - Compact for Dialog */}
                        {srv.duration > 0 && srv.days.length > 0 && (
                          <div className='space-y-2'>
                            <Label className='text-xs flex items-center gap-1'>
                              <Calendar className='h-3 w-3' />
                              Кунлар жадвали
                            </Label>

                            {/* Compact Grid View */}
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
                              {srv.days.map((day, dayIndex) => (
                                <div
                                  key={dayIndex}
                                  className='flex flex-col gap-1 p-2 bg-muted/30 rounded border'
                                >
                                  <span className='text-xs font-medium'>
                                    {day.day}-кун
                                  </span>
                                  <Input
                                    type='date'
                                    value={
                                      day.date
                                        ? new Date(day.date)
                                            .toISOString()
                                            .split('T')[0]
                                        : ''
                                    }
                                    onChange={(e) =>
                                      updateServiceDayDate(
                                        srv.id,
                                        dayIndex,
                                        e.target.value
                                          ? new Date(e.target.value)
                                          : null
                                      )
                                    }
                                    className='text-xs h-7'
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <Label className='text-xs mb-1 block'>Изоҳ</Label>
                          <Input
                            placeholder='Изоҳ...'
                            className='h-9'
                            value={srv.notes}
                            onChange={(e) =>
                              updateService(srv.id, 'notes', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Бекор қилиш
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating || !patient}
            className='bg-green-600 hover:bg-green-700'
          >
            {isCreating ? 'Сақланмоқда...' : 'Сақлаш'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVisitDialog;
