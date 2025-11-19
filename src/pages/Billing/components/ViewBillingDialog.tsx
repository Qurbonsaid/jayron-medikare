import {
  useGetOneBillingQuery,
  useUpdatePaymentMutation,
  useUpdateServiceMutation,
} from '@/app/api/billingApi/billingApi';
import { getStatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { format } from 'date-fns';
import { CreditCard, Edit, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  billingId: string | null;
}

interface EditableService {
  _id?: string;
  id: string;
  name: string;
  count: number;
  price: number;
  total_price: number;
}

const ViewBillingDialog = ({ isOpen, onClose, billingId }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [services, setServices] = useState<EditableService[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const { data: billingData, isLoading } = useGetOneBillingQuery(
    billingId || '',
    {
      skip: !billingId,
    }
  );

  const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
  const [updatePayment, { isLoading: isPaymentUpdating }] =
    useUpdatePaymentMutation();

  useEffect(() => {
    if (billingData?.data?.services) {
      setServices(
        billingData.data.services.map((s) => ({
          _id: s._id,
          id: s._id,
          name: s.name,
          count: s.count,
          price: s.price,
          total_price: s.total_price,
        }))
      );
    }
  }, [billingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  const formatNumberWithSpaces = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleUpdateService = (
    id: string,
    field: 'name' | 'count' | 'price',
    value: any
  ) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === 'count' || field === 'price') {
            updated.total_price = updated.count * updated.price;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const handleAddService = () => {
    const newService: EditableService = {
      id: Date.now().toString(),
      name: '',
      count: 1,
      price: 0,
      total_price: 0,
    };
    setServices([...services, newService]);
  };

  const handleRemoveService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter((s) => s.id !== id));
    } else {
      toast.error('Камида битта хизмат бўлиши керак');
    }
  };

  const handleSaveServices = async () => {
    if (!billingId) return;

    try {
      const result = await updateService({
        id: billingId,
        body: {
          services: services.map((s) => ({
            name: s.name,
            count: s.count,
            price: s.price,
          })),
        },
      }).unwrap();

      if (result.success) {
        toast.success('Хизматлар муваффақиятли янгиланди');
        setIsEditMode(false);
      }
    } catch (error: any) {
      toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
    }
  };

  const handleAddPayment = async () => {
    if (!billingId) return;

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Илтимос, тўлов миқдорини киритинг');
      return;
    }

    const debtAmount = billingData?.data?.debt_amount || 0;
    if (parseFloat(paymentAmount) > debtAmount) {
      toast.error('Тўлов миқдори қарз суммасидан ошиб кетмаслиги керак');
      return;
    }

    try {
      const result = await updatePayment({
        id: billingId,
        body: {
          payment: {
            payment_method: paymentMethod,
            amount: parseFloat(paymentAmount),
          },
        },
      }).unwrap();

      if (result.success) {
        toast.success('Тўлов муваффақиятли қўшилди');
        setPaymentAmount('');
      }
    } catch (error: any) {
      toast.error(error?.data?.error?.msg || 'Хатолик юз берди');
    }
  };

  const calculateTotal = () => {
    return services.reduce((sum, s) => sum + s.total_price, 0);
  };

  if (!billingId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl flex items-center justify-between'>
            <span>Ҳисоб-фактура маълумотлари</span>
            {!isEditMode ? (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setIsEditMode(true)}
              >
                <Edit className='w-4 h-4 mr-2' />
                Таҳрирлаш
              </Button>
            ) : (
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setIsEditMode(false);
                    if (billingData?.data?.services) {
                      setServices(
                        billingData.data.services.map((s) => ({
                          _id: s._id,
                          id: s._id,
                          name: s.name,
                          count: s.count,
                          price: s.price,
                          total_price: s.total_price,
                        }))
                      );
                    }
                  }}
                >
                  Бекор қилиш
                </Button>
                <Button
                  size='sm'
                  onClick={handleSaveServices}
                  disabled={isUpdating}
                >
                  <Save className='w-4 h-4 mr-2' />
                  {isUpdating ? 'Сақланмоқда...' : 'Сақлаш'}
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center py-8'>
            <LoadingSpinner />
          </div>
        ) : billingData?.data ? (
          <div className='space-y-4 sm:space-y-6'>
            {/* Billing Info */}
            <Card className='p-3 sm:p-4 bg-muted/50'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Бемор</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {billingData.data.patient_id.fullname}
                  </div>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Ҳисоб №
                  </Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {billingData.data._id}
                  </div>
                </div>
                <div className='sm:px-4 sm:text-center'>
                  <Label className='text-xs text-muted-foreground'>Сана</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {format(billingData.data.created_at, 'dd.MM.yyyy')}
                  </div>
                </div>
                <div className='sm:px-4 sm:text-center'>
                  <Label className='text-xs text-muted-foreground'>Ҳолат</Label>
                  <div>{getStatusBadge(billingData.data.status)}</div>
                </div>
              </div>
            </Card>

            {/* Services */}
            <div>
              <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                Хизматлар
              </Label>

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
                      {isEditMode && (
                        <th className='text-center py-3 px-4 font-medium text-sm'>
                          Амал
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className='border-b'>
                        <td className='py-2 px-4'>
                          {isEditMode ? (
                            <Input
                              value={service.name}
                              onChange={(e) =>
                                handleUpdateService(
                                  service.id,
                                  'name',
                                  e.target.value
                                )
                              }
                              className='text-sm'
                            />
                          ) : (
                            <span className='text-sm'>{service.name}</span>
                          )}
                        </td>
                        <td className='py-2 px-4'>
                          {isEditMode ? (
                            <Input
                              type='text'
                              inputMode='numeric'
                              value={service.count}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ''
                                );
                                handleUpdateService(
                                  service.id,
                                  'count',
                                  parseInt(value) || 1
                                );
                              }}
                              className='w-20 mx-auto text-center text-sm'
                            />
                          ) : (
                            <div className='text-center text-sm'>
                              {service.count}
                            </div>
                          )}
                        </td>
                        <td className='py-2 px-4'>
                          {isEditMode ? (
                            <Input
                              type='text'
                              inputMode='numeric'
                              value={formatNumberWithSpaces(service.price)}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\s/g, '')
                                  .replace(/[^0-9]/g, '');
                                handleUpdateService(
                                  service.id,
                                  'price',
                                  parseInt(value) || 0
                                );
                              }}
                              className='text-right text-sm'
                            />
                          ) : (
                            <div className='text-right text-sm'>
                              {formatCurrency(service.price)}
                            </div>
                          )}
                        </td>
                        <td className='py-2 px-4 text-right font-semibold text-sm'>
                          {formatCurrency(service.total_price)}
                        </td>
                        {isEditMode && (
                          <td className='py-2 px-4'>
                            <div className='flex justify-center'>
                              <Button
                                size='sm'
                                variant='destructive'
                                onClick={() => handleRemoveService(service.id)}
                                className='h-8 w-8 p-0'
                              >
                                ×
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Service Button - Desktop */}
              {isEditMode && (
                <Button
                  variant='outline'
                  onClick={handleAddService}
                  className='mt-3 w-full hidden md:flex items-center justify-center'
                >
                  <span className='text-lg mr-2'>+</span>
                  Хизмат қўшиш
                </Button>
              )}

              {/* Mobile Cards */}
              <div className='md:hidden space-y-3'>
                {services.map((service) => (
                  <Card key={service.id} className='p-3'>
                    <div className='space-y-3'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          Хизмат номи
                        </Label>
                        {isEditMode ? (
                          <Input
                            value={service.name}
                            onChange={(e) =>
                              handleUpdateService(
                                service.id,
                                'name',
                                e.target.value
                              )
                            }
                            className='text-sm'
                          />
                        ) : (
                          <div className='text-sm font-medium'>
                            {service.name}
                          </div>
                        )}
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Сони
                          </Label>
                          {isEditMode ? (
                            <Input
                              type='text'
                              inputMode='numeric'
                              value={service.count}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ''
                                );
                                handleUpdateService(
                                  service.id,
                                  'count',
                                  parseInt(value) || 1
                                );
                              }}
                              className='text-sm'
                            />
                          ) : (
                            <div className='text-sm'>{service.count}</div>
                          )}
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Нархи
                          </Label>
                          {isEditMode ? (
                            <Input
                              type='text'
                              inputMode='numeric'
                              value={formatNumberWithSpaces(service.price)}
                              onChange={(e) => {
                                const value = e.target.value
                                  .replace(/\s/g, '')
                                  .replace(/[^0-9]/g, '');
                                handleUpdateService(
                                  service.id,
                                  'price',
                                  parseInt(value) || 0
                                );
                              }}
                              className='text-sm'
                            />
                          ) : (
                            <div className='text-sm'>
                              {formatCurrency(service.price)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='pt-2 border-t flex justify-between items-center'>
                        <span className='text-xs text-muted-foreground'>
                          Жами:
                        </span>
                        <span className='font-semibold text-sm'>
                          {formatCurrency(service.total_price)}
                        </span>
                      </div>

                      {isEditMode && (
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleRemoveService(service.id)}
                          className='w-full mt-2'
                        >
                          Ўчириш
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Add Service Button - Mobile */}
              {isEditMode && (
                <Button
                  variant='outline'
                  onClick={handleAddService}
                  className='mt-3 w-full md:hidden flex items-center justify-center'
                >
                  <span className='text-lg mr-2'>+</span>
                  Хизмат қўшиш
                </Button>
              )}
            </div>

            {/* Analyses Section */}
            {billingData.data.examination_id?.analyses &&
              billingData.data.examination_id.analyses.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    Таҳлиллар
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            Таҳлил тури
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Даража
                          </th>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            Клиник кўрсатмалар
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Ҳолат
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Сана
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.analyses.map(
                          (analysis) => (
                            <tr key={analysis._id} className='border-b'>
                              <td className='py-2 px-4 text-sm'>
                                {analysis.analysis_type}
                              </td>
                              <td className='py-2 px-4 text-center'>
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                                  {analysis.level}
                                </span>
                              </td>
                              <td className='py-2 px-4 text-sm'>
                                {analysis.clinical_indications || '-'}
                              </td>
                              <td className='py-2 px-4 text-center'>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    analysis.status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : analysis.status === 'COMPLETED'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {analysis.status}
                                </span>
                              </td>
                              <td className='py-2 px-4 text-center text-sm text-muted-foreground'>
                                {format(
                                  new Date(analysis.created_at),
                                  'dd.MM.yyyy'
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {billingData.data.examination_id.analyses.map(
                      (analysis) => (
                        <Card key={analysis._id} className='p-3'>
                          <div className='space-y-2'>
                            <div className='flex items-start justify-between gap-2'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Таҳлил тури
                                </Label>
                                <div className='font-medium text-sm mt-1'>
                                  {analysis.analysis_type}
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  analysis.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : analysis.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {analysis.status}
                              </span>
                            </div>

                            <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Даража
                                </Label>
                                <div className='text-sm mt-1'>
                                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                                    {analysis.level}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Сана
                                </Label>
                                <div className='text-sm mt-1'>
                                  {format(
                                    new Date(analysis.created_at),
                                    'dd.MM.yyyy'
                                  )}
                                </div>
                              </div>
                            </div>

                            {analysis.clinical_indications && (
                              <div className='pt-2 border-t'>
                                <Label className='text-xs text-muted-foreground'>
                                  Клиник кўрсатмалар
                                </Label>
                                <div className='text-sm mt-1'>
                                  {analysis.clinical_indications}
                                </div>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Rooms Section */}
            {billingData.data.examination_id?.rooms &&
              billingData.data.examination_id.rooms.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    Палаталар
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            Палата
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Қават
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Бошланиш
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            Тугаш
                          </th>
                          <th className='text-right py-3 px-4 font-medium text-sm'>
                            Нархи
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.rooms.map(
                          (room, index) => (
                            <tr key={room._id || index} className='border-b'>
                              <td className='py-2 px-4'>
                                <div className='font-medium text-sm'>
                                  {room.room_name}
                                </div>
                                <div className='text-xs text-muted-foreground'>
                                  ID: {room.room_id}
                                </div>
                              </td>
                              <td className='py-2 px-4 text-center text-sm'>
                                {room.floor_number || '-'}
                              </td>
                              <td className='py-2 px-4 text-center text-sm'>
                                {format(
                                  new Date(room.start_date),
                                  'dd.MM.yyyy'
                                )}
                              </td>
                              <td className='py-2 px-4 text-center text-sm'>
                                {room.end_date ? (
                                  format(new Date(room.end_date), 'dd.MM.yyyy')
                                ) : (
                                  <span className='text-yellow-600'>
                                    Давом этмоқда
                                  </span>
                                )}
                              </td>
                              <td className='py-2 px-4 text-right font-semibold text-sm'>
                                {formatCurrency(room.room_price)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {billingData.data.examination_id.rooms.map(
                      (room, index) => (
                        <Card key={room._id || index} className='p-3'>
                          <div className='space-y-2'>
                            <div className='flex items-start justify-between'>
                              <div>
                                <div className='font-medium text-sm'>
                                  {room.room_name}
                                </div>
                                <div className='text-xs text-muted-foreground mt-0.5'>
                                  ID: {room.room_id}
                                </div>
                              </div>
                              {room.floor_number && (
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                                  {room.floor_number}-қават
                                </span>
                              )}
                            </div>

                            <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Бошланиш
                                </Label>
                                <div className='text-sm mt-1'>
                                  {format(
                                    new Date(room.start_date),
                                    'dd.MM.yyyy'
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  Тугаш
                                </Label>
                                <div className='text-sm mt-1'>
                                  {room.end_date ? (
                                    format(
                                      new Date(room.end_date),
                                      'dd.MM.yyyy'
                                    )
                                  ) : (
                                    <span className='text-yellow-600'>
                                      Давом этмоқда
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className='pt-2 border-t flex justify-between items-center'>
                              <span className='text-xs text-muted-foreground'>
                                Нархи:
                              </span>
                              <span className='font-semibold text-sm'>
                                {formatCurrency(room.room_price)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Payment Info */}
            <Card className='p-3 sm:p-4 bg-primary/5'>
              <Label className='text-base font-semibold mb-3 block'>
                Тўлов маълумотлари
              </Label>
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>
                    {isEditMode ? 'Хизматлар жами (янги):' : 'Жами сумма:'}
                  </span>
                  <span className='font-semibold'>
                    {formatCurrency(
                      isEditMode
                        ? calculateTotal()
                        : billingData.data.total_amount
                    )}
                  </span>
                </div>
                {isEditMode && (
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-muted-foreground'>Аввалги жами:</span>
                    <span className='font-semibold'>
                      {formatCurrency(billingData.data.total_amount)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Тўланган:</span>
                  <span className='font-semibold text-success'>
                    {formatCurrency(billingData.data.paid_amount)}
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm border-t pt-2'>
                  <span className='font-semibold'>Қолган қарз:</span>
                  <span className='text-lg font-bold text-danger'>
                    {formatCurrency(billingData.data.debt_amount)}
                  </span>
                </div>
              </div>

              {/* Payment History */}
              {billingData.data.payments &&
                billingData.data.payments.length > 0 && (
                  <div className='mt-4 pt-4 border-t'>
                    <Label className='text-sm font-semibold mb-2 block'>
                      Тўловлар тарихи
                    </Label>
                    <div className='space-y-2'>
                      {billingData.data.payments.map((payment) => (
                        <div
                          key={payment._id}
                          className='flex justify-between items-center text-xs sm:text-sm p-2 bg-background rounded'
                        >
                          <div className='flex items-center gap-2'>
                            <span>
                              {payment.payment_method === 'cash'
                                ? '💵 Нақд'
                                : payment.payment_method === 'card'
                                ? '💳 Карта'
                                : payment.payment_method === 'click'
                                ? '📱 Click'
                                : '📱 Payme'}
                            </span>
                            <span className='text-muted-foreground'>
                              {format(payment.payment_date, 'dd.MM.yyyy HH:mm')}
                            </span>
                          </div>
                          <span className='font-semibold'>
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                      ))}
                      <div className='flex justify-between items-center text-sm font-semibold pt-2 border-t'>
                        <span>Жами тўланған:</span>
                        <span className='text-success'>
                          {formatCurrency(billingData.data.paid_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
            </Card>

            {/* Add Payment Section - Only show if there's debt */}
            {billingData.data.debt_amount > 0 && !isEditMode && (
              <Card className='p-3 sm:p-4'>
                <Label className='text-base font-semibold mb-3 block'>
                  Тўлов қўшиш
                </Label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div>
                    <Label className='text-sm mb-1.5 block'>
                      Тўлов миқдори
                    </Label>
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
                    <Label className='text-sm mb-1.5 block'>Тўлов усули</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                    >
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

                  <div className='flex items-end'>
                    <Button
                      className='w-full text-sm'
                      onClick={handleAddPayment}
                      disabled={isPaymentUpdating}
                    >
                      <CreditCard className='w-4 h-4 mr-2' />
                      {isPaymentUpdating ? 'Қўшилмоқда...' : 'Тўлов қўшиш'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ViewBillingDialog;
