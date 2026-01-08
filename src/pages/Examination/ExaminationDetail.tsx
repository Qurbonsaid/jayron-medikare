import { useGetAllDiagnosisQuery } from '@/app/api/diagnosisApi/diagnosisApi'
import {
	useAddServiceMutation,
	useCompleteExamsMutation,
	useDeleteExamMutation,
	useGetManyPrescriptionQuery,
	useGetManyServiceQuery,
	useGetOneExamQuery,
	useUpdateExamMutation,
	useUpdateExaminationServiceMutation,
} from '@/app/api/examinationApi/examinationApi'
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication'
import {
	useCreateNeurologicStatusMutation,
	useDeleteNeurologicStatusMutation,
	useGetAllNeurologicStatusQuery,
	useUpdateNeurologicStatusMutation,
} from '@/app/api/neurologicApi/neurologicApi'
import { useUpdatePrescriptionMutation } from '@/app/api/prescription/prescriptionApi'
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { BodyPartConstants } from '@/constants/BodyPart'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { useRouteActions } from '@/hooks/RBS/useRoutePermission'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
	AlertTriangle,
	ArrowLeft,
	Brain,
	CalendarDays,
	Check,
	CheckCircle2,
	ChevronsUpDown,
	Edit,
	Eye,
	FilePlus,
	Loader2,
	Plus,
	Repeat,
	Save,
	Trash2,
	X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AllPrescriptionsDownloadButton, {
	ExaminationInfoDownloadButton,
	NeurologicStatusDownloadButton,
	ServicesDownloadButton,
} from '../../components/PDF/ExaminationPDF'
import { ViewMedicalImage } from '../Radiology/components'

// Body part labels will be loaded from translations
const getBodyPartLabels = (
	t: (key: string) => string
): Record<string, string> => ({
	[BodyPartConstants.HEAD]: t('examinations:detail.bodyParts.head'),
	[BodyPartConstants.NECK]: t('examinations:detail.bodyParts.neck'),
	[BodyPartConstants.CHEST]: t('examinations:detail.bodyParts.chest'),
	[BodyPartConstants.ABDOMEN]: t('examinations:detail.bodyParts.abdomen'),
	[BodyPartConstants.PELVIS]: t('examinations:detail.bodyParts.pelvis'),
	[BodyPartConstants.SPINE]: t('examinations:detail.bodyParts.spine'),
	[BodyPartConstants.ARM]: t('examinations:detail.bodyParts.arm'),
	[BodyPartConstants.LEG]: t('examinations:detail.bodyParts.leg'),
	[BodyPartConstants.KNEE]: t('examinations:detail.bodyParts.knee'),
	[BodyPartConstants.SHOULDER]: t('examinations:detail.bodyParts.shoulder'),
	[BodyPartConstants.HAND]: t('examinations:detail.bodyParts.hand'),
	[BodyPartConstants.FOOT]: t('examinations:detail.bodyParts.foot'),
})

const getRoomType = (t: (key: string) => string) => ({
	stasionar: t('examinations:detail.roomTypes.stasionar'),
	ambulator: t('examinations:detail.roomTypes.ambulator'),
})

const getStatusMap = (
	t: (key: string) => string
): Record<string, { label: string; bgColor: string }> => ({
	pending: {
		label: t('examinations:detail.statuses.pending'),
		bgColor: 'bg-yellow-500',
	},
	active: {
		label: t('examinations:detail.statuses.active'),
		bgColor: 'bg-blue-500',
	},
	completed: {
		label: t('examinations:detail.statuses.completed'),
		bgColor: 'bg-green-500',
	},
})

