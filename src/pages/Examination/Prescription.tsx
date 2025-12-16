import {
  useAddServiceMutation,
  useGetAllExamsQuery,
  useGetManyServiceQuery,
  useGetOneExamQuery,
  useUpdateServiceMutation,
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
  const [updateService] = useUpdateServiceMutation();
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

  // Update serviceDuration based on existing services
  useEffect(() => {
    if (patientServices.length > 0 && patientServices[0]?.duration) {
      const existingDuration = patientServices[0].duration;
      // Only update if services array is empty (not adding new services)
      if (services.length === 0) {
        setServiceDuration(existingDuration);
      }
    } else if (patientServices.length === 0 && services.length === 0) {
      // Reset to default 7 if no existing services and no new services
      setServiceDuration(7);
    }
  }, [patientServices, services.length]);

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
    // Get duration from existing services if available, otherwise use serviceDuration
    const existingDuration =
      patientServices.length > 0 && patientServices[0]?.duration
        ? patientServices[0].duration
        : serviceDuration;

    // Update serviceDuration if it doesn't match existing services
    if (patientServices.length > 0 && existingDuration !== serviceDuration) {
      setServiceDuration(existingDuration);
    }

    // Mark all days by default
    const allDays = Array.from({ length: existingDuration }, (_, i) => i + 1);
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

  // Dorilarni alohida saqlash
  const handleSaveMedications = async () => {
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    if (medications.length === 0) {
      toast.error('Илтимос, камида битта дори қўшинг');
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
      toast.error('Илтимос, барча майдонларни тўлдиринг');
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
      toast.error(
        'Такрорланган дори. Ҳар бир дори фақат бир марта қўшилиши керак.'
      );
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
        toast.success(`${medications.length} та дори муваффақиятли сақланди`);
        setMedications([]);
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || `Дориларни сақлашда хатолик`);
      },
    });
  };

  // Xizmatlarni alohida saqlash
  const handleSaveServices = async () => {
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    if (services.length === 0) {
      toast.error('Илтимос, камида битта хизмат қўшинг');
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
      toast.error('Илтимос, хизмат муддатини киритинг');
      return;
    }
    if (!serviceStartDate) {
      toast.error('Илтимос, бошланиш санасини танланг');
      return;
    }

    if (hasErrors) {
      setFormErrors((prev) => ({ ...prev, services: srvErrors }));
      toast.error('Илтимос, барча майдонларни тўлдиринг');
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
      toast.error(
        'Такрорланган хизмат. Ҳар бир хизмат фақат бир марта қўшилиши керак.'
      );
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
    if (hasExistingServices) {
      const existingServiceDoc = patientServices[0]; // Use first service document
      if (existingServiceDoc && existingServiceDoc.items) {
        const existingItems = existingServiceDoc.items.map((item: any) => ({
          _id: item._id,
          service_type_id:
            typeof item.service_type_id === 'object'
              ? item.service_type_id._id
              : item.service_type_id,
          days: (item.days || []).map((day: any) => ({
            day: day.day,
            date: day.date
              ? typeof day.date === 'string'
                ? day.date
                : format(new Date(day.date), 'yyyy-MM-dd')
              : null,
          })),
          notes: item.notes || '',
        }));

        // Combine new items with existing items
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
        toast.success(`${services.length} та хизмат муваффақиятли сақланди`);
        setServices([]);
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || `Хизматларни сақлашда хатолик`);
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
      toast.error('Рецепт маълумотлари топилмади');
      return;
    }

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
        toast.success('Рецепт муваффақиятли янгиланди');
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
                {/* Existing Prescriptions - Show first */}
                {examinationData?.data?.prescription?.items &&
                  examinationData.data.prescription.items.length > 0 && (
                    <>
                      <div className='text-xs font-medium text-muted-foreground mb-2'>
                        Мавжуд рецептлар (
                        {examinationData.data.prescription.items.length} та)
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
                                  <div className='space-y-2'>
                                    <Label className='text-xs sm:text-sm'>
                                      Қўшимча
                                    </Label>
                                    <Input
                                      placeholder='Қўшимча маълумот...'
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
                                      Бекор
                                    </Button>
                                    <Button
                                      size='sm'
                                      onClick={handleUpdatePrescription}
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
                                    {prescription.addons && (
                                      <div>
                                        <Label className='text-xs text-muted-foreground'>
                                          Қўшимча
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
                      Янги дорилар
                    </div>
                    {medications.map((med, index) => (
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
                      {isCreating ? 'Сақланмоқда...' : 'Дориларни сақлаш'}
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
                  Хизматлар
                </Label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    // Get duration from existing services if available
                    const existingDuration =
                      patientServices.length > 0 && patientServices[0]?.duration
                        ? patientServices[0].duration
                        : 7;
                    setServiceDuration(existingDuration);
                    addService();
                  }}
                  className='gap-1'
                >
                  <Plus className='w-4 h-4' />
                  Хизмат қўшиш
                </Button>
              </div>

              {/* Unified Services Table - Show if services exist or adding */}
              {(patientServices.length > 0 || services.length > 0) && (
                <div className='space-y-3'>
                  {/* Common Settings */}
                  <div className='flex items-end gap-2 p-2 bg-muted/30 rounded-lg border'>
                    <div className='w-28'>
                      <Label className='text-xs font-medium'>
                        Муддат (кун)
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
                            return;
                          }
                          const val = parseInt(inputValue) || 0;
                          if (val >= 0 && val <= 30) {
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
                          {(() => {
                            // Determine the number of days to show in header
                            // If adding new services, use serviceDuration
                            // If only existing services, find max duration
                            let daysToShow = 8; // Default to 8

                            if (services.length > 0) {
                              // If adding new services, use serviceDuration (minimum 1)
                              daysToShow = Math.max(serviceDuration, 1);
                            } else if (patientServices.length > 0) {
                              // If only existing services, find max duration
                              const maxDuration = patientServices.reduce(
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
                              daysToShow = maxDuration > 0 ? maxDuration : 8;
                            }

                            // Show days based on duration, but limit to 8 per row
                            // If duration is more than 8, show 8 (first row), otherwise show exact duration
                            const columnsToShow = Math.min(daysToShow, 8);

                            return Array.from(
                              { length: columnsToShow },
                              (_, i) => (
                                <th
                                  key={i}
                                  className='border px-1 py-1.5 text-center min-w-[70px]'
                                ></th>
                              )
                            );
                          })()}
                          <th className='border px-1 py-1.5 text-center font-semibold w-10 sticky right-0 bg-muted/50 z-20'></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Existing services - show in table */}
                        {patientServices.map((serviceDoc: any) =>
                          serviceDoc.items?.map((service: any) => {
                            const serviceDays = service.days || [];
                            const totalDays =
                              service.duration || serviceDays.length || 0;

                            // Split days into chunks of 8
                            const dayChunks: Array<Array<any>> = [];
                            for (let i = 0; i < totalDays; i += 8) {
                              const chunk = [];
                              for (
                                let j = i;
                                j < Math.min(i + 8, totalDays);
                                j++
                              ) {
                                const dayData = serviceDays[j];
                                chunk.push({
                                  dayNumber: j + 1,
                                  dayData: dayData || null,
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
                                      'Номаълум'}
                                  </td>
                                ) : null}
                                {chunk.map((dayItem, idx) => (
                                  <td
                                    key={idx}
                                    className='border px-1 py-1 text-center group relative min-w-[70px]'
                                  >
                                    <span className='font-bold text-xs block'>
                                      {dayItem.dayNumber}-кун
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
                                          <div className='flex flex-col items-center justify-center'>
                                            <span className='text-[10px] text-muted-foreground font-bold'>
                                              {day.day}-кун
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
                                              {day.day}-кун:{' '}
                                              {new Date(
                                                day.date
                                              ).toLocaleDateString('uz-UZ')}
                                              {isMarked && ' ✓'}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className='flex flex-col items-center justify-center'>
                                            <span className='text-[10px] text-muted-foreground font-medium'>
                                              {day.day}-кун
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

              {/* Xizmatlarni saqlash tugmasi */}
              {services.length > 0 && (
                <div className='flex justify-end mt-4'>
                  <Button
                    onClick={handleSaveServices}
                    disabled={isAddingService || !selectedExaminationId}
                    className='text-sm'
                  >
                    {isAddingService ? 'Сақланмоқда...' : 'Хизматларни сақлаш'}
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
