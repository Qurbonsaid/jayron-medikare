import { useCreateBillingMutation } from '@/app/api/billingApi/billingApi';
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
import { formatCurrency, Service } from '../Billing';
import { AnalysisItem } from './AnalysisItem';
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
  const [selectedExaminationId, setSelectedExaminationId] = React.useState('');
  const [selectedAnalysis, setSelectedAnalysis] = React.useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = React.useState<string[]>([]);
  const [selectedServices, setSelectedServices] = React.useState<string[]>([]);

  // General services state (local to NewBilling)
  const [services, setServices] = React.useState<Service[]>([
    {
      id: Date.now().toString(),
      name: '',
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

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount;
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
    },
    {
      refetchOnMountOrArgChange: true, // Always refetch when component mounts or args change
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
    if (!selectedExam?.services) return [];
    return selectedExam.services.map((s: any) =>
      typeof s.service_type_id === 'object'
        ? s.service_type_id._id
        : s.service_type_id
    );
  }, [selectedExam]);

  // Auto-select all items from examination
  React.useEffect(() => {
    if (selectedExam && analysisIds.length > 0) {
      setSelectedAnalysis(analysisIds);
    }
  }, [analysisIds, selectedExam]);

  React.useEffect(() => {
    if (selectedExam && roomIds.length > 0) {
      setSelectedRooms(roomIds);
    }
  }, [roomIds, selectedExam]);

  React.useEffect(() => {
    if (selectedExam && serviceIds.length > 0) {
      setSelectedServices(serviceIds);
    }
  }, [serviceIds, selectedExam]);

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
      setSelectedAnalysis([]);
      setSelectedRooms([]);
      setSelectedServices([]);
      setServices([]);
    }
  }, [isInvoiceModalOpen]);

  const handleSaveBilling = async () => {
    // Validation
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    // Validate general services
    if (services.length === 0) {
      toast.error('Илтимос, камида битта умумий хизмат қўшинг');
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
      const billingData = {
        examination_id: selectedExaminationId,
        services: services.map((s) => ({
          name: s.name,
          count: s.quantity,
          price: s.unitPrice,
        })),
        payment: {
          payment_method: paymentMethod,
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
        setSelectedAnalysis([]);
        setSelectedRooms([]);
        setSelectedServices([]);
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
                          {selectedAnalysis.map((analysisId) => (
                            <AnalysisItem
                              key={analysisId}
                              analysisId={analysisId}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='md:hidden'>
                      {selectedAnalysis.map((analysisId) => (
                        <AnalysisItem
                          key={analysisId}
                          analysisId={analysisId}
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
                              <RoomItem
                                key={roomId}
                                roomId={roomId}
                                checkInDate={roomData?.start_date}
                                checkOutDate={roomData?.end_date}
                                days={roomData?.days}
                              />
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
                            key={roomId}
                            roomId={roomId}
                            checkInDate={roomData?.start_date}
                            checkOutDate={roomData?.end_date}
                            days={roomData?.days}
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
                          {selectedServices.map((serviceId) => {
                            const serviceData = selectedExam?.services?.find(
                              (s: any) =>
                                (typeof s.service_type_id === 'object'
                                  ? s.service_type_id._id
                                  : s.service_type_id) === serviceId
                            );
                            return (
                              <ServiceItem
                                key={serviceId}
                                serviceId={serviceId}
                                quantity={serviceData?.quantity || 1}
                                price={serviceData?.price}
                              />
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='md:hidden'>
                      {selectedServices.map((serviceId) => {
                        const serviceData = selectedExam?.services?.find(
                          (s: any) =>
                            (typeof s.service_type_id === 'object'
                              ? s.service_type_id._id
                              : s.service_type_id) === serviceId
                        );
                        return (
                          <ServiceItem
                            key={serviceId}
                            serviceId={serviceId}
                            quantity={serviceData?.quantity || 1}
                            price={serviceData?.price}
                            isMobile
                          />
                        );
                      })}
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
                      <th className='text-center py-3 px-4 font-medium text-sm'>
                        Сони
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm'>
                        Нархи
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm'>
                        Жами
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
                            className='w-20 mx-auto text-center text-sm'
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
                            className='text-right text-sm'
                          />
                        </td>
                        <td className='py-2 px-4 text-right font-semibold text-sm'>
                          {formatCurrency(service.total)}
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

                      <div className='pt-2 min-w-52 border-t flex justify-between items-center'>
                        <span className='text-xs text-muted-foreground'>
                          Жами:
                        </span>
                        <span className='font-semibold text-sm'>
                          {formatCurrency(service.total)}
                        </span>
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

          {/* Payment Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
            <div className='space-y-3 sm:space-y-4'>
              <div>
                <Label className='text-sm'>Чегирма (сўм)</Label>
                <Input
                  type='text'
                  inputMode='numeric'
                  value={formatNumberWithSpaces(discount)}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s/g, '')
                      .replace(/[^0-9]/g, '');
                    setDiscount(parseInt(value) || 0);
                  }}
                  placeholder='0'
                  className='text-sm'
                />
              </div>

              <Card className='p-3 sm:p-4 bg-primary/5'>
                <div className='flex justify-between items-center mb-2 text-sm'>
                  <span className='text-muted-foreground'>Оралиқ жами:</span>
                  <span className='font-semibold'>
                    {formatCurrency(calculateSubtotal())}
                  </span>
                </div>
                <div className='flex justify-between items-center mb-2 text-sm'>
                  <span className='text-muted-foreground'>Чегирма:</span>
                  <span className='text-danger'>
                    -{formatCurrency(discount)}
                  </span>
                </div>
                <div className='border-t pt-2 flex justify-between items-center'>
                  <span className='text-base sm:text-lg font-semibold'>
                    Жами тўлов:
                  </span>
                  <span className='text-lg sm:text-2xl font-bold text-primary'>
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>
              </Card>
            </div>

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
