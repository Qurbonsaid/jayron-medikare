import { useCreateBillingMutation } from '@/app/api/billingApi/billingApi';
import { service_type } from '@/app/api/billingApi/types';
import { useGetAllExamsQuery } from '@/app/api/examinationApi/examinationApi';
import { getStatusBadge } from '@/components/common/StatusBadge';
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PAYMENT } from '@/constants/payment';
import { CreditCard, Plus, Printer, Send } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Service } from '../Billing';
import { AnalysisItem } from './AnalysisItem';
import { formatCurrency } from './BillingBadge';
import { RoomItem } from './RoomItem';
import { ServiceItem } from './ServiceItem';

interface Props {
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NewBilling = ({ isInvoiceModalOpen, setIsInvoiceModalOpen }: Props) => {
  const [page, setPage] = React.useState(1);
  const [allExams, setAllExams] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [discount, setDiscount] = React.useState(0);

  // Analysis, Room, Service states
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [paymentType, setPaymentType] = React.useState<service_type>('XIZMAT');
  const [selectedExaminationId, setSelectedExaminationId] = React.useState('');
  const [selectedRooms, setSelectedRooms] = React.useState<string[]>([]);

  // General services state (local to NewBilling)
  const [services, setServices] = React.useState<Service[]>([
    {
      id: Date.now().toString(),
      name: '',
      service_type: 'XIZMAT',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  const [createBilling, { isLoading: isCreating }] = useCreateBillingMutation();

  // Service management functions
  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      service_type: 'XIZMAT',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setServices([...services, newService]);
  };

  const updateService = (
    id: string,
    field: keyof Service,
    value: string | number
  ) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const calculateSubtotal = () => {
    return services.reduce((sum, service) => sum + service.total, 0);
  };

  // Calculate analyses total separately
  const calculateAnalysesTotal = () => {
    if (!selectedExam?.analyses || selectedExam.analyses.length === 0) return 0;

    let total = 0;
    selectedExam.analyses.forEach((analysis: any) => {
      const analysisType =
        typeof analysis.analysis_type === 'object'
          ? analysis.analysis_type
          : null;
      const price = analysisType?.price ?? analysis.price ?? 0;
      total += price;
    });
    return total;
  };

  // Calculate rooms total separately - using the same logic as displayed in the table
  const calculateRoomsTotal = () => {
    if (!selectedExam?.rooms || selectedExam.rooms.length === 0) return 0;
    if (selectedRooms.length === 0) return 0;

    let total = 0;
    // Calculate exactly as shown in the table - iterate through selectedRooms and find corresponding room
    selectedRooms.forEach((roomId) => {
      const room = selectedExam.rooms.find((r: any) => {
        const rId = typeof r.room_id === 'object' ? r.room_id._id : r.room_id;
        return rId === roomId;
      });

      if (!room) return;

      // Use EXACT same calculation as RoomItem component (line 12-16)
      // Note: RoomItem uses room?.end_date || room?.estimated_leave_time without fallback to new Date()
      const days = Math.ceil(
        (new Date(room?.end_date || room?.estimated_leave_time).getTime() -
          new Date(room?.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Use EXACT same calculation as RoomItem component (line 18)
      const roomTotal = days
        ? (room?.room_price || 0) * days
        : room?.room_price || 0;
      total += roomTotal;
    });
    return total;
  };

  // Calculate examination services items total separately
  const calculateExaminationServicesItemsTotal = () => {
    if (
      !selectedExam?.service?.items ||
      selectedExam.service.items.length === 0
    )
      return 0;

    let total = 0;
    selectedExam.service.items.forEach((item: any) => {
      const serviceType =
        typeof item.service_type_id === 'object' ? item.service_type_id : null;
      if (serviceType) {
        const quantity =
          item.quantity ??
          item.days?.filter(
            (day: any) => day.date !== null && day.date !== undefined
          ).length ??
          1;
        const unitPrice = serviceType.price ?? item.price ?? 0;
        const itemTotal = item.total_price ?? unitPrice * quantity;
        total += itemTotal;
      }
    });
    return total;
  };

  // Calculate examination services total (analyses, rooms, services)
  const calculateExaminationServicesTotal = () => {
    if (!selectedExam) return 0;
    return (
      calculateAnalysesTotal() +
      calculateRoomsTotal() +
      calculateExaminationServicesItemsTotal()
    );
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    console.log('Services for calc', services);
    const examinationServicesTotal = calculateExaminationServicesTotal();
    return subtotal + examinationServicesTotal - discount;
  };

  const {
    data: examinationsData,
    isLoading: isLoadingExams,
    isFetching,
  } = useGetAllExamsQuery(
    {
      page,
      limit: 20,
      status: 'pending',
      has_billing: false,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  // Update allExams when new data arrives (only when modal is open)
  React.useEffect(() => {
    if (examinationsData?.data && isInvoiceModalOpen) {
      if (page === 1) {
        setAllExams(examinationsData.data);
      } else {
        setAllExams((prev) => {
          const newExams = examinationsData.data.filter(
            (exam: any) => !prev.some((e) => e._id === exam._id)
          );
          return [...prev, ...newExams];
        });
      }

      // Check if there's more data
      if (examinationsData.pagination) {
        setHasMore(examinationsData.pagination.next_page !== null);
      }
    }
  }, [examinationsData, page, isInvoiceModalOpen]);

  const selectedExam = React.useMemo(() => {
    return allExams.find((exam) => exam._id === selectedExaminationId);
  }, [allExams, selectedExaminationId]);

  // Get selected items from examination
  const analysisIds = React.useMemo(() => {
    if (!selectedExam?.analyses) return [];
    return selectedExam.analyses.map((a: any) =>
      typeof a === 'object' ? a._id : a
    );
  }, [selectedExam]);

  const roomIds = React.useMemo(() => {
    if (!selectedExam?.rooms) return [];
    return selectedExam.rooms.map((r: any) =>
      typeof r.room_id === 'object' ? r.room_id._id : r.room_id
    );
  }, [selectedExam]);

  const serviceIds = React.useMemo(() => {
    if (!selectedExam?.service?.items) return [];
    return selectedExam.service.items.map((s: any) =>
      typeof s.service_type_id === 'object'
        ? s.service_type_id._id
        : s.service_type_id
    );
  }, [selectedExam]);

  React.useEffect(() => {
    if (selectedExam && roomIds.length > 0) {
      setSelectedRooms(roomIds);
    }
  }, [roomIds, selectedExam]);

  const formatNumberWithSpaces = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  // Reset when modal closes
  React.useEffect(() => {
    if (!isInvoiceModalOpen) {
      // Modal yopilganda reset
      setPage(1);
      setAllExams([]);
      setHasMore(true);
      setSelectedExaminationId('');
      setSelectedRooms([]);
      setServices([]);
      setPaymentType('XIZMAT');
      setPaymentAmount('');
      setPaymentMethod('cash');
      setDiscount(0);
    }
  }, [isInvoiceModalOpen]);

  const handleSaveBilling = async () => {
    // Validation
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    // Validate services - either general services or examination services should exist
    const examinationServicesTotal = calculateExaminationServicesTotal();
    if (services.length === 0 && examinationServicesTotal === 0) {
      toast.error(
        'Илтимос, камида битта хизмат қўшинг ёки кўрикда хизматлар бўлиши керак'
      );
      return;
    }

    const invalidService = services.find(
      (s) => !s.name.trim() || s.quantity <= 0 || s.unitPrice <= 0
    );
    if (invalidService) {
      if (!invalidService.name.trim()) {
        toast.error('Илтимос, хизмат номини киритинг');
      } else if (invalidService.quantity <= 0) {
        toast.error('Илтимос, хизмат сонини тўғри киритинг');
      } else if (invalidService.unitPrice <= 0) {
        toast.error('Илтимос, хизмат нархини киритинг');
      }
      return;
    }

    if (
      paymentAmount === '' ||
      paymentAmount === null ||
      paymentAmount === undefined
    ) {
      toast.error('Илтимос, тўлов миқдорини киритинг');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (parseFloat(paymentAmount) > grandTotal) {
      toast.error('Тўлов миқдори жами суммадан ошиб кетмаслиги керак');
      return;
    }

    try {
      // Prepare examination services for backend
      const examinationServices: Array<{
        name: string;
        count: number;
        price: number;
        service_type: service_type;
      }> = [];

      // Add analyses as services
      if (selectedExam?.analyses && selectedExam.analyses.length > 0) {
        selectedExam.analyses.forEach((analysis: any) => {
          const analysisType =
            typeof analysis.analysis_type === 'object'
              ? analysis.analysis_type
              : null;
          const price = analysisType?.price ?? analysis.price ?? 0;
          if (price > 0) {
            examinationServices.push({
              name: analysisType?.name || 'Таҳлил',
              count: 1,
              price: price,
              service_type: 'TAHLIL',
            });
          }
        });
      }

      // Add rooms as services
      if (selectedExam?.rooms && selectedExam.rooms.length > 0) {
        selectedExam.rooms.forEach((room: any) => {
          const days = Math.ceil(
            (new Date(
              room?.end_date || room?.estimated_leave_time || new Date()
            ).getTime() -
              new Date(room?.start_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const roomTotal =
            days > 0 ? (room?.room_price || 0) * days : room?.room_price || 0;
          if (roomTotal > 0) {
            examinationServices.push({
              name: room?.room_name || 'Палата',
              count: days > 0 ? days : 1,
              price: room?.room_price || 0,
              service_type: 'XONA',
            });
          }
        });
      }

      // Add services from examination.service.items
      if (
        selectedExam?.service?.items &&
        selectedExam.service.items.length > 0
      ) {
        selectedExam.service.items.forEach((item: any) => {
          const serviceType =
            typeof item.service_type_id === 'object'
              ? item.service_type_id
              : null;
          if (serviceType) {
            const quantity =
              item.quantity ??
              item.days?.filter(
                (day: any) => day.date !== null && day.date !== undefined
              ).length ??
              1;
            const unitPrice = serviceType.price ?? item.price ?? 0;
            const itemTotal = item.total_price ?? unitPrice * quantity;
            if (itemTotal > 0) {
              examinationServices.push({
                name: serviceType.name || 'Хизмат',
                count: quantity,
                price: unitPrice,
                service_type: 'XIZMAT',
              });
            }
          }
        });
      }

      // Combine general services with examination services
      const allServices = [
        ...services.map((s) => ({
          name: s.name,
          count: s.quantity,
          price: s.unitPrice,
          service_type: s.service_type,
        })),
        ...examinationServices,
      ];

      const billingData = {
        examination_id: selectedExaminationId,
        services: allServices,
        payment: {
          payment_method: paymentMethod,
          payment_type: paymentType,
          amount: parseFloat(paymentAmount),
        },
      };

      const result = await createBilling(billingData).unwrap();

      if (result.success) {
        toast.success('Ҳисоб-фактура муваффақиятли яратилди');
        setIsInvoiceModalOpen(false);
        // Reset form
        setSelectedExaminationId('');
        setPaymentAmount('');
        setDiscount(0);
        setSelectedRooms([]);
      }
    } catch (error: any) {
      toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
    }
  };

  return (
    <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
      <DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
        <AlertDialogHeader>
          <DialogTitle className='text-xl sm:text-2xl'>
            Янги ҳисоб-фактура
          </DialogTitle>
        </AlertDialogHeader>

        <div className='space-y-4 sm:space-y-6'>
          <div>
            <Label className='text-sm mb-2 block'>Кўрикни танланг *</Label>
            <Select
              value={selectedExaminationId}
              onValueChange={setSelectedExaminationId}
            >
              <SelectTrigger className='h-auto min-h-[42px] py-2.5 px-3'>
                {selectedExam ? (
                  <div className='flex items-start justify-between w-full gap-3 text-left'>
                    <div className='flex-1 min-w-0 space-y-0.5'>
                      <div className='font-semibold text-sm text-primary truncate'>
                        {selectedExam.patient_id.fullname}
                      </div>
                      <div className='text-xs text-muted-foreground truncate'>
                        <span className='font-medium'>Шикоят:</span>{' '}
                        {selectedExam.complaints}
                      </div>
                      <div className='text-xs text-muted-foreground truncate'>
                        <span className='font-medium'>Доктор:</span>{' '}
                        {selectedExam.doctor_id.fullname}
                      </div>
                    </div>
                    <div className='flex-shrink-0 mt-0.5'>
                      {getStatusBadge(selectedExam.status)}
                    </div>
                  </div>
                ) : (
                  <span className='text-muted-foreground text-sm'>
                    Кўрикни танланг
                  </span>
                )}
              </SelectTrigger>
              <SelectContent
                onScroll={handleScroll}
                className='max-h-[420px] overflow-y-auto w-full'
              >
                {isLoadingExams && allExams.length === 0 ? (
                  <div className='p-4 text-center'>
                    <LoadingSpinner className='w-5 h-5 mx-auto' />
                  </div>
                ) : allExams && allExams.length > 0 ? (
                  allExams.map((exam) => (
                    <SelectItem
                      key={exam._id}
                      value={exam._id}
                      className='py-3 px-3 cursor-pointer hover:bg-accent transition-colors'
                    >
                      <div className='flex items-start justify-between w-full gap-3'>
                        <div className='flex-1 min-w-0 space-y-1'>
                          <div className='font-semibold text-sm text-primary'>
                            {exam.patient_id.fullname}
                          </div>
                          <div className='text-xs text-muted-foreground line-clamp-2'>
                            <span className='font-medium'>Шикоят:</span>{' '}
                            {exam.complaints}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            <span className='font-medium'>Доктор:</span>{' '}
                            {exam.doctor_id.fullname}
                          </div>
                        </div>
                        <div className='flex-shrink-0 mt-0.5'>
                          {getStatusBadge(exam.status)}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className='p-4 text-center text-muted-foreground text-sm'>
                    Актив кўриклар топилмади
                  </div>
                )}
                {isFetching && allExams.length > 0 && (
                  <div className='p-2 text-center'>
                    <LoadingSpinner className='w-4 h-4 mx-auto' />
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Patient Info - Show after selecting examination */}
          {selectedExam && (
            <Card className='p-3 sm:p-4 bg-muted/50'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Бемор</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {selectedExam.patient_id.fullname}
                  </div>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>ID</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {selectedExam.patient_id._id}
                  </div>
                </div>
                <div className='sm:col-span-2 lg:col-span-1'>
                  <Label className='text-xs text-muted-foreground'>
                    Телефон
                  </Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {selectedExam.patient_id.phone}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Analysis, Rooms, Services Input Fields */}
          {selectedExam && (
            <div className='space-y-4'>
              {/* Analysis Section */}
              <div>
                <div className='mb-3'>
                  <Label className='text-base sm:text-lg font-semibold'>
                    Таҳлиллар
                  </Label>
                </div>

                {analysisIds.length > 0 ? (
                  <div className='border rounded-lg overflow-hidden'>
                    {/* Desktop Table View */}
                    <div className='hidden md:block'>
                      <table className='w-full'>
                        <thead className='bg-muted'>
                          <tr>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Таҳлил тури
                            </th>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Даража
                            </th>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Клиник кўрсатмалар
                            </th>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Холат
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-sm'>
                              Сана
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExam?.analyses?.map((analysis: any) => (
                            <AnalysisItem
                              key={analysis._id}
                              analysis={analysis}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='md:hidden'>
                      {selectedExam?.analyses?.map((analysis: any) => (
                        <AnalysisItem
                          key={analysis._id}
                          analysis={analysis}
                          isMobile
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='p-8 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20'>
                    Таҳлиллар топилмади
                  </div>
                )}
              </div>

              {/* Rooms Section */}
              <div>
                <div className='mb-3'>
                  <Label className='text-base sm:text-lg font-semibold'>
                    Палаталар
                  </Label>
                </div>

                {roomIds.length > 0 ? (
                  <div className='border rounded-lg overflow-hidden'>
                    {/* Desktop Table View */}
                    <div className='hidden md:block'>
                      <table className='w-full'>
                        <thead className='bg-muted'>
                          <tr>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Палата
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-sm'>
                              Холат
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-sm'>
                              Бошланиш
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-sm'>
                              Тугаш
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-sm'>
                              Кунлар
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-sm'>
                              Нархи
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRooms.map((roomId) => {
                            const roomData = selectedExam?.rooms?.find(
                              (r: any) =>
                                (typeof r.room_id === 'object'
                                  ? r.room_id._id
                                  : r.room_id) === roomId
                            );
                            return (
                              <RoomItem key={roomData?._id} room={roomData} />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='md:hidden'>
                      {selectedRooms.map((roomId) => {
                        const roomData = selectedExam?.rooms?.find(
                          (r: any) =>
                            (typeof r.room_id === 'object'
                              ? r.room_id._id
                              : r.room_id) === roomId
                        );
                        return (
                          <RoomItem
                            key={roomData?._id}
                            room={roomData}
                            isMobile
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className='p-8 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20'>
                    Палаталар топилмади
                  </div>
                )}
              </div>

              {/* Services Section */}
              <div>
                <div className='mb-3'>
                  <Label className='text-base sm:text-lg font-semibold'>
                    Хизматлар
                  </Label>
                </div>

                {serviceIds.length > 0 ? (
                  <div className='border rounded-lg overflow-hidden'>
                    {/* Desktop Table View */}
                    <div className='hidden md:block'>
                      <table className='w-full'>
                        <thead className='bg-muted'>
                          <tr>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Хизмат номи
                            </th>
                            <th className='text-left py-3 px-4 font-medium text-sm'>
                              Код
                            </th>
                            <th className='text-center py-3 px-4 font-medium text-sm'>
                              Сони
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-sm'>
                              Нархи
                            </th>
                            <th className='text-right py-3 px-4 font-medium text-sm'>
                              Жами
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedExam?.service?.items?.map((item: any) => (
                            <ServiceItem key={item._id} service={item} />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='md:hidden'>
                      {selectedExam?.service?.items?.map((item: any) => (
                        <ServiceItem key={item._id} service={item} isMobile />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className='p-8 text-center text-muted-foreground text-sm border rounded-lg bg-muted/20'>
                    Хизматлар топилмади
                  </div>
                )}
              </div>
            </div>
          )}

          {/* General Services Section - Only show when examination is selected */}
          {selectedExam && (
            <div>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3'>
                <Label className='text-base sm:text-lg font-semibold'>
                  Умумий хизматлар
                </Label>
              </div>

              {/* Desktop Table */}
              <div className='hidden md:block border rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-muted'>
                    <tr>
                      <th className='text-left py-3 px-4 font-medium text-sm'>
                        Хизмат номи
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-sm w-[170px]'>
                        Хизмат тури
                      </th>
                      <th className='text-center py-3 px-4 font-medium text-sm w-24'>
                        Сони
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm w-48'>
                        Нархи
                      </th>
                      <th className='w-16'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className='border-b'>
                        <td className='py-2 px-4'>
                          <Input
                            value={service.name}
                            onChange={(e) =>
                              updateService(service.id, 'name', e.target.value)
                            }
                            placeholder='Хизмат номи...'
                            className='text-sm'
                          />
                        </td>
                        <td className='py-2 px-4'>
                          <Select
                            value={service.service_type}
                            onValueChange={(value: service_type) =>
                              updateService(service.id, 'service_type', value)
                            }
                          >
                            <SelectTrigger className='h-9 text-sm w-[170px]'>
                              <SelectValue placeholder='Турини танланг' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='KORIK'>Кўрик</SelectItem>
                              <SelectItem value='XIZMAT'>Хизмат</SelectItem>
                              <SelectItem value='XONA'>Хона</SelectItem>
                              <SelectItem value='TASVIR'>Тасвир</SelectItem>
                              <SelectItem value='TAHLIL'>Таҳлил</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className='py-2 px-4'>
                          <Input
                            type='text'
                            inputMode='numeric'
                            min='1'
                            value={service.quantity}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ''
                              );
                              updateService(
                                service.id,
                                'quantity',
                                parseInt(value) || 0
                              );
                            }}
                            className='w-16 mx-auto text-center text-sm'
                          />
                        </td>
                        <td className='py-2 px-4'>
                          <Input
                            type='text'
                            inputMode='numeric'
                            value={formatNumberWithSpaces(service.unitPrice)}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\s/g, '')
                                .replace(/[^0-9]/g, '');
                              updateService(
                                service.id,
                                'unitPrice',
                                parseInt(value) || 0
                              );
                            }}
                            className='text-right text-sm w-36 ml-auto'
                          />
                        </td>
                        <td className='py-2 px-4'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeService(service.id)}
                            className='text-white bg-red-500 hover:text-danger h-8 w-8 p-0'
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className='text-center p-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={addService}
                    className='w-full sm:w-auto text-xs sm:text-sm bg-blue-500 text-white'
                  >
                    <Plus className='w-3 h-3 sm:w-4 sm:h-4 mr-2' />
                    Хизмат қўшиш
                  </Button>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className='md:hidden space-y-3'>
                {services.map((service) => (
                  <Card key={service.id} className='p-3'>
                    <div className='space-y-3'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          Хизмат номи
                        </Label>
                        <Input
                          value={service.name}
                          onChange={(e) =>
                            updateService(service.id, 'name', e.target.value)
                          }
                          placeholder='Хизмат номи...'
                          className='text-sm'
                        />
                      </div>

                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          Хизмат тури
                        </Label>
                        <Select
                          value={service.service_type}
                          onValueChange={(value: service_type) =>
                            updateService(service.id, 'service_type', value)
                          }
                        >
                          <SelectTrigger className='text-sm'>
                            <SelectValue placeholder='Турини танланг' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='KORIK'>Кўрик</SelectItem>
                            <SelectItem value='XIZMAT'>Хизмат</SelectItem>
                            <SelectItem value='XONA'>Хона</SelectItem>
                            <SelectItem value='TASVIR'>Тасвир</SelectItem>
                            <SelectItem value='TAHLIL'>Таҳлил</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Сони
                          </Label>
                          <Input
                            type='text'
                            inputMode='numeric'
                            min='1'
                            value={service.quantity}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^0-9]/g,
                                ''
                              );
                              updateService(
                                service.id,
                                'quantity',
                                parseInt(value) || 1
                              );
                            }}
                            className='text-sm'
                          />
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Нархи
                          </Label>
                          <Input
                            type='text'
                            inputMode='numeric'
                            value={formatNumberWithSpaces(service.unitPrice)}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\s/g, '')
                                .replace(/[^0-9]/g, '');
                              updateService(
                                service.id,
                                'unitPrice',
                                parseInt(value) || 0
                              );
                            }}
                            className='text-sm'
                          />
                        </div>
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeService(service.id)}
                        className='text-danger hover:text-danger w-full mt-2'
                      >
                        Ўчириш
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Mobile Add Service Button */}
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addService}
                  className='w-full text-sm bg-blue-500 text-white'
                >
                  <Plus className='w-4 h-4 mr-2' />
                  Хизмат қўшиш
                </Button>
              </div>
            </div>
          )}

          {/* Payment Breakdown Section */}

          {/* Payment Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            {selectedExam && (
              <Card className='p-4 bg-muted/30'>
                <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                  Тўлов тафсилотлари
                </Label>
                <div className='space-y-2'>
                  {calculateAnalysesTotal() > 0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>Таҳлиллар:</span>
                      <span className='font-medium'>
                        {formatCurrency(calculateAnalysesTotal())}
                      </span>
                    </div>
                  )}
                  {calculateRoomsTotal() > 0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>Палаталар:</span>
                      <span className='font-medium'>
                        {formatCurrency(calculateRoomsTotal())}
                      </span>
                    </div>
                  )}
                  {calculateExaminationServicesItemsTotal() > 0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        Кўрик хизматлари:
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(
                          calculateExaminationServicesItemsTotal()
                        )}
                      </span>
                    </div>
                  )}
                  {calculateSubtotal() > 0 && (
                    <div className='flex justify-between items-center text-sm'>
                      <span className='text-muted-foreground'>
                        Умумий хизматлар:
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(calculateSubtotal())}
                      </span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className='flex justify-between items-center text-sm text-red-600'>
                      <span>Чегирма:</span>
                      <span className='font-medium'>
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className='border-t pt-2 mt-2 flex justify-between items-center'>
                    <span className='text-base font-semibold'>Жами:</span>
                    <span className='text-lg font-bold text-primary'>
                      {formatCurrency(calculateGrandTotal())}
                    </span>
                  </div>
                </div>
              </Card>
            )}
            {/* <div className='space-y-3 sm:space-y-4'>
              <Card className='p-3 sm:p-4 bg-primary/5 flex justify-between items-center'>
                <span className='text-base sm:text-lg font-semibold'>
                  Жами тўлов:
                </span>
                <span className='text-lg sm:text-2xl font-bold text-primary'>
                  {formatCurrency(calculateGrandTotal())}
                </span>
              </Card>
            </div> */}

            <div className='space-y-3 sm:space-y-4'>
              <div>
                <Label className='text-sm'>Тўлов миқдори</Label>
                <Input
                  type='text'
                  inputMode='numeric'
                  value={
                    paymentAmount
                      ? formatNumberWithSpaces(parseFloat(paymentAmount))
                      : ''
                  }
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s/g, '')
                      .replace(/[^0-9]/g, '');
                    setPaymentAmount(value);
                  }}
                  placeholder='0'
                  className='text-sm'
                />
              </div>

              <div>
                <Label className='text-sm'>Тўлов усули</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PAYMENT.CASH}>
                      <div className='flex items-center'>
                        <CreditCard className='w-4 h-4 mr-2' />
                        Нақд
                      </div>
                    </SelectItem>
                    <SelectItem value={PAYMENT.CARD}>Карта</SelectItem>
                    <SelectItem value={PAYMENT.ONLINE}>Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className='text-sm'>Тўлов тури</Label>
                <Select
                  value={paymentType}
                  onValueChange={(value: service_type) => setPaymentType(value)}
                >
                  <SelectTrigger className='text-sm'>
                    <SelectValue placeholder='Тўлов турини танланг' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='KORIK'>Кўрик</SelectItem>
                    <SelectItem value='XIZMAT'>Хизмат</SelectItem>
                    <SelectItem value='XONA'>Хона</SelectItem>
                    <SelectItem value='TASVIR'>Тасвир</SelectItem>
                    <SelectItem value='TAHLIL'>Таҳлил</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='text-xs text-muted-foreground mt-2'>
                Жами: {formatCurrency(calculateGrandTotal())}
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className='gap-2 flex-col sm:flex-row'>
          <Button
            variant='outline'
            onClick={() => setIsInvoiceModalOpen(false)}
            className='w-full sm:w-auto text-sm'
          >
            Бекор қилиш
          </Button>
          <Button
            variant='outline'
            className='w-full sm:w-auto text-sm'
            disabled
          >
            <Send className='w-4 h-4 mr-2' />
            Беморга юбориш
          </Button>
          <Button
            variant='outline'
            className='w-full sm:w-auto text-sm'
            disabled
          >
            <Printer className='w-4 h-4 mr-2' />
            Чоп этиш
          </Button>
          <Button
            className='w-full sm:w-auto text-sm'
            onClick={handleSaveBilling}
            disabled={isCreating || !selectedExaminationId}
          >
            {isCreating ? 'Сақланмоқда...' : 'Сақлаш'}
          </Button>
        </AlertDialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewBilling;
