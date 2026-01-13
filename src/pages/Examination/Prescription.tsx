import {
  useAddServiceMutation,
  useGetAllExamsQuery,
  useGetManyServiceQuery,
  useGetOneExamQuery,
  useUpdateExaminationServiceMutation,
} from '@/app/api/examinationApi/examinationApi';
import type { Prescription } from '@/app/api/examinationApi/types';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import { useGetPatientByIdQuery } from '@/app/api/patientApi/patientApi';
import {
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
} from '@/app/api/prescription/prescriptionApi';
import { useGetAllPrecriptionTemplateQuery } from '@/app/api/prescriptionTemplateApi/prescriptionTemplateApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { useGetAllServiceTemplateQuery } from '@/app/api/serviceTemplateApi/serviceTemplateApi';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { format } from 'date-fns';
import {
  Activity,
  AlertCircle,
  CalendarDays,
  Edit,
  Loader2,
  Plus,
  Repeat,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['prescription', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [allergyWarning, setAllergyWarning] = useState(false);
  const [formErrors, setFormErrors] = useState<FormValidationErrors>({
    medications: {},
    services: {},
  });
  const [serviceSearch, setServiceSearch] = useState<Record<string, string>>(
    {}
  );
  const [servicePage, setServicePage] = useState(1);
  const [serviceOptions, setServiceOptions] = useState<any[]>([]);
  const [hasMoreServices, setHasMoreServices] = useState(true);
  const serviceSearchRefs = React.useRef<
    Record<string, HTMLInputElement | null>
  >({});

  // Common service settings
  const [serviceDuration, setServiceDuration] = useState<number>(7);
  const [serviceStartDate, setServiceStartDate] = useState<Date | null>(
    new Date()
  );

  // Prescription editing states
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [editingPrescriptionDocId, setEditingPrescriptionDocId] = useState<
    string | null
  >(null);
  const [editPrescriptionForm, setEditPrescriptionForm] = useState({
    medication_id: '',
    frequency: '',
    duration: '',
    instructions: '',
    addons: '',
  });
  const [editMedicationSearch, setEditMedicationSearch] = useState('');

  // Patient selection states
  const [patient, setPatient] = useState<any>(null);
  const [selectedExaminationId, setSelectedExaminationId] =
    useState<string>('');

  // Medication search states
  const [medicationSearch, setMedicationSearch] = useState('');

  // Medications search + infinite scroll state
  const [medicationOptions, setMedicationOptions] = useState<any[]>([]);
  const [medicationPage, setMedicationPage] = useState(1);
  const [hasMoreMedications, setHasMoreMedications] = useState(true);
  const [isLoadingMoreMedications, setIsLoadingMoreMedications] =
    useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Combined search term for both medication selects
  const [currentMedicationSearch, setCurrentMedicationSearch] = useState('');

  // Examination search state
  const [examinationSearch, setExaminationSearch] = useState('');

  // Infinite scroll states
  const [page, setPage] = useState(1);
  const [allExaminations, setAllExaminations] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  // Template states
  const [selectedPrescriptionTemplate, setSelectedPrescriptionTemplate] =
    useState('');
  const [prescriptionTemplateSearch, setPrescriptionTemplateSearch] =
    useState('');
  const [prescriptionTemplatePage, setPrescriptionTemplatePage] = useState(1);

  const [selectedServiceTemplate, setSelectedServiceTemplate] = useState('');
  const [serviceTemplateSearch, setServiceTemplateSearch] = useState('');
  const [serviceTemplatePage, setServiceTemplatePage] = useState(1);

  // Get examination ID from navigation state
  const examinationIdFromState = location.state?.examinationId;

  // Fetch active examinations with pagination
  const { data: examinationsData, isLoading: isLoadingExaminations } =
    useGetAllExamsQuery({
      page: page,
      limit: 20,
      status: 'pending',
      _key: queryKey,
      has_prescription: false,
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

  // Fetch medications for search (paged)
  const { data: medicationsData, isFetching: isFetchingMedications } =
    useGetAllMedicationsQuery({
      page: medicationPage,
      limit: 20,
      search: currentMedicationSearch || undefined,
    });

  // Fetch all services - filtering will be done client-side
  const { data: servicesData, isFetching: isFetchingServices } =
    useGetAllServiceQuery({
      page: 1,
      limit: 20,
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

  // Store all available services
  useEffect(() => {
    if (servicesData?.data) {
      setServiceOptions(servicesData.data);
    }
  }, [servicesData]);

  const [createPrescription, { isLoading: isCreating }] =
    useCreatePrescriptionMutation();
  const [updatePrescription, { isLoading: isUpdating }] =
    useUpdatePrescriptionMutation();
  const [addServiceToExam, { isLoading: isAddingService }] =
    useAddServiceMutation();
  const [updateService] = useUpdateExaminationServiceMutation();
  const handleRequest = useHandleRequest();

  // Fetch services by patient_id to check if services exist
  const { data: patientServicesData } = useGetManyServiceQuery(
    {
      page: 1,
      limit: 100,
      patient_id: examinationData?.data.patient_id?._id || '',
    },
    { skip: !examinationData?.data.patient_id?._id }
  );
  const patientServices = patientServicesData?.data || [];

  const availableServices = serviceOptions;

  // Helper function to get service by ID
  const getServiceById = (serviceId: string) => {
    return (
      serviceOptions.find((s: any) => s._id === serviceId) ||
      patientServices
        .flatMap((doc: any) => doc.items || [])
        .find((item: any) => {
          const itemServiceId =
            typeof item.service_type_id === 'object'
              ? item.service_type_id?._id
              : item.service_type_id;
          return itemServiceId === serviceId;
        })?.service_type_id
    );
  };

  // Update serviceDuration and serviceStartDate based on existing services
  useEffect(() => {
    // Only update if services array is empty (not adding new services)
    if (services.length === 0 && patientServices.length > 0) {
      // Get max duration from all existing services
      const durations = patientServices
        .flatMap(
          (doc: any) =>
            doc.items?.map(
              (item: any) => item.duration || item.days?.length || 0
            ) || []
        )
        .filter((d: number) => d > 0);
      if (durations.length > 0) {
        const maxDuration = Math.max(...durations);
        setServiceDuration(maxDuration);
      }

      // Get start date from existing services (first date found in days)
      const firstDate = patientServices
        .flatMap((doc: any) => doc.items || [])
        .flatMap((item: any) => item.days || [])
        .map((day: any) => day.date)
        .filter((date: any) => date !== null && date !== undefined)
        .sort((a: any, b: any) => {
          const dateA = new Date(a).getTime();
          const dateB = new Date(b).getTime();
          return dateA - dateB;
        })[0];

      if (firstDate) {
        setServiceStartDate(new Date(firstDate));
      }
    } else if (patientServices.length === 0 && services.length === 0) {
      // Reset to default 7 if no existing services and no new services
      setServiceDuration(7);
      setServiceStartDate(new Date());
    }
  }, [patientServices.length, services.length]);

  // Update currentMedicationSearch when medicationSearch changes
  useEffect(() => {
    setCurrentMedicationSearch(medicationSearch);
  }, [medicationSearch]);

  // Update currentMedicationSearch when editMedicationSearch changes
  useEffect(() => {
    setCurrentMedicationSearch(editMedicationSearch);
  }, [editMedicationSearch]);

  // Reset medications pagination when search changes
  useEffect(() => {
    setMedicationPage(1);
    setMedicationOptions([]);
    setHasMoreMedications(true);
  }, [currentMedicationSearch]);

  // Build medicationOptions incrementally when new data arrives
  useEffect(() => {
    if (!isDropdownOpen) return; // Only update when dropdown is open

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
    // reset loading-more when fetch completes
    if (!isFetchingMedications) {
      setIsLoadingMoreMedications(false);
    }
  }, [medicationsData, medicationPage, isFetchingMedications, isDropdownOpen]);

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
    // Clear templates
    setSelectedPrescriptionTemplate('');
    setSelectedServiceTemplate('');
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

  // Handle prescription template selection
  const handlePrescriptionTemplateSelect = (templateId: string) => {
    setSelectedPrescriptionTemplate(templateId);

    const template = prescriptionTemplatesData?.data.find(
      (t: any) => t._id === templateId
    );
    if (!template) return;

    // Extract populated medication objects from template items and add to medicationOptions
    const populatedMedications = template.items
      .map((item: any) => item.medication_id)
      .filter((med: any) => med && typeof med === 'object' && med._id);

    if (populatedMedications.length > 0) {
      setMedicationOptions((prev) => {
        const existingIds = new Set(prev.map((m: any) => m._id));
        const newMeds = populatedMedications.filter(
          (m: any) => !existingIds.has(m._id)
        );
        return [...prev, ...newMeds];
      });
    }

    // Add medications from template - replace existing ones
    const templateMedications: Medication[] = template.items.map(
      (item: any) => ({
        id: Date.now().toString() + Math.random(),
        medication_id: item.medication_id?._id || item.medication_id || '',
        additionalInfo: '',
        frequency: item.frequency?.toString() || '',
        duration: item.duration?.toString() || '',
        instructions: item.instructions || '',
        addons: item.addons || '',
      })
    );

    // Replace medications list instead of appending
    setMedications(templateMedications);
    toast.success(t('prescription:templateApplied'));
  };

  // Handle service template selection
  const handleServiceTemplateSelect = (templateId: string) => {
    setSelectedServiceTemplate(templateId);

    const template = serviceTemplatesData?.data.find(
      (t: any) => t._id === templateId
    );
    if (!template) return;

    // Set duration from template
    if (template.duration) {
      setServiceDuration(template.duration);
    }

    // Add services from template - replace existing ones
    const duration = template.duration || serviceDuration || 7;
    const allDays = Array.from({ length: duration }, (_, i) => i + 1);

    const templateServices: ServiceItem[] = template.items.map((item: any) => ({
      id: Date.now().toString() + Math.random(),
      service_id: item.service_type_id?._id || item.service_type_id || '',
      notes: '',
      markedDays: allDays, // Mark all days by default
    }));

    // Replace services list instead of appending
    setServices(templateServices);
    toast.success(t('prescription:templateApplied'));
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
    // Use serviceDuration from input directly (minimum 1)
    const duration = Math.max(serviceDuration, 1);

    // Mark all days by default
    const allDays = Array.from({ length: duration }, (_, i) => i + 1);
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

  // Mark every day for a specific service
  const markEveryDayForService = (serviceId: string) => {
    setServices(
      services.map((srv) => {
        if (srv.id === serviceId) {
          const allDays = Array.from(
            { length: serviceDuration },
            (_, i) => i + 1
          ); // Mark all days: 1, 2, 3, 4...
          return { ...srv, markedDays: allDays };
        }
        return srv;
      })
    );
  };

  // Mark every other day for a specific service
  const markEveryOtherDayForService = (serviceId: string) => {
    setServices(
      services.map((srv) => {
        if (srv.id === serviceId) {
          const everyOtherDay = Array.from(
            { length: serviceDuration },
            (_, i) => i + 1
          ).filter((day) => day % 2 === 1); // Mark odd days: 1, 3, 5, 7...
          return { ...srv, markedDays: everyOtherDay };
        }
        return srv;
      })
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Dorilarni alohida saqlash
  const handleSaveMedications = async () => {
    if (!selectedExaminationId) {
      toast.error(t('prescription:selectExamError'));
      return;
    }

    if (medications.length === 0) {
      toast.error(t('prescription:addMedicationError'));
      return;
    }

    // Validate each medication
    const medErrors: ValidationErrors = {};
    let hasErrors = false;

    for (const med of medications) {
      medErrors[med.id] = {};

      if (!med.medication_id || med.medication_id.trim() === '') {
        medErrors[med.id].medication_id = true;
        hasErrors = true;
      }

      if (!med.frequency || med.frequency.trim() === '') {
        medErrors[med.id].frequency = true;
        hasErrors = true;
      }

      if (!med.duration || med.duration.trim() === '') {
        medErrors[med.id].duration = true;
        hasErrors = true;
      }

      if (!med.instructions || med.instructions.trim() === '') {
        medErrors[med.id].instructions = true;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setFormErrors((prev) => ({ ...prev, medications: medErrors }));
      toast.error(t('prescription:fillAllFieldsError'));
      return;
    }

    // Check for duplicates
    const medicationIds = medications.map((med) =>
      med.medication_id.toLowerCase().trim()
    );
    const duplicates = medicationIds.filter(
      (id, index) => medicationIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      toast.error(t('prescription:fillAllFieldsError'));
      return;
    }

    const medicationItems = medications.map((med) => ({
      medication_id: med.medication_id,
      frequency: parseInt(med.frequency) || 0,
      duration: parseInt(med.duration) || 0,
      instructions: med.instructions,
      addons: med.addons || '',
    }));

    // Check if prescription already exists
    const hasExistingPrescription =
      examinationData?.data?.prescription?._id &&
      examinationData.data.prescription.items &&
      examinationData.data.prescription.items.length > 0;

    await handleRequest({
      request: async () => {
        if (hasExistingPrescription) {
          // Use updatePrescription - merge new items with existing ones
          const existingItems = examinationData.data.prescription.items.map(
            (item: any) => ({
              _id: item._id,
              medication_id:
                typeof item.medication_id === 'object'
                  ? item.medication_id._id
                  : item.medication_id,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions || '',
              addons: item.addons || '',
            })
          );

          // Combine existing items with new items
          // New items don't have _id - API will create them
          // We'll use type assertion since new items don't have _id yet
          const allItems = [
            ...existingItems,
            ...(medicationItems as any), // New items without _id
          ];

          const res = await updatePrescription({
            id: examinationData.data.prescription._id,
            body: {
              items: allItems as any, // Type assertion for new items without _id
            },
          }).unwrap();
          return res;
        } else {
          // Use createPrescription for new prescription
          const res = await createPrescription({
            examination_id: selectedExaminationId,
            items: medicationItems,
          }).unwrap();
          return res;
        }
      },
      onSuccess: () => {
        toast.success(
          `${medications.length} ${t('prescription:medicationsSaved')}`
        );
        setMedications([]);
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('prescription:medicationsSaveError')
        );
      },
    });
  };

  // Xizmatlarni alohida saqlash
  const handleSaveServices = async () => {
    if (!selectedExaminationId) {
      toast.error(t('prescription:selectExamError'));
      return;
    }

    if (services.length === 0) {
      toast.error(t('prescription:addServiceError'));
      return;
    }

    // Validate services
    const srvErrors: ServiceValidationErrors = {};
    let hasErrors = false;

    for (const srv of services) {
      srvErrors[srv.id] = {};

      if (!srv.service_id || srv.service_id.trim() === '') {
        srvErrors[srv.id].service_id = true;
        hasErrors = true;
      }
    }

    if (!serviceDuration || serviceDuration < 1) {
      toast.error(t('prescription:serviceDurationError'));
      return;
    }
    if (!serviceStartDate) {
      toast.error(t('prescription:serviceStartDateError'));
      return;
    }

    if (hasErrors) {
      setFormErrors((prev) => ({ ...prev, services: srvErrors }));
      toast.error(t('prescription:fillAllFieldsError'));
      return;
    }

    // Check for duplicates
    const serviceIds = services.map((srv) =>
      srv.service_id.toLowerCase().trim()
    );
    const duplicates = serviceIds.filter(
      (id, index) => serviceIds.indexOf(id) !== index
    );
    if (duplicates.length > 0) {
      toast.error(t('prescription:fillAllFieldsError'));
      return;
    }

    const hasExistingServices = patientServices.length > 0;

    // Prepare items array
    let itemsToSave = services.map((srv) => ({
      service_type_id: srv.service_id,
      days: (() => {
        const allDays = generateDays(serviceDuration, serviceStartDate);
        const markedDays = srv.markedDays || [];
        // Include all days, but set date to null for unmarked days
        return allDays.map((day) => ({
          day: day.day,
          date:
            markedDays.includes(day.day) && day.date
              ? format(day.date, 'yyyy-MM-dd')
              : null,
        }));
      })(),
      notes: srv.notes,
    }));

    // If adding new items to existing service document, preserve all existing items
    // and ensure all items' days arrays match the new duration
    if (hasExistingServices) {
      const existingServiceDoc = patientServices[0]; // Use first service document
      if (existingServiceDoc && existingServiceDoc.items) {
        // Update all existing items to match the new duration
        // This ensures all items' days arrays are synchronized with the current serviceDuration
        const existingItems = existingServiceDoc.items.map((item: any) => {
          const existingDays = (item.days || []).map((day: any) => ({
            day: day.day,
            date: day.date
              ? typeof day.date === 'string'
                ? day.date
                : format(new Date(day.date), 'yyyy-MM-dd')
              : null,
          })) as Array<{ day: number; date: string | null }>;

          // Always ensure days array length equals current serviceDuration
          // If duration changed or days array is shorter/longer, adjust to match new duration
          const daysMap = new Map(
            existingDays.map((d) => [d.day, d.date] as [number, string | null])
          );

          // Generate days array matching the new duration
          const paddedDays: Array<{ day: number; date: string | null }> =
            Array.from({ length: serviceDuration }, (_, i) => {
              const dayNumber = i + 1;
              // If day exists in existing days, use its date, otherwise null
              return {
                day: dayNumber,
                date: daysMap.get(dayNumber) ?? null,
              };
            });

          return {
            _id: item._id,
            service_type_id:
              typeof item.service_type_id === 'object'
                ? item.service_type_id._id
                : item.service_type_id,
            days: paddedDays,
            notes: item.notes || '',
          };
        });

        // Combine new items with existing items (all with updated duration)
        itemsToSave = [...existingItems, ...itemsToSave];
      }
    }

    const payload = {
      examination_id: selectedExaminationId,
      duration: serviceDuration,
      items: itemsToSave,
    };

    await handleRequest({
      request: async () => {
        // If existing services exist, use update
        // Otherwise, use create
        if (hasExistingServices) {
          // Get service document ID from existing services
          const serviceDocId = patientServices[0]?._id;
          if (serviceDocId) {
            payload.examination_id = serviceDocId;
            const res = await updateService(payload as any).unwrap();
            return res;
          }
        }
        const res = await addServiceToExam({
          examination_id: selectedExaminationId,
          duration: serviceDuration,
          items: itemsToSave as any,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(`${services.length} ${t('prescription:servicesSaved')}`);
        setServices([]);
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('prescription:servicesSaveError')
        );
      },
    });
  };

  const startEditPrescription = (
    prescription: any,
    prescriptionDocId: string
  ) => {
    setEditingPrescriptionId(prescription._id);
    setEditingPrescriptionDocId(prescriptionDocId);
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
      addons: prescription.addons || '',
    });
    setEditMedicationSearch('');
  };

  const cancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    setEditingPrescriptionDocId(null);
    setEditPrescriptionForm({
      medication_id: '',
      frequency: '',
      duration: '',
      instructions: '',
      addons: '',
    });
    setEditMedicationSearch('');
  };

  const handleUpdatePrescription = async () => {
    if (!editingPrescriptionId || !editingPrescriptionDocId) {
      toast.error(t('prescription:prescriptionDataNotFound'));
      return;
    }

    if (!editPrescriptionForm.medication_id.trim()) {
      toast.error(t('prescription:selectMedicationError'));
      return;
    }
    if (
      !editPrescriptionForm.frequency ||
      parseInt(editPrescriptionForm.frequency) <= 0
    ) {
      toast.error(t('prescription:frequencyError'));
      return;
    }
    if (
      !editPrescriptionForm.duration ||
      parseInt(editPrescriptionForm.duration) <= 0
    ) {
      toast.error(t('prescription:durationError'));
      return;
    }

    await handleRequest({
      request: async () => {
        // Get all existing items from prescription
        const existingItems =
          examinationData?.data?.prescription?.items?.map((item: any) => ({
            _id: item._id,
            medication_id:
              typeof item.medication_id === 'object'
                ? item.medication_id._id
                : item.medication_id,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || '',
            addons: item.addons || '',
          })) || [];

        // Find and replace the item being edited
        const updatedItems = existingItems.map((item: any) => {
          if (item._id === editingPrescriptionId) {
            // Replace with updated item
            return {
              _id: editingPrescriptionId,
              medication_id: editPrescriptionForm.medication_id,
              frequency: parseInt(editPrescriptionForm.frequency),
              duration: parseInt(editPrescriptionForm.duration),
              instructions: editPrescriptionForm.instructions,
              addons: editPrescriptionForm.addons || '',
            };
          }
          return item;
        });

        const res = await updatePrescription({
          id: editingPrescriptionDocId, // Document ID
          body: {
            items: updatedItems, // Send all items (existing + updated)
          },
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('prescription:prescriptionUpdated'));
        setEditPrescriptionForm({
          medication_id: '',
          frequency: '',
          duration: '',
          instructions: '',
          addons: '',
        });
        setEditMedicationSearch('');
        setEditingPrescriptionId(null);
        setEditingPrescriptionDocId(null);
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('prescription:prescriptionUpdateError')
        );
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
                {t('prescription:loadingData')}
              </p>
            </div>
          </div>
        )}

        {/* Examination Selection */}
        {!isLoading && !selectedExaminationId ? (
          <Card className='mb-4 sm:mb-6'>
            <CardHeader>
              <CardTitle>{t('prescription:selectExamination')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder={t('prescription:searchPlaceholder')}
                    value={examinationSearch}
                    onChange={(e) => setExaminationSearch(e.target.value)}
                    className='pl-9 h-10 sm:h-12 text-sm sm:text-base'
                  />
                </div>
                <Card>
                  <div
                    className='max-h-[400px] overflow-auto'
                    onScroll={handleScroll}
                  >
                    {isLoadingExaminations && examinations.length === 0 ? (
                      <div className='p-6 text-center text-sm text-muted-foreground'>
                        <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                        {t('prescription:loading')}
                      </div>
                    ) : examinations.length === 0 ? (
                      <div className='p-6 text-center text-sm text-muted-foreground'>
                        {t('prescription:noActiveExams')}
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('prescription:patient')}</TableHead>
                            <TableHead>{t('prescription:doctor')}</TableHead>
                            <TableHead>{t('prescription:date')}</TableHead>
                            <TableHead>{t('prescription:complaint')}</TableHead>
                            <TableHead className='text-right'>
                              {t('prescription:action')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {examinations
                            .filter((exam: any) => {
                              if (!examinationSearch.trim()) return true;
                              const query = examinationSearch.toLowerCase();
                              return (
                                exam.patient_id?.fullname
                                  ?.toLowerCase()
                                  .includes(query) ||
                                exam.doctor_id?.fullname
                                  ?.toLowerCase()
                                  .includes(query) ||
                                exam._id?.toLowerCase().includes(query) ||
                                exam.complaints?.toLowerCase().includes(query)
                              );
                            })
                            .map((exam: any) => (
                              <TableRow
                                key={exam._id}
                                className={`cursor-pointer hover:bg-accent ${
                                  selectedExaminationId === exam._id
                                    ? 'bg-primary/10'
                                    : ''
                                }`}
                                onClick={() =>
                                  setSelectedExaminationId(exam._id)
                                }
                              >
                                <TableCell className='font-medium'>
                                  {exam.patient_id?.fullname ||
                                    t('prescription:unknown')}
                                </TableCell>
                                <TableCell>
                                  {exam.doctor_id?.fullname ||
                                    t('prescription:unknown')}
                                </TableCell>
                                <TableCell>
                                  {exam.created_at
                                    ? new Date(
                                        exam.created_at
                                      ).toLocaleDateString('uz-UZ')
                                    : '-'}
                                </TableCell>
                                <TableCell className='max-w-[200px] truncate text-xs'>
                                  {exam.complaints?.slice(0, 50) ||
                                    t('prescription:noComplaint')}
                                  {exam.complaints?.length > 50 ? '...' : ''}
                                </TableCell>
                                <TableCell className='text-right'>
                                  <Button
                                    size='sm'
                                    variant={
                                      selectedExaminationId === exam._id
                                        ? 'default'
                                        : 'outline'
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedExaminationId(exam._id);
                                    }}
                                  >
                                    {selectedExaminationId === exam._id
                                      ? t('prescription:selected')
                                      : t('prescription:select')}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                    {isLoadingMore && (
                      <div className='p-4 text-center text-sm text-muted-foreground'>
                        <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                        {t('prescription:loading')}
                      </div>
                    )}
                    {!hasMore && examinations.length > 0 && (
                      <div className='p-2 text-center text-xs text-muted-foreground'>
                        {t('prescription:allExamsLoaded')}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
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
                          {t('patientName')}
                        </Label>
                        <p className='font-semibold text-sm sm:text-base break-words'>
                          {patient?.fullname || t('noData')}
                        </p>
                      </div>
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          {t('birthDate')}
                        </Label>
                        <p className='font-semibold text-sm sm:text-base'>
                          {patient?.date_of_birth ? (
                            <>
                              {new Date(
                                patient.date_of_birth
                              ).toLocaleDateString('uz-UZ')}{' '}
                              <span className='text-muted-foreground'>
                                ({calculateAge(patient.date_of_birth)}{' '}
                                {t('yearsOld')})
                              </span>
                            </>
                          ) : (
                            t('noData')
                          )}
                        </p>
                      </div>
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          {t('phone')}
                        </Label>
                        <p className='font-semibold text-sm sm:text-base'>
                          {patient?.phone || t('noData')}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={clearSelection}
                        className='absolute right-2 top-2 border border-red-500'
                      >
                        <X className='h-2 w-2 scale-125 text-red-500' />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card className='mb-3'>
                  <CardHeader className='p-5 max-sm:pb-2'>
                    <CardTitle className='text-base sm:text-lg'>
                      {t('prescription:examInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-5 pt-0'>
                    <div className='flex sm:justify-between items-center flex-col sm:flex-row max-sm:items-start'>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          {t('prescription:doctor')}
                        </Label>
                        <p className='font-semibold text-sm sm:text-base break-words'>
                          {examinationData.data.doctor_id?.fullname ||
                            t('prescription:unknown')}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          {t('prescription:complaint')}
                        </Label>
                        <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                          {examinationData.data.complaints ||
                            t('prescription:noData')}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <Label className='text-xs sm:text-sm text-muted-foreground'>
                          {t('prescription:recommendation')}
                        </Label>
                        <p className='text-sm sm:text-base whitespace-pre-wrap break-words'>
                          {examinationData.data?.description ||
                            t('prescription:noData')}
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
                {t('prescription:allergyWarning', {
                  allergies: patient.allergies.join(', '),
                })}
              </AlertDescription>
            </Alert>
          )}

        {/* Template Selection */}
        {!isLoading && selectedExaminationId && patient && (
          <Card className='mb-4 sm:mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                <svg
                  className='w-5 h-5 text-primary'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                {t('prescription:selectTemplates')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Prescription Template */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('prescription:prescriptionTemplate')}
                    </Label>
                  </div>
                  <div className='relative'>
                    <ComboBox
                      value={selectedPrescriptionTemplate}
                      onValueChange={handlePrescriptionTemplateSelect}
                      placeholder={t('prescription:selectPrescriptionTemplate')}
                      searchPlaceholder={t('prescription:searchTemplate')}
                      emptyText={t('prescription:noTemplatesFound')}
                      loadingText={t('prescription:loading')}
                      searchValue={prescriptionTemplateSearch}
                      onSearchChange={setPrescriptionTemplateSearch}
                      options={
                        prescriptionTemplatesData?.data?.map((template: any) => ({
                          value: template._id,
                          label: template.name,
                          sublabel: `${template.items?.length || 0} ${t(
                            'prescription:medications'
                          )}`,
                        })) || []
                      }
                      isLoading={isFetchingPrescriptionTemplates}
                      hasMore={
                        prescriptionTemplatesData
                          ? prescriptionTemplatePage <
                            prescriptionTemplatesData.totalPages
                          : false
                      }
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        const scrollPercentage =
                          (target.scrollTop /
                            (target.scrollHeight - target.clientHeight)) *
                          100;
                        if (
                          scrollPercentage > 80 &&
                          !isFetchingPrescriptionTemplates &&
                          prescriptionTemplatesData &&
                          prescriptionTemplatePage <
                            prescriptionTemplatesData.totalPages
                        ) {
                          setPrescriptionTemplatePage((prev) => prev + 1);
                        }
                      }}
                    />
                    {selectedPrescriptionTemplate && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setSelectedPrescriptionTemplate('')}
                        className='absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Service Template */}
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                    <Label className='text-sm font-medium text-muted-foreground'>
                      {t('prescription:serviceTemplate')}
                    </Label>
                  </div>
                  <div className='relative'>
                    <ComboBox
                      value={selectedServiceTemplate}
                      onValueChange={handleServiceTemplateSelect}
                      placeholder={t('prescription:selectServiceTemplate')}
                      searchPlaceholder={t('prescription:searchTemplate')}
                      emptyText={t('prescription:noTemplatesFound')}
                      loadingText={t('prescription:loading')}
                      searchValue={serviceTemplateSearch}
                      onSearchChange={setServiceTemplateSearch}
                      options={
                        serviceTemplatesData?.data?.map((template: any) => ({
                          value: template._id,
                          label: template.name,
                          sublabel: `${template.items?.length || 0} ${t(
                            'prescription:services'
                          )} • ${template.duration} ${t('prescription:days')}`,
                        })) || []
                      }
                      isLoading={isFetchingServiceTemplates}
                      hasMore={
                        serviceTemplatesData
                          ? serviceTemplatePage < serviceTemplatesData.totalPages
                          : false
                      }
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        const scrollPercentage =
                          (target.scrollTop /
                            (target.scrollHeight - target.clientHeight)) *
                          100;
                        if (
                          scrollPercentage > 80 &&
                          !isFetchingServiceTemplates &&
                          serviceTemplatesData &&
                          serviceTemplatePage < serviceTemplatesData.totalPages
                        ) {
                          setServiceTemplatePage((prev) => prev + 1);
                        }
                      }}
                    />
                    {selectedServiceTemplate && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setSelectedServiceTemplate('')}
                        className='absolute right-10 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors'
                      >
                        <X className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show forms only when examination is selected */}
        {!isLoading && selectedExaminationId && patient && (
          <>
            {/* Drug Search */}

            {/* Medications List */}
            <Card className='mb-4 sm:mb-6'>
              <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 space-y-2 sm:space-y-0'>
                <CardTitle className='text-base sm:text-lg md:text-xl'>
                  {t('prescription:medicationsList')}
                </CardTitle>
                <Button
                  onClick={addMedication}
                  size='sm'
                  className='w-full sm:w-auto text-xs sm:text-sm'
                >
                  <Plus className='mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  {t('prescription:addMedicationBtn')}
                </Button>
              </CardHeader>
              <CardContent className='space-y-3 sm:space-y-4'>
                {/* Existing Prescriptions - Show first */}
                {examinationData?.data?.prescription?.items &&
                  examinationData.data.prescription.items.length > 0 && (
                    <>
                      <div className='text-xs font-medium text-muted-foreground mb-2'>
                        {t('prescription:existingPrescriptions')} (
                        {examinationData.data.prescription.items.length}{' '}
                        {t('prescription:count')})
                      </div>
                      {examinationData.data.prescription.items.map(
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
                                        {t('prescription:medicationNameLabel')}{' '}
                                        *
                                      </Label>
                                      <Select
                                        value={
                                          editPrescriptionForm.medication_id
                                        }
                                        onOpenChange={(open) => {
                                          setIsDropdownOpen(open);
                                          if (open) {
                                            setEditMedicationSearch('');
                                            setMedicationPage(1);
                                            setMedicationOptions([]);
                                            setHasMoreMedications(true);
                                          }
                                        }}
                                        onValueChange={(value) =>
                                          setEditPrescriptionForm({
                                            ...editPrescriptionForm,
                                            medication_id: value,
                                          })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue
                                            placeholder={t('selectMedication')}
                                          />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <div className='p-2 sticky top-0 bg-background z-20 border-b'>
                                            <Input
                                              placeholder={t(
                                                'prescription:search'
                                              )}
                                              value={editMedicationSearch}
                                              onChange={(e) =>
                                                setEditMedicationSearch(
                                                  e.target.value
                                                )
                                              }
                                              className='mb-2'
                                            />
                                          </div>
                                          <div
                                            className='max-h-64 overflow-auto'
                                            onScroll={(e) => {
                                              const target =
                                                e.target as HTMLDivElement;
                                              const atBottom =
                                                target.scrollHeight -
                                                  target.scrollTop <=
                                                target.clientHeight + 10;
                                              if (
                                                atBottom &&
                                                hasMoreMedications &&
                                                !isLoadingMoreMedications &&
                                                !isFetchingMedications
                                              ) {
                                                setIsLoadingMoreMedications(
                                                  true
                                                );
                                                setMedicationPage(
                                                  (prev) => prev + 1
                                                );
                                              }
                                            }}
                                          >
                                            {isFetchingMedications &&
                                            medicationOptions.length === 0 ? (
                                              <div className='p-4 text-center text-sm text-muted-foreground'>
                                                <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                                                {t('prescription:loading')}
                                              </div>
                                            ) : medicationOptions.length > 0 ? (
                                              medicationOptions.map(
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
                                                {t(
                                                  'prescription:medicationNotFound'
                                                )}
                                              </div>
                                            )}
                                            {isFetchingMedications &&
                                              medicationOptions.length > 0 && (
                                                <div className='p-2 text-center text-xs text-muted-foreground'>
                                                  <Loader2 className='h-3 w-3 animate-spin inline-block mr-2' />
                                                  {t('prescription:loading')}
                                                </div>
                                              )}
                                            {!hasMoreMedications &&
                                              medicationOptions.length > 0 && (
                                                <div className='p-2 text-center text-[11px] text-muted-foreground'>
                                                  {t(
                                                    'prescription:allExamsLoaded'
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className='space-y-2'>
                                      <Label className='text-xs sm:text-sm'>
                                        {t('prescription:durationDays')} *
                                      </Label>
                                      <Input
                                        type='number'
                                        min='0'
                                        placeholder={t(
                                          'prescription:treatmentDuration'
                                        )}
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
                                        {t('prescription:timesPerDay')} *
                                      </Label>
                                      <Input
                                        type='number'
                                        min='0'
                                        placeholder={t('prescription:intake')}
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
                                      {t('prescription:additionalInstructions')}
                                    </Label>
                                    <Textarea
                                      placeholder={t(
                                        'prescription:enterAdditionalInstructions'
                                      )}
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
                                  <div className='space-y-2'>
                                    <Label className='text-xs sm:text-sm'>
                                      {t('prescription:additional')}
                                    </Label>
                                    <Input
                                      placeholder={t(
                                        'prescription:additionalInfo'
                                      )}
                                      value={editPrescriptionForm.addons}
                                      onChange={(e) =>
                                        setEditPrescriptionForm({
                                          ...editPrescriptionForm,
                                          addons: e.target.value,
                                        })
                                      }
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
                                      {t('prescription:cancelBtn')}
                                    </Button>
                                    <Button
                                      size='sm'
                                      onClick={handleUpdatePrescription}
                                      disabled={isUpdating}
                                    >
                                      {isUpdating
                                        ? t('prescription:saving')
                                        : t('prescription:save')}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // View mode
                                <>
                                  <div className='flex items-center justify-between mb-2'>
                                    <span className='text-xs sm:text-sm font-medium text-primary'>
                                      {t('prescription:medicationNum')} #
                                      {index + 1}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                      <span className='text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'>
                                        {t('prescription:saved')}
                                      </span>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          startEditPrescription(
                                            prescription,
                                            examinationData.data.prescription
                                              ._id
                                          )
                                        }
                                        disabled={
                                          editingPrescriptionId !== null
                                        }
                                        className='h-7 w-7 p-0'
                                      >
                                        <Edit className='h-3.5 w-3.5' />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t(
                                          'prescription:medicationNameViewLabel'
                                        )}
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {typeof prescription.medication_id ===
                                        'object'
                                          ? prescription.medication_id?.name
                                          : t('prescription:unknownService')}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t('prescription:intakeLabel')}
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {prescription.frequency}{' '}
                                        {t('prescription:timesDay')}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t('prescription:durationLabel')}
                                      </Label>
                                      <p className='text-sm font-medium'>
                                        {prescription.duration}{' '}
                                        {t('prescription:day')}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t('prescription:instructionsLabel')}
                                      </Label>
                                      <p className='text-sm'>
                                        {prescription.instructions || '-'}
                                      </p>
                                    </div>
                                    {prescription.addons && (
                                      <div>
                                        <Label className='text-xs text-muted-foreground'>
                                          {t('prescription:additionalLabel')}
                                        </Label>
                                        <p className='text-sm'>
                                          {prescription.addons}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        )
                      )}
                    </>
                  )}

                {/* New Medications - Show at the bottom */}
                {medications.length > 0 && (
                  <>
                    <div className='text-xs font-medium text-muted-foreground mb-2 mt-4'>
                      {t('prescription:newMedications')}
                    </div>
                    {medications.map((med, index) => (
                      <Card
                        key={med.id}
                        className='border border-border shadow-sm'
                      >
                        <CardContent className='pt-3 sm:pt-4'>
                          <div className='flex items-center justify-between mb-3'>
                            <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
                              {t('prescription:medicationNum')} #{index + 1}
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
                                  {t('prescription:medication')}{' '}
                                  <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                  value={med.medication_id}
                                  onOpenChange={(open) => {
                                    setIsDropdownOpen(open);
                                    if (open) {
                                      // reset paging when opening to ensure fresh list
                                      setMedicationSearch('');
                                      setMedicationPage(1);
                                      setHasMoreMedications(true);
                                      // Don't clear options immediately - let the effect handle it
                                      setMedicationOptions([]);
                                      setHasMoreMedications(true);
                                    }
                                  }}
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
                                    <SelectValue
                                      placeholder={t(
                                        'prescription:selectMedicationPlaceholder'
                                      )}
                                    />
                                  </SelectTrigger>
                                  <SelectContent className='p-0'>
                                    <div className='p-2 sticky top-0 bg-background z-20 border-b'>
                                      <Input
                                        placeholder={t(
                                          'prescription:searchMedicationPlaceholder'
                                        )}
                                        value={medicationSearch}
                                        onChange={(e) => {
                                          setMedicationSearch(e.target.value);
                                        }}
                                        className='text-sm'
                                      />
                                    </div>
                                    <div
                                      className='max-h-64 overflow-auto'
                                      onScroll={(e) => {
                                        const target =
                                          e.target as HTMLDivElement;
                                        const atBottom =
                                          target.scrollHeight -
                                            target.scrollTop <=
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
                                    >
                                      {isFetchingMedications &&
                                      medicationOptions.length === 0 ? (
                                        <div className='p-4 text-center text-sm text-muted-foreground'>
                                          <Loader2 className='h-4 w-4 animate-spin mx-auto mb-2' />
                                          {t('prescription:loading')}
                                        </div>
                                      ) : medicationOptions.length > 0 ? (
                                        medicationOptions.map(
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
                                          {t('prescription:medicationNotFound')}
                                        </div>
                                      )}
                                      {isFetchingMedications &&
                                        medicationOptions.length > 0 && (
                                          <div className='p-2 text-center text-xs text-muted-foreground'>
                                            <Loader2 className='h-3 w-3 animate-spin inline-block mr-2' />
                                            {t('prescription:loading')}
                                          </div>
                                        )}
                                      {!hasMoreMedications &&
                                        medicationOptions.length > 0 && (
                                          <div className='p-2 text-center text-[11px] text-muted-foreground'>
                                            {t('prescription:allExamsLoaded')}
                                          </div>
                                        )}
                                    </div>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className='text-xs sm:text-sm'>
                                  {t('prescription:additional')}
                                </Label>
                                <Input
                                  placeholder={t('prescription:additionalInfo')}
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
                                  {t('prescription:durationDaysLabel')}{' '}
                                  <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                  type='number'
                                  min='0'
                                  placeholder={t(
                                    'prescription:durationPlaceholderShort'
                                  )}
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
                                  {t('prescription:timesPerDayLabel')}{' '}
                                  <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                  type='number'
                                  min='0'
                                  placeholder={t(
                                    'prescription:timesPlaceholder'
                                  )}
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
                                  {t(
                                    'prescription:additionalInstructionsLabel'
                                  )}{' '}
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
                                  placeholder={t('prescription:afterMeal')}
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
                    ))}
                  </>
                )}

                {/* Dorilarni saqlash tugmasi */}
                {medications.length > 0 && (
                  <div className='flex justify-end mt-4'>
                    <Button
                      onClick={handleSaveMedications}
                      disabled={isCreating || !selectedExaminationId}
                      className='text-sm'
                    >
                      {isCreating
                        ? t('prescription:saving')
                        : t('prescription:saveMedicationsBtn')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services List */}
            <div className='space-y-3 border rounded-lg p-4 bg-muted/30'>
              <div className='flex items-center justify-between'>
                <Label className='flex items-center gap-2'>
                  <Activity className='w-4 h-4 text-primary' />
                  {t('prescription:servicesLabel')}
                </Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    // If no duration set, use max from existing services or default 7
                    if (serviceDuration === 0 || !serviceDuration) {
                      let maxDuration = 7;
                      if (patientServices.length > 0) {
                        const durations = patientServices
                          .flatMap(
                            (doc: any) =>
                              doc.items?.map(
                                (item: any) =>
                                  item.duration || item.days?.length || 0
                              ) || []
                          )
                          .filter((d: number) => d > 0);
                        if (durations.length > 0) {
                          maxDuration = Math.max(...durations);
                        }
                      }
                      setServiceDuration(maxDuration);
                    }
                    // Ensure start date is set from existing services if available
                    if (patientServices.length > 0) {
                      const firstDate = patientServices
                        .flatMap((doc: any) => doc.items || [])
                        .flatMap((item: any) => item.days || [])
                        .map((day: any) => day.date)
                        .filter(
                          (date: any) => date !== null && date !== undefined
                        )
                        .sort((a: any, b: any) => {
                          const dateA = new Date(a).getTime();
                          const dateB = new Date(b).getTime();
                          return dateA - dateB;
                        })[0];
                      if (firstDate) {
                        setServiceStartDate(new Date(firstDate));
                      }
                    }
                    addService();
                  }}
                  className='gap-1'
                >
                  <Plus className='w-4 h-4' />
                  {t('prescription:addServiceBtn')}
                </Button>
              </div>

              {/* Unified Services Table - Show if services exist or adding */}
              {(patientServices.length > 0 || services.length > 0) && (
                <div className='space-y-3'>
                  {/* Common Settings */}
                  <div className='flex items-end gap-2 p-2 bg-muted/30 rounded-lg border'>
                    <div className='w-28'>
                      <Label className='text-xs font-medium'>
                        {t('prescription:durationDaysCommon')}
                      </Label>
                      <Input
                        type='number'
                        min={0}
                        max={30}
                        value={serviceDuration === 0 ? '' : serviceDuration}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (inputValue === '') {
                            setServiceDuration(0);
                            setServices(
                              services.map((srv) => ({
                                ...srv,
                                markedDays: [],
                              }))
                            );
                            return;
                          }
                          const val = parseInt(inputValue) || 0;
                          if (val >= 0 && val <= 30) {
                            setServiceDuration(val);

                            // Update all services' marked days based on new duration
                            setServices(
                              services.map((srv) => {
                                const currentMarked = srv.markedDays || [];

                                if (val === 0) {
                                  return { ...srv, markedDays: [] };
                                }

                                // If all previous days were marked (1, 2, 3, ..., max)
                                // then mark all new days too when duration increases
                                if (currentMarked.length > 0) {
                                  const sortedMarked = [...currentMarked].sort(
                                    (a, b) => a - b
                                  );
                                  const maxMarked =
                                    sortedMarked[sortedMarked.length - 1];
                                  const isAllDaysMarked =
                                    sortedMarked.every(
                                      (day, idx) => day === idx + 1
                                    ) && sortedMarked.length === maxMarked;

                                  if (isAllDaysMarked && val > maxMarked) {
                                    // All previous days were marked consecutively, mark all new days too
                                    const allDays = Array.from(
                                      { length: val },
                                      (_, i) => i + 1
                                    );
                                    return { ...srv, markedDays: allDays };
                                  }

                                  // If pattern is every other day, extend pattern to new duration
                                  const sortedMarkedForPattern = [
                                    ...currentMarked,
                                  ].sort((a, b) => a - b);
                                  const isEveryOtherDay =
                                    sortedMarkedForPattern.every(
                                      (day, idx) =>
                                        idx === 0 ||
                                        day ===
                                          sortedMarkedForPattern[idx - 1] + 2
                                    );
                                  if (
                                    isEveryOtherDay &&
                                    sortedMarkedForPattern[0] === 1 &&
                                    val >
                                      sortedMarkedForPattern[
                                        sortedMarkedForPattern.length - 1
                                      ]
                                  ) {
                                    // Extend pattern for new days
                                    const newMarked = Array.from(
                                      { length: val },
                                      (_, i) => i + 1
                                    ).filter((day) => day % 2 === 1);
                                    return { ...srv, markedDays: newMarked };
                                  }
                                }

                                // Keep only marked days that are within new duration
                                const adjustedMarked = currentMarked.filter(
                                  (day) => day <= val
                                );

                                // If no days were marked before, mark all days by default
                                if (adjustedMarked.length === 0 && val > 0) {
                                  const allDays = Array.from(
                                    { length: val },
                                    (_, i) => i + 1
                                  );
                                  return { ...srv, markedDays: allDays };
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
                        {t('prescription:startDateLabel')}
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
                          {t('prescription:everyDayBtn')}
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
                          {t('prescription:everyOtherDayBtn')}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Services Table */}
                  <div className='overflow-x-auto max-h-[400px] scroll-auto'>
                    <table className='w-full border-collapse border text-xs'>
                      <thead className='sticky top-0 bg-background z-10'>
                        {(() => {
                          // Determine the number of days to show in header
                          // If adding new services, use serviceDuration
                          // If only existing services, find max duration
                          let daysToShow = 8; // Default to 8

                          if (services.length > 0) {
                            // If adding new services, use serviceDuration (minimum 1)
                            // Also consider existing services' duration
                            let maxExistingDuration = 0;
                            if (patientServices.length > 0) {
                              maxExistingDuration = patientServices.reduce(
                                (max: number, doc: any) => {
                                  const docMax =
                                    doc.items?.reduce(
                                      (itemMax: number, item: any) => {
                                        const itemDuration =
                                          item.duration ||
                                          item.days?.length ||
                                          0;
                                        return Math.max(itemMax, itemDuration);
                                      },
                                      0
                                    ) || 0;
                                  return Math.max(max, docMax);
                                },
                                0
                              );
                            }
                            daysToShow = Math.max(
                              serviceDuration,
                              maxExistingDuration,
                              1
                            );
                          } else if (patientServices.length > 0) {
                            // If only existing services, find max duration
                            const maxDuration = patientServices.reduce(
                              (max: number, doc: any) => {
                                const docMax =
                                  doc.items?.reduce(
                                    (itemMax: number, item: any) => {
                                      const itemDuration =
                                        item.duration || item.days?.length || 0;
                                      return Math.max(itemMax, itemDuration);
                                    },
                                    0
                                  ) || 0;
                                return Math.max(max, docMax);
                              },
                              0
                            );
                            daysToShow = maxDuration > 0 ? maxDuration : 8;
                          }

                          // Split days into chunks of 8 for multiple rows
                          const daysPerRow = 8;
                          const headerChunks: number[][] = [];
                          for (let i = 0; i < daysToShow; i += daysPerRow) {
                            const chunk = [];
                            for (
                              let j = i;
                              j < Math.min(i + daysPerRow, daysToShow);
                              j++
                            ) {
                              chunk.push(j + 1);
                            }
                            headerChunks.push(chunk);
                          }

                          // If no chunks, create at least one empty chunk
                          if (headerChunks.length === 0) {
                            headerChunks.push([]);
                          }

                          return headerChunks.map((chunk, chunkIndex) => (
                            <tr
                              key={`header-${chunkIndex}`}
                              className='bg-muted/50'
                            >
                              {chunkIndex === 0 && (
                                <th
                                  className='border px-2 py-1.5 text-left font-semibold min-w-[150px] sticky left-0 bg-muted/50 z-20'
                                  rowSpan={headerChunks.length}
                                >
                                  {t('prescription:serviceHeader')}
                                </th>
                              )}
                              {chunk.map((dayNum) => (
                                <th
                                  key={dayNum}
                                  className='border px-1 py-1.5 text-center min-w-[70px]'
                                ></th>
                              ))}
                              {chunk.length < daysPerRow &&
                                Array.from(
                                  { length: daysPerRow - chunk.length },
                                  (_, i) => (
                                    <th
                                      key={`empty-${i}`}
                                      className='border px-1 py-1.5'
                                    ></th>
                                  )
                                )}
                              {chunkIndex === 0 && (
                                <th
                                  className='border px-1 py-1.5 text-center font-semibold w-12 sticky right-0 bg-muted/50 z-20'
                                  rowSpan={headerChunks.length}
                                >
                                  {t('prescription:actionsHeader')}
                                </th>
                              )}
                            </tr>
                          ));
                        })()}
                      </thead>
                      <tbody>
                        {/* Existing services - show in table */}
                        {patientServices.map((serviceDoc: any) =>
                          serviceDoc.items?.map((service: any) => {
                            const serviceDays = service.days || [];
                            const originalDuration =
                              service.duration || serviceDays.length || 0;

                            // If new services are being added, use the maximum of serviceDuration and original duration
                            const totalDays =
                              services.length > 0
                                ? Math.max(serviceDuration, originalDuration)
                                : originalDuration;

                            // Split days into chunks of 8
                            const dayChunks: Array<Array<any>> = [];
                            for (let i = 0; i < totalDays; i += 8) {
                              const chunk = [];
                              for (
                                let j = i;
                                j < Math.min(i + 8, totalDays);
                                j++
                              ) {
                                // If day exists in original data, use it, otherwise create empty day
                                const dayData = serviceDays[j] || null;
                                chunk.push({
                                  dayNumber: j + 1,
                                  dayData: dayData,
                                });
                              }
                              dayChunks.push(chunk);
                            }

                            if (dayChunks.length === 0) {
                              dayChunks.push([]);
                            }

                            return dayChunks.map((chunk, chunkIndex) => (
                              <tr
                                key={`${service._id}-chunk-${chunkIndex}`}
                                className='hover:bg-muted/30'
                              >
                                {chunkIndex === 0 ? (
                                  <td
                                    className='border px-3 py-2 font-medium sticky left-0 bg-background z-10'
                                    rowSpan={dayChunks.length}
                                  >
                                    {service.service_type_id?.name ||
                                      t('prescription:unknownService')}
                                  </td>
                                ) : null}
                                {chunk.map((dayItem, idx) => (
                                  <td
                                    key={idx}
                                    className='border px-1 py-1 text-center group relative min-w-[70px]'
                                  >
                                    <span className='font-bold text-xs block'>
                                      {dayItem.dayNumber}-
                                      {t('prescription:dayNum')}
                                    </span>
                                    {dayItem.dayData?.date ? (
                                      <div className='flex items-center justify-center'>
                                        <span className='text-xs text-primary'>
                                          {format(
                                            dayItem.dayData.date,
                                            'dd/MM'
                                          )}
                                        </span>
                                        <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                          {new Date(
                                            dayItem.dayData.date
                                          ).toLocaleDateString('uz-UZ')}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className='text-muted-foreground text-xs'>
                                        —
                                      </span>
                                    )}
                                  </td>
                                ))}
                                {chunk.length < 8 &&
                                  Array.from(
                                    { length: 8 - chunk.length },
                                    (_, i) => (
                                      <td
                                        key={`empty-${i}`}
                                        className='border px-1 py-1'
                                      ></td>
                                    )
                                  )}
                                {chunkIndex === 0 ? (
                                  <td
                                    className='border px-1 py-1 text-center sticky right-0 bg-background z-10'
                                    rowSpan={dayChunks.length}
                                  ></td>
                                ) : null}
                              </tr>
                            ));
                          })
                        )}
                        {/* New services being added */}
                        {services.map((srv) => {
                          const days = generateDays(
                            Math.max(serviceDuration, 1),
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
                                        onOpenChange={(open) => {
                                          if (open) {
                                            // Clear search when opening this specific select
                                            setServiceSearch((prev) => ({
                                              ...prev,
                                              [srv.id]: '',
                                            }));
                                            setTimeout(() => {
                                              const inputRef =
                                                serviceSearchRefs.current[
                                                  srv.id
                                                ];
                                              if (inputRef) {
                                                inputRef.focus();
                                              }
                                            }, 0);
                                          } else {
                                            // Clear search when closing
                                            setServiceSearch((prev) => {
                                              const newState = { ...prev };
                                              delete newState[srv.id];
                                              return newState;
                                            });
                                          }
                                        }}
                                      >
                                        <SelectTrigger className='h-7 text-xs border-0 shadow-none min-w-[140px]'>
                                          <SelectValue
                                            placeholder={t(
                                              'prescription:selectPlaceholder'
                                            )}
                                          />
                                        </SelectTrigger>
                                        <SelectContent
                                          onCloseAutoFocus={(e) => {
                                            e.preventDefault();
                                          }}
                                          onEscapeKeyDown={(e) => {
                                            // Allow escape to close, but prevent default focus behavior
                                          }}
                                        >
                                          <div className='p-2'>
                                            <Input
                                              ref={(el) => {
                                                if (el) {
                                                  serviceSearchRefs.current[
                                                    srv.id
                                                  ] = el;
                                                } else {
                                                  delete serviceSearchRefs
                                                    .current[srv.id];
                                                }
                                              }}
                                              placeholder={t(
                                                'prescription:search'
                                              )}
                                              value={
                                                serviceSearch[srv.id] || ''
                                              }
                                              onChange={(e) => {
                                                const newValue = e.target.value;
                                                setServiceSearch((prev) => ({
                                                  ...prev,
                                                  [srv.id]: newValue,
                                                }));
                                                // Maintain focus after state update
                                                requestAnimationFrame(() => {
                                                  e.target.focus();
                                                });
                                              }}
                                              onKeyDown={(e) => {
                                                e.stopPropagation();
                                                // Prevent Enter from closing select
                                                if (e.key === 'Enter') {
                                                  e.preventDefault();
                                                }
                                              }}
                                              autoFocus
                                              className='text-sm mb-2'
                                            />
                                          </div>
                                          {(() => {
                                            const searchQuery = (
                                              serviceSearch[srv.id] || ''
                                            )
                                              .toLowerCase()
                                              .trim();
                                            // Get list of already selected service IDs (excluding current service)
                                            const selectedServiceIds = services
                                              .filter(
                                                (s) =>
                                                  s.service_id &&
                                                  s.id !== srv.id
                                              )
                                              .map((s) => s.service_id);

                                            const filteredServices = searchQuery
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

                                            return filteredServices.length >
                                              0 ? (
                                              filteredServices.map((s: any) => (
                                                <SelectItem
                                                  key={s._id}
                                                  value={s._id}
                                                >
                                                  {s.name} -{' '}
                                                  {new Intl.NumberFormat(
                                                    'uz-UZ'
                                                  ).format(s.price)}{' '}
                                                  {t('prescription:sum')}
                                                </SelectItem>
                                              ))
                                            ) : (
                                              <div className='px-2 py-4 text-xs text-muted-foreground text-center'>
                                                {t(
                                                  'prescription:serviceNotFound'
                                                )}
                                              </div>
                                            );
                                          })()}
                                          {isFetchingServices && (
                                            <div className='flex items-center justify-center py-2 text-xs text-muted-foreground'>
                                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                              {t('prescription:loading')}
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
                                          <div className='flex flex-col items-center justify-center'>
                                            <span className='text-[10px] text-muted-foreground font-bold'>
                                              {day.day}-
                                              {t('prescription:dayNum')}
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
                                              {day.day}-
                                              {t('prescription:dayNum')}:{' '}
                                              {new Date(
                                                day.date
                                              ).toLocaleDateString('uz-UZ')}
                                              {isMarked && ' ✓'}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className='flex flex-col items-center justify-center'>
                                            <span className='text-[10px] text-muted-foreground font-medium'>
                                              {day.day}-
                                              {t('prescription:dayNum')}
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
                                      className='border px-1 py-2 text-center sticky right-0 bg-background z-10 w-12'
                                      rowSpan={dayChunks.length}
                                    >
                                      <div className='flex flex-col items-center gap-1'>
                                        <div className='flex gap-1'>
                                          <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              markEveryDayForService(srv.id)
                                            }
                                            className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                            disabled={!srv.service_id}
                                            title={t(
                                              'prescription:everyDayTitle'
                                            )}
                                          >
                                            <CalendarDays className='w-3 h-3' />
                                          </Button>
                                          <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              markEveryOtherDayForService(
                                                srv.id
                                              )
                                            }
                                            className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                            disabled={!srv.service_id}
                                            title={t(
                                              'prescription:everyOtherDayTitle'
                                            )}
                                          >
                                            <Repeat className='w-3 h-3' />
                                          </Button>
                                        </div>
                                        <Button
                                          type='button'
                                          variant='ghost'
                                          size='sm'
                                          onClick={() => removeService(srv.id)}
                                          className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                          title={t('prescription:deleteTitle')}
                                        >
                                          <Trash2 className='w-3 h-3' />
                                        </Button>
                                      </div>
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

              {/* Xizmatlarni saqlash tugmasi */}
              {services.length > 0 && (
                <div className='flex justify-end mt-4'>
                  <Button
                    onClick={handleSaveServices}
                    disabled={isAddingService || !selectedExaminationId}
                    className='text-sm'
                  >
                    {isAddingService
                      ? t('prescription:saving')
                      : t('prescription:saveServicesBtn')}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Prescription;
