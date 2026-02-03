import { useCreateExamWithPrescriptionAndServiceMutation } from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import {
  useGetAllPatientQuery,
  useGetPatientByIdQuery,
} from '@/app/api/patientApi/patientApi';
import { useGetAllPrecriptionTemplateQuery } from '@/app/api/prescriptionTemplateApi/prescriptionTemplateApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { useGetAllServiceTemplateQuery } from '@/app/api/serviceTemplateApi/serviceTemplateApi';
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
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { calculateAge } from '../../Examination/components/calculateAge';
import { Textarea } from '@/components/ui/textarea';

interface TemplateMedicationItem {
  medication_id?: { _id: string } | string;
  frequency?: number | string;
  duration?: number | string;
  instructions?: string;
  addons?: string;
}

interface PrescriptionTemplate {
  _id: string;
  name: string;
  items: TemplateMedicationItem[];
}

interface TemplateServiceItem {
  service_type_id?: { _id: string } | string;
}

interface ServiceTemplate {
  _id: string;
  name: string;
  duration?: number;
  items: TemplateServiceItem[];
}

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
  const { t } = useTranslation('patients');
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

  // Template states
  const [selectedPrescriptionTemplate, setSelectedPrescriptionTemplate] =
    useState('');
  const [prescriptionTemplateSearch, setPrescriptionTemplateSearch] =
    useState('');
  const [prescriptionTemplatePage, setPrescriptionTemplatePage] = useState(1);
  const [prescriptionTemplates, setPrescriptionTemplates] = useState<
    PrescriptionTemplate[]
  >([]);
  const [hasMorePrescriptionTemplates, setHasMorePrescriptionTemplates] =
    useState(true);

  const [selectedServiceTemplate, setSelectedServiceTemplate] = useState('');
  const [serviceTemplateSearch, setServiceTemplateSearch] = useState('');
  const [serviceTemplatePage, setServiceTemplatePage] = useState(1);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>(
    []
  );
  const [hasMoreServiceTemplates, setHasMoreServiceTemplates] = useState(true);

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

  const [createExamWithPrescriptionAndService, { isLoading: isCreating }] =
    useCreateExamWithPrescriptionAndServiceMutation();
  const handleRequest = useHandleRequest();

  // Fetch medications
  const { data: medicationsData } = useGetAllMedicationsQuery({
    page: 1,
    limit: 20,
    search: medicationSearch || undefined,
  });

  // Fetch services
  const { data: servicesData } = useGetAllServiceQuery({
    page: 1,
    limit: 20,
    search: serviceSearch || undefined,
  } as any);

  // Fetch prescription templates
  const {
    data: prescriptionTemplatesData,
    isFetching: isFetchingPrescriptionTemplates,
  } = useGetAllPrecriptionTemplateQuery({
    page: prescriptionTemplatePage,
    limit: 20,
    ...(prescriptionTemplateSearch && { name: prescriptionTemplateSearch }),
  });

  // Fetch service templates
  const { data: serviceTemplatesData, isFetching: isFetchingServiceTemplates } =
    useGetAllServiceTemplateQuery({
      page: serviceTemplatePage,
      limit: 20,
      ...(serviceTemplateSearch && { search: serviceTemplateSearch }),
    });

  const availableMedications = medicationsData?.data || [];
  const availableServices = servicesData?.data || [];

  const patients = patientsData?.data || [];
  const doctors = doctorsData?.data || [];

  const TEMPLATE_PAGE_SIZE = 20;

  useEffect(() => {
    if (!prescriptionTemplatesData?.data) {
      return;
    }

    const newTemplates: PrescriptionTemplate[] = prescriptionTemplatesData.data;

    if (prescriptionTemplatePage === 1) {
      setPrescriptionTemplates(newTemplates);
    } else if (newTemplates.length > 0) {
      setPrescriptionTemplates((prev) => {
        const merged = [...prev];
        newTemplates.forEach((template) => {
          if (!merged.some((item) => item._id === template._id)) {
            merged.push(template);
          }
        });
        return merged;
      });
    }

    if (newTemplates.length < TEMPLATE_PAGE_SIZE) {
      setHasMorePrescriptionTemplates(false);
    }
  }, [prescriptionTemplatesData, prescriptionTemplatePage]);

  useEffect(() => {
    if (!serviceTemplatesData?.data) {
      return;
    }

    const newTemplates: ServiceTemplate[] = serviceTemplatesData.data;

    if (serviceTemplatePage === 1) {
      setServiceTemplates(newTemplates);
    } else if (newTemplates.length > 0) {
      setServiceTemplates((prev) => {
        const merged = [...prev];
        newTemplates.forEach((template) => {
          if (!merged.some((item) => item._id === template._id)) {
            merged.push(template);
          }
        });
        return merged;
      });
    }

    if (newTemplates.length < TEMPLATE_PAGE_SIZE) {
      setHasMoreServiceTemplates(false);
    }
  }, [serviceTemplatesData, serviceTemplatePage]);

  useEffect(() => {
    setPrescriptionTemplatePage(1);
    setHasMorePrescriptionTemplates(true);
    setPrescriptionTemplates([]);
  }, [prescriptionTemplateSearch]);

  useEffect(() => {
    setServiceTemplatePage(1);
    setHasMoreServiceTemplates(true);
    setServiceTemplates([]);
  }, [serviceTemplateSearch]);

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
        setSelectedPrescriptionTemplate('');
        setSelectedServiceTemplate('');
        setPrescriptionTemplatePage(1);
        setServiceTemplatePage(1);
        setPrescriptionTemplateSearch('');
        setServiceTemplateSearch('');
        setPrescriptionTemplates([]);
        setServiceTemplates([]);
        setHasMorePrescriptionTemplates(true);
        setHasMoreServiceTemplates(true);
      }, 200);
    }
  }, [open]);

  useEffect(() => {
    if (!open || prescriptionTemplates.length > 0) {
      return;
    }

    if (prescriptionTemplatesData?.data) {
      setPrescriptionTemplates(prescriptionTemplatesData.data);
      setHasMorePrescriptionTemplates(
        prescriptionTemplatesData.data.length >= TEMPLATE_PAGE_SIZE
      );
    }
  }, [open, prescriptionTemplates.length, prescriptionTemplatesData]);

  useEffect(() => {
    if (!open || serviceTemplates.length > 0) {
      return;
    }

    if (serviceTemplatesData?.data) {
      setServiceTemplates(serviceTemplatesData.data);
      setHasMoreServiceTemplates(
        serviceTemplatesData.data.length >= TEMPLATE_PAGE_SIZE
      );
    }
  }, [open, serviceTemplates.length, serviceTemplatesData]);

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

  // Handle prescription template selection
  const handlePrescriptionTemplateSelect = (templateId: string) => {
    setSelectedPrescriptionTemplate(templateId);

    const template = prescriptionTemplates.find((t) => t._id === templateId);
    if (!template) return;

    // Add medications from template - replace existing ones
    const templateMedications: MedicationItem[] = template.items.map((item) => {
      const medicationId =
        typeof item.medication_id === 'string'
          ? item.medication_id
          : item.medication_id?._id || '';

      return {
        id: Date.now().toString() + Math.random(),
        medication_id: medicationId,
        additionalInfo: '',
        frequency: item.frequency?.toString() || '',
        duration: item.duration?.toString() || '',
        instructions: item.instructions || '',
        addons: item.addons || '',
      };
    });

    // Replace medications list instead of appending
    setMedications(templateMedications);
    toast.success(t('newVisitDialog.templateApplied'));
  };

  // Handle service template selection
  const handleServiceTemplateSelect = (templateId: string) => {
    setSelectedServiceTemplate(templateId);

    const template = serviceTemplates.find((t) => t._id === templateId);
    if (!template) return;

    // Set duration from template
    if (template.duration) {
      setServiceDuration(template.duration);
    }

    // Add services from template - replace existing ones
    const duration = template.duration || serviceDuration || 7;
    const allDays = Array.from({ length: duration }, (_, i) => i + 1);

    const templateServices: ServiceItem[] = template.items.map((item) => {
      const serviceId =
        typeof item.service_type_id === 'string'
          ? item.service_type_id
          : item.service_type_id?._id || '';

      return {
        id: Date.now().toString() + Math.random(),
        service_id: serviceId,
        notes: '',
        markedDays: allDays, // Mark all days by default
      };
    });

    // Replace services list instead of appending
    setServices(templateServices);
    toast.success(t('newVisitDialog.templateApplied'));
  };

  const handlePrescriptionTemplateScroll = (
    event: React.UIEvent<HTMLDivElement>
  ) => {
    const target = event.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (
      isNearBottom &&
      hasMorePrescriptionTemplates &&
      !isFetchingPrescriptionTemplates
    ) {
      setPrescriptionTemplatePage((prev) => prev + 1);
    }
  };

  const handleServiceTemplateScroll = (
    event: React.UIEvent<HTMLDivElement>
  ) => {
    const target = event.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 20;

    if (isNearBottom && hasMoreServiceTemplates && !isFetchingServiceTemplates) {
      setServiceTemplatePage((prev) => prev + 1);
    }
  };

  const handleSave = async () => {
    setShowErrors(true);

    if (!selectedPatientId) {
      toast.error(t('newVisitDialog.errors.selectPatient'));
      return;
    }
    if (!selectedDoctorId) {
      toast.error(t('newVisitDialog.errors.selectDoctor'));
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

    const request: any = {
      patient_id: selectedPatientId,
      doctor_id: selectedDoctorId,
      treatment_type: treatmentType,
      prescription_data: {
        items: prescriptionItems,
      },
    };
    console.log(request);
    await handleRequest({
      request: async () => {
        if (serviceData) {
          request.service_data = serviceData;
        }

        const res = await createExamWithPrescriptionAndService(
          request
        ).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('newVisitDialog.success.examCreated'));
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('newVisitDialog.errorOccurred')
        );
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>
            {t('newVisitDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('newVisitDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Patient Search/Selection */}
          {!patient ? (
            <div className='space-y-2'>
              <Label className='flex items-center gap-2'>
                <User className='w-4 h-4 text-primary' />
                {t('newVisitDialog.selectPatient')}
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
                      <span className='truncate'>
                        {t('newVisitDialog.searchPatient')}
                      </span>
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0' align='start'>
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder={t('newVisitDialog.searchByNameIdPhone')}
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {t('newVisitDialog.patientNotFound')}
                      </CommandEmpty>
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
                        ({calculateAge(patient.date_of_birth)}{' '}
                        {t('newVisitDialog.yearsOld')},{' '}
                        {patient.gender === 'male' ? t('male') : t('female')})
                      </span>
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      ID: {patient.patient_id} • {patient.phone}
                    </p>
                    {patient?.allergies && patient.allergies.length > 0 && (
                      <div className='px-3 py-2 bg-red-50 border border-red-200 rounded-lg mt-2'>
                        <p className='text-sm font-semibold text-red-600'>
                          ⚠ {t('newVisitDialog.allergy')}:{' '}
                          {patient.allergies.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Doctor Selection and Treatment Type in one row */}
              <div className='flex items-end gap-4 shadow-sm border p-2 rounded-lg'>
                <div className='flex-1 space-y-2'>
                  <Label className='flex items-center gap-2'>
                    <UserCog className='w-4 h-4 text-primary' />
                    {t('newVisitDialog.selectDoctor')}
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
                      <SelectValue
                        placeholder={t(
                          'newVisitDialog.selectDoctorPlaceholder'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <div className='p-2'>
                        <Input
                          ref={doctorSearchRef}
                          placeholder={t('newVisitDialog.search')}
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
                              {doctor.section ||
                                t('newVisitDialog.specialtyNotSpecified')}
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
                    {t('newVisitDialog.treatmentType')}
                  </Label>
                  <div className='grid grid-cols-2 gap-1 border-2 border-blue-500 rounded-xl p-1'>
                    <button
                      type='button'
                      onClick={() => setTreatmentType('ambulator')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        treatmentType === 'ambulator'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t('newVisitDialog.ambulatory')}
                    </button>
                    <button
                      type='button'
                      onClick={() => setTreatmentType('stasionar')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        treatmentType === 'stasionar'
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {t('newVisitDialog.inpatient')}
                    </button>
                  </div>
                </div>
              </div>

                          {/* Subjective - Complaints */}
              <div className='space-y-2 shadow-sm border p-2 rounded-lg'>
                <Label className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-primary' />
                  {t('newVisitDialog.complaint')}
                </Label>
                <Textarea
                  placeholder={t('newVisitDialog.complaintPlaceholder')}
                  className={`min-h-24 ${
                    showErrors && !subjective.trim() ? 'border-red-500' : ''
                  }`}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className='space-y-2 shadow-sm border p-2 rounded-lg'>
                <Label className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-primary' />
                  {t('newVisitDialog.descriptionLabel')}
                </Label>
                <Textarea
                  placeholder={t('newVisitDialog.descriptionPlaceholder')}
                  className='min-h-24'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Template Selection - Side by Side */}
              <div className='shadow-sm border rounded-lg p-4 bg-gradient-to-r from-blue-50/50 to-green-50/50'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Prescription Template */}
                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      <Pill className='w-4 h-4 text-primary' />
                      {t('newVisitDialog.prescriptionTemplate')}
                    </Label>
                    <Select
                      value={selectedPrescriptionTemplate}
                      onValueChange={handlePrescriptionTemplateSelect}
                    >
                      <SelectTrigger className='h-10'>
                        <SelectValue
                          placeholder={t(
                            'newVisitDialog.selectPrescriptionTemplate'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <div className='p-2'>
                          <Input
                            placeholder={t('newVisitDialog.searchTemplate')}
                            value={prescriptionTemplateSearch}
                            onChange={(e) =>
                              setPrescriptionTemplateSearch(e.target.value)
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                            className='h-8 mb-2'
                          />
                        </div>
                        <div
                          className='max-h-64 overflow-auto'
                          onScroll={handlePrescriptionTemplateScroll}
                        >
                          {prescriptionTemplates.length > 0 ? (
                            prescriptionTemplates.map((template) => (
                              <SelectItem
                                key={template._id}
                                value={template._id}
                              >
                                <div className='flex flex-col'>
                                  <span className='font-medium'>
                                    {template.name}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {template.items?.length || 0}{' '}
                                    {t('newVisitDialog.medications')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className='p-4 text-center text-sm text-muted-foreground'>
                              {t('newVisitDialog.noTemplatesFound')}
                            </div>
                          )}
                          {isFetchingPrescriptionTemplates && (
                            <div className='p-2 text-center text-xs text-muted-foreground'>
                              {t('newVisitDialog.loading')}
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Template */}
                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2'>
                      <Activity className='w-4 h-4 text-primary' />
                      {t('newVisitDialog.serviceTemplate')}
                    </Label>
                    <Select
                      value={selectedServiceTemplate}
                      onValueChange={handleServiceTemplateSelect}
                    >
                      <SelectTrigger className='h-10'>
                        <SelectValue
                          placeholder={t(
                            'newVisitDialog.selectServiceTemplate'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <div className='p-2'>
                          <Input
                            placeholder={t('newVisitDialog.searchTemplate')}
                            value={serviceTemplateSearch}
                            onChange={(e) =>
                              setServiceTemplateSearch(e.target.value)
                            }
                            onKeyDown={(e) => e.stopPropagation()}
                            className='h-8 mb-2'
                          />
                        </div>
                        <div
                          className='max-h-64 overflow-auto'
                          onScroll={handleServiceTemplateScroll}
                        >
                          {serviceTemplates.length > 0 ? (
                            serviceTemplates.map((template) => (
                              <SelectItem key={template._id} value={template._id}>
                                <div className='flex flex-col'>
                                  <span className='font-medium'>
                                    {template.name}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {template.items?.length || 0}{' '}
                                    {t('newVisitDialog.services')} •{' '}
                                    {template.duration} {t('newVisitDialog.days')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className='p-4 text-center text-sm text-muted-foreground'>
                              {t('newVisitDialog.noTemplatesFound')}
                            </div>
                          )}
                          {isFetchingServiceTemplates && (
                            <div className='p-2 text-center text-xs text-muted-foreground'>
                              {t('newVisitDialog.loading')}
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Prescriptions Section */}
              <div className='space-y-3 border rounded-lg p-4 bg-muted/30 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <Label className='flex items-center gap-2'>
                    <Pill className='w-4 h-4 text-primary' />
                    {t('newVisitDialog.prescriptions')}
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addMedication}
                    className='gap-1'
                  >
                    <Plus className='w-4 h-4' />
                    {t('newVisitDialog.addMedication')}
                  </Button>
                </div>

                {medications.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    {t('newVisitDialog.noMedicationsAdded')}
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
                            <Label className='text-xs mb-1 block'>
                              {t('newVisitDialog.medication')}
                            </Label>
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
                                <SelectValue
                                  placeholder={t(
                                    'newVisitDialog.selectMedication'
                                  )}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <div className='p-2'>
                                  <Input
                                    ref={medicationSearchRef}
                                    placeholder={t(
                                      'newVisitDialog.searchMedication'
                                    )}
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
                                    {t('newVisitDialog.medicationNotFound')}
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>
                              {t('newVisitDialog.additionalInfo')}
                            </Label>
                            <Input
                              placeholder={t(
                                'newVisitDialog.additionalInfoPlaceholder'
                              )}
                              className='h-9'
                              value={med.addons}
                              onChange={(e) =>
                                updateMedication(
                                  med.id,
                                  'addons',
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
                              {t('newVisitDialog.day')}
                            </Label>
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
                            <Label className='text-xs mb-1 block'>
                              {t('newVisitDialog.timesPerDay')}
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
                          <div className='flex-1 min-w-0'>
                            <Label className='text-xs mb-1 block'>
                              {t('newVisitDialog.usage')}
                            </Label>
                            <Input
                              placeholder={t('newVisitDialog.usagePlaceholder')}
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
              <div className='space-y-3 border rounded-lg p-4 bg-muted/30 shadow-sm'>
                <div className='flex items-center justify-between'>
                  <Label className='flex items-center gap-2'>
                    <Activity className='w-4 h-4 text-primary' />
                    {t('newVisitDialog.services')}
                  </Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addService}
                    className='gap-1'
                  >
                    <Plus className='w-4 h-4' />
                    {t('newVisitDialog.addService')}
                  </Button>
                </div>

                {services.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    {t('newVisitDialog.noServicesAdded')}
                  </p>
                ) : (
                  <div className='space-y-3'>
                    {/* Common Settings */}
                    <div className='flex items-end gap-2 p-2 bg-muted/30 rounded-lg border'>
                      <div className='w-28'>
                        <Label className='text-xs font-medium'>
                          {t('newVisitDialog.duration')}
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
                          {t('newVisitDialog.startDate')}
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
                            {t('newVisitDialog.everyDay')}
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
                            {t('newVisitDialog.everyTwoDays')}
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
                              {t('newVisitDialog.service')}
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
                                            <SelectValue
                                              placeholder={t(
                                                'newVisitDialog.select'
                                              )}
                                            />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <div className='p-2'>
                                              <Input
                                                ref={serviceSearchRef}
                                                placeholder={t(
                                                  'newVisitDialog.search'
                                                )}
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
                                                {t('newVisitDialog.sum')}
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
                                            <div className='flex flex-col items-center justify-center'>
                                              <span className='text-[10px] text-muted-foreground font-bold'>
                                                {t('newVisitDialog.dayN', {
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
                                                {t('newVisitDialog.dayN', {
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
                                                {t('newVisitDialog.dayN', {
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {t('newVisitDialog.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating || !patient}
            className='bg-green-600 hover:bg-green-700'
          >
            {isCreating ? t('newVisitDialog.saving') : t('newVisitDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewVisitDialog;
