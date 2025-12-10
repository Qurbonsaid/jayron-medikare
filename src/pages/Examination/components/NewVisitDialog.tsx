import {
  useAddServiceMutation,
  useCreateExamMutation,
} from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useCreatePrescriptionMutation } from '@/app/api/prescription/prescriptionApi';
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
import { format } from 'date-fns';
import {
  Activity,
  FileText,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  User,
  UserCog,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
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
    notes: string;
    markedDays: number[]; // Array of day numbers that are marked
  }
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceDuration, setServiceDuration] = useState<number>(7);
  const [serviceStartDate, setServiceStartDate] = useState<Date | null>(
    new Date()
  );

  // Doctor search state
  const [doctorSearch, setDoctorSearch] = useState('');

  // Refs for autofocus
  const doctorSearchRef = useRef<HTMLInputElement>(null);
  const medicationSearchRef = useRef<HTMLInputElement>(null);
  const serviceSearchRef = useRef<HTMLInputElement>(null);

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

        // Save services with common duration and start date
        if (services.length > 0 && serviceDuration && serviceStartDate) {
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

          try {
            await addServiceToExam({
              examination_id: examId,
              duration: serviceDuration,
              items: serviceItems,
            }).unwrap();
          } catch (error) {
            console.error('Хизмат сақлашда хатолик:', error);
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
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
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
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <CommandList>
                      <CommandEmpty>Бемор топилмади</CommandEmpty>
                      <CommandGroup>
                        {filteredPatients.map((p) => (
                          <CommandItem
                            key={p._id}
                            value={p._id}
                            keywords={[p.fullname, p.patient_id, p.phone]}
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
                    onOpenChange={(open) => {
                      if (open) {
                        setTimeout(() => doctorSearchRef.current?.focus(), 0);
                      }
                    }}
                  >
                    <SelectTrigger
                      className={`h-12 ${
                        showErrors && !selectedDoctorId ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue placeholder='Шифокорни танланг...' />
                    </SelectTrigger>
                    <SelectContent>
                      <div className='p-2'>
                        <Input
                          ref={doctorSearchRef}
                          placeholder='Қидириш...'
                          value={doctorSearch}
                          onChange={(e) => setDoctorSearch(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onFocus={(e) => {
                            setTimeout(() => e.target.focus(), 0);
                          }}
                          className='h-8 mb-2'
                        />
                      </div>
                      {filteredDoctors.map((doctor: any) => (
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
                              onOpenChange={(open) => {
                                if (open) {
                                  setTimeout(
                                    () => medicationSearchRef.current?.focus(),
                                    0
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className='h-9'>
                                <SelectValue placeholder='Дорини танланг...' />
                              </SelectTrigger>
                              <SelectContent>
                                <div className='p-2'>
                                  <Input
                                    ref={medicationSearchRef}
                                    placeholder='Дори қидириш...'
                                    value={medicationSearch}
                                    onChange={(e) =>
                                      setMedicationSearch(e.target.value)
                                    }
                                    onKeyDown={(e) => e.stopPropagation()}
                                    onFocus={(e) => {
                                      setTimeout(() => e.target.focus(), 0);
                                    }}
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
                                            updateService(
                                              srv.id,
                                              'service_id',
                                              value
                                            )
                                          }
                                          onOpenChange={(open) => {
                                            if (open) {
                                              setTimeout(
                                                () =>
                                                  serviceSearchRef.current?.focus(),
                                                0
                                              );
                                            }
                                          }}
                                        >
                                          <SelectTrigger className='h-7 text-xs border-0 shadow-none min-w-[140px]'>
                                            <SelectValue placeholder='Танланг...' />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <div className='p-2'>
                                              <Input
                                                ref={serviceSearchRef}
                                                placeholder='Қидириш...'
                                                value={serviceSearch}
                                                onChange={(e) =>
                                                  setServiceSearch(
                                                    e.target.value
                                                  )
                                                }
                                                onKeyDown={(e) =>
                                                  e.stopPropagation()
                                                }
                                                onFocus={(e) => {
                                                  setTimeout(
                                                    () => e.target.focus(),
                                                    0
                                                  );
                                                }}
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
