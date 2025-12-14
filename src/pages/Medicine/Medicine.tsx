/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from '@/app/api/baseApi';
import {
  useCreateServiceDaysMutation,
  useGetAllExamsQuery,
  useTakeServiceMutation,
} from '@/app/api/examinationApi/examinationApi';
import { 
  useTakePrescriptionMutation 
} from '@/app/api/prescription/prescriptionApi';
import { useAppDispatch } from '@/app/store';
import CantRead from '@/components/common/CantRead';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { useRouteActions } from '@/hooks/RBS';
import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Room {
  room_name: string;
}

interface Patient {
  fullname: string;
}

interface ExamRecord {
  _id: string;
  patient_id: Patient;
  rooms: Room[];
  prescription: string | null;
  service: string | null;
}

interface Day {
  _id: string;
  date: string | null;
  day: number;
  times: number | string;
}

interface PrescriptionItem {
  medication_id: {
    _id: string;
    name: string;
    dosage: string;
    dosage_unit?: string;
  };
  frequency: number;
  duration: number;
  instructions: string;
  addons?: string;
  days?: Day[];
  _id: string;
}

interface PrescriptionData {
  _id: string;
  items: PrescriptionItem[];
}

interface ServiceItem {
  service_type_id: {
    _id: string;
    code: string;
    name: string;
    description: string;
  };
  price: number;
  frequency: number;
  duration: number;
  status: string;
  notes?: string;
  days?: Day[];
  _id: string;
}

interface ServiceData {
  _id: string;
  services: ServiceItem[];
}

interface EnrichedExamRecord extends ExamRecord {
  prescriptionData?: PrescriptionData | null;
  serviceData?: ServiceData | null;
  isLoadingPrescription?: boolean;
  isLoadingService?: boolean;
}

