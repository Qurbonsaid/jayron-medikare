import { useGetAllDiagnosisQuery } from '@/app/api/diagnosisApi/diagnosisApi';
import {
  useAddServiceMutation,
  useCompleteExamsMutation,
  useDeleteExamMutation,
  useGetOneExamQuery,
  useUpdateExamMutation,
  useUpdatePrescriptionMutation,
  useUpdateServiceMutation,
} from '@/app/api/examinationApi/examinationApi';
import { useGetAllMedicationsQuery } from '@/app/api/medication/medication';
import {
  useCreateNeurologicStatusMutation,
  useDeleteNeurologicStatusMutation,
  useGetAllNeurologicStatusQuery,
  useUpdateNeurologicStatusMutation,
} from '@/app/api/neurologicApi/neurologicApi';
import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BodyPartConstants } from '@/constants/BodyPart';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Edit,
  Eye,
  FilePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ViewMedicalImage } from '../Radiology/components';
import AllPrescriptionsDownloadButton, {
  ExaminationInfoDownloadButton,
  NeurologicStatusDownloadButton,
  ServicesDownloadButton,
} from './components/ExaminationPDF';

// Tana qismlari uchun o'zbek nomlari
const bodyPartLabels: Record<string, string> = {
  [BodyPartConstants.HEAD]: 'Бош',
  [BodyPartConstants.NECK]: 'Бўйин',
  [BodyPartConstants.CHEST]: 'Кўкрак',
  [BodyPartConstants.ABDOMEN]: 'Қорин',
  [BodyPartConstants.PELVIS]: 'Тос',
  [BodyPartConstants.SPINE]: 'Умуртқа поғонаси',
  [BodyPartConstants.ARM]: 'Қўл',
  [BodyPartConstants.LEG]: 'Оёқ',
  [BodyPartConstants.KNEE]: 'Тиззя',
  [BodyPartConstants.SHOULDER]: 'Елка',
  [BodyPartConstants.HAND]: 'Кафт',
  [BodyPartConstants.FOOT]: 'Тобан',
};

const roomType = {
  stasionar: 'Стасионар',
  ambulator: 'Амбулатор',
};

const statusMap: Record<string, { label: string; bgColor: string }> = {
  pending: { label: 'Кутилмоқда', bgColor: 'bg-yellow-500' },
  active: { label: 'Фаол', bgColor: 'bg-blue-500' },
  completed: { label: 'Тайёр', bgColor: 'bg-green-500' },
};

const ExaminationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Service states
  type ServiceDay = { day: number; date: Date | null };

  const generateDays = (
    duration: number,
    prevDays: ServiceDay[] = []
  ): ServiceDay[] => {
    const safeDuration = Math.max(0, Math.min(duration || 0, 60));
    return Array.from({ length: safeDuration }, (_, idx) => {
      const existing = prevDays[idx];
      return existing
        ? existing
        : {
            day: idx + 1,
            date: null,
          };
    });
  };

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    service_type_id: '',
    duration: 1,
    notes: '',
    days: generateDays(1),
    interval: 1,
  });

  // Prescription states
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
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

  // Fetch all services
  const { data: servicesData } = useGetAllServiceQuery({
    page: 1,
    limit: 100,
    search: undefined,
    code: undefined,
    is_active: undefined,
    min_price: undefined,
    max_price: undefined,
  });
  const serviceTypes = servicesData?.data || [];

  // Fetch medications for prescription edit
  const { data: medicationsData } = useGetAllMedicationsQuery({
    page: 1,
    limit: 100,
    search: medicationSearch || undefined,
  });

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
  const [addService, { isLoading: isAddingServiceMutation }] =
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
  }, [exam]);

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
      toast.error('Илтимос, шикоятни киритинг');
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
        toast.success('Кўрик муваффақиятли янгиланди');
        setIsEditMode(false);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || 'Хатолик юз берди');
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
        toast.success('Кўрик муваффақиятли ўчирилди');
        navigate(-1);
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
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
        toast.success('Кўрик муваффақиятли якунланди');
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
      },
    });
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    // Delete prescription functionality is currently disabled in the API
    toast.error('Рецептни ўчириш функцияси ҳозирча мавжуд эмас');
  };

  // Service handlers
  const handleAddService = async () => {
    if (!serviceForm.service_type_id) {
      toast.error('Илтимос, хизмат турини танланг');
      return;
    }
    if (!serviceForm.duration || serviceForm.duration <= 0) {
      toast.error('Илтимос, тўғри муддатни киритинг');
      return;
    }

    const safeDuration = Math.max(1, Math.min(serviceForm.duration, 60));
    const normalizedDays = generateDays(safeDuration, serviceForm.days);

    await handleRequest({
      request: async () => {
        const res = await addService({
          examination_id: exam._id,
          duration: safeDuration,
          items: [
            {
              service_type_id: serviceForm.service_type_id,
              days: normalizedDays,
              notes: serviceForm.notes,
            },
          ],
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Хизмат муваффақиятли қўшилди');
        setIsAddingService(false);
        setServiceForm({
          service_type_id: '',
          duration: 1,
          notes: '',
          days: generateDays(1),
          interval: 1,
        });
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хизматни қўшишда хатолик');
      },
    });
  };

  const handleUpdateService = async (serviceId: string) => {
    if (!serviceForm.service_type_id) {
      toast.error('Илтимос, хизмат турини танланг');
      return;
    }
    if (!serviceForm.duration || serviceForm.duration <= 0) {
      toast.error('Илтимос, тўғри муддатни киритинг');
      return;
    }

    const safeDuration = Math.max(1, Math.min(serviceForm.duration, 60));
    const normalizedDays = generateDays(safeDuration, serviceForm.days);

    await handleRequest({
      request: async () => {
        const res = await updateService({
          examination_id: exam._id,
          duration: safeDuration,
          items: [
            {
              service_type_id: serviceForm.service_type_id,
              days: normalizedDays,
              notes: serviceForm.notes,
            },
          ],
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Хизмат муваффақиятли янгиланди');
        setEditingServiceId(null);
        setServiceForm({
          service_type_id: '',
          duration: 1,
          notes: '',
          days: generateDays(1),
          interval: 1,
        });
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Хизматни янгилашда хатолик');
      },
    });
  };

  const handleRemoveService = async (serviceId: string) => {
    // Remove service functionality is currently disabled in the API
    toast.error('Хизматни ўчириш функцияси ҳозирча мавжуд эмас');
  };

  const startEditService = (service: any) => {
    setEditingServiceId(service._id);
    const existingDays: ServiceDay[] = (service.days || []).map(
      (d: any, idx: number) => ({
        day: d?.day || idx + 1,
        date: d?.date ? new Date(d.date) : null,
      })
    );
    setServiceForm({
      service_type_id: service.service_type_id?._id || service.service_type_id,
      duration: service.duration,
      notes: service.notes || '',
      days: generateDays(service.duration, existingDays),
      interval: 1,
    });
  };

  const cancelEditService = () => {
    setEditingServiceId(null);
    setServiceForm({
      service_type_id: '',
      duration: 1,
      notes: '',
      days: generateDays(1),
      interval: 1,
    });
  };

  const handleServiceDurationChange = (duration: number) => {
    const safeDuration = Math.max(0, Math.min(duration, 60));
    setServiceForm((prev) => ({
      ...prev,
      duration: safeDuration,
      days: generateDays(safeDuration, prev.days),
    }));
  };

  const updateServiceFormDayDate = (index: number, date: Date | null) => {
    setServiceForm((prev) => {
      // If first day, auto-fill subsequent days
      if (index === 0 && date) {
        const newDays = prev.days.map((d, i) => {
          if (i === 0) return { ...d, date };
          const newDate = new Date(date);
          newDate.setDate(newDate.getDate() + i * prev.interval);
          return { ...d, date: newDate };
        });
        return { ...prev, days: newDays };
      }

      const updated = [...prev.days];
      if (updated[index]) {
        updated[index] = { ...updated[index], date };
      }
      return { ...prev, days: updated };
    });
  };

  const updateServiceFormInterval = (newInterval: number) => {
    setServiceForm((prev) => {
      const firstDate = prev.days[0]?.date;
      if (!firstDate) {
        return { ...prev, interval: newInterval };
      }

      const newDays = prev.days.map((d, i) => {
        if (i === 0) return d;
        const newDate = new Date(firstDate);
        newDate.setDate(newDate.getDate() + i * newInterval);
        return { ...d, date: newDate };
      });

      return { ...prev, interval: newInterval, days: newDays };
    });
  };

  const chunkDays = (days: ServiceDay[]) => {
    const rows: ServiceDay[][] = [];
    for (let i = 0; i < days.length; i += 6) {
      rows.push(days.slice(i, i + 6));
    }
    return rows;
  };

  // Prescription handlers
  const startEditPrescription = (prescription: any) => {
    setEditingPrescriptionId(prescription._id);
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
    setPrescriptionForm({
      medication_id: '',
      frequency: '',
      duration: '',
      instructions: '',
      addons: '',
    });
    setMedicationSearch('');
  };

  const handleUpdatePrescription = async (prescriptionId: string) => {
    if (!prescriptionForm.medication_id.trim()) {
      toast.error('Илтимос, дорини танланг');
      return;
    }
    if (
      !prescriptionForm.frequency ||
      parseInt(prescriptionForm.frequency) <= 0
    ) {
      toast.error('Илтимос, тўғри қабул қилиш частотасини киритинг');
      return;
    }
    if (
      !prescriptionForm.duration ||
      parseInt(prescriptionForm.duration) <= 0
    ) {
      toast.error('Илтимос, тўғри муддатни киритинг');
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
        toast.success('Рецепт муваффақиятли янгиланди');
        setEditingPrescriptionId(null);
        setPrescriptionForm({
          medication_id: '',
          frequency: '',
          duration: '',
          instructions: '',
          addons: '',
        });
        setMedicationSearch('');
        refetch();
      },
      onError: (error) => {
        toast.error(error?.data?.error?.msg || 'Рецептни янгилашда хатолик');
      },
    });
  };

  // Neurologic status handlers
  const neurologicFieldLabels: Record<string, string> = {
    meningeal_symptoms: 'Менингеальные симптомы',
    i_para_n_olfactorius: 'I пара – n.olfactorius',
    ii_para_n_opticus: 'II пара – n. opticus',
    iii_para_n_oculomotorius:
      'III, IV, VI пары – n. oculomotorius, n. trochlearis, n. abducens',
    iv_para_n_trochlearis: 'V пара – n.trigeminus',
    v_para_n_trigeminus: 'VII пара – n. facialis',
    vi_para_n_abducens: 'VIII пара – n. vestibulocochlearis',
    vii_para_n_fascialis: 'IX, X пара – n. glossopharingeus, n. vagus',
    viii_para_n_vestibulocochlearis: 'XI пара – n. accessorius',
    ix_para_n_glossopharyngeus: 'XII пара – n. hypoglossus',
    x_para_n_vagus: 'Симптомы орального автоматизма',
    xi_para_n_accessorius: 'Двигательная система',
    xii_para_n_hypoglossus: 'Чувствительная сфера',
    motor_system: 'Координаторная сфера',
    sensory_sphere: 'Высшие мозговые функции',
    coordination_sphere: 'Синдромологический диагноз, обоснование',
    higher_brain_functions: 'Топический диагноз и его обоснование',
    syndromic_diagnosis_justification: 'Синдромологический диагноз',
    topical_diagnosis_justification: 'Топический диагноз',
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
        toast.success('Неврологик статус муваффақиятли қўшилди');
        setIsAddingNeurologic(false);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || 'Неврологик статусни қўшишда хатолик'
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
        toast.success('Неврологик статус муваффақиятли янгиланди');
        setEditingNeurologicId(null);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || 'Неврологик статусни янгилашда хатолик'
        );
      },
    });
  };

  const handleDeleteNeurologic = async (neurologicId: string) => {
    if (!window.confirm('Бу неврологик статусни ўчиришни хоҳлайсизми?')) {
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await deleteNeurologic(neurologicId).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success('Неврологик статус муваффақиятли ўчирилди');
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || 'Неврологик статусни ўчиришда хатолик'
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
          <p className='text-muted-foreground'>Юкланмоқда...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-muted-foreground mb-4'>Кўрик топилмади</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Орқага
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
            <CardTitle>Бемор Маълумотлари</CardTitle>
            <ExaminationInfoDownloadButton exam={exam} />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <Label className='text-muted-foreground'>Исм</Label>
                <p className='font-medium mt-1'>{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Телефон</Label>
                <p className='font-medium mt-1'>{exam.patient_id?.phone}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Шифокор</Label>
                <p className='font-medium mt-1'>{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Сана</Label>
                <p className='font-medium mt-1'>
                  {new Date(exam.created_at).toLocaleDateString('uz-UZ')}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground mr-5'>Тури :</Label>
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
                <Label className='text-muted-foreground mr-5'>Статус :</Label>
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
                Рецепт Ёзиш
              </Button>
              <Button
                variant='outline'
                className='w-full'
                onClick={handleEdit}
                disabled={isEditMode}
              >
                <Edit className='w-4 h-4 mr-2' />
                Таҳрирлаш
              </Button>
              <Button
                variant='outline'
                className='w-full text-red-600 hover:bg-red-600 hover:text-white'
                onClick={() => setIsDeleteConfirm(true)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Ўчириш
              </Button>
              <Button
                variant='default'
                className='w-full bg-green-600 hover:bg-green-700'
                onClick={handleComplete}
                disabled={isCompleting || exam.status === 'completed'}
              >
                <CheckCircle2 className='w-4 h-4 mr-2' />
                {isCompleting
                  ? 'Якунланмоқда...'
                  : exam.status === 'completed'
                  ? 'Якунланган'
                  : 'Якунлаш'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            // Tahrirlash rejimida boshqa tablarga o'tishni bloklash
            if (isEditMode && value !== 'examination') {
              toast.error(
                'Илтимос, аввал таҳрирлашни тугатинг ёки бекор қилинг'
              );
              return;
            }
            setActiveTab(value);
          }}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1'>
            <TabsTrigger
              value='examination'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Кўрик
            </TabsTrigger>
            <TabsTrigger
              value='prescriptions'
              className='py-2 sm:py-3 text-xs sm:text-sm'
              disabled={isEditMode}
            >
              Рецептлар
            </TabsTrigger>
            <TabsTrigger
              value='services'
              className='py-2 sm:py-3 text-xs sm:text-sm'
              disabled={isEditMode}
            >
              Хизматлар
            </TabsTrigger>
            <TabsTrigger
              value='visits'
              className='py-2 sm:py-3 text-xs sm:text-sm'
              disabled={isEditMode}
            >
              Таҳлил
            </TabsTrigger>
            <TabsTrigger
              value='images'
              className='py-2 sm:py-3 text-xs sm:text-sm'
              disabled={isEditMode}
            >
              Тасвирлар
            </TabsTrigger>
            <TabsTrigger
              value='neurologic'
              className='py-2 sm:py-3 text-xs sm:text-sm'
              disabled={isEditMode}
            >
              Неврологик Статус
            </TabsTrigger>
          </TabsList>

          {/* Examination Tab */}
          <TabsContent value='examination'>
            <Card>
              <CardHeader>
                <CardTitle>Кўрик Маълумотлари</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditMode ? (
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label>Шикоят</Label>
                      <Textarea
                        placeholder='Бемор шикоятини киритинг...'
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
                      <Label>Ташхис</Label>
                      <Select
                        value={editForm.diagnosis}
                        onValueChange={(value) =>
                          setEditForm({ ...editForm, diagnosis: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Ташхисни танланг...' />
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
                      <Label>Тавсия</Label>
                      <Textarea
                        placeholder='Кўрик натижаси ва тавсияларни киритинг...'
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
                        Бекор қилиш
                      </Button>
                      <Button onClick={handleUpdate} disabled={isUpdating}>
                        {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-muted-foreground'>Шикоят</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {exam.complaints || 'Киритилмаган'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>Ташхис</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {typeof exam.diagnosis === 'object' &&
                        exam.diagnosis?.name
                          ? exam.diagnosis.name
                          : typeof exam.diagnosis === 'string'
                          ? exam.diagnosis
                          : 'Киритилмаган'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground'>Тавсия</Label>
                      <p className='font-medium bg-muted p-3 rounded-md mt-1'>
                        {exam.description || 'Киритилмаган'}
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
                  <CardTitle>Хоналар Маълумотлари</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {exam.rooms.map((room: any, index: number) => (
                      <Card key={room._id} className='border border-primary/10'>
                        <CardContent className='pt-4'>
                          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <div>
                              <Label className='text-muted-foreground'>
                                Хона Номи
                              </Label>
                              <p className='font-medium mt-1'>
                                {room.room_name || 'Номаълум'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-muted-foreground'>
                                Қават
                              </Label>
                              <p className='font-medium mt-1'>
                                {room.floor_number || 'Номаълум'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-muted-foreground'>
                                Нархи
                              </Label>
                              <p className='font-medium mt-1'>
                                {room.room_price
                                  ? `${room.room_price.toLocaleString()} сўм`
                                  : 'Номаълум'}
                              </p>
                            </div>
                            <div>
                              <Label className='text-muted-foreground'>
                                Муддати
                              </Label>
                              <p className='font-medium mt-1'>
                                {room.start_date
                                  ? new Date(
                                      room.start_date
                                    ).toLocaleDateString('uz-UZ')
                                  : 'Номаълум'}
                                {room.end_date && (
                                  <>
                                    {' - '}
                                    {new Date(room.end_date).toLocaleDateString(
                                      'uz-UZ'
                                    )}
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

          {/* Prescriptions Tab */}
          <TabsContent value='prescriptions'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span>Рецептлар</span>
                    {exam.prescriptions && exam.prescriptions.length > 0 && (
                      <span className='text-sm font-normal text-muted-foreground'>
                        ({exam.prescriptions.length} та)
                      </span>
                    )}
                  </div>
                  {exam.prescriptions && exam.prescriptions.length > 0 && (
                    <AllPrescriptionsDownloadButton exam={exam} />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exam.prescriptions && exam.prescriptions.length > 0 ? (
                  <div className='space-y-4'>
                    {exam.prescriptions.map(
                      (prescription: any, index: number) => (
                        <Card
                          key={prescription._id}
                          className='border border-primary/10 bg-primary/5'
                        >
                          <CardContent className='pt-4'>
                            {editingPrescriptionId === prescription._id ? (
                              <div className='space-y-4'>
                                <div className='flex items-center justify-between mb-3'>
                                  <span className='text-sm font-medium text-primary'>
                                    Рецепт #{index + 1} - Таҳрирлаш
                                  </span>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                  <div className='space-y-2 sm:col-span-3'>
                                    <Label>Дори *</Label>
                                    <Select
                                      value={prescriptionForm.medication_id}
                                      onValueChange={(value) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          medication_id: value,
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder='Дорини танланг'>
                                          {prescriptionForm.medication_id
                                            ? medicationsData?.data?.find(
                                                (m: any) =>
                                                  m._id ===
                                                  prescriptionForm.medication_id
                                              )?.name || 'Дорини танланг'
                                            : 'Дорини танланг'}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className='p-2'>
                                          <Input
                                            placeholder='Дорини қидириш...'
                                            value={medicationSearch}
                                            onChange={(e) =>
                                              setMedicationSearch(
                                                e.target.value
                                              )
                                            }
                                            className='mb-2'
                                          />
                                        </div>
                                        {medicationsData?.data?.map(
                                          (med: any) => (
                                            <SelectItem
                                              key={med._id}
                                              value={med._id}
                                            >
                                              {med.name} ({med.dosage})
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className='space-y-2'>
                                    <Label>Муддати (кун) *</Label>
                                    <Input
                                      type='number'
                                      placeholder='Муддатни киритинг'
                                      value={prescriptionForm.duration}
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
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          duration: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className='space-y-2'>
                                    <Label>
                                      Қабул қилиш (кунига неча марта) *
                                    </Label>
                                    <Input
                                      type='number'
                                      placeholder='Частотани киритинг'
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
                                      value={prescriptionForm.frequency}
                                      onChange={(e) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          frequency: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className='space-y-2'>
                                  <Label>Қўшимча Кўрсатмалар</Label>
                                  <Textarea
                                    placeholder='Қўшимча кўрсатмаларни киритинг'
                                    value={prescriptionForm.instructions}
                                    onChange={(e) =>
                                      setPrescriptionForm({
                                        ...prescriptionForm,
                                        instructions: e.target.value,
                                      })
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div className='space-y-2'>
                                  <Label>Қўшимча дорилар</Label>
                                  <Textarea
                                    placeholder='Қўшимча дорилар ёки маслаҳатлар...'
                                    value={prescriptionForm.addons}
                                    onChange={(e) =>
                                      setPrescriptionForm({
                                        ...prescriptionForm,
                                        addons: e.target.value,
                                      })
                                    }
                                    rows={3}
                                  />
                                </div>
                                <div className='flex gap-2 justify-end'>
                                  <Button
                                    variant='outline'
                                    onClick={cancelEditPrescription}
                                    disabled={isUpdatingPrescription}
                                  >
                                    <X className='w-4 h-4 mr-2' />
                                    Бекор қилиш
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      handleUpdatePrescription(prescription._id)
                                    }
                                    disabled={isUpdatingPrescription}
                                  >
                                    <Save className='w-4 h-4 mr-2' />
                                    {isUpdatingPrescription
                                      ? 'Сақланмоқда...'
                                      : 'Сақлаш'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className='flex items-center justify-between mb-3'>
                                  <span className='text-sm font-medium text-primary'>
                                    Рецепт #{index + 1}
                                  </span>
                                  <div className='flex gap-2'>
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        startEditPrescription(prescription)
                                      }
                                      disabled={editingPrescriptionId !== null}
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
                                      disabled={false}
                                      className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                    >
                                      <Trash2 className='h-4 w-4' />
                                    </Button>
                                  </div>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                                  <div>
                                    <Label className='text-xs text-muted-foreground'>
                                      Дори
                                    </Label>
                                    <p className='font-semibold text-sm mt-1'>
                                      {typeof prescription.medication_id ===
                                        'object' && prescription.medication_id
                                        ? `${prescription.medication_id.name} (${prescription.medication_id.dosage})`
                                        : 'Номаълум'}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-xs text-muted-foreground'>
                                      Муддати
                                    </Label>
                                    <p className='font-semibold text-sm mt-1'>
                                      {prescription.duration} кун
                                    </p>
                                  </div>
                                  <div>
                                    <Label className='text-xs text-muted-foreground'>
                                      Қабул Қилиш
                                    </Label>
                                    <p className='font-semibold text-sm mt-1'>
                                      Кунига {prescription.frequency} марта
                                    </p>
                                  </div>
                                </div>
                                {prescription.instructions && (
                                  <div className='mt-3 pt-3 border-t border-primary/10'>
                                    <Label className='text-xs text-muted-foreground'>
                                      Қўшимча Кўрсатмалар
                                    </Label>
                                    <p className='text-sm font-medium mt-1'>
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
                ) : (
                  <div className='text-center py-8'>
                    <p className='text-muted-foreground mb-4'>
                      Ҳали рецептлар қўшилмаган
                    </p>
                    <Button
                      onClick={() => {
                        navigate('/prescription', {
                          state: { examinationId: exam._id },
                        });
                      }}
                    >
                      <FilePlus className='w-4 h-4 mr-2' />
                      Рецепт Ёзиш
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value='services'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span>Хизматлар</span>
                    {exam.services && exam.services.length > 0 && (
                      <span className='text-sm font-normal text-muted-foreground'>
                        ({exam.services.length} та)
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {exam.services && exam.services.length > 0 && (
                      <ServicesDownloadButton exam={exam} />
                    )}
                    <Button
                      size='sm'
                      onClick={() => setIsAddingService(true)}
                      disabled={isAddingService}
                    >
                      <Plus className='w-4 h-4 mr-2' />
                      Хизмат Қўшиш
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {/* Add Service Form */}
                  {isAddingService && (
                    <Card className='border-2 border-primary/20 bg-primary/5'>
                      <CardContent className='pt-4'>
                        <div className='space-y-4'>
                          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
                            <div className='flex-1 min-w-0 space-y-2'>
                              <Label>Хизмат Тури *</Label>
                              <Select
                                value={serviceForm.service_type_id}
                                onValueChange={(value) =>
                                  setServiceForm({
                                    ...serviceForm,
                                    service_type_id: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Хизмат турини танланг' />
                                </SelectTrigger>
                                <SelectContent>
                                  {serviceTypes.map((service: any) => (
                                    <SelectItem
                                      key={service._id}
                                      value={service._id}
                                    >
                                      {service.name} -{' '}
                                      {service.price.toLocaleString()} сўм
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className='w-28 space-y-2'>
                              <Label>Муддат (кун)</Label>
                              <Input
                                type='number'
                                placeholder='7'
                                value={serviceForm.duration}
                                min={1}
                                max={60}
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
                                  handleServiceDurationChange(
                                    parseInt(e.target.value) || 0
                                  )
                                }
                              />
                            </div>

                            <div className='flex-1 min-w-0 space-y-2'>
                              <Label>Изоҳ</Label>
                              <Textarea
                                placeholder='Қўшимча изоҳ киритинг'
                                value={serviceForm.notes}
                                onChange={(e) =>
                                  setServiceForm({
                                    ...serviceForm,
                                    notes: e.target.value,
                                  })
                                }
                                rows={1}
                                className='min-h-10'
                              />
                            </div>
                          </div>

                          {serviceForm.days.length > 0 && (
                            <div className='space-y-3'>
                              <div className='flex items-center gap-4'>
                                <Label className='text-xs whitespace-nowrap'>
                                  Кунлар жадвали
                                </Label>
                                <div className='flex items-center gap-2'>
                                  <Label className='text-xs text-muted-foreground'>
                                    Интервал:
                                  </Label>
                                  <Select
                                    value={String(serviceForm.interval || 1)}
                                    onValueChange={(value) =>
                                      updateServiceFormInterval(
                                        parseInt(value) as 1 | 2
                                      )
                                    }
                                  >
                                    <SelectTrigger className='h-7 w-[140px] text-xs'>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value='1'>
                                        Ҳар куни
                                      </SelectItem>
                                      <SelectItem value='2'>
                                        Кун оралаб
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {/* Desktop horizontal table */}
                              <div className='hidden sm:block overflow-x-auto'>
                                <table className='border-collapse border rounded-lg w-full'>
                                  <thead>
                                    <tr className='bg-muted/50'>
                                      <th className='border px-2 py-1 text-xs font-medium text-left min-w-[100px]'>
                                        1-кун сана
                                      </th>
                                      {serviceForm.days.map((day) => (
                                        <th
                                          key={day.day}
                                          className='border px-1 py-1 text-xs font-medium text-center min-w-[40px]'
                                        >
                                          {day.day}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr>
                                      <td className='border px-1 py-1'>
                                        <Input
                                          type='date'
                                          value={
                                            serviceForm.days[0]?.date
                                              ? new Date(
                                                  serviceForm.days[0].date
                                                )
                                                  .toISOString()
                                                  .split('T')[0]
                                              : ''
                                          }
                                          onChange={(e) =>
                                            updateServiceFormDayDate(
                                              0,
                                              e.target.value
                                                ? new Date(e.target.value)
                                                : null
                                            )
                                          }
                                          className='text-xs h-7 w-full'
                                        />
                                      </td>
                                      {serviceForm.days.map((day) => (
                                        <td
                                          key={day.day}
                                          className='border px-1 py-1 text-center group relative'
                                        >
                                          {day.date ? (
                                            <div className='flex items-center justify-center'>
                                              <span className='text-green-600 font-bold'>
                                                ✓
                                              </span>
                                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                {new Date(
                                                  day.date
                                                ).toLocaleDateString('uz-UZ')}
                                              </div>
                                            </div>
                                          ) : (
                                            <span className='text-muted-foreground'>
                                              -
                                            </span>
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile view */}
                              <div className='sm:hidden space-y-2'>
                                <div className='flex items-center gap-2'>
                                  <Label className='text-xs'>1-кун сана:</Label>
                                  <Input
                                    type='date'
                                    value={
                                      serviceForm.days[0]?.date
                                        ? new Date(serviceForm.days[0].date)
                                            .toISOString()
                                            .split('T')[0]
                                        : ''
                                    }
                                    onChange={(e) =>
                                      updateServiceFormDayDate(
                                        0,
                                        e.target.value
                                          ? new Date(e.target.value)
                                          : null
                                      )
                                    }
                                    className='text-xs h-8 flex-1'
                                  />
                                </div>
                                <div className='flex flex-wrap gap-1'>
                                  {serviceForm.days.map((day) => (
                                    <div
                                      key={day.day}
                                      className='w-8 h-8 flex items-center justify-center border rounded text-xs group relative'
                                    >
                                      {day.date ? (
                                        <>
                                          <span className='text-green-600 font-bold'>
                                            ✓
                                          </span>
                                          <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                            {day.day}:{' '}
                                            {new Date(
                                              day.date
                                            ).toLocaleDateString('uz-UZ')}
                                          </div>
                                        </>
                                      ) : (
                                        <span className='text-muted-foreground'>
                                          {day.day}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className='flex gap-2 justify-end'>
                            <Button
                              variant='outline'
                              onClick={() => {
                                setIsAddingService(false);
                                setServiceForm({
                                  service_type_id: '',
                                  duration: 1,
                                  notes: '',
                                  days: generateDays(1),
                                  interval: 1,
                                });
                              }}
                              disabled={isAddingServiceMutation}
                            >
                              <X className='w-4 h-4 mr-2' />
                              Бекор қилиш
                            </Button>
                            <Button
                              onClick={handleAddService}
                              disabled={isAddingServiceMutation}
                            >
                              <Save className='w-4 h-4 mr-2' />
                              {isAddingServiceMutation
                                ? 'Сақланмоқда...'
                                : 'Сақлаш'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Services Summary Table - like the reference image */}
                  {exam.services &&
                    exam.services.length > 0 &&
                    !editingServiceId && (
                      <Card className='border border-primary/10 mb-4'>
                        <CardContent className='pt-4'>
                          <div className='flex items-center justify-between mb-3'>
                            <Label className='text-sm font-semibold'>
                              Хизматлар жадвали
                            </Label>
                          </div>
                          <div className='overflow-x-auto'>
                            <table className='w-full border-collapse border text-sm'>
                              <thead>
                                <tr className='bg-muted/50'>
                                  <th className='border px-3 py-2 text-left font-semibold min-w-[150px]'>
                                    Хизмат номи
                                  </th>
                                  {Array.from(
                                    {
                                      length: Math.max(
                                        ...(exam.services || []).map(
                                          (s: any) =>
                                            s.duration || s.days?.length || 0
                                        ),
                                        1
                                      ),
                                    },
                                    (_, i) => (
                                      <th
                                        key={i}
                                        className='border px-2 py-2 text-center font-semibold min-w-[70px]'
                                      >
                                        {i + 1}
                                      </th>
                                    )
                                  )}
                                  <th className='border px-2 py-2 text-center font-semibold w-16'>
                                    Ҳаракат
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {exam.services.map((service: any) => {
                                  const maxDays = Math.max(
                                    ...(exam.services || []).map(
                                      (s: any) =>
                                        s.duration || s.days?.length || 0
                                    ),
                                    1
                                  );
                                  return (
                                    <tr
                                      key={service._id}
                                      className='hover:bg-muted/30'
                                    >
                                      <td className='border px-3 py-2 font-medium'>
                                        {service.service_type_id?.name ||
                                          'Номаълум'}
                                      </td>
                                      {Array.from(
                                        { length: maxDays },
                                        (_, i) => {
                                          const day = service.days?.[i];
                                          return (
                                            <td
                                              key={i}
                                              className='border px-1 py-1 text-center group relative'
                                            >
                                              {day?.date ? (
                                                <div className='flex items-center justify-center'>
                                                  <span className='text-xs'>
                                                    {new Date(
                                                      day.date
                                                    ).getDate()}{' '}
                                                    {new Date(
                                                      day.date
                                                    ).toLocaleDateString(
                                                      'uz-UZ',
                                                      { month: 'short' }
                                                    )}
                                                  </span>
                                                  <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                    {new Date(
                                                      day.date
                                                    ).toLocaleDateString(
                                                      'uz-UZ'
                                                    )}
                                                  </div>
                                                </div>
                                              ) : i <
                                                (service.duration ||
                                                  service.days?.length ||
                                                  0) ? (
                                                <span className='text-muted-foreground'>
                                                  —
                                                </span>
                                              ) : null}
                                            </td>
                                          );
                                        }
                                      )}
                                      <td className='border px-1 py-1 text-center'>
                                        <div className='flex items-center justify-center gap-1'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              startEditService(service)
                                            }
                                            className='h-6 w-6 p-0'
                                          >
                                            <Edit className='h-3 w-3' />
                                          </Button>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              handleRemoveService(service._id)
                                            }
                                            className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                                          >
                                            <Trash2 className='h-3 w-3' />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                  {/* Services List - Individual Cards for Editing */}
                  {exam.services &&
                  exam.services.length > 0 &&
                  editingServiceId ? (
                    exam.services.map((service: any, index: number) => (
                      <Card
                        key={service._id}
                        className='border border-primary/10'
                      >
                        <CardContent className='pt-4'>
                          {editingServiceId === service._id ? (
                            <div className='space-y-4'>
                              <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
                                <div className='flex-1 min-w-0 space-y-2'>
                                  <Label>Хизмат Тури *</Label>
                                  <Select
                                    value={serviceForm.service_type_id}
                                    onValueChange={(value) =>
                                      setServiceForm({
                                        ...serviceForm,
                                        service_type_id: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder='Хизмат турини танланг' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {serviceTypes.map((st: any) => (
                                        <SelectItem key={st._id} value={st._id}>
                                          {st.name} -{' '}
                                          {st.price.toLocaleString()} сўм
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className='w-28 space-y-2'>
                                  <Label>Муддат (кун)</Label>
                                  <Input
                                    type='number'
                                    value={serviceForm.duration}
                                    min={1}
                                    max={60}
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
                                      handleServiceDurationChange(
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                  />
                                </div>

                                <div className='flex-1 min-w-0 space-y-2'>
                                  <Label>Изоҳ</Label>
                                  <Textarea
                                    value={serviceForm.notes}
                                    onChange={(e) =>
                                      setServiceForm({
                                        ...serviceForm,
                                        notes: e.target.value,
                                      })
                                    }
                                    rows={2}
                                  />
                                </div>
                              </div>

                              {serviceForm.days.length > 0 && (
                                <div className='space-y-3'>
                                  <div className='flex items-center gap-4'>
                                    <Label className='text-xs whitespace-nowrap'>
                                      Кунлар жадвали
                                    </Label>
                                    <div className='flex items-center gap-2'>
                                      <Label className='text-xs text-muted-foreground'>
                                        Интервал:
                                      </Label>
                                      <Select
                                        value={String(
                                          serviceForm.interval || 1
                                        )}
                                        onValueChange={(value) =>
                                          updateServiceFormInterval(
                                            parseInt(value) as 1 | 2
                                          )
                                        }
                                      >
                                        <SelectTrigger className='h-7 w-[140px] text-xs'>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value='1'>
                                            Ҳар куни
                                          </SelectItem>
                                          <SelectItem value='2'>
                                            Кун оралаб
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  {/* Desktop horizontal table */}
                                  <div className='hidden sm:block overflow-x-auto'>
                                    <table className='border-collapse border rounded-lg w-full'>
                                      <thead>
                                        <tr className='bg-muted/50'>
                                          <th className='border px-2 py-1 text-xs font-medium text-left min-w-[100px]'>
                                            1-кун сана
                                          </th>
                                          {serviceForm.days.map((day) => (
                                            <th
                                              key={day.day}
                                              className='border px-1 py-1 text-xs font-medium text-center min-w-[40px]'
                                            >
                                              {day.day}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td className='border px-1 py-1'>
                                            <Input
                                              type='date'
                                              value={
                                                serviceForm.days[0]?.date
                                                  ? new Date(
                                                      serviceForm.days[0].date
                                                    )
                                                      .toISOString()
                                                      .split('T')[0]
                                                  : ''
                                              }
                                              onChange={(e) =>
                                                updateServiceFormDayDate(
                                                  0,
                                                  e.target.value
                                                    ? new Date(e.target.value)
                                                    : null
                                                )
                                              }
                                              className='text-xs h-7 w-full'
                                            />
                                          </td>
                                          {serviceForm.days.map((day) => (
                                            <td
                                              key={day.day}
                                              className='border px-1 py-1 text-center group relative'
                                            >
                                              {day.date ? (
                                                <div className='flex items-center justify-center'>
                                                  <span className='text-green-600 font-bold'>
                                                    ✓
                                                  </span>
                                                  <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                    {new Date(
                                                      day.date
                                                    ).toLocaleDateString(
                                                      'uz-UZ'
                                                    )}
                                                  </div>
                                                </div>
                                              ) : (
                                                <span className='text-muted-foreground'>
                                                  -
                                                </span>
                                              )}
                                            </td>
                                          ))}
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Mobile view */}
                                  <div className='sm:hidden space-y-2'>
                                    <div className='flex items-center gap-2'>
                                      <Label className='text-xs'>
                                        1-кун сана:
                                      </Label>
                                      <Input
                                        type='date'
                                        value={
                                          serviceForm.days[0]?.date
                                            ? new Date(serviceForm.days[0].date)
                                                .toISOString()
                                                .split('T')[0]
                                            : ''
                                        }
                                        onChange={(e) =>
                                          updateServiceFormDayDate(
                                            0,
                                            e.target.value
                                              ? new Date(e.target.value)
                                              : null
                                          )
                                        }
                                        className='text-xs h-8 flex-1'
                                      />
                                    </div>
                                    <div className='flex flex-wrap gap-1'>
                                      {serviceForm.days.map((day) => (
                                        <div
                                          key={day.day}
                                          className='w-8 h-8 flex items-center justify-center border rounded text-xs group relative'
                                        >
                                          {day.date ? (
                                            <>
                                              <span className='text-green-600 font-bold'>
                                                ✓
                                              </span>
                                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                {day.day}:{' '}
                                                {new Date(
                                                  day.date
                                                ).toLocaleDateString('uz-UZ')}
                                              </div>
                                            </>
                                          ) : (
                                            <span className='text-muted-foreground'>
                                              {day.day}
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className='flex gap-2 justify-end'>
                                <Button
                                  variant='outline'
                                  onClick={cancelEditService}
                                  disabled={isUpdatingService}
                                >
                                  <X className='w-4 h-4 mr-2' />
                                  Бекор қилиш
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleUpdateService(service._id)
                                  }
                                  disabled={isUpdatingService}
                                >
                                  <Save className='w-4 h-4 mr-2' />
                                  {isUpdatingService
                                    ? 'Сақланмоқда...'
                                    : 'Сақлаш'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className='flex items-center justify-between mb-3'>
                                <span className='text-sm font-medium text-primary'>
                                  Хизмат #{index + 1}
                                </span>
                                <div className='flex gap-2'>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => startEditService(service)}
                                    disabled={editingServiceId !== null}
                                  >
                                    <Edit className='h-4 w-4' />
                                  </Button>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                      handleRemoveService(service._id)
                                    }
                                    disabled={false}
                                    className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Хизмат Тури
                                  </Label>
                                  <p className='font-semibold text-sm mt-1'>
                                    {service.service_type_id?.name ||
                                      'Маълумот йўқ'}
                                  </p>
                                </div>
                                <div>
                                  <Label className='text-xs text-muted-foreground'>
                                    Муддати
                                  </Label>
                                  <p className='font-semibold text-sm mt-1'>
                                    {service.duration} кун
                                  </p>
                                </div>
                                {service.price && (
                                  <div>
                                    <Label className='text-xs text-muted-foreground'>
                                      Нарх
                                    </Label>
                                    <p className='font-semibold text-sm mt-1'>
                                      {service.price.toLocaleString()} сўм
                                    </p>
                                  </div>
                                )}
                              </div>

                              {service.days && service.days.length > 0 && (
                                <div className='mt-3 space-y-2'>
                                  <div className='flex items-center gap-4'>
                                    <Label className='text-xs text-muted-foreground'>
                                      Кунлар жадвали
                                    </Label>
                                    {service.interval && (
                                      <span className='text-xs bg-muted px-2 py-0.5 rounded'>
                                        {service.interval === 1
                                          ? 'Ҳар куни'
                                          : 'Кун оралаб'}
                                      </span>
                                    )}
                                  </div>

                                  {/* Desktop horizontal table */}
                                  <div className='hidden sm:block overflow-x-auto'>
                                    <table className='border-collapse border rounded-lg w-full'>
                                      <thead>
                                        <tr className='bg-muted/50'>
                                          {(service.days || []).map(
                                            (day: any, idx: number) => (
                                              <th
                                                key={day?.day || idx + 1}
                                                className='border px-1 py-1 text-xs font-medium text-center min-w-[40px]'
                                              >
                                                {day?.day || idx + 1}
                                              </th>
                                            )
                                          )}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          {(service.days || []).map(
                                            (day: any, idx: number) => (
                                              <td
                                                key={`${
                                                  day?.day || idx + 1
                                                }-body`}
                                                className='border px-1 py-1 text-center group relative'
                                              >
                                                {day?.date ? (
                                                  <div className='flex items-center justify-center'>
                                                    <span className='text-green-600 font-bold'>
                                                      ✓
                                                    </span>
                                                    <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                      {new Date(
                                                        day.date
                                                      ).toLocaleDateString(
                                                        'uz-UZ'
                                                      )}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <span className='text-muted-foreground'>
                                                    -
                                                  </span>
                                                )}
                                              </td>
                                            )
                                          )}
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Mobile view */}
                                  <div className='sm:hidden flex flex-wrap gap-1'>
                                    {(service.days || []).map(
                                      (day: any, idx: number) => (
                                        <div
                                          key={day?.day || idx + 1}
                                          className='w-8 h-8 flex items-center justify-center border rounded text-xs group relative'
                                        >
                                          {day?.date ? (
                                            <>
                                              <span className='text-green-600 font-bold'>
                                                ✓
                                              </span>
                                              <div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none'>
                                                {day?.day || idx + 1}:{' '}
                                                {new Date(
                                                  day.date
                                                ).toLocaleDateString('uz-UZ')}
                                              </div>
                                            </>
                                          ) : (
                                            <span className='text-muted-foreground'>
                                              {day?.day || idx + 1}
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                              {service.notes && (
                                <div className='mt-3 pt-3 border-t border-primary/10'>
                                  <Label className='text-xs text-muted-foreground'>
                                    Изоҳ
                                  </Label>
                                  <p className='text-sm font-medium mt-1'>
                                    {service.notes}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground mb-4'>
                        Ҳали хизматлар қўшилмаган
                      </p>
                      {!isAddingService && (
                        <Button onClick={() => setIsAddingService(true)}>
                          <Plus className='w-4 h-4 mr-2' />
                          Хизмат Қўшиш
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visits Tab */}
          <TabsContent value='visits'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Таҳлиллар</span>
                  {exam.analyses && exam.analyses.length > 0 && (
                    <span className='text-sm font-normal text-muted-foreground'>
                      ({exam.analyses.length} та)
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
                                paramValue < range.min || paramValue > range.max
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
                                            {paramType.normal_range.general.min}{' '}
                                            -{' '}
                                            {paramType.normal_range.general.max}
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
                                            {paramType.normal_range.male.min} -{' '}
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
                                            {paramType.normal_range.female.min}{' '}
                                            -{' '}
                                            {paramType.normal_range.female.max}
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
                                        ? 'Тугалланган'
                                        : analysis.status === 'active'
                                        ? 'Фаол'
                                        : analysis.status === 'pending'
                                        ? 'Кутилмоқда'
                                        : analysis.status}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className='space-y-3'>
                                {analysis.analysis_type && (
                                  <div>
                                    <Label className='text-xs text-muted-foreground'>
                                      Таҳлил Тури
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
                                      Даража
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
                                                          .normal_range.male ||
                                                        resParamType
                                                          .normal_range.female;
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
                                                          .normal_range.male ||
                                                        resParamType
                                                          .normal_range.female;
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
                                                            {resParamType.unit}
                                                          </span>
                                                        )}
                                                      </td>
                                                      <td className='p-2 text-right text-muted-foreground'>
                                                        {normalRangeText || '-'}
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
                      Ҳали таҳлиллар қўшилмаган
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value='images'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <span>Тасвирлар</span>
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

                      // Display first image from image_paths as thumbnail
                      const thumbnailPath = image.image_paths[0];
                      const bodyPartLabel =
                        bodyPartLabels[image.body_part] ||
                        image.body_part ||
                        'Кўрсатилмаган';
                      const imagingTypeName =
                        image.imaging_type_id?.name || 'Номаълум';
                      const imageDate = image.created_at
                        ? new Date(image.created_at).toLocaleDateString('uz-UZ')
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
                            {/* Image Section */}
                            <div className='relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0'>
                              <img
                                src={thumbnailPath}
                                alt={image.description || `Тасвир ${index + 1}`}
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

                            {/* Info Section */}
                            <div className='flex-1 p-4'>
                              <div className='space-y-2'>
                                <h4
                                  className='font-semibold text-base line-clamp-2'
                                  title={image.description}
                                >
                                  {image.description || 'Тавсиф йўқ'}
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
                                      {image.image_paths.length} та тасвир
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
                      Ҳали тасвирлар қўшилмаган
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Neurologic Status Tab */}
          <TabsContent value='neurologic'>
            <Card>
              <CardContent>
                <div className='py-6'>
                  {/* Add Neurologic Form */}
                  {isAddingNeurologic && (
                    <Card className='border-2 border-primary/20 bg-primary/5'>
                      <CardContent className='pt-4'>
                        <div className='space-y-4'>
                          <h3 className='font-semibold text-lg mb-4'>
                            Янги Неврологик Статус
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
                                  } киритинг...`}
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
                              Бекор қилиш
                            </Button>
                            <Button
                              onClick={handleAddNeurologic}
                              disabled={isCreatingNeurologic}
                            >
                              <Save className='w-4 h-4 mr-2' />
                              {isCreatingNeurologic
                                ? 'Сақланмоқда...'
                                : 'Сақлаш'}
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
                                    Таҳрирлаш
                                  </h3>
                                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {Object.keys(neurologicForm).map(
                                      (field) => (
                                        <div key={field} className='space-y-2'>
                                          <Label className='text-sm font-medium'>
                                            {neurologicFieldLabels[field] ||
                                              field}
                                          </Label>
                                          <Textarea
                                            placeholder={`${
                                              neurologicFieldLabels[field] ||
                                              field
                                            } киритинг...`}
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
                                      Бекор қилиш
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleUpdateNeurologic(neurologic._id)
                                      }
                                      disabled={isUpdatingNeurologic}
                                    >
                                      <Save className='w-4 h-4 mr-2' />
                                      {isUpdatingNeurologic
                                        ? 'Сақланмоқда...'
                                        : 'Сақлаш'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center gap-2'>
                                      <Brain className='w-5 h-5 text-primary' />
                                      <span className='text-sm font-medium text-primary'>
                                        Неврологик Статус #{index + 1}
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
                                        disabled={editingNeurologicId !== null}
                                      >
                                        <Edit className='h-4 w-4' />
                                      </Button>
                                      <Button
                                        variant='ghost'
                                        size='sm'
                                        onClick={() =>
                                          handleDeleteNeurologic(neurologic._id)
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
                            Ҳали неврологик статус қўшилмаган
                          </p>
                          <Button onClick={() => setIsAddingNeurologic(true)}>
                            <Plus className='w-4 h-4 mr-2' />
                            Неврологик Статус Қўшиш
                          </Button>
                        </div>
                      )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
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
                Бекор қилиш
              </Button>
              <Button
                variant='destructive'
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Ўчирилмоқда...' : 'Ўчириш'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ExaminationDetail;