const ExaminationDetail = () => {

  const { t } = useTranslation(['examinations', 'common']);
  const navigate = useNavigate();
  const { id } = useParams();

  // Get translated labels
  const bodyPartLabels = getBodyPartLabels(t);
  const roomType = getRoomType(t);
  const statusMap = getStatusMap(t);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('examination');
  const [editForm, setEditForm] = useState({
    complaints: '',
    description: '',
    diagnosis: '',
  });

  const {
    canRead: canReadExamination,
    canUpdate,
    canDelete,
  } = useRouteActions('/examination/:id');
  const { canRead: canReadPrescription } = useRouteActions('/prescription');
  const { canRead: canReadServices } = useRouteActions('/service');
  const { canRead: canReadVisits } = useRouteActions('/lab-results');
  const { canRead: canReadImages } = useRouteActions('/radiology');
  const tabPermissions: Record<string, boolean> = {
    examination: canReadExamination,
    prescriptions: canReadPrescription,
    services: canReadServices,
    visits: canReadVisits,
    images: canReadImages,
    neurologic: canReadExamination,
  };

  // Service states
  type ServiceDay = { day: number; date: Date | null };
  type ServiceItem = {
    id: string;
    service_type_id: string;
    duration: number;
    notes: string;
    days: ServiceDay[];
  };

  const generateDays = (
    duration: number,
    prevDays: ServiceDay[] = [],
    startDate: Date | null = null
  ): ServiceDay[] => {
    const safeDuration = Math.max(0, Math.min(duration || 0, 60));
    const baseDate = startDate || new Date();
    return Array.from({ length: safeDuration }, (_, idx) => {
      const existing = prevDays[idx];
      if (existing) return existing;

      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + idx);
      return {
        day: idx + 1,
        date: dayDate,
      };
    });
  };

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(
    null
  );
  const [serviceStartDate, setServiceStartDate] = useState<Date>(new Date());
  const [serviceDuration, setServiceDuration] = useState(7); // Default 7, min 0
  const [serviceSearch, setServiceSearch] = useState('');
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState('');
  const [openServiceCombobox, setOpenServiceCombobox] = useState<string>('');
  const [servicePage, setServicePage] = useState(1);

  // Refs for autofocus
  const serviceSearchRef = useRef<HTMLInputElement>(null);
  const medicationSearchRef = useRef<HTMLInputElement>(null);

  // Refs to track initialization
  const serviceInitializedRef = useRef(false);

  // Debounce service search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  // Prescription states
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    string | null
  >(null);
  const [editingPrescriptionDocId, setEditingPrescriptionDocId] = useState<
    string | null
  >(null);
  const [prescriptionForm, setPrescriptionForm] = useState({
    medication_id: '',
    frequency: '',
    duration: '',
    instructions: '',
    addons: '',
  });
  const [medicationSearch, setMedicationSearch] = useState('');

  // Neurologic status states
  const [isAddingNeurologic, setIsAddingNeurologic] = useState(false);
  const [editingNeurologicId, setEditingNeurologicId] = useState<string | null>(
    null
  );
  const initialNeurologicForm = {
    meningeal_symptoms: 'Yaxshi',
    i_para_n_olfactorius: 'Yaxshi',
    ii_para_n_opticus: 'Yaxshi',
    iii_para_n_oculomotorius: 'Yaxshi',
    iv_para_n_trochlearis: 'Yaxshi',
    v_para_n_trigeminus: 'Yaxshi',
    vi_para_n_abducens: 'Yaxshi',
    vii_para_n_fascialis: 'Yaxshi',
    viii_para_n_vestibulocochlearis: 'Yaxshi',
    ix_para_n_glossopharyngeus: 'Yaxshi',
    x_para_n_vagus: 'Yaxshi',
    xi_para_n_accessorius: 'Yaxshi',
    xii_para_n_hypoglossus: 'Yaxshi',
    motor_system: 'Yaxshi',
    sensory_sphere: 'Yaxshi',
    coordination_sphere: 'Yaxshi',
    higher_brain_functions: 'Yaxshi',
    syndromic_diagnosis_justification: 'Yaxshi',
    topical_diagnosis_justification: 'Yaxshi',
  };
  const [neurologicForm, setNeurologicForm] = useState(initialNeurologicForm);

  // Fetch examination details
  const {
    data: examData,
    isLoading,
    refetch,
  } = useGetOneExamQuery(id || '', {
    skip: !id,
  });

  const exam = examData?.data;

  // Fetch all diagnosis
  const { data: diagnosisData } = useGetAllDiagnosisQuery({});
  const diagnoses = diagnosisData?.data || [];

  // Fetch all service types with search and pagination
  const serviceQueryParams: any = {
    page: servicePage,
    limit: 20,
  };
  if (debouncedServiceSearch.trim()) {
    serviceQueryParams.search = debouncedServiceSearch.trim();
  }
  const { data: servicesData, isFetching: isFetchingServices } =
    useGetAllServiceQuery(serviceQueryParams);

  const [selectedServicesCache, setSelectedServicesCache] = useState<{
    [key: string]: any;
  }>({});

  // Service types from API
  const serviceTypes = servicesData?.data || [];
  const serviceHasMoreData = servicesData?.data?.length === 20;

  // Cache selected services for lookup
  useEffect(() => {
    if (servicesData?.data && servicesData.data.length > 0) {
      const newCacheItems: { [key: string]: any } = {};
      servicesData.data.forEach((service: any) => {
        newCacheItems[service._id] = service;
      });
      setSelectedServicesCache((prev) => ({ ...prev, ...newCacheItems }));
    }
  }, [servicesData?.data]);

  // Reset pagination when search changes
  useEffect(() => {
    setServicePage(1);
  }, [debouncedServiceSearch]);

  // Helper function to get service by ID
  const getServiceById = (serviceId: string) => {
    return (
      serviceTypes.find((s: any) => s._id === serviceId) ||
      selectedServicesCache[serviceId]
    );
  };

  // Fetch medications for prescription edit
  const { data: medicationsData } = useGetAllMedicationsQuery({
    page: 1,
    limit: 100,
    search: medicationSearch || undefined,
  });

  // Fetch prescriptions by patient_id
  const { data: prescriptionsData, refetch: refetchPrescriptions } =
    useGetManyPrescriptionQuery(
      {
        page: 1,
        limit: 100,
        patient_id: exam?.patient_id?._id || '',
      },
      { skip: !exam?.patient_id?._id }
    );
  const prescriptions = prescriptionsData?.data || [];

  // Fetch services by patient_id
  const { data: patientServicesData, refetch: refetchPatientServices } =
    useGetManyServiceQuery(
      {
        page: 1,
        limit: 100,
        patient_id: exam?.patient_id?._id || '',
      },
      { skip: !exam?.patient_id?._id }
    );
  const patientServices = patientServicesData?.data || [];

  // Fetch neurologic status
  const { data: neurologicData, refetch: refetchNeurologic } =
    useGetAllNeurologicStatusQuery(
      {
        page: 1,
        limit: 100,
        examination_id: id || '',
      },
      { skip: !id }
    );
  const neurologicStatuses = neurologicData?.data || [];

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [completeExam, { isLoading: isCompleting }] =
    useCompleteExamsMutation();
  const [addServiceMutation, { isLoading: isAddingServiceMutation }] =
    useAddServiceMutation();
  const [updateService, { isLoading: isUpdatingService }] =
    useUpdateServiceMutation();
  const [updatePrescription, { isLoading: isUpdatingPrescription }] =
    useUpdatePrescriptionMutation();
  const [createNeurologic, { isLoading: isCreatingNeurologic }] =
    useCreateNeurologicStatusMutation();
  const [updateNeurologic, { isLoading: isUpdatingNeurologic }] =
    useUpdateNeurologicStatusMutation();
  const [deleteNeurologic, { isLoading: isDeletingNeurologic }] =
    useDeleteNeurologicStatusMutation();
  const handleRequest = useHandleRequest();

  // Update serviceDuration and serviceStartDate based on existing services when adding new services
  useEffect(() => {
    // Only initialize once when component mounts or patientServices first loads
    if (serviceInitializedRef.current || !patientServicesData) return;

    if (patientServices.length > 0) {
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
      serviceInitializedRef.current = true;
    } else if (patientServices.length === 0) {
      // Reset to default 7 if no existing services
      setServiceDuration(7);
      setServiceStartDate(new Date());
      serviceInitializedRef.current = true;
    }
  }, [patientServices, patientServicesData]);

  // Update form when exam changes
  useEffect(() => {
    if (exam) {
      const diagnosisId =
        typeof exam.diagnosis === 'object' && exam.diagnosis?._id
          ? exam.diagnosis._id
          : typeof exam.diagnosis === 'string'
          ? exam.diagnosis
          : '';
      setEditForm({
        complaints: exam.complaints || '',
        description: exam.description || '',
        diagnosis: diagnosisId,
      });
    }
  }, [exam?._id]);

  const handleEdit = () => {
    setIsEditMode(true);
    setActiveTab('examination');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    const diagnosisId =
      typeof exam.diagnosis === 'object' && exam.diagnosis?._id
        ? exam.diagnosis._id
        : typeof exam.diagnosis === 'string'
        ? exam.diagnosis
        : '';
    setEditForm({
      complaints: exam.complaints || '',
      description: exam.description || '',
      diagnosis: diagnosisId,
    });
  };

  const handleUpdate = async () => {
    if (!editForm.complaints.trim()) {
      toast.error(t('examinations:detail.enterComplaint'));
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updateExam({
          id: exam._id,
          body: {
            patient_id: exam.patient_id._id,
            diagnosis: editForm.diagnosis,
            complaints: editForm.complaints,
            description: editForm.description,
          },
        });
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.examUpdated'));
        setIsEditMode(false);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || t('examinations:detail.errorOccurred'));
      },
    });
  };

  const handleDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deleteExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.examDeleted'));
        navigate(-1);
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('examinations:detail.errorOccurred')
        );
      },
    });
  };

  const handleComplete = async () => {
    await handleRequest({
      request: async () => {
        const res = await completeExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.examCompleted'));
        refetch();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('examinations:detail.errorOccurred')
        );
      },
    });
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    // Delete prescription functionality is currently disabled in the API
    toast.error(t('examinations:detail.deletePrescriptionNotAvailable'));
  };

  // Service handlers
  const addService = () => {
    // Use serviceDuration from input directly (minimum 1)
    const duration = Math.max(serviceDuration, 1);
    const newService: ServiceItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      service_type_id: '',
      duration: duration,
      notes: '',
      days: generateDays(duration, [], serviceStartDate),
    };
    setServices([...services, newService]);
  };

  const removeService = (serviceId: string) => {
    setServices(services.filter((s) => s.id !== serviceId));
  };

  const updateServiceField = (
    serviceId: string,
    field: keyof ServiceItem,
    value: any
  ) => {
    setServices(
      services.map((srv) =>
        srv.id === serviceId ? { ...srv, [field]: value } : srv
      )
    );
  };

  const toggleDayMark = (serviceId: string, dayNumber: number) => {
    setServices(
      services.map((srv) => {
        if (srv.id !== serviceId) return srv;
        const dayIndex = dayNumber - 1;
        const updatedDays = [...srv.days];
        if (updatedDays[dayIndex]) {
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            date: updatedDays[dayIndex].date
              ? null
              : new Date(
                  serviceStartDate.getTime() + dayIndex * 24 * 60 * 60 * 1000
                ),
          };
        }
        return { ...srv, days: updatedDays };
      })
    );
  };

  const markEveryOtherDay = () => {
    setServices(
      services.map((srv) => {
        const everyOtherDay = Array.from(
          { length: serviceDuration },
          (_, i) => i + 1
        ).filter((day) => day % 2 === 1);

        const updatedDays = srv.days.map((day, idx) => {
          if (everyOtherDay.includes(day.day)) {
            const dayDate = new Date(serviceStartDate);
            dayDate.setDate(dayDate.getDate() + idx);
            return { ...day, date: dayDate };
          }
          return { ...day, date: null };
        });

        return { ...srv, days: updatedDays };
      })
    );
  };

  const markEveryDay = () => {
    setServices(
      services.map((srv) => {
        const updatedDays = srv.days.map((day, idx) => {
          const dayDate = new Date(serviceStartDate);
          dayDate.setDate(dayDate.getDate() + idx);
          return { ...day, date: dayDate };
        });
        return { ...srv, days: updatedDays };
      })
    );
  };

  // Mark every day for a specific service
  const markEveryDayForService = (serviceId: string) => {
    setServices(
      services.map((srv) => {
        if (srv.id === serviceId) {
          const updatedDays = srv.days.map((day, idx) => {
            const dayDate = new Date(serviceStartDate);
            dayDate.setDate(dayDate.getDate() + idx);
            return { ...day, date: dayDate };
          });
          return { ...srv, days: updatedDays };
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
          const duration = srv.days.length || serviceDuration;
          const everyOtherDay = Array.from(
            { length: duration },
            (_, i) => i + 1
          ).filter((day) => day % 2 === 1);

          const updatedDays = srv.days.map((day, idx) => {
            if (everyOtherDay.includes(day.day)) {
              const dayDate = new Date(serviceStartDate);
              dayDate.setDate(dayDate.getDate() + idx);
              return { ...day, date: dayDate };
            }
            return { ...day, date: null };
          });

          return { ...srv, days: updatedDays };
        }
        return srv;
      })
    );
  };

  const handleSaveService = async () => {
    if (services.length === 0) {
      toast.error(t('examinations:detail.addServiceError'));
      return;
    }

    const invalidService = services.find((s) => !s.service_type_id);
    if (invalidService) {
      toast.error(t('examinations:detail.selectServiceTypeError'));
      return;
    }

    const isEdit = Boolean(editingServiceId);
    const hasExistingServices = patientServices.length > 0;

    // Prepare items array
    let itemsToSave = services.map((srv) => ({
      _id: srv.id.startsWith('temp-') ? undefined : srv.id, // New items don't have _id
      service_type_id: srv.service_type_id,
      days: srv.days.map((day) => ({
        day: day.day,
        date: day.date ? format(day.date, 'yyyy-MM-dd') : null,
      })),
      notes: srv.notes,
    }));

    // If editing, preserve other items from the same service document
    if (isEdit && editingServiceId) {
      // Find the service document that contains the item being edited
      const serviceDoc = patientServices.find((doc: any) =>
        doc.items?.some((item: any) => item._id === editingServiceId)
      );

      if (serviceDoc && serviceDoc.items) {
        // Get all items from the service document except the one being edited
        // and ensure all items' days arrays match the new duration
        const otherItems = serviceDoc.items
          .filter((item: any) => item._id !== editingServiceId)
          .map((item: any) => {
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
              existingDays.map(
                (d) => [d.day, d.date] as [number, string | null]
              )
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

        // Combine edited item with other existing items (all with updated duration)
        itemsToSave = [...itemsToSave, ...otherItems];
      }
    } else if (hasExistingServices && !isEdit) {
      // If adding new items to existing service document, preserve all existing items
      // and ensure all items' days arrays match the new duration
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
      examination_id: exam._id,
      duration: serviceDuration,
      items: itemsToSave,
    };

    await handleRequest({
      request: async () => {
        // If existing services exist or editing, use update
        // Otherwise, use create
        if (hasExistingServices || isEdit) {
          // Update service document
          const serviceDocId = isEdit 
            ? patientServices.find((doc: any) =>
                doc.items?.some((item: any) => item._id === editingServiceId)
              )?._id
            : patientServices[0]?._id;
          
          if (!serviceDocId) {
            throw new Error('Xizmat hujjati topilmadi');
          }
          
          payload.examination_id = serviceDocId;
          const res = await updateService(payload).unwrap();
          return res;
        }
        const res = await addServiceMutation(payload).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(
          isEdit
            ? t('examinations:detail.serviceUpdated')
            : t('examinations:detail.serviceAdded')
        );
        setIsAddingService(false);
        setEditingServiceId(null);
        setServices([]);
        setServiceDuration(7);
        setServiceStartDate(new Date());
        refetchPatientServices();
      },
      onError: (error) => {
        console.error('Service save error:', error);
        toast.error(
          error?.data?.error?.msg ||
            (isEdit
              ? t('examinations:detail.serviceDeleteError')
              : t('examinations:detail.errorOccurred'))
        );
      },
    });
  };

  const handleUpdateService = async (serviceId: string) => {
    // Update service functionality - to be implemented
    toast.error(t('examinations:detail.updateServiceNotAvailable'));
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!serviceId) {
      toast.error(t('examinations:detail.serviceDataNotFound'));
      return;
    }

    // Find the service document that contains the item to delete
    const serviceDoc = patientServices.find((doc: any) =>
      doc.items?.some((item: any) => item._id === serviceId)
    );

    if (!serviceDoc || !serviceDoc.items) {
      toast.error(t('examinations:detail.serviceNotFoundError'));
      return;
    }

    // Get all items except the one being deleted
    const remainingItems = serviceDoc.items
      .filter((item: any) => item._id !== serviceId)
      .map((item: any) => ({
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

    // If no items remain, we might want to handle this differently
    // For now, we'll update with empty items array
    const payload = {
      examination_id: serviceDoc._id,
      duration: serviceDoc.duration || 7,
      items: remainingItems,
    };

    setDeletingServiceId(serviceId);

    await handleRequest({
      request: async () => {
        const res = await updateService(payload).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.serviceDeleted'));
        setDeletingServiceId(null);
        refetchPatientServices();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('examinations:detail.serviceDeleteError')
        );
        setDeletingServiceId(null);
      },
    });
  };

  const startEditService = (service: any) => {
    const duration = service.duration || service.days?.length || 0;
    const firstDate =
      service.days?.find((d: any) => d?.date)?.date || new Date();

    setIsAddingService(true);
    setEditingServiceId(service._id);
    setServiceDuration(duration || 7);
    setServiceStartDate(firstDate ? new Date(firstDate) : new Date());

    const normalizedDays =
      service.days?.map((day: any, idx: number) => ({
        day: day?.day || idx + 1,
        date: day?.date ? new Date(day.date) : null,
      })) || [];

    setServices([
      {
        id: service._id,
        service_type_id:
          typeof service.service_type_id === 'object'
            ? service.service_type_id?._id || ''
            : service.service_type_id || '',
        duration: duration || normalizedDays.length || 7,
        notes: service.notes || '',
        days:
          normalizedDays.length > 0
            ? normalizedDays
            : generateDays(duration || 7, [], new Date(firstDate)),
      },
    ]);
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
  };

  // Prescription handlers
  const startEditPrescription = (
    prescription: any,
    prescriptionDocId: string
  ) => {
    setEditingPrescriptionId(prescription._id);
    setEditingPrescriptionDocId(prescriptionDocId);
    const medId =
      typeof prescription.medication_id === 'object' &&
      prescription.medication_id !== null
        ? prescription.medication_id._id
        : prescription.medication_id || '';
    setPrescriptionForm({
      medication_id: medId,
      frequency: prescription.frequency?.toString() || '',
      duration: prescription.duration?.toString() || '',
      instructions: prescription.instructions || '',
      addons: prescription.addons || '',
    });
    setMedicationSearch('');
  };

  const cancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    setEditingPrescriptionDocId(null);
    setPrescriptionForm({
      medication_id: '',
      frequency: '',
      duration: '',
      instructions: '',
      addons: '',
    });
    setMedicationSearch('');
  };

  const handleUpdatePrescription = async () => {
    if (!editingPrescriptionId || !editingPrescriptionDocId) {
      toast.error(t('examinations:detail.prescriptionDataNotFound'));
      return;
    }

    if (!prescriptionForm.medication_id.trim()) {
      toast.error(t('examinations:detail.selectMedicationError'));
      return;
    }
    if (
      !prescriptionForm.frequency ||
      parseInt(prescriptionForm.frequency) <= 0
    ) {
      toast.error(t('examinations:detail.frequencyError'));
      return;
    }
    if (
      !prescriptionForm.duration ||
      parseInt(prescriptionForm.duration) <= 0
    ) {
      toast.error(t('examinations:detail.durationError'));
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updatePrescription({
          id: editingPrescriptionDocId,
          body: {
            items: [
              {
                _id: editingPrescriptionId,
                medication_id: prescriptionForm.medication_id,
                frequency: parseInt(prescriptionForm.frequency),
                duration: parseInt(prescriptionForm.duration),
                instructions: prescriptionForm.instructions,
                addons: prescriptionForm.addons || '',
              },
            ],
          },
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.prescriptionUpdated'));
        setEditingPrescriptionId(null);
        setEditingPrescriptionDocId(null);
        setPrescriptionForm({
          medication_id: '',
          frequency: '',
          duration: '',
          instructions: '',
          addons: '',
        });
        setMedicationSearch('');
        refetchPrescriptions();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t('examinations:detail.prescriptionUpdateError')
        );
      },
    });
  };

  // Neurologic status handlers
  const neurologicFieldLabels: Record<string, string> = {
    meningeal_symptoms: t('examinations:detail.neurologic.meningealSymptoms'),
    i_para_n_olfactorius: t('examinations:detail.neurologic.paraN1'),
    ii_para_n_opticus: t('examinations:detail.neurologic.paraN2'),
    iii_para_n_oculomotorius: t('examinations:detail.neurologic.paraN3_4_6'),
    iv_para_n_trochlearis: t('examinations:detail.neurologic.paraN5'),
    v_para_n_trigeminus: t('examinations:detail.neurologic.paraN7'),
    vi_para_n_abducens: t('examinations:detail.neurologic.paraN8'),
    vii_para_n_fascialis: t('examinations:detail.neurologic.paraN9_10'),
    viii_para_n_vestibulocochlearis: t(
      'examinations:detail.neurologic.paraN11'
    ),
    ix_para_n_glossopharyngeus: t('examinations:detail.neurologic.paraN12'),
    x_para_n_vagus: t('examinations:detail.neurologic.oralAutomatism'),
    xi_para_n_accessorius: t('examinations:detail.neurologic.motorSystem'),
    xii_para_n_hypoglossus: t('examinations:detail.neurologic.sensorySphere'),
    motor_system: t('examinations:detail.neurologic.coordinationSphere'),
    sensory_sphere: t('examinations:detail.neurologic.higherBrainFunctions'),
    coordination_sphere: t(
      'examinations:detail.neurologic.syndromicDiagnosisJustification'
    ),
    higher_brain_functions: t(
      'examinations:detail.neurologic.topicalDiagnosisJustification'
    ),
    syndromic_diagnosis_justification: t(
      'examinations:detail.neurologic.syndromicDiagnosis'
    ),
    topical_diagnosis_justification: t(
      'examinations:detail.neurologic.topicalDiagnosis'
    ),
  };

  const handleAddNeurologic = async () => {
    await handleRequest({
      request: async () => {
        const res = await createNeurologic({
          examination_id: exam._id,
          ...neurologicForm,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.neurologicCreated'));
        setIsAddingNeurologic(false);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t('examinations:detail.neurologicAddError')
        );
      },
    });
  };

  const handleUpdateNeurologic = async (neurologicId: string) => {
    await handleRequest({
      request: async () => {
        const res = await updateNeurologic({
          id: neurologicId,
          ...neurologicForm,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.neurologicUpdated'));
        setEditingNeurologicId(null);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t('examinations:detail.neurologicUpdateError')
        );
      },
    });
  };

  const handleDeleteNeurologic = async (neurologicId: string) => {
    if (!window.confirm(t('examinations:detail.neurologicDeleteConfirm'))) {
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await deleteNeurologic(neurologicId).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t('examinations:detail.neurologicDeleted'));
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t('examinations:detail.neurologicDeleteError')
        );
      },
    });
  };

  const startEditNeurologic = (neurologic: any) => {
    setEditingNeurologicId(neurologic._id);
    setNeurologicForm({
      meningeal_symptoms: neurologic.meningeal_symptoms || '',
      i_para_n_olfactorius: neurologic.i_para_n_olfactorius || '',
      ii_para_n_opticus: neurologic.ii_para_n_opticus || '',
      iii_para_n_oculomotorius: neurologic.iii_para_n_oculomotorius || '',
      iv_para_n_trochlearis: neurologic.iv_para_n_trochlearis || '',
      v_para_n_trigeminus: neurologic.v_para_n_trigeminus || '',
      vi_para_n_abducens: neurologic.vi_para_n_abducens || '',
      vii_para_n_fascialis: neurologic.vii_para_n_fascialis || '',
      viii_para_n_vestibulocochlearis:
        neurologic.viii_para_n_vestibulocochlearis || '',
      ix_para_n_glossopharyngeus: neurologic.ix_para_n_glossopharyngeus || '',
      x_para_n_vagus: neurologic.x_para_n_vagus || '',
      xi_para_n_accessorius: neurologic.xi_para_n_accessorius || '',
      xii_para_n_hypoglossus: neurologic.xii_para_n_hypoglossus || '',
      motor_system: neurologic.motor_system || '',
      sensory_sphere: neurologic.sensory_sphere || '',
      coordination_sphere: neurologic.coordination_sphere || '',
      higher_brain_functions: neurologic.higher_brain_functions || '',
      syndromic_diagnosis_justification:
        neurologic.syndromic_diagnosis_justification || '',
      topical_diagnosis_justification:
        neurologic.topical_diagnosis_justification || '',
    });
  };

  const cancelEditNeurologic = () => {
    setEditingNeurologicId(null);
    setNeurologicForm(initialNeurologicForm);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-primary mx-auto mb-4' />
          <p className='text-muted-foreground'>
            {t('examinations:detail.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>
            {t('examinations:detail.notFound')}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            {t('examinations:detail.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Patient Info Card */}
        <Card className='mb-6'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{t('detail.patientInfo')}</CardTitle>
            <ExaminationInfoDownloadButton exam={exam} />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <Label className='text-muted-foreground'>
                  {t('detail.name')}
                </Label>
                <p className='font-medium mt-1'>{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  {t('detail.phone')}
                </Label>
                <p className='font-medium mt-1'>{exam.patient_id?.phone}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  {t('detail.doctor')}
                </Label>
                <p className='font-medium mt-1'>{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  {t('detail.date')}
                </Label>
                <p className='font-medium mt-1'>
                  {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground mr-5'>
                  {t('type')} :
                </Label>
                <p
                  className={`font-medium mt-1 inline-block px-2 py-0.5 rounded ${
                    exam.treatment_type === 'stasionar'
                      ? 'bg-green-300 text-green-900'
                      : 'bg-red-300 text-red-900'
                  }`}
                >
                  {roomType[exam.treatment_type]}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground mr-5'>
                  {t('status')} :
                </Label>
                <p
                  className={`font-medium mt-1 inline-block px-2 py-0.5 rounded text-white ${
                    statusMap[exam.status]?.bgColor || 'bg-gray-500'
                  }`}
                >
                  {statusMap[exam.status]?.label || exam.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
              {canReadPrescription ? (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    navigate('/prescription', {
                      state: { examinationId: exam._id },
                    });
                  }}
                >
                  <FilePlus className='w-4 h-4 mr-2' />
                  {t('detail.writePrescription')}
                </Button>
              ) : (
                ''
              )}
              {canUpdate ? (
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={handleEdit}
                  disabled={isEditMode}
                >
                  <Edit className='w-4 h-4 mr-2' />
                  {t('detail.editExam')}
                </Button>
              ) : (
                ''
              )}
              {canDelete ? (
                <Button
                  variant='outline'
                  className='w-full text-red-600 hover:bg-red-600 hover:text-white'
                  onClick={() => setIsDeleteConfirm(true)}
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  {t('detail.deleteExam')}
                </Button>
              ) : (
                ''
              )}
              <Button
                variant='default'
                className='w-full bg-green-600 hover:bg-green-700'
                onClick={handleComplete}
                disabled={isCompleting || exam.status === 'completed'}
              >
                <CheckCircle2 className='w-4 h-4 mr-2' />
                {isCompleting
                  ? t('examinations:detail.completing')
                  : exam.status === 'completed'
                  ? t('examinations:detail.completed')
                  : t('examinations:detail.completeExam')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (!tabPermissions[value]) {
              toast.error(t('examinations:detail.noPermission'));
              return;
            }
            // Tahrirlash rejimida boshqa tablarga o'tishni bloklash
            if (isEditMode && value !== 'examination') {
              toast.error(t('examinations:detail.tabLoadError'));
              return;
            }
            setActiveTab(value);
          }}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1'>
            {canReadExamination && (
              <TabsTrigger
                value='examination'
                className='py-2 sm:py-3 text-xs sm:text-sm'
              >
                {t('examinations:detail.tabs.examination')}
              </TabsTrigger>
            )}
            {canReadPrescription && (
              <TabsTrigger
                value='prescriptions'
                className='py-2 sm:py-3 text-xs sm:text-sm'
                disabled={isEditMode}
              >
                {t('examinations:detail.tabs.prescriptions')}
              </TabsTrigger>
            )}
            {canReadServices && (
              <TabsTrigger
                value='services'
                className='py-2 sm:py-3 text-xs sm:text-sm'
                disabled={isEditMode}
              >
                {t('examinations:detail.tabs.services')}
              </TabsTrigger>
            )}
            {canReadVisits && (
              <TabsTrigger
                value='visits'
                className='py-2 sm:py-3 text-xs sm:text-sm'
                disabled={isEditMode}
              >
                {t('examinations:detail.tabs.visits')}
              </TabsTrigger>
            )}
            {canReadImages && (
              <TabsTrigger
                value='images'
                className='py-2 sm:py-3 text-xs sm:text-sm'
                disabled={isEditMode}
              >
                {t('examinations:detail.tabs.images')}
              </TabsTrigger>
            )}
            {canReadExamination && (
              <TabsTrigger
                value='neurologic'
                className='py-2 sm:py-3 text-xs sm:text-sm'
                disabled={isEditMode}
              >
                {t('examinations:detail.tabs.neurologic')}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Examination Tab */}
          {canReadExamination && (
            <TabsContent value='examination'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('examinations:detail.examInfo')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditMode ? (
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label>{t('examinations:detail.complaint')}</Label>
                        <Textarea
                          placeholder={t('examinations:detail.enterComplaint')}
                          value={editForm.complaints}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              complaints: e.target.value,
                            })
                          }
                          className='min-h-24'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label>{t('detail.diagnosis')}</Label>
                        <Select
                          value={editForm.diagnosis}
                          onValueChange={(value) =>
                            setEditForm({ ...editForm, diagnosis: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('detail.selectDiagnosis')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {diagnoses.map((diagnosis: any) => (
                              <SelectItem
                                key={diagnosis._id}
                                value={diagnosis._id}
                              >
                                {diagnosis.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label>{t('detail.recommendation')}</Label>
                        <Textarea
                          placeholder={t(
                            'detail.enterRecommendationPlaceholder'
                          )}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className='min-h-24'
                        />
                      </div>

                      <div className='flex gap-3 justify-end'>
                        <Button
                          variant='outline'
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                        >
                          {t('common:cancel')}
                        </Button>
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                          {isUpdating ? t('common:saving') : t('common:save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div>
                        <Label className='text-muted-foreground'>
                          {t('examinations:detail.complaint')}
                        </Label>
                        <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                          {exam.complaints ||
                            t('examinations:detail.notEntered')}
                        </p>
                      </div>
                      <div>
                        <Label className='text-muted-foreground'>
                          {t('examinations:detail.diagnosis')}
                        </Label>
                        <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                          {typeof exam.diagnosis === 'object' &&
                          exam.diagnosis?.name
                            ? exam.diagnosis.name
                            : typeof exam.diagnosis === 'string'
                            ? exam.diagnosis
                            : t('examinations:detail.notEntered')}
                        </p>
                      </div>
                      <div>
                        <Label className='text-muted-foreground'>
                          {t('detail.recommendation')}
                        </Label>
                        <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                          {exam.description || t('detail.notEntered')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Room Info Card */}
              {exam.rooms && exam.rooms.length > 0 && (
                <Card className='mt-6'>
                  <CardHeader>
                    <CardTitle>{t('detail.roomInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {exam.rooms.map((room: any, index: number) => (
                        <Card
                          key={room._id}
                          className='border border-primary/10'
                        >
                          <CardContent className='pt-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                              <div>
                                <Label className='text-muted-foreground'>
                                  {t('detail.roomName')}
                                </Label>
                                <p className='font-medium mt-1'>
                                  {room.room_name || t('detail.unknown')}
                                </p>
                              </div>
                              <div>
                                <Label className='text-muted-foreground'>
                                  {t('detail.floor')}
                                </Label>
                                <p className='font-medium mt-1'>
                                  {room.floor_number || t('detail.unknown')}
                                </p>
                              </div>
                              <div>
                                <Label className='text-muted-foreground'>
                                  {t('detail.price')}
                                </Label>
                                <p className='font-medium mt-1'>
                                  {room.room_price
                                    ? `${room.room_price.toLocaleString()} ${t(
                                        'detail.sum'
                                      )}`
                                    : t('detail.unknown')}
                                </p>
                              </div>
                              <div>
                                <Label className='text-muted-foreground'>
                                  {t('detail.duration')}
                                </Label>
                                <p className='font-medium mt-1'>
                                  {room.start_date
                                    ? new Date(
                                        room.start_date
                                      ).toLocaleDateString('uz-UZ')
                                    : t('detail.unknown')}
                                  {room.end_date && (
                                    <>
                                      {' - '}
                                      {new Date(
                                        room.end_date
                                      ).toLocaleDateString('uz-UZ')}
                                    </>
                                  )}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Prescriptions Tab */}
          {canReadPrescription && (
            <TabsContent value='prescriptions'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span>{t('detail.prescriptions')}</span>
                      {prescriptions.length > 0 && (
                        <span className='text-sm font-normal text-muted-foreground'>
                          ({prescriptions.length} {t('detail.items')})
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {prescriptions.length > 0 && (
                        <AllPrescriptionsDownloadButton
                          exam={exam}
                          prescriptions={prescriptions}
                        />
                      )}
                      <Button
                        size='sm'
                        onClick={() => {
                          navigate('/prescription', {
                            state: { examinationId: exam._id },
                          });
                        }}
                      >
                        <Plus className='w-4 h-4 mr-2' />
                        {t('detail.addPrescription')}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {prescriptions.length > 0 ? (
                    <div className='space-y-4'>
                      {prescriptions.map(
                        (prescriptionDoc: any, docIndex: number) => (
                          <Card
                            key={prescriptionDoc._id}
                            className='border border-primary/10 bg-primary/5'
                          >
                            <CardContent className='pt-4'>
                              <div className='mb-3'>
                                <div className='flex items-center justify-between'>
                                  <span className='text-sm font-medium text-primary'>
                                    {t('detail.prescriptionNum')} #
                                    {docIndex + 1} -{' '}
                                    {new Date(
                                      prescriptionDoc.created_at
                                    ).toLocaleDateString('uz-UZ')}
                                  </span>
                                  <span className='text-xs text-muted-foreground'>
                                    {prescriptionDoc.doctor_id?.fullname}
                                  </span>
                                </div>
                              </div>
                              {/* Prescription Items */}
                              <div className='space-y-3'>
                                {prescriptionDoc.items?.map(
                                  (item: any, itemIndex: number) => (
                                    <div
                                      key={item._id}
                                      className='border rounded-lg p-3 bg-background'
                                    >
                                      {editingPrescriptionId === item._id ? (
                                        // Edit mode
                                        <div className='space-y-4'>
                                          <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-semibold text-primary'>
                                              {t('detail.editMedication')} #
                                              {itemIndex + 1}
                                            </span>
                                          </div>
                                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                            <div>
                                              <Label className='text-xs'>
                                                {t('detail.medication')}
                                              </Label>
                                              <Select
                                                value={
                                                  prescriptionForm.medication_id
                                                }
                                                onValueChange={(value) =>
                                                  setPrescriptionForm({
                                                    ...prescriptionForm,
                                                    medication_id: value,
                                                  })
                                                }
                                                onOpenChange={(open) => {
                                                  if (open) {
                                                    setTimeout(
                                                      () =>
                                                        medicationSearchRef.current?.focus(),
                                                      0
                                                    );
                                                  }
                                                }}
                                              >
                                                <SelectTrigger className='mt-1'>
                                                  <SelectValue
                                                    placeholder={t(
                                                      'detail.selectMedication'
                                                    )}
                                                  />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <div className='p-2'>
                                                    <Input
                                                      ref={medicationSearchRef}
                                                      placeholder={t(
                                                        'detail.search'
                                                      )}
                                                      value={medicationSearch}
                                                      onChange={(e) =>
                                                        setMedicationSearch(
                                                          e.target.value
                                                        )
                                                      }
                                                      onKeyDown={(e) =>
                                                        e.stopPropagation()
                                                      }
                                                      onFocus={(e) => {
                                                        setTimeout(
                                                          () =>
                                                            e.target.focus(),
                                                          0
                                                        );
                                                      }}
                                                      className='mb-2'
                                                    />
                                                  </div>
                                                  {medicationsData?.data?.map(
                                                    (med: any) => (
                                                      <SelectItem
                                                        key={med._id}
                                                        value={med._id}
                                                      >
                                                        {med.name}{' '}
                                                        {med.dosage &&
                                                          `(${med.dosage})`}
                                                      </SelectItem>
                                                    )
                                                  )}
                                                </SelectContent>
                                              </Select>
                                            </div>
                                            <div>
                                              <Label className='text-xs'>
                                                {t('detail.intakePerDay')}
                                              </Label>
                                              <Input
                                                type='number'
                                                min={1}
                                                value={
                                                  prescriptionForm.frequency
                                                }
                                                onChange={(e) =>
                                                  setPrescriptionForm({
                                                    ...prescriptionForm,
                                                    frequency: e.target.value,
                                                  })
                                                }
                                                className='mt-1'
                                                placeholder={t(
                                                  'detail.timesPerDay'
                                                )}
                                              />
                                            </div>
                                            <div>
                                              <Label className='text-xs'>
                                                {t('detail.durationDays')}
                                              </Label>
                                              <Input
                                                type='number'
                                                min={1}
                                                value={
                                                  prescriptionForm.duration
                                                }
                                                onChange={(e) =>
                                                  setPrescriptionForm({
                                                    ...prescriptionForm,
                                                    duration: e.target.value,
                                                  })
                                                }
                                                className='mt-1'
                                                placeholder={t(
                                                  'detail.howManyDays'
                                                )}
                                              />
                                            </div>
                                            <div>
                                              <Label className='text-xs'>
                                                {t('detail.instruction')}
                                              </Label>
                                              <Input
                                                value={
                                                  prescriptionForm.instructions
                                                }
                                                onChange={(e) =>
                                                  setPrescriptionForm({
                                                    ...prescriptionForm,
                                                    instructions:
                                                      e.target.value,
                                                  })
                                                }
                                                className='mt-1'
                                                placeholder={t(
                                                  'detail.instructionPlaceholder'
                                                )}
                                              />
                                            </div>
                                          </div>
                                          <div>
                                            <Label className='text-xs'>
                                              {t('detail.additional')}
                                            </Label>
                                            <Textarea
                                              value={prescriptionForm.addons}
                                              onChange={(e) =>
                                                setPrescriptionForm({
                                                  ...prescriptionForm,
                                                  addons: e.target.value,
                                                })
                                              }
                                              className='mt-1'
                                              placeholder={t(
                                                'detail.additionalInfo'
                                              )}
                                              rows={2}
                                            />
                                          </div>
                                          <div className='flex gap-2 justify-end'>
                                            <Button
                                              variant='outline'
                                              size='sm'
                                              onClick={cancelEditPrescription}
                                              disabled={isUpdatingPrescription}
                                            >
                                              <X className='w-3 h-3 mr-1' />
                                              {t('detail.cancel')}
                                            </Button>
                                            <Button
                                              size='sm'
                                              onClick={handleUpdatePrescription}
                                              disabled={isUpdatingPrescription}
                                            >
                                              <Save className='w-3 h-3 mr-1' />
                                              {isUpdatingPrescription
                                                ? t('detail.saving')
                                                : t('detail.save')}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        // View mode
                                        <>
                                          <div className='flex items-center justify-between mb-2'>
                                            <span className='text-xs font-medium text-muted-foreground'>
                                              {t('detail.medication')} #
                                              {itemIndex + 1}
                                            </span>
                                            <div className='flex gap-1'>
                                              <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                  startEditPrescription(
                                                    item,
                                                    prescriptionDoc._id
                                                  )
                                                }
                                                disabled={
                                                  editingPrescriptionId !== null
                                                }
                                                className='h-6 w-6 p-0'
                                              >
                                                <Edit className='h-3 w-3' />
                                              </Button>
                                            </div>
                                          </div>
                                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
                                            <div>
                                              <Label className='text-xs text-muted-foreground'>
                                                {t('detail.medication')}
                                              </Label>
                                              <p className='font-semibold text-sm'>
                                                {item.medication_id?.name ||
                                                  t('detail.unknown')}{' '}
                                                {item.medication_id?.dosage &&
                                                  `(${item.medication_id.dosage})`}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className='text-xs text-muted-foreground'>
                                                {t('detail.duration')}
                                              </Label>
                                              <p className='font-semibold text-sm'>
                                                {item.duration}{' '}
                                                {t('detail.days')}
                                              </p>
                                            </div>
                                            <div>
                                              <Label className='text-xs text-muted-foreground'>
                                                {t('detail.intake')}
                                              </Label>
                                              <p className='font-semibold text-sm'>
                                                {t('detail.timesPerDayCount', {
                                                  count: item.frequency,
                                                })}
                                              </p>
                                            </div>
                                            {item.instructions && (
                                              <div>
                                                <Label className='text-xs text-muted-foreground'>
                                                  {t('detail.instruction')}
                                                </Label>
                                                <p className='text-sm'>
                                                  {item.instructions}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                          {/* Days grid */}
                                          {item.days &&
                                            item.days.length > 0 && (
                                              <div className='mt-2 pt-2 border-t'>
                                                <Label className='text-xs text-muted-foreground mb-1 block'>
                                                  {t('detail.intakeDays')}
                                                </Label>
                                                <div className='flex flex-wrap gap-1'>
                                                  {item.days.map((day: any) => (
                                                    <div
                                                      key={day._id || day.day}
                                                      className={`text-xs px-2 py-1 rounded ${
                                                        day.date
                                                          ? 'bg-green-100 text-green-800'
                                                          : 'bg-gray-100 text-gray-500'
                                                      }`}
                                                    >
                                                      {day.day}
                                                      {day.date && (
                                                        <span className='ml-1'>
                                                          (
                                                          {new Date(
                                                            day.date
                                                          ).toLocaleDateString(
                                                            'uz-UZ',
                                                            {
                                                              day: '2-digit',
                                                              month: '2-digit',
                                                            }
                                                          )}
                                                          )
                                                        </span>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                        </>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground mb-4'>
                        {t('detail.noPrescriptions')}
                      </p>
                      <Button
                        onClick={() => {
                          navigate('/prescription', {
                            state: { examinationId: exam._id },
                          });
                        }}
                      >
                        <FilePlus className='w-4 h-4 mr-2' />
                        {t('detail.writePrescription')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Services Tab */}
          {canReadServices && (
            <TabsContent value='services'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span>{t('detail.services')}</span>
                      {patientServices.length > 0 && (
                        <span className='text-sm font-normal text-muted-foreground'>
                          ({patientServices.length} {t('detail.items')})
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      {patientServices.length > 0 && (
                        <ServicesDownloadButton
                          exam={exam}
                          services={patientServices}
                        />
                      )}
                      <Button
                        size='sm'
                        onClick={() => {
                          setIsAddingService(true);
                          // Ensure duration is set from existing services if available
                          if (serviceDuration === 0 || !serviceDuration) {
                            let maxDuration = 7; // Default
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
                                (date: any) =>
                                  date !== null && date !== undefined
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
                          if (services.length === 0) {
                            addService();
                          }
                        }}
                        disabled={isAddingService}
                      >
                        <Plus className='w-4 h-4 mr-2' />
                        {t('detail.addService')}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Unified Services Table - Show if services exist or adding/editing */}
                    {(patientServices.length > 0 ||
                      isAddingService ||
                      editingServiceId) && (
                      <Card className='border border-primary/10 mb-4'>
                        <CardContent className='pt-4'>
                          <div className='flex items-center justify-between mb-3'>
                            <Label className='text-sm font-semibold'>
                              {t('detail.servicesTable')}
                            </Label>
                            {/* Show form controls if adding or editing */}
                            {(isAddingService || editingServiceId) && (
                              <div className='flex items-end gap-2'>
                                <div className='w-32'>
                                  <Label className='text-xs'>
                                    {t('detail.durationDays')}
                                  </Label>
                                  <Input
                                    type='number'
                                    value={
                                      serviceDuration === 0
                                        ? ''
                                        : serviceDuration
                                    }
                                    min={0}
                                    max={60}
                                    onChange={(e) => {
                                      const inputValue = e.target.value;
                                      if (inputValue === '') {
                                        setServiceDuration(0);
                                        return;
                                      }
                                      const newDuration =
                                        parseInt(inputValue) || 0;
                                      if (newDuration < 0) {
                                        setServiceDuration(0);
                                        return;
                                      }
                                      setServiceDuration(newDuration);
                                      if (newDuration > 0) {
                                        setServices(
                                          services.map((srv) => {
                                            const currentDays = srv.days || [];

                                            // If all previous days were marked (all have dates), mark all new days too
                                            if (currentDays.length > 0) {
                                              const allDaysMarked =
                                                currentDays.every(
                                                  (day) => day.date !== null
                                                );
                                              const currentMaxDay =
                                                currentDays.length;

                                              if (
                                                allDaysMarked &&
                                                newDuration > currentMaxDay
                                              ) {
                                                // All previous days were marked, so mark all new days too
                                                const newDays: ServiceDay[] =
                                                  Array.from(
                                                    { length: newDuration },
                                                    (_, idx) => {
                                                      if (idx < currentMaxDay) {
                                                        return currentDays[idx];
                                                      }
                                                      const dayDate = new Date(
                                                        serviceStartDate
                                                      );
                                                      dayDate.setDate(
                                                        dayDate.getDate() + idx
                                                      );
                                                      return {
                                                        day: idx + 1,
                                                        date: dayDate,
                                                      };
                                                    }
                                                  );
                                                return {
                                                  ...srv,
                                                  duration: newDuration,
                                                  days: newDays,
                                                };
                                              }
                                            }

                                            // Otherwise, extend days but keep existing ones
                                            const newDays: ServiceDay[] =
                                              Array.from(
                                                { length: newDuration },
                                                (_, idx) => {
                                                  const existingDay =
                                                    currentDays[idx];
                                                  if (existingDay) {
                                                    return existingDay;
                                                  }
                                                  return {
                                                    day: idx + 1,
                                                    date: null,
                                                  };
                                                }
                                              );
                                            return {
                                              ...srv,
                                              duration: newDuration,
                                              days: newDays,
                                            };
                                          })
                                        );
                                      } else {
                                        setServices(
                                          services.map((srv) => ({
                                            ...srv,
                                            duration: 0,
                                            days: [],
                                          }))
                                        );
                                      }
                                    }}
                                    className='mt-1 h-8 text-sm'
                                  />
                                </div>
                                <div>
                                  <Label className='text-xs'>
                                    {t('detail.startDate')}
                                  </Label>
                                  <Input
                                    type='date'
                                    value={
                                      serviceStartDate
                                        .toISOString()
                                        .split('T')[0]
                                    }
                                    onChange={(e) => {
                                      const newDate = new Date(e.target.value);
                                      setServiceStartDate(newDate);
                                      setServices(
                                        services.map((srv) => ({
                                          ...srv,
                                          days: generateDays(
                                            serviceDuration,
                                            [],
                                            newDate
                                          ),
                                        }))
                                      );
                                    }}
                                    className='mt-1 h-8 text-sm'
                                  />
                                </div>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={markEveryDay}
                                  disabled={services.length === 0}
                                  className='h-8'
                                >
                                  {t('detail.everyDay')}
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={markEveryOtherDay}
                                  disabled={services.length === 0}
                                  className='h-8'
                                >
                                  {t('detail.everyOtherDay')}
                                </Button>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setIsAddingService(true);
                                    // Ensure duration is set from existing services if available
                                    if (
                                      serviceDuration === 0 ||
                                      !serviceDuration
                                    ) {
                                      let maxDuration = 7; // Default
                                      if (patientServices.length > 0) {
                                        const durations = patientServices
                                          .flatMap(
                                            (doc: any) =>
                                              doc.items?.map(
                                                (item: any) =>
                                                  item.duration ||
                                                  item.days?.length ||
                                                  0
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
                                          (date: any) =>
                                            date !== null && date !== undefined
                                        )
                                        .sort((a: any, b: any) => {
                                          const dateA = new Date(a).getTime();
                                          const dateB = new Date(b).getTime();
                                          return dateA - dateB;
                                        })[0];
                                      if (firstDate) {
                                        setServiceStartDate(
                                          new Date(firstDate)
                                        );
                                      }
                                    }
                                    addService();
                                  }}
                                  className='h-8 bg-blue-500 hover:bg-blue-600 text-white'
                                >
                                  <Plus className='w-3 h-3 mr-1' />
                                  {t('detail.add')}
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border text-sm'>
                              <thead>
                                {(() => {
                                  // Determine the number of days to show in header
                                  // If adding new services, use serviceDuration
                                  // If only existing services, find max duration
                                  let daysToShow = 8; // Default to 8

                                  if (services.length > 0 || isAddingService) {
                                    // If adding new services, use serviceDuration (minimum 1)
                                    // Also consider existing services' duration
                                    let maxExistingDuration = 0;
                                    if (patientServices.length > 0) {
                                      maxExistingDuration =
                                        patientServices.reduce(
                                          (max: number, doc: any) => {
                                            const docMax =
                                              doc.items?.reduce(
                                                (
                                                  itemMax: number,
                                                  item: any
                                                ) => {
                                                  const itemDuration =
                                                    item.duration ||
                                                    item.days?.length ||
                                                    0;
                                                  return Math.max(
                                                    itemMax,
                                                    itemDuration
                                                  );
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
                                                item.duration ||
                                                item.days?.length ||
                                                0;
                                              return Math.max(
                                                itemMax,
                                                itemDuration
                                              );
                                            },
                                            0
                                          ) || 0;
                                        return Math.max(max, docMax);
                                      },
                                      0
                                    );
                                    daysToShow =
                                      maxDuration > 0 ? maxDuration : 8;
                                  }

                                  // Split days into chunks of 8 for multiple rows
                                  const daysPerRow = 8;
                                  const headerChunks: number[][] = [];
                                  for (
                                    let i = 0;
                                    i < daysToShow;
                                    i += daysPerRow
                                  ) {
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

                                  return headerChunks.map(
                                    (chunk, chunkIndex) => (
                                      <tr
                                        key={`header-${chunkIndex}`}
                                        className='bg-muted/50'
                                      >
                                        {chunkIndex === 0 && (
                                          <th
                                            className='border px-3 py-2 text-left font-semibold min-w-[150px]'
                                            rowSpan={headerChunks.length}
                                          >
                                            {t('detail.serviceName')}
                                          </th>
                                        )}
                                        {chunk.map((dayNum) => (
                                          <th
                                            key={dayNum}
                                            className='border px-2 py-2 text-center font-semibold min-w-[70px]'
                                          ></th>
                                        ))}
                                        {chunk.length < daysPerRow &&
                                          Array.from(
                                            {
                                              length: daysPerRow - chunk.length,
                                            },
                                            (_, i) => (
                                              <th
                                                key={`empty-${i}`}
                                                className='border px-2 py-2'
                                              ></th>
                                            )
                                          )}
                                        {chunkIndex === 0 && (
                                          <th
                                            className='border px-2 py-2 text-center font-semibold w-12'
                                            rowSpan={headerChunks.length}
                                          >
                                            {t('detail.actions')}
                                          </th>
                                        )}
                                      </tr>
                                    )
                                  );
                                })()}
                              </thead>
                              <tbody>
                                {/* Existing services - show in their original position, editable if being edited */}
                                {patientServices.map((serviceDoc: any) =>
                                  serviceDoc.items?.map((service: any) => {
                                    // Check if this service is being edited
                                    const isBeingEdited =
                                      editingServiceId &&
                                      service._id === editingServiceId;

                                    // If being edited, use data from services array, otherwise use original data
                                    const editingService = isBeingEdited
                                      ? services.find(
                                          (s) => s.id === service._id
                                        )
                                      : null;

                                    const serviceDays = editingService
                                      ? editingService.days || []
                                      : service.days || [];
                                    const originalDuration = editingService
                                      ? editingService.duration ||
                                        serviceDays.length ||
                                        0
                                      : service.duration ||
                                        serviceDays.length ||
                                        0;

                                    // If new services are being added, use the maximum of serviceDuration and original duration
                                    const totalDays =
                                      services.length > 0 && !isBeingEdited
                                        ? Math.max(
                                            serviceDuration,
                                            originalDuration
                                          )
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
                                        const dayData = serviceDays[j];
                                        chunk.push({
                                          dayNumber: j + 1,
                                          dayData: dayData || null,
                                        });
                                      }
                                      dayChunks.push(chunk);
                                    }

                                    // If no days, show at least one row
                                    if (dayChunks.length === 0) {
                                      dayChunks.push([]);
                                    }

                                    return dayChunks.map(
                                      (chunk, chunkIndex) => (
                                        <tr
                                          key={`${service._id}-chunk-${chunkIndex}`}
                                          className={`hover:bg-muted/30 ${
                                            isBeingEdited ? 'bg-primary/5' : ''
                                          }`}
                                        >
                                          {chunkIndex === 0 ? (
                                            <td
                                              className='border px-3 py-2 font-medium'
                                              rowSpan={dayChunks.length}
                                            >
                                              {isBeingEdited ? (
                                                <Popover
                                                  open={
                                                    openServiceCombobox ===
                                                    editingService?.id
                                                  }
                                                  onOpenChange={(open) => {
                                                    setOpenServiceCombobox(
                                                      open
                                                        ? editingService?.id ||
                                                            ''
                                                        : ''
                                                    );
                                                    if (open) {
                                                      setServiceSearch('');
                                                      setTimeout(
                                                        () =>
                                                          serviceSearchRef.current?.focus(),
                                                        0
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant='outline'
                                                      role='combobox'
                                                      className='w-full justify-between'
                                                      size='sm'
                                                    >
                                                      {editingService?.service_type_id
                                                        ? getServiceById(
                                                            editingService.service_type_id
                                                          )?.name ||
                                                          t('detail.select')
                                                        : t('detail.select')}
                                                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className='w-[400px] p-0'>
                                                    <Command
                                                      shouldFilter={false}
                                                    >
                                                      <CommandInput
                                                        ref={serviceSearchRef}
                                                        placeholder={t(
                                                          'detail.searchService'
                                                        )}
                                                        value={serviceSearch}
                                                        onValueChange={
                                                          setServiceSearch
                                                        }
                                                        onKeyDown={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      />
                                                      <CommandList
                                                        onScroll={(e: any) => {
                                                          const bottom =
                                                            e.target
                                                              .scrollHeight -
                                                              e.target
                                                                .scrollTop ===
                                                            e.target
                                                              .clientHeight;
                                                          if (
                                                            bottom &&
                                                            serviceHasMoreData &&
                                                            !isFetchingServices
                                                          ) {
                                                            setServicePage(
                                                              (prev) => prev + 1
                                                            );
                                                          }
                                                        }}
                                                      >
                                                        {isFetchingServices &&
                                                        serviceTypes.length ===
                                                          0 ? (
                                                          <div className='flex items-center justify-center py-4'>
                                                            <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                                            <span className='text-sm text-muted-foreground'>
                                                              {t(
                                                                'detail.loading'
                                                              )}
                                                            </span>
                                                          </div>
                                                        ) : serviceTypes.length ===
                                                          0 ? (
                                                          <CommandEmpty>
                                                            {t(
                                                              'detail.serviceNotFound'
                                                            )}
                                                          </CommandEmpty>
                                                        ) : (
                                                          <CommandGroup>
                                                            {(() => {
                                                              // Get list of already selected service IDs (excluding current editing service)
                                                              const selectedServiceIds =
                                                                services
                                                                  .filter(
                                                                    (s) =>
                                                                      s.service_type_id &&
                                                                      s.id !==
                                                                        editingService?.id
                                                                  )
                                                                  .map(
                                                                    (s) =>
                                                                      s.service_type_id
                                                                  );

                                                              // Also include services from patientServices that are not being edited
                                                              const existingServiceIds =
                                                                patientServices
                                                                  .flatMap(
                                                                    (
                                                                      doc: any
                                                                    ) =>
                                                                      doc.items ||
                                                                      []
                                                                  )
                                                                  .filter(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item._id !==
                                                                      editingServiceId
                                                                  )
                                                                  .map(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item
                                                                        .service_type_id
                                                                        ?._id ||
                                                                      item.service_type_id
                                                                  )
                                                                  .filter(
                                                                    Boolean
                                                                  );

                                                              const allSelectedIds =
                                                                [
                                                                  ...new Set([
                                                                    ...selectedServiceIds,
                                                                    ...existingServiceIds,
                                                                  ]),
                                                                ];

                                                              return serviceTypes
                                                                .filter(
                                                                  (
                                                                    serviceType: any
                                                                  ) =>
                                                                    !allSelectedIds.includes(
                                                                      serviceType._id
                                                                    )
                                                                )
                                                                .map(
                                                                  (
                                                                    serviceType: any
                                                                  ) => (
                                                                    <CommandItem
                                                                      key={
                                                                        serviceType._id
                                                                      }
                                                                      value={
                                                                        serviceType._id
                                                                      }
                                                                      keywords={[
                                                                        serviceType.name,
                                                                        serviceType._id,
                                                                      ]}
                                                                      onSelect={() => {
                                                                        if (
                                                                          editingService
                                                                        ) {
                                                                          updateServiceField(
                                                                            editingService.id,
                                                                            'service_type_id',
                                                                            serviceType._id
                                                                          );
                                                                        }
                                                                        setOpenServiceCombobox(
                                                                          ''
                                                                        );
                                                                        setServiceSearch(
                                                                          ''
                                                                        );
                                                                        setServicePage(
                                                                          1
                                                                        );
                                                                      }}
                                                                    >
                                                                      <Check
                                                                        className={cn(
                                                                          'mr-2 h-4 w-4',
                                                                          editingService?.service_type_id ===
                                                                            serviceType._id
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                        )}
                                                                      />
                                                                      {
                                                                        serviceType.name
                                                                      }
                                                                    </CommandItem>
                                                                  )
                                                                );
                                                            })()}
                                                            {isFetchingServices && (
                                                              <div className='flex items-center justify-center py-2'>
                                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                              </div>
                                                            )}
                                                          </CommandGroup>
                                                        )}
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>
                                              ) : (
                                                service.service_type_id?.name ||
                                                t('detail.unknown')
                                              )}
                                            </td>
                                          ) : null}
                                          {chunk.map((dayItem, idx) => (
                                            <td
                                              key={idx}
                                              className={`border px-1 py-1 text-center group relative ${
                                                isBeingEdited
                                                  ? 'cursor-pointer hover:bg-muted/50'
                                                  : ''
                                              }`}
                                              onClick={() => {
                                                if (
                                                  isBeingEdited &&
                                                  editingService
                                                ) {
                                                  toggleDayMark(
                                                    editingService.id,
                                                    dayItem.dayNumber
                                                  );
                                                }
                                              }}
                                            >
                                              <span className='font-bold text-xs block'>
                                                {dayItem.dayNumber}-
                                                {t('detail.day')}
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
                                                    ).toLocaleDateString(
                                                      'uz-UZ'
                                                    )}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className='text-muted-foreground text-xs'>
                                                  —
                                                </span>
                                              )}
                                            </td>
                                          ))}
                                          {/* Fill empty cells if chunk is less than 8 */}
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
                                              className='border px-1 py-2 text-center w-12'
                                              rowSpan={dayChunks.length}
                                            >
                                              <div className='flex flex-col items-center gap-1'>
                                                <div className='flex gap-1'>
                                                  {isBeingEdited && (
                                                    <>
                                                      <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                          markEveryDayForService(
                                                            editingService?.id ||
                                                              ''
                                                          )
                                                        }
                                                        className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                                        disabled={
                                                          !editingService?.service_type_id
                                                        }
                                                        title={t(
                                                          'detail.everyDay'
                                                        )}
                                                      >
                                                        <CalendarDays className='w-3 h-3' />
                                                      </Button>
                                                      <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        onClick={() =>
                                                          markEveryOtherDayForService(
                                                            editingService?.id ||
                                                              ''
                                                          )
                                                        }
                                                        className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                                        disabled={
                                                          !editingService?.service_type_id
                                                        }
                                                        title={t(
                                                          'detail.everyOtherDay'
                                                        )}
                                                      >
                                                        <Repeat className='w-3 h-3' />
                                                      </Button>
                                                    </>
                                                  )}
                                                </div>
                                                <div className='flex gap-1'>
                                                  <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                      startEditService(service)
                                                    }
                                                    className='h-6 w-6 p-0'
                                                    disabled={
                                                      deletingServiceId ===
                                                      service._id
                                                    }
                                                    title={t('detail.editExam')}
                                                  >
                                                    <Edit className='h-3 w-3' />
                                                  </Button>
                                                  <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                      handleDeleteService(
                                                        service._id
                                                      )
                                                    }
                                                    className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                                    disabled={
                                                      deletingServiceId ===
                                                        service._id ||
                                                      isAddingService
                                                    }
                                                    title={t(
                                                      'detail.deleteExam'
                                                    )}
                                                  >
                                                    {deletingServiceId ===
                                                    service._id ? (
                                                      <Loader2 className='h-3 w-3 animate-spin' />
                                                    ) : (
                                                      <Trash2 className='h-3 w-3' />
                                                    )}
                                                  </Button>
                                                </div>
                                              </div>
                                            </td>
                                          ) : null}
                                        </tr>
                                      )
                                    );
                                  })
                                )}
                                {/* Services being added (new services only, not edited ones) - show as rows in table */}
                                {(isAddingService || editingServiceId) &&
                                  services
                                    .filter(
                                      (service) =>
                                        !editingServiceId ||
                                        service.id !== editingServiceId
                                    )
                                    .map((service) => {
                                      // Split days into chunks of 8
                                      const dayChunks: Array<
                                        typeof service.days
                                      > = [];
                                      for (
                                        let i = 0;
                                        i < service.days.length;
                                        i += 8
                                      ) {
                                        dayChunks.push(
                                          service.days.slice(i, i + 8)
                                        );
                                      }

                                      return dayChunks.map(
                                        (chunk, chunkIndex) => (
                                          <tr
                                            key={`new-${service.id}-chunk-${chunkIndex}`}
                                            className='hover:bg-muted/30 bg-primary/5'
                                          >
                                            {chunkIndex === 0 ? (
                                              <td
                                                className='border px-3 py-2'
                                                rowSpan={dayChunks.length}
                                              >
                                                <Popover
                                                  open={
                                                    openServiceCombobox ===
                                                    service.id
                                                  }
                                                  onOpenChange={(open) => {
                                                    setOpenServiceCombobox(
                                                      open ? service.id : ''
                                                    );
                                                    if (open) {
                                                      setServiceSearch('');
                                                      setTimeout(
                                                        () =>
                                                          serviceSearchRef.current?.focus(),
                                                        0
                                                      );
                                                    }
                                                  }}
                                                >
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant='outline'
                                                      role='combobox'
                                                      className='w-full justify-between'
                                                      size='sm'
                                                    >
                                                      {service.service_type_id
                                                        ? getServiceById(
                                                            service.service_type_id
                                                          )?.name ||
                                                          t('detail.select')
                                                        : t('detail.select')}
                                                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className='w-[400px] p-0'>
                                                    <Command
                                                      shouldFilter={false}
                                                    >
                                                      <CommandInput
                                                        ref={serviceSearchRef}
                                                        placeholder={t(
                                                          'detail.searchService'
                                                        )}
                                                        value={serviceSearch}
                                                        onValueChange={
                                                          setServiceSearch
                                                        }
                                                        onKeyDown={(e) =>
                                                          e.stopPropagation()
                                                        }
                                                      />
                                                      <CommandList
                                                        onScroll={(e: any) => {
                                                          const bottom =
                                                            e.target
                                                              .scrollHeight -
                                                              e.target
                                                                .scrollTop ===
                                                            e.target
                                                              .clientHeight;
                                                          if (
                                                            bottom &&
                                                            serviceHasMoreData &&
                                                            !isFetchingServices
                                                          ) {
                                                            setServicePage(
                                                              (prev) => prev + 1
                                                            );
                                                          }
                                                        }}
                                                      >
                                                        {isFetchingServices &&
                                                        serviceTypes.length ===
                                                          0 ? (
                                                          <div className='flex items-center justify-center py-4'>
                                                            <Loader2 className='h-4 w-4 animate-spin mr-2' />
                                                            <span className='text-sm text-muted-foreground'>
                                                              {t(
                                                                'common:loading'
                                                              )}
                                                            </span>
                                                          </div>
                                                        ) : serviceTypes.length ===
                                                          0 ? (
                                                          <CommandEmpty>
                                                            {t(
                                                              'services.serviceNotFound'
                                                            )}
                                                          </CommandEmpty>
                                                        ) : (
                                                          <CommandGroup>
                                                            {(() => {
                                                              // Get list of already selected service IDs (excluding current service)
                                                              const selectedServiceIds =
                                                                services
                                                                  .filter(
                                                                    (s) =>
                                                                      s.service_type_id &&
                                                                      s.id !==
                                                                        service.id
                                                                  )
                                                                  .map(
                                                                    (s) =>
                                                                      s.service_type_id
                                                                  );

                                                              // Also include services from patientServices that are not being edited
                                                              const existingServiceIds =
                                                                patientServices
                                                                  .flatMap(
                                                                    (
                                                                      doc: any
                                                                    ) =>
                                                                      doc.items ||
                                                                      []
                                                                  )
                                                                  .filter(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item._id !==
                                                                      service.id
                                                                  )
                                                                  .map(
                                                                    (
                                                                      item: any
                                                                    ) =>
                                                                      item
                                                                        .service_type_id
                                                                        ?._id ||
                                                                      item.service_type_id
                                                                  )
                                                                  .filter(
                                                                    Boolean
                                                                  );

                                                              const allSelectedIds =
                                                                [
                                                                  ...new Set([
                                                                    ...selectedServiceIds,
                                                                    ...existingServiceIds,
                                                                  ]),
                                                                ];

                                                              return serviceTypes
                                                                .filter(
                                                                  (
                                                                    serviceType: any
                                                                  ) =>
                                                                    !allSelectedIds.includes(
                                                                      serviceType._id
                                                                    )
                                                                )
                                                                .map(
                                                                  (
                                                                    serviceType: any
                                                                  ) => (
                                                                    <CommandItem
                                                                      key={
                                                                        serviceType._id
                                                                      }
                                                                      value={
                                                                        serviceType._id
                                                                      }
                                                                      keywords={[
                                                                        serviceType.name,
                                                                        serviceType._id,
                                                                      ]}
                                                                      onSelect={() => {
                                                                        updateServiceField(
                                                                          service.id,
                                                                          'service_type_id',
                                                                          serviceType._id
                                                                        );
                                                                        setOpenServiceCombobox(
                                                                          ''
                                                                        );
                                                                        setServiceSearch(
                                                                          ''
                                                                        );
                                                                        setServicePage(
                                                                          1
                                                                        );
                                                                      }}
                                                                    >
                                                                      <Check
                                                                        className={cn(
                                                                          'mr-2 h-4 w-4',
                                                                          service.service_type_id ===
                                                                            serviceType._id
                                                                            ? 'opacity-100'
                                                                            : 'opacity-0'
                                                                        )}
                                                                      />
                                                                      {
                                                                        serviceType.name
                                                                      }
                                                                    </CommandItem>
                                                                  )
                                                                );
                                                            })()}
                                                            {isFetchingServices && (
                                                              <div className='flex items-center justify-center py-2'>
                                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                              </div>
                                                            )}
                                                          </CommandGroup>
                                                        )}
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>
                                              </td>
                                            ) : null}
                                            {chunk.map((day) => (
                                              <td
                                                key={day.day}
                                                className='border px-1 py-1 text-center cursor-pointer hover:bg-muted/50'
                                                onClick={() =>
                                                  toggleDayMark(
                                                    service.id,
                                                    day.day
                                                  )
                                                }
                                              >
                                                <span className='font-bold text-xs block'>
                                                  {day.day}-{t('detail.day')}
                                                </span>
                                                {day.date ? (
                                                  <div className='text-xs font-medium text-primary'>
                                                    {new Date(
                                                      day.date
                                                    ).toLocaleDateString(
                                                      'en-GB',
                                                      {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                      }
                                                    )}
                                                  </div>
                                                ) : (
                                                  <span className='text-muted-foreground text-xs'>
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                            ))}
                                            {/* Fill empty cells if chunk is less than 8 */}
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
                                                className='border px-1 py-2 text-center w-12'
                                                rowSpan={dayChunks.length}
                                              >
                                                <div className='flex flex-col items-center gap-1'>
                                                  <div className='flex gap-1'>
                                                    <Button
                                                      variant='ghost'
                                                      size='sm'
                                                      onClick={() =>
                                                        markEveryDayForService(
                                                          service.id
                                                        )
                                                      }
                                                      className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                                      disabled={
                                                        !service.service_type_id
                                                      }
                                                      title={t(
                                                        'detail.everyDay'
                                                      )}
                                                    >
                                                      <CalendarDays className='w-3 h-3' />
                                                    </Button>
                                                    <Button
                                                      variant='ghost'
                                                      size='sm'
                                                      onClick={() =>
                                                        markEveryOtherDayForService(
                                                          service.id
                                                        )
                                                      }
                                                      className='h-6 w-6 p-0 text-muted-foreground hover:text-primary'
                                                      disabled={
                                                        !service.service_type_id
                                                      }
                                                      title={t(
                                                        'detail.everyOtherDay'
                                                      )}
                                                    >
                                                      <Repeat className='w-3 h-3' />
                                                    </Button>
                                                  </div>
                                                  <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                      removeService(service.id)
                                                    }
                                                    className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                                    title={t(
                                                      'detail.deleteExam'
                                                    )}
                                                  >
                                                    <Trash2 className='w-3 h-3' />
                                                  </Button>
                                                </div>
                                              </td>
                                            ) : null}
                                          </tr>
                                        )
                                      );
                                    })}
                              </tbody>
                            </table>
                          </div>
                          {/* Action buttons when adding or editing */}
                          {(isAddingService || editingServiceId) && (
                            <div className='flex gap-2 justify-end mt-4 pt-2 border-t'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  setIsAddingService(false);
                                  setServices([]);
                                  setServiceDuration(7);
                                  setServiceStartDate(new Date());
                                  setEditingServiceId(null);
                                }}
                                disabled={
                                  isAddingServiceMutation || isUpdatingService
                                }
                              >
                                <X className='w-4 h-4 mr-2' />
                                Бекор қилиш
                              </Button>
                              <Button
                                size='sm'
                                onClick={handleSaveService}
                                disabled={
                                  isAddingServiceMutation ||
                                  isUpdatingService ||
                                  services.length === 0
                                }
                              >
                                <Save className='w-4 h-4 mr-2' />
                                {editingServiceId
                                  ? isUpdatingService
                                    ? t('detail.updating')
                                    : t('detail.update')
                                  : isAddingServiceMutation
                                  ? t('detail.saving')
                                  : t('detail.save')}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {patientServices.length === 0 ? (
                      <div className='text-center py-8'>
                        <p className='text-muted-foreground mb-4'>
                          {t('detail.noServices')}
                        </p>
                        {!isAddingService && (
                          <Button
                            onClick={() => {
                              setIsAddingService(true);
                              // Ensure duration is set from existing services if available
                              if (serviceDuration === 0 || !serviceDuration) {
                                let maxDuration = 7; // Default
                                if (patientServices.length > 0) {
                                  const durations = patientServices
                                    .flatMap(
                                      (doc: any) =>
                                        doc.items?.map(
                                          (item: any) =>
                                            item.duration ||
                                            item.days?.length ||
                                            0
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
                                    (date: any) =>
                                      date !== null && date !== undefined
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
                              // Add default one row
                              if (services.length === 0) {
                                addService();
                              }
                            }}
                          >
                            <Plus className='w-4 h-4 mr-2' />
                            {t('detail.addService')}
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Visits Tab */}
          {canReadVisits && (
            <TabsContent value='visits'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{t('laboratory.title')}</span>
                    {exam.analyses && exam.analyses.length > 0 && (
                      <span className='text-sm font-normal text-muted-foreground'>
                        ({exam.analyses.length} {t('laboratory.count')})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exam.analyses && exam.analyses.length > 0 ? (
                    <div className='space-y-4'>
                      {exam.analyses.map((analysis: any, index: number) => {
                        const paramType = analysis.analysis_parameter_type;
                        const paramValue = analysis.analysis_parameter_value;

                        // Check if this is new structure (single parameter per analysis)
                        const isNewStructure =
                          paramType && typeof paramType === 'object';

                        if (isNewStructure) {
                          // NEW STRUCTURE: Single parameter with detailed info
                          const isAbnormal =
                            paramType?.normal_range &&
                            (() => {
                              const range =
                                paramType.normal_range.general ||
                                paramType.normal_range.male ||
                                paramType.normal_range.female;
                              if (range && typeof paramValue === 'number') {
                                return (
                                  paramValue < range.min ||
                                  paramValue > range.max
                                );
                              }
                              return false;
                            })();

                          return (
                            <Card
                              key={analysis._id}
                              className={`border ${
                                isAbnormal
                                  ? 'border-red-300 bg-red-50/30'
                                  : 'border-primary/10 bg-primary/5'
                              }`}
                            >
                              <CardContent className='pt-4'>
                                <div className='space-y-4'>
                                  {/* Parameter Info */}
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Параметр номи
                                      </Label>
                                      <p className='font-bold text-base mt-1'>
                                        {paramType.parameter_name}
                                      </p>
                                      {paramType.parameter_code && (
                                        <p className='text-xs text-muted-foreground mt-1'>
                                          Код: {paramType.parameter_code}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Натижа
                                      </Label>
                                      <div className='flex items-baseline gap-2 mt-1'>
                                        <p
                                          className={`font-bold text-lg ${
                                            isAbnormal
                                              ? 'text-red-600'
                                              : 'text-green-600'
                                          }`}
                                        >
                                          {paramValue}
                                        </p>
                                        {paramType.unit && (
                                          <span className='text-sm text-muted-foreground'>
                                            {paramType.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Normal Range */}
                                  {paramType?.normal_range && (
                                    <div className='bg-white rounded border p-3'>
                                      <Label className='text-xs text-muted-foreground block mb-2'>
                                        Меъёрий қийматлар
                                      </Label>
                                      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm'>
                                        {paramType.normal_range.general && (
                                          <div>
                                            <p className='text-xs text-muted-foreground'>
                                              Умумий:
                                            </p>
                                            <p className='font-semibold'>
                                              {
                                                paramType.normal_range.general
                                                  .min
                                              }{' '}
                                              -{' '}
                                              {
                                                paramType.normal_range.general
                                                  .max
                                              }
                                              {paramType.normal_range.general
                                                .value &&
                                                ` (${paramType.normal_range.general.value})`}
                                            </p>
                                          </div>
                                        )}
                                        {paramType.normal_range.male && (
                                          <div>
                                            <p className='text-xs text-muted-foreground'>
                                              Эркаклар:
                                            </p>
                                            <p className='font-semibold'>
                                              {paramType.normal_range.male.min}{' '}
                                              -{' '}
                                              {paramType.normal_range.male.max}
                                              {paramType.normal_range.male
                                                .value &&
                                                ` (${paramType.normal_range.male.value})`}
                                            </p>
                                          </div>
                                        )}
                                        {paramType.normal_range.female && (
                                          <div>
                                            <p className='text-xs text-muted-foreground'>
                                              Аёллар:
                                            </p>
                                            <p className='font-semibold'>
                                              {
                                                paramType.normal_range.female
                                                  .min
                                              }{' '}
                                              -{' '}
                                              {
                                                paramType.normal_range.female
                                                  .max
                                              }
                                              {paramType.normal_range.female
                                                .value &&
                                                ` (${paramType.normal_range.female.value})`}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Description */}
                                  {paramType?.description && (
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Таърифи
                                      </Label>
                                      <p className='text-sm mt-1 bg-blue-50 p-2 rounded border border-blue-200'>
                                        {paramType.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Status Indicator */}
                                  {isAbnormal && (
                                    <div className='bg-red-100 border border-red-300 rounded p-3'>
                                      <p className='text-sm font-semibold text-red-800 flex items-center gap-2'>
                                        <AlertTriangle className='w-4 h-4' />
                                        Огоҳлантириш: Натижа меъёрий қийматдан
                                        ташқарида
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } else {
                          // OLD STRUCTURE: Analysis with multiple results
                          return (
                            <Card
                              key={analysis._id}
                              className='border border-primary/10 bg-primary/5'
                            >
                              <CardContent className='pt-4'>
                                <div className='flex items-center justify-between mb-3'>
                                  <div>
                                    <span className='text-sm font-medium text-primary'>
                                      Таҳлил #{index + 1}
                                    </span>
                                    {analysis.created_at && (
                                      <p className='text-xs text-muted-foreground mt-1'>
                                        {new Date(
                                          analysis.created_at
                                        ).toLocaleString('uz-UZ', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </p>
                                    )}
                                  </div>
                                  {analysis.status && (
                                    <div className='text-right'>
                                      <span
                                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                          analysis.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : analysis.status === 'active'
                                            ? 'bg-blue-100 text-blue-800'
                                            : analysis.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}
                                      >
                                        {analysis.status === 'completed'
                                          ? t('detail.statuses.completed')
                                          : analysis.status === 'active'
                                          ? t('detail.statuses.active')
                                          : analysis.status === 'pending'
                                          ? t('detail.statuses.pending')
                                          : analysis.status}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className='space-y-3'>
                                  {analysis.analysis_type && (
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t('detail.analysisType')}
                                      </Label>
                                      <p className='font-semibold text-sm mt-1'>
                                        {typeof analysis.analysis_type ===
                                        'object'
                                          ? analysis.analysis_type.name
                                          : analysis.analysis_type}
                                      </p>
                                    </div>
                                  )}

                                  {analysis.level && (
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        {t('detail.level')}
                                      </Label>
                                      <p className='font-semibold text-sm mt-1'>
                                        {analysis.level}
                                      </p>
                                    </div>
                                  )}

                                  {typeof analysis.analysis_type === 'object' &&
                                    analysis.analysis_type.description && (
                                      <div>
                                        <Label className='text-xs text-muted-foreground'>
                                          Таърифи
                                        </Label>
                                        <p className='text-sm mt-1 bg-blue-50 p-2 rounded border border-blue-200'>
                                          {analysis.analysis_type.description}
                                        </p>
                                      </div>
                                    )}

                                  {analysis.clinical_indications && (
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Клиник Кўрсатмалар
                                      </Label>
                                      <p className='text-sm mt-1 bg-white p-2 rounded border'>
                                        {analysis.clinical_indications}
                                      </p>
                                    </div>
                                  )}

                                  {analysis.results &&
                                    analysis.results.length > 0 && (
                                      <div>
                                        <Label className='text-xs text-muted-foreground mb-2 block'>
                                          Натижалар
                                        </Label>
                                        <div className='bg-white rounded border'>
                                          <div className='overflow-x-auto'>
                                            <table className='w-full text-sm'>
                                              <thead className='bg-muted/50'>
                                                <tr>
                                                  <th className='text-left p-2 font-semibold'>
                                                    Параметр
                                                  </th>
                                                  <th className='text-right p-2 font-semibold'>
                                                    Қиймат
                                                  </th>
                                                  <th className='text-right p-2 font-semibold'>
                                                    Меъёр
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {analysis.results.map(
                                                  (result: any) => {
                                                    const resParamType =
                                                      typeof result.analysis_parameter_type ===
                                                      'object'
                                                        ? result.analysis_parameter_type
                                                        : null;
                                                    const resValue =
                                                      result.analysis_parameter_value;

                                                    // Check if abnormal
                                                    const resIsAbnormal =
                                                      resParamType?.normal_range &&
                                                      (() => {
                                                        const range =
                                                          resParamType
                                                            .normal_range
                                                            .general ||
                                                          resParamType
                                                            .normal_range
                                                            .male ||
                                                          resParamType
                                                            .normal_range
                                                            .female;
                                                        if (
                                                          range &&
                                                          typeof resValue ===
                                                            'number'
                                                        ) {
                                                          return (
                                                            resValue <
                                                              range.min ||
                                                            resValue > range.max
                                                          );
                                                        }
                                                        return false;
                                                      })();

                                                    const normalRangeText =
                                                      resParamType?.normal_range &&
                                                      (() => {
                                                        const range =
                                                          resParamType
                                                            .normal_range
                                                            .general ||
                                                          resParamType
                                                            .normal_range
                                                            .male ||
                                                          resParamType
                                                            .normal_range
                                                            .female;
                                                        if (range) {
                                                          return `${range.min} - ${range.max}`;
                                                        }
                                                        return '-';
                                                      })();

                                                    return (
                                                      <tr
                                                        key={result._id}
                                                        className={`border-t ${
                                                          resIsAbnormal
                                                            ? 'bg-red-50'
                                                            : ''
                                                        }`}
                                                      >
                                                        <td className='p-2'>
                                                          {resParamType
                                                            ? resParamType.parameter_name
                                                            : result.analysis_parameter_type}
                                                        </td>
                                                        <td
                                                          className={`p-2 text-right font-medium ${
                                                            resIsAbnormal
                                                              ? 'text-red-600 font-bold'
                                                              : 'text-green-600'
                                                          }`}
                                                        >
                                                          {resValue}
                                                          {resParamType?.unit && (
                                                            <span className='text-xs text-muted-foreground ml-1'>
                                                              {
                                                                resParamType.unit
                                                              }
                                                            </span>
                                                          )}
                                                        </td>
                                                        <td className='p-2 text-right text-muted-foreground'>
                                                          {normalRangeText ||
                                                            '-'}
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {analysis.comment && (
                                    <div>
                                      <Label className='text-xs text-muted-foreground'>
                                        Изоҳ
                                      </Label>
                                      <p className='text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200'>
                                        {analysis.comment}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground'>
                        {t('laboratory.noAnalysesYet')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Images Tab */}
          {canReadImages && (
            <TabsContent value='images'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{t('radiology.title')}</span>
                    {exam.images &&
                      Array.isArray(exam.images) &&
                      exam.images.length > 0 &&
                      (() => {
                        const totalImagesCount = (exam.images as any[]).reduce(
                          (total: number, img: any) => {
                            if (
                              img?.image_paths &&
                              Array.isArray(img.image_paths)
                            ) {
                              return total + img.image_paths.length;
                            }
                            return total;
                          },
                          0
                        );

                        return totalImagesCount > 0 ? (
                          <span className='text-sm font-normal text-muted-foreground'>
                            ({totalImagesCount} та)
                          </span>
                        ) : null;
                      })()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exam.images && exam.images.length > 0 ? (
                    <div className='space-y-3'>
                      {exam.images.map((image: any, index: number) => {
                        if (
                          !image?.image_paths ||
                          !Array.isArray(image.image_paths) ||
                          image.image_paths.length === 0
                        ) {
                          return null;
                        }

                        const thumbnailPath = image.image_paths[0];
                        const bodyPartLabel =
                          bodyPartLabels[image.body_part] ||
                          image.body_part ||
                          t('detail.notSpecified');
                        const imagingTypeName =
                          image.imaging_type_id?.name || t('detail.unknown');
                        const imageDate = image.created_at
                          ? new Date(image.created_at).toLocaleDateString(
                              'uz-UZ'
                            )
                          : '';

                        return (
                          <Card
                            key={image._id || index}
                            className='overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
                            onClick={() => {
                              setSelectedImage(image);
                              setShowViewModal(true);
                            }}
                          >
                            <div className='flex flex-col sm:flex-row'>
                              <div className='relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0'>
                                <img
                                  src={thumbnailPath}
                                  alt={
                                    image.description ||
                                    `${t('detail.image')} ${index + 1}`
                                  }
                                  className='w-full h-full object-cover hover:scale-105 transition-transform'
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14"%3EТасвир топилмади%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                                {image.image_paths.length > 1 && (
                                  <div className='absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded'>
                                    +{image.image_paths.length - 1}
                                  </div>
                                )}
                                <div className='absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group'>
                                  <Eye className='w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                                </div>
                              </div>

                              <div className='flex-1 p-4'>
                                <div className='space-y-2'>
                                  <h4
                                    className='font-semibold text-base line-clamp-2'
                                    title={image.description}
                                  >
                                    {image.description ||
                                      t('detail.noDescription')}
                                  </h4>
                                  <div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>
                                    <div className='flex items-center gap-1'>
                                      <span className='font-medium text-foreground'>
                                        {imagingTypeName}
                                      </span>
                                    </div>
                                    <span>•</span>
                                    <div className='flex items-center gap-1'>
                                      <span>{bodyPartLabel}</span>
                                    </div>
                                    <span>•</span>
                                    <div className='flex items-center gap-1'>
                                      <span>
                                        {image.image_paths.length}{' '}
                                        {t('detail.imagesCount')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {imageDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground'>
                        {t('radiology.noImagesYet')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Neurologic Status Tab */}
          {canReadExamination && (
            <TabsContent value='neurologic'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('neurologic.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='py-6'>
                    {/* Add Neurologic Form */}
                    {isAddingNeurologic && (
                      <Card className='border-2 border-primary/20 bg-primary/5'>
                        <CardContent className='pt-4'>
                          <div className='space-y-4'>
                            <h3 className='font-semibold text-lg mb-4'>
                              {t('neurologic.newStatus')}
                            </h3>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              {Object.keys(neurologicForm).map((field) => (
                                <div key={field} className='space-y-2'>
                                  <Label className='text-sm font-medium'>
                                    {neurologicFieldLabels[field] || field}
                                  </Label>
                                  <Textarea
                                    placeholder={`${
                                      neurologicFieldLabels[field] || field
                                    } ${t('neurologic.enterField')}`}
                                    value={
                                      neurologicForm[
                                        field as keyof typeof neurologicForm
                                      ]
                                    }
                                    onChange={(e) =>
                                      setNeurologicForm({
                                        ...neurologicForm,
                                        [field]: e.target.value,
                                      })
                                    }
                                    className='min-h-20 resize-y'
                                    rows={3}
                                  />
                                </div>
                              ))}
                            </div>
                            <div className='flex gap-2 justify-end pt-4'>
                              <Button
                                variant='outline'
                                onClick={() => {
                                  setIsAddingNeurologic(false);
                                  setNeurologicForm(initialNeurologicForm);
                                }}
                                disabled={isCreatingNeurologic}
                              >
                                <X className='w-4 h-4 mr-2' />
                                {t('detail.cancel')}
                              </Button>
                              <Button
                                onClick={handleAddNeurologic}
                                disabled={isCreatingNeurologic}
                              >
                                <Save className='w-4 h-4 mr-2' />
                                {isCreatingNeurologic
                                  ? t('detail.saving')
                                  : t('detail.save')}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Neurologic Status List */}
                    {neurologicStatuses.length > 0
                      ? neurologicStatuses.map(
                          (neurologic: any, index: number) => (
                            <Card
                              key={neurologic._id}
                              className='border border-primary/10'
                            >
                              <CardContent className='pt-4'>
                                {editingNeurologicId === neurologic._id ? (
                                  <div className='space-y-4'>
                                    <h3 className='font-semibold text-lg mb-4'>
                                      {t('detail.editExam')}
                                    </h3>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      {Object.keys(neurologicForm).map(
                                        (field) => (
                                          <div
                                            key={field}
                                            className='space-y-2'
                                          >
                                            <Label className='text-sm font-medium'>
                                              {neurologicFieldLabels[field] ||
                                                field}
                                            </Label>
                                            <Textarea
                                              placeholder={`${
                                                neurologicFieldLabels[field] ||
                                                field
                                              } ${t('neurologic.enterField')}`}
                                              value={
                                                neurologicForm[
                                                  field as keyof typeof neurologicForm
                                                ]
                                              }
                                              onChange={(e) =>
                                                setNeurologicForm({
                                                  ...neurologicForm,
                                                  [field]: e.target.value,
                                                })
                                              }
                                              className='min-h-20 resize-y'
                                              rows={3}
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                    <div className='flex gap-2 justify-end pt-4'>
                                      <Button
                                        variant='outline'
                                        onClick={cancelEditNeurologic}
                                        disabled={isUpdatingNeurologic}
                                      >
                                        <X className='w-4 h-4 mr-2' />
                                        {t('detail.cancel')}
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleUpdateNeurologic(neurologic._id)
                                        }
                                        disabled={isUpdatingNeurologic}
                                      >
                                        <Save className='w-4 h-4 mr-2' />
                                        {isUpdatingNeurologic
                                          ? t('detail.saving')
                                          : t('detail.save')}
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className='flex items-center justify-between mb-4'>
                                      <div className='flex items-center gap-2'>
                                        <Brain className='w-5 h-5 text-primary' />
                                        <span className='text-sm font-medium text-primary'>
                                          {t('detail.neurologicStatusNumber')} #
                                          {index + 1}
                                        </span>
                                      </div>
                                      <div className='flex gap-2'>
                                        <NeurologicStatusDownloadButton
                                          exam={exam}
                                          neurologic={neurologic}
                                        />
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            startEditNeurologic(neurologic)
                                          }
                                          disabled={
                                            editingNeurologicId !== null
                                          }
                                        >
                                          <Edit className='h-4 w-4' />
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='sm'
                                          onClick={() =>
                                            handleDeleteNeurologic(
                                              neurologic._id
                                            )
                                          }
                                          disabled={isDeletingNeurologic}
                                          className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                      {Object.keys(initialNeurologicForm).map(
                                        (field) => {
                                          const value = neurologic[field];
                                          if (!value) return null;
                                          return (
                                            <div
                                              key={field}
                                              className='bg-muted/50 p-3 rounded-lg'
                                            >
                                              <Label className='text-xs text-muted-foreground block mb-1'>
                                                {neurologicFieldLabels[field] ||
                                                  field}
                                              </Label>
                                              <p className='text-sm font-medium whitespace-pre-wrap'>
                                                {value}
                                              </p>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                    {neurologic.created_at && (
                                      <div className='mt-4 pt-3 border-t border-primary/10'>
                                        <p className='text-xs text-muted-foreground'>
                                          Яратилган:{' '}
                                          {new Date(
                                            neurologic.created_at
                                          ).toLocaleString('uz-UZ')}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          )
                        )
                      : !isAddingNeurologic && (
                          <div className='text-center py-8'>
                            <Brain className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                            <p className='text-muted-foreground mb-4'>
                              {t('neurologic.noStatusYet')}
                            </p>
                            <Button onClick={() => setIsAddingNeurologic(true)}>
                              <Plus className='w-4 h-4 mr-2' />
                              {t('neurologic.addStatus')}
                            </Button>
                          </div>
                        )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* View Medical Images Modal */}
        <ViewMedicalImage
          open={showViewModal}
          onOpenChange={setShowViewModal}
          medicalImage={selectedImage}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <AlertTriangle className='w-5 h-5 text-red-600' />
                Кўрикни ўчириш
              </DialogTitle>
              <DialogDescription>
                Сиз ҳақиқатан ҳам бу кўрикни ўчирмоқчимисиз? Бу амални қайтариб
                бўлмайди.
              </DialogDescription>
            </DialogHeader>

            <div className='py-4'>
              <div className='p-4 bg-muted rounded-lg space-y-2'>
                <p className='text-sm'>
                  <span className='font-semibold'>Бемор:</span>{' '}
                  {exam.patient_id?.fullname}
                </p>
                <p className='text-sm'>
                  <span className='font-semibold'>Шифокор:</span>{' '}
                  {exam.doctor_id?.fullname}
                </p>
                <p className='text-sm'>
                  <span className='font-semibold'>Сана:</span>{' '}
                  {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setIsDeleteConfirm(false)}
                disabled={isDeleting}
              >
                {t('detail.cancel')}
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t('detail.deleting') : t('detail.deleteExam')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ExaminationDetail;
