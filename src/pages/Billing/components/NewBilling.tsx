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
import { Service } from '../Billing';

interface Props {
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addService: () => void;
  services: Array<Service>;
  updateService: (id: string, field: keyof Service, value: any) => void;
  formatCurrency: (amount: number) => string;
  removeService: (id: string) => void;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  paymentAmount: string;
  setPaymentAmount: React.Dispatch<React.SetStateAction<string>>;
  paymentMethod: string;
  setPaymentMethod: React.Dispatch<React.SetStateAction<string>>;
  selectedExaminationId: string;
  setSelectedExaminationId: React.Dispatch<React.SetStateAction<string>>;
  calculateSubtotal: () => number;
  calculateGrandTotal: () => number;
}

const NewBilling = ({
  isInvoiceModalOpen,
  setIsInvoiceModalOpen,
  addService,
  services,
  updateService,
  formatCurrency,
  removeService,
  discount,
  setDiscount,
  paymentAmount,
  setPaymentAmount,
  paymentMethod,
  setPaymentMethod,
  selectedExaminationId,
  setSelectedExaminationId,
  calculateSubtotal,
  calculateGrandTotal,
}: Props) => {
  const [page, setPage] = React.useState(1);
  const [allExams, setAllExams] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const [createBilling, { isLoading: isCreating }] = useCreateBillingMutation();
  const {
    data: examinationsData,
    isLoading: isLoadingExams,
    isFetching,
  } = useGetAllExamsQuery(
    {
      page,
      limit: 20,
      status : 'pending'
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
    }
  }, [isInvoiceModalOpen]);

  const handleSaveBilling = async () => {
    // Validation
    if (!selectedExaminationId) {
      toast.error('Илтимос, кўрикни танланг');
      return;
    }

    if (services.length === 0) {
      toast.error('Илтимос, камида битта хизмат қўшинг');
      return;
    }

    const invalidService = services.find(
      (s) => !s.name.trim() || s.quantity <= 0 || s.unitPrice <= 0
    );
    if (invalidService) {
      toast.error('Илтимос, барча хизматлар маълумотларини тўлдиринг');
      return;
    }

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Илтимос, тўлов миқдорини киритинг');
      return;
    }

    const grandTotal = calculateGrandTotal();
    if (parseFloat(paymentAmount) > grandTotal) {
      toast.error('Тўлов миқдори жами суммадан ошиб кетмаслиги керак');
      return;
    }

    try {
      const result = await createBilling({
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
      }).unwrap();

      if (result.success) {
        toast.success('Ҳисоб-фактура муваффақиятли яратилди');
        setIsInvoiceModalOpen(false);
        // Reset form
        setSelectedExaminationId('');
        setPaymentAmount('');
        setDiscount(0);
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

          {/* Services Table */}
          <div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3'>
              <Label className='text-base sm:text-lg font-semibold'>
                Хизматлар
              </Label>
              <Button
                variant='outline'
                size='sm'
                onClick={addService}
                className='w-full sm:w-auto text-xs sm:text-sm'
              >
                <Plus className='w-3 h-3 sm:w-4 sm:h-4 mr-2' />
                Хизмат қўшиш
              </Button>
            </div>

            {/* Desktop Table View */}
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
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            updateService(
                              service.id,
                              'quantity',
                              parseInt(value) || 1
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
                          className='text-danger hover:text-danger'
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {services.map((service) => (
                <Card key={service.id} className='p-3'>
                  <div className='space-y-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <Label className='text-xs text-muted-foreground'>
                        Хизмат номи
                      </Label>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeService(service.id)}
                        className='text-danger hover:text-danger h-6 w-6 p-0 -mt-1'
                      >
                        ×
                      </Button>
                    </div>
                    <Input
                      value={service.name}
                      onChange={(e) =>
                        updateService(service.id, 'name', e.target.value)
                      }
                      placeholder='Хизмат номи...'
                      className='text-sm'
                    />

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
                            const value = e.target.value.replace(/[^0-9]/g, '');
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

                    <div className='pt-2 border-t flex justify-between items-center'>
                      <span className='text-xs text-muted-foreground'>
                        Жами:
                      </span>
                      <span className='font-semibold text-sm'>
                        {formatCurrency(service.total)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

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