const Medicine = () => {
  const { canRead } = useRouteActions('/medicine');
  const dispatch = useAppDispatch();

  if (!canRead) return <CantRead />;

  const [currentPage, setCurrentPage] = useState(1);
  const [roomSearch, setRoomSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    recordId: string | null;
    prescriptionId: string | null;
    serviceId: string | null;
    itemId: string | null;
    day: string | null;
    type: 'medicine' | 'service';
  }>({
    open: false,
    recordId: null,
    prescriptionId: null,
    serviceId: null,
    itemId: null,
    day: null,
    type: 'medicine',
  });
  const [processedServices, setProcessedServices] = useState<Set<string>>(
    new Set()
  );
  const [enrichedRecords, setEnrichedRecords] = useState<EnrichedExamRecord[]>([]);

  const itemsPerPage = 10;

  // RTK Query with room search
  const { data, isLoading, isError } = useGetAllExamsQuery({
    page: currentPage,
    limit: itemsPerPage,
    status: 'pending',
    is_roomed: true,
    ...(roomSearch && { room_name: roomSearch }),
  } as any);

  const [takePrescription, { isLoading: takingMedicine }] =
    useTakePrescriptionMutation();
  const [createServiceDays] = useCreateServiceDaysMutation();
  const [takeService, { isLoading: takingService }] = useTakeServiceMutation();
  const handleRequest = useHandleRequest();

  // Bemorlar yuklanganida har birining prescription va service ma'lumotlarini yuklash
  useEffect(() => {
    if (!data?.data) {
      setEnrichedRecords([]);
      return;
    }

    const fetchEnrichedData = async () => {
      const records = data.data as ExamRecord[];
      
      // Dastlab barcha recordlarni loading holati bilan qo'shamiz
      const initialRecords: EnrichedExamRecord[] = records.map(record => ({
        ...record,
        isLoadingPrescription: !!record.prescription,
        isLoadingService: !!record.service,
        prescriptionData: null,
        serviceData: null,
      }));
      
      setEnrichedRecords(initialRecords);

      // Har bir bemor uchun prescription va service ma'lumotlarini parallel yuklash
      const enriched = await Promise.all(
        records.map(async (record) => {
          const enrichedRecord: EnrichedExamRecord = {
            ...record,
            isLoadingPrescription: false,
            isLoadingService: false,
          };

          // Prescription va Service ma'lumotlarini parallel yuklash
          const promises: Promise<any>[] = [];

          if (record.prescription) {
            promises.push(
              dispatch(
                baseApi.endpoints.getOnePrescription.initiate(record.prescription as string, { forceRefetch: false })
              )
                .unwrap()
                .then((result: any) => {
                  if (result?.data) {
                    enrichedRecord.prescriptionData = result.data;
                  }
                })
                .catch((error) => {
                  console.error('Prescription yuklashda xatolik:', error);
                  enrichedRecord.prescriptionData = null;
                })
            );
          }

          if (record.service) {
            promises.push(
              dispatch(
                baseApi.endpoints.getOneExam.initiate(record._id, { forceRefetch: false })
              )
                .unwrap()
                .then((result: any) => {
                  if (result?.data) {
                    enrichedRecord.serviceData = result.data;
                  }
                })
                .catch((error) => {
                  console.error('Service yuklashda xatolik:', error);
                  enrichedRecord.serviceData = null;
                })
            );
          }

          await Promise.all(promises);
          return enrichedRecord;
        })
      );

      setEnrichedRecords(enriched);
    };

    fetchEnrichedData();
  }, [data]);

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Service accordion ochilganda days yaratish
  // const handleServiceAccordionChange = async (
  // 	recordId: string,
  // 	service: Service
  // ) => {
  // 	if (service.days?.length > 0 || processedServices.has(service._id)) {
  // 		return
  // 	}

  // 	setProcessedServices(prev => new Set(prev).add(service._id))

  // 	await handleRequest({
  // 		request: () =>
  // 			createServiceDays({
  // 				id: recordId,
  // 				serviceId: service._id,
  // 				data: {
  // 					service_type_id:
  // 						typeof service.service_type_id === 'string'
  // 							? service.service_type_id
  // 							: service.service_type_id._id,
  // 					price: service.price,
  // 					frequency: service.frequency,
  // 					duration: service.duration,
  // 					status: service.status as any,
  // 					notes: service.notes,
  // 				},
  // 			}),
  // 		onSuccess: () => {
  // 			toast.success('Хизмат кунлари яратилди')
  // 		},
  // 		onError: err => {
  // 			if (err?.data) {
  // 				toast.error(err?.data?.error?.msg)
  // 			} else {
  // 				toast.error(err?.error?.msg || 'Хатолик юз берди')
  // 			}
  // 		},
  // 	})
  // }

  const openConfirmModal = (
    recordId: string,
    prescriptionId: string | null,
    serviceId: string | null,
    itemId: string | null,
    day: string,
    type: 'medicine' | 'service' = 'medicine'
  ) => {
    setConfirmModal({
      open: true,
      recordId,
      prescriptionId,
      serviceId,
      itemId,
      day,
      type,
    });
  };

  const handleConfirm = async () => {
    if (!confirmModal.day) {
      return;
    }

    if (confirmModal.type === 'medicine' && confirmModal.prescriptionId && confirmModal.itemId) {
      await handleRequest({
        request: () =>
          takePrescription({
            id: confirmModal.prescriptionId!,
            body: {
              item_id: confirmModal.itemId!,
              day: confirmModal.day!,
            },
          }),
        onSuccess: () => {
          toast.success('Дори қабул қилинди ✓');
          setConfirmModal({
            open: false,
            recordId: null,
            prescriptionId: null,
            serviceId: null,
            itemId: null,
            day: null,
            type: 'medicine',
          });
        },
        onError: (err) => {
          if (err?.data) {
            toast.error(err?.data?.error?.msg);
          } else {
            toast.error(err?.error?.msg || 'Хатолик юз берди');
          }
        },
      });
    } else if (confirmModal.type === 'service' && confirmModal.recordId && confirmModal.serviceId) {
      await handleRequest({
        request: () =>
          takeService({
            id: confirmModal.recordId!,
            serviceId: confirmModal.serviceId!,
            day: confirmModal.day!,
          }),
        onSuccess: () => {
          toast.success('Хизмат бажарилди ✓');
          setConfirmModal({
            open: false,
            recordId: null,
            prescriptionId: null,
            serviceId: null,
            itemId: null,
            day: null,
            type: 'medicine',
          });
        },
        onError: (err) => {
          if (err?.data) {
            toast.error(err?.data?.error?.msg);
          } else {
            toast.error(err?.error?.msg || 'Хатолик юз берди');
          }
        },
      });
    }
  };

  // Room search handler
  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-red-500'>Маълумотларни юклашда хатолик!</p>
      </div>
    );
  }

  const isToday = (dateStr: string) => {
    const today = new Date();
    const d = new Date(dateStr);

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const { data: records, pagination } = data;

  return (
    <div className='min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        <Card className='shadow-md'>
          <CardHeader className='pb-3 sm:pb-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
              <CardTitle className='text-lg sm:text-xl md:text-2xl'>
                Дори Бериш Жадвали (MAR)
              </CardTitle>

              {/* Room Search */}
              <div className='flex gap-2 w-full sm:w-auto'>
                <Input
                  placeholder='Xona raqami bilan qidiruv...'
                  value={roomSearch}
                  onChange={(e) => setRoomSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className='w-full sm:w-50 h-9 text-sm'
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-2 sm:p-4 md:p-6'>
            {/* Bemorlar ro'yxati - Accordion */}
            <Accordion
              type='single'
              collapsible
              className='w-full space-y-2 sm:space-y-3'
            >
              {enrichedRecords.map((record) => (
                <AccordionItem
                  key={record._id}
                  value={`record-${record._id}`}
                  className='border rounded-lg overflow-hidden bg-card'
                >
                  <AccordionTrigger className='px-3 sm:px-4 py-2 sm:py-3 hover:bg-accent/50 hover:no-underline'>
                    <div className='flex justify-between items-center w-full pr-2 sm:pr-4'>
                      <div className='text-left'>
                        <p className='font-semibold text-xs sm:text-sm md:text-base line-clamp-1'>
                          {record.patient_id.fullname}
                        </p>
                        <p className='text-xs text-muted-foreground mt-0.5'>
                          Ётоқ:{' '}
                          {record.rooms[record.rooms.length - 1]?.room_name ||
                            'N/A'}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className='px-2 sm:px-4 pb-2 sm:pb-4'>
                    <Tabs defaultValue='medicines' className='w-full'>
                      <TabsList className='grid w-full grid-cols-2 mb-4'>
                        <TabsTrigger value='medicines'>Дорилар</TabsTrigger>
                        <TabsTrigger value='services'>Хизматлар</TabsTrigger>
                      </TabsList>
                      <TabsContent value='medicines'>
                        {record.isLoadingPrescription ? (
                          <div className='flex items-center justify-center py-8'>
                            <Loader2 className='w-6 h-6 animate-spin text-primary' />
                            <span className='ml-2 text-sm text-muted-foreground'>
                              Дорилар юкланмоқда...
                            </span>
                          </div>
                        ) : !record.prescriptionData?.items || record.prescriptionData.items.length === 0 ? (
                          <p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
                            Дорилар топилмади
                          </p>
                        ) : (
                          <div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
                            {record.prescriptionData.items.map((item) => (
                              <Card key={item._id} className='border shadow-sm bg-card'>
                                <CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
                                  <div className='flex justify-between items-start gap-2'>
                                    <div className='flex-1 min-w-0'>
                                      <h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
                                        {item.medication_id.name}
                                      </h4>
                                      <p className='text-xs font-medium text-muted-foreground mt-1'>
                                        КЎРСАТМАЛАР: {item.instructions || 'Йўқ'}
                                      </p>
                                      <p className='text-xs text-muted-foreground mt-0.5'>
                                        Дозировка: {item.medication_id.dosage}
                                        {item.medication_id.dosage_unit || ''}
                                      </p>
                                      {item.addons && (
                                        <p className='text-xs text-muted-foreground mt-0.5'>
                                          Қўшимча: {item.addons}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className='px-3 sm:px-6 pb-3 sm:pb-6'>
                                  {!item.days || item.days.length === 0 ? (
                                    <p className='text-xs text-muted-foreground text-center py-4'>
                                      Кунлар маълумоти йўқ
                                    </p>
                                  ) : (
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1.5 sm:gap-2'>
                                      {item.days.map((day) => {
                                        const dayDate = day.date ? new Date(day.date) : null;
                                        const isTodayDay = dayDate && isToday(day.date!);
                                        const isPast = dayDate && dayDate < new Date() && !isTodayDay;
                                        const taken = day.times && Number(day.times) >= item.frequency;

                                        return (
                                          <div
                                            key={day._id}
                                            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 transition-all ${
                                              taken
                                                ? 'bg-green-50 border-green-500'
                                                : isTodayDay
                                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                                                : isPast
                                                ? 'bg-gray-50 border-gray-300 opacity-60'
                                                : 'bg-white border-gray-200 hover:border-primary'
                                            }`}
                                          >
                                            <span className='text-[10px] sm:text-xs font-semibold text-muted-foreground'>
                                              {day.day}-кун
                                            </span>
                                            {dayDate && (
                                              <span className='text-[9px] sm:text-[10px] text-muted-foreground mt-0.5'>
                                                {formatDate(day.date!)}
                                              </span>
                                            )}
                                            <div className='text-[10px] sm:text-xs font-medium mt-1'>
                                              {day.times || 0}/{item.frequency}
                                            </div>
                                            {!taken && isTodayDay && (
                                              <Button
                                                size='sm'
                                                variant='ghost'
                                                className='mt-1 h-6 w-6 p-0 hover:bg-green-100'
                                                onClick={() =>
                                                  openConfirmModal(
                                                    record._id,
                                                    record.prescriptionData!._id,
                                                    null,
                                                    item._id,
                                                    String(day.day),
                                                    'medicine'
                                                  )
                                                }
                                              >
                                                <Check className='w-3 h-3 sm:w-4 sm:h-4 text-green-600' />
                                              </Button>
                                            )}
                                            {taken && (
                                              <Check className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1' />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value='services'>
                        {record.isLoadingService ? (
                          <div className='flex items-center justify-center py-8'>
                            <Loader2 className='w-6 h-6 animate-spin text-primary' />
                            <span className='ml-2 text-sm text-muted-foreground'>
                              Хизматлар юкланмоқда...
                            </span>
                          </div>
                        ) : !record.serviceData?.services || record.serviceData.services.length === 0 ? (
                          <p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
                            Хизматлар топилмади
                          </p>
                        ) : (
                          <div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
                            {record.serviceData.services.map((service) => (
                              <Card
                                key={service._id}
                                className='border shadow-sm bg-card'
                              >
                                <CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
                                  <div className='flex justify-between items-start gap-2'>
                                    <div className='flex-1 min-w-0'>
                                      <h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
                                        {service.service_type_id.name}
                                      </h4>
                                      {service.notes && (
                                        <p className='text-xs font-medium text-muted-foreground mt-1'>
                                          ИЗОҲ: {service.notes}
                                        </p>
                                      )}
                                      <p className='text-xs text-muted-foreground mt-0.5'>
                                        Нарх: {service.price?.toLocaleString()} сўм
                                      </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                                <CardContent className='px-3 sm:px-6 pb-3 sm:pb-6'>
                                  {!service.days || service.days.length === 0 ? (
                                    <p className='text-xs text-muted-foreground text-center py-4'>
                                      Кунлар маълумоти йўқ
                                    </p>
                                  ) : (
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-1.5 sm:gap-2'>
                                      {service.days.map((day) => {
                                        const dayDate = day.date ? new Date(day.date) : null;
                                        const isTodayDay = dayDate && isToday(day.date!);
                                        const isPast = dayDate && dayDate < new Date() && !isTodayDay;
                                        const taken = day.times && Number(day.times) >= service.frequency;

                                        return (
                                          <div
                                            key={day._id}
                                            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 transition-all ${
                                              taken
                                                ? 'bg-green-50 border-green-500'
                                                : isTodayDay
                                                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                                                : isPast
                                                ? 'bg-gray-50 border-gray-300 opacity-60'
                                                : 'bg-white border-gray-200 hover:border-primary'
                                            }`}
                                          >
                                            <span className='text-[10px] sm:text-xs font-semibold text-muted-foreground'>
                                              {day.day}-кун
                                            </span>
                                            {dayDate && (
                                              <span className='text-[9px] sm:text-[10px] text-muted-foreground mt-0.5'>
                                                {formatDate(day.date!)}
                                              </span>
                                            )}
                                            <div className='text-[10px] sm:text-xs font-medium mt-1'>
                                              {day.times || 0}/{service.frequency}
                                            </div>
                                            {!taken && isTodayDay && (
                                              <Button
                                                size='sm'
                                                variant='ghost'
                                                className='mt-1 h-6 w-6 p-0 hover:bg-green-100'
                                                onClick={() =>
                                                  openConfirmModal(
                                                    record._id,
                                                    null,
                                                    service._id,
                                                    null,
                                                    String(day.day),
                                                    'service'
                                                  )
                                                }
                                              >
                                                <Check className='w-3 h-3 sm:w-4 sm:h-4 text-green-600' />
                                              </Button>
                                            )}
                                            {taken && (
                                              <Check className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1' />
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                                      <>
                                        {/* Desktop - 5 columns */}
                                        <div className='hidden lg:grid lg:grid-cols-5 gap-2 xl:gap-3'>
                                          {service.days.map((day) => {
                                            const taken = day.times || 0;
                                            const total = service.frequency;
                                            const isCompleted = taken >= total;
                                            const lastDate = formatDate(
                                              day.date
                                            );

                                            return (
                                              <div
                                                key={day._id}
                                                className='flex flex-col items-center p-2 xl:p-3 border rounded-lg hover:bg-accent/50 transition-colors'
                                                onClick={() =>
                                                  !isCompleted &&
                                                  openConfirmModal(
                                                    record._id,
                                                    null,
                                                    service._id,
                                                    String(day.day),
                                                    'service'
                                                  )
                                                }
                                              >
                                                <p className='text-xs font-medium mb-1 text-center line-clamp-1'>
                                                  Кун {day.day}
                                                </p>
                                                {lastDate && (
                                                  <p className='text-[10px] text-black mb-1.5 text-center'>
                                                    {isToday(day.date)
                                                      ? 'Bugun'
                                                      : lastDate}
                                                  </p>
                                                )}
                                                <button
                                                  disabled={isCompleted}
                                                  className={`text-base xl:text-lg font-bold transition-all ${
                                                    isCompleted
                                                      ? 'text-green-600 cursor-default'
                                                      : 'text-primary hover:scale-110 cursor-pointer active:scale-95'
                                                  }`}
                                                >
                                                  {isCompleted ? (
                                                    <div className='flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 bg-green-500 rounded-full'>
                                                      <Check className='w-4 h-4 xl:w-5 xl:h-5 text-white' />
                                                    </div>
                                                  ) : (
                                                    <span>
                                                      {taken}/{total}
                                                    </span>
                                                  )}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Tablet - 3 columns */}
                                        <div className='hidden sm:grid lg:hidden sm:grid-cols-3 md:grid-cols-4 gap-2'>
                                          {service.days.map((day) => {
                                            const taken = day.times || 0;
                                            const total = service.frequency;
                                            const isCompleted = taken >= total;
                                            const lastDate = formatDate(
                                              day.date
                                            );

                                            return (
                                              <div
                                                key={day._id}
                                                className='flex flex-col items-center p-2 border rounded-lg hover:bg-accent/50 transition-colors'
                                                onClick={() =>
                                                  !isCompleted &&
                                                  openConfirmModal(
                                                    record._id,
                                                    null,
                                                    service._id,
                                                    String(day.day),
                                                    'service'
                                                  )
                                                }
                                              >
                                                <p className='text-xs font-medium mb-0.5 text-center line-clamp-1'>
                                                  Кун {day.day}
                                                </p>
                                                {lastDate && (
                                                  <p className='text-[10px] text-black mb-1 text-center'>
                                                    {isToday(day.date)
                                                      ? 'Bugun'
                                                      : lastDate}
                                                  </p>
                                                )}
                                                <button
                                                  disabled={isCompleted}
                                                  className={`text-base font-bold transition-all ${
                                                    isCompleted
                                                      ? 'text-green-600 cursor-default'
                                                      : 'text-primary hover:scale-110 cursor-pointer active:scale-95'
                                                  }`}
                                                >
                                                  {isCompleted ? (
                                                    <div className='flex items-center justify-center w-7 h-7 bg-green-500 rounded-full'>
                                                      <Check className='w-4 h-4 text-white' />
                                                    </div>
                                                  ) : (
                                                    <span>
                                                      {taken}/{total}
                                                    </span>
                                                  )}
                                                </button>
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Mobile - 2 columns */}
                                        <div className='grid grid-cols-2 gap-2 sm:hidden'>
                                          {service.days.map((day) => {
                                            const taken = day.times || 0;
                                            const total = service.frequency;
                                            const isCompleted = taken >= total;
                                            const lastDate = formatDate(
                                              day.date
                                            );

                                            return (
                                              <div
                                                key={day._id}
                                                className='flex flex-col p-2 border rounded-lg active:bg-accent/50 transition-colors'
                                                onClick={() =>
                                                  !isCompleted &&
                                                  openConfirmModal(
                                                    record._id,
                                                    null,
                                                    service._id,
                                                    String(day.day),
                                                    'service'
                                                  )
                                                }
                                              >
                                                <div className='flex items-center justify-between mb-1'>
                                                  <span className='text-xs font-medium'>
                                                    Кун {day.day}
                                                  </span>
                                                  <button
                                                    disabled={isCompleted}
                                                    className={`text-sm font-bold transition-all flex-shrink-0 ${
                                                      isCompleted
                                                        ? 'text-green-600'
                                                        : 'text-primary active:scale-95'
                                                    }`}
                                                  >
                                                    {isCompleted ? (
                                                      <Check className='w-5 h-5 text-green-600' />
                                                    ) : (
                                                      <span>
                                                        {taken}/{total}
                                                      </span>
                                                    )}
                                                  </button>
                                                </div>
                                                {lastDate && (
                                                  <p className='text-[9px] text-black text-left'>
                                                    {isToday(day.date)
                                                      ? 'Bugun'
                                                      : lastDate}
                                                  </p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </>
                                    )}

                                    {/* Days yo'q va processing ham yo'q */}
                                    {!hasDays && !isProcessing && (
                                      <p className='text-xs sm:text-sm text-black text-center py-4'>
                                        Кунлар юкланмоқда...
                                      </p>
                                    )}
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Empty state */}
            {records.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-sm text-muted-foreground'>
                  {roomSearch
                    ? `"${roomSearch}" хонада беморлар топилмади`
                    : 'Беморлар топилмади'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className='mt-4 sm:mt-6'>
                <Pagination>
                  <PaginationContent className='flex-wrap gap-1'>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        className={`h-8 sm:h-10 text-xs sm:text-sm ${
                          pagination.prev_page === null
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }`}
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: pagination.total_pages },
                      (_, i) => i + 1
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className='h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm cursor-pointer'
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, pagination.total_pages)
                          )
                        }
                        className={`h-8 sm:h-10 text-xs sm:text-sm ${
                          pagination.next_page === null
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirm Modal */}
      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) =>
          !open &&
          setConfirmModal({
            open: false,
            recordId: null,
            prescriptionId: null,
            serviceId: null,
            day: null,
            type: 'medicine',
          })
        }
      >
        <DialogContent className='max-w-[90vw] sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle className='text-base sm:text-lg'>
              Тасдиқлаш
            </DialogTitle>
          </DialogHeader>
          <p className='text-sm sm:text-base text-muted-foreground py-3 sm:py-4'>
            {confirmModal.type === 'medicine'
              ? 'Бемор дорини ичдими?'
              : 'Хизмат бажарилдими?'}
          </p>
          <DialogFooter className='flex gap-2 sm:gap-3'>
            <Button
              variant='outline'
              onClick={() =>
                setConfirmModal({
                  open: false,
                  recordId: null,
                  prescriptionId: null,
                  serviceId: null,
                  day: null,
                  type: 'medicine',
                })
              }
              disabled={takingMedicine || takingService}
              className='flex-1 sm:flex-none text-sm'
            >
              Йўқ
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={takingMedicine || takingService}
              className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
            >
              {takingMedicine || takingService ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'Ҳа'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Medicine;
