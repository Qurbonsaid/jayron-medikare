import {
  useGetOneBillingQuery,
  useUpdatePaymentMutation,
  useUpdateServiceBillingMutation,
} from '@/app/api/billingApi/billingApi';
import type { service_type as ServiceType } from '@/app/api/billingApi/types';
import { getStatusBadge } from '@/components/common/StatusBadge';
import { useTranslation } from 'react-i18next';
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
import { ServiceItem } from './ServiceItem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  billingId: string | null;
}

interface EditableService {
  _id?: string;
  id: string;
  name: string;
  service_type: ServiceType;
  count: number;
  price: number;
  total_price: number;
}

const ViewBillingDialog = ({ isOpen, onClose, billingId }: Props) => {
  const { t } = useTranslation('billing');
  const [isEditMode, setIsEditMode] = useState(false);
  const [services, setServices] = useState<EditableService[]>([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentType, setPaymentType] = useState<ServiceType>('XIZMAT');

  const { data: billingData, isLoading } = useGetOneBillingQuery(
    billingId || '',
    {
      skip: !billingId,
    }
  );

  const [updateService, { isLoading: isUpdating }] =
    useUpdateServiceBillingMutation();
  const [updatePayment, { isLoading: isPaymentUpdating }] =
    useUpdatePaymentMutation();

  useEffect(() => {
    if (billingData?.data?.services) {
      setServices(
        billingData.data.services.map((s: any) => ({
          _id: s._id,
          id: s._id,
          name: s.name,
          service_type: (s.service_type ?? 'XIZMAT') as ServiceType,
          count: s.count,
          price: s.price,
          total_price: s.total_price,
        }))
      );
    }
  }, [billingData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' ' + t('currency');
  };

  const formatNumberWithSpaces = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const getPaymentMethodDisplay = (
    method: string,
    purpose: 'type' | 'purpose'
  ) => {
    if (purpose === 'purpose') {
      switch (method) {
        case 'KORIK':
          return '💵 ' + t('serviceTypes.examination');
        case 'XIZMAT':
          return '🏥 ' + t('service');
        case 'XONA':
          return '🛏️ ' + t('serviceTypes.room');
        case 'TASVIR':
          return '🖼️ ' + t('serviceTypes.image');
        case 'TAHLIL':
          return '🧪 ' + t('serviceTypes.analysis');
        default:
          return method;
      }
    } else {
      const lowerMethod = method?.toLowerCase() || '';
      switch (lowerMethod) {
        case 'cash':
          return '💵 ' + t('cash');
        case 'card':
          return '💳 ' + t('card');
        case 'click':
          return '📱 Click';
        case 'online':
          return '📱 Online';
        default:
          return '📱 ' + method;
      }
    }
  };

  const handleUpdateService = (
    id: string,
    field: 'name' | 'service_type' | 'count' | 'price',
    value: string | number
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
      service_type: 'XIZMAT',
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
      toast.error(t('validation.atLeastOneService'));
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
            service_type: s.service_type,
          })),
        },
      }).unwrap();

      if (result.success) {
        toast.success(t('servicesUpdatedSuccess'));
        setIsEditMode(false);
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { error?: { msg?: string } } };
      toast.error(apiError?.data?.error?.msg || t('errorOccurred'));
    }
  };

  const handleAddPayment = async () => {
    if (!billingId) return;

    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error(t('validation.enterPaymentAmount'));
      return;
    }

    const debtAmount = billingData?.data?.debt_amount || 0;
    if (parseFloat(paymentAmount) > debtAmount) {
      toast.error(t('validation.paymentExceedsDebt'));
      return;
    }

    try {
      const result = await updatePayment({
        id: billingId,
        body: {
          payment: {
            payment_method: paymentMethod,
            payment_type: paymentType,
            amount: parseFloat(paymentAmount),
          },
        },
      }).unwrap();

      if (result.success) {
        toast.success(t('paymentAddedSuccess'));
        setPaymentAmount('');
      }
    } catch (error: unknown) {
      const apiError = error as { data?: { error?: { msg?: string } } };
      toast.error(apiError?.data?.error?.msg || t('errorOccurred'));
    }
  };

  const calculateTotal = () => {
    return services.reduce((sum, s) => sum + s.total_price, 0);
  };

  if (!billingId) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false);
          if (billingData?.data?.services) {
            setServices(
              billingData.data.services.map((s: any) => ({
                _id: s._id,
                id: s._id,
                name: s.name,
                service_type: (s.service_type ?? 'XIZMAT') as ServiceType,
                count: s.count,
                price: s.price,
                total_price: s.total_price,
              }))
            );
          }
          onClose();
        }
      }}
    >
      <DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl flex items-center justify-between'>
            <span>{t('invoiceDetails')}</span>
            {!isEditMode ? (
              <Button
                size='sm'
                variant='outline'
                onClick={() => setIsEditMode(true)}
              >
                <Edit className='w-4 h-4 mr-2' />
                {t('edit')}
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
                        billingData.data.services.map((s: any) => ({
                          _id: s._id,
                          id: s._id,
                          name: s.name,
                          service_type: (s.service_type ??
                            'XIZMAT') as ServiceType,
                          count: s.count,
                          price: s.price,
                          total_price: s.total_price,
                        }))
                      );
                    }
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button
                  size='sm'
                  onClick={handleSaveServices}
                  disabled={isUpdating}
                >
                  <Save className='w-4 h-4 mr-2' />
                  {isUpdating ? t('saving') : t('save')}
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
                  <Label className='text-xs text-muted-foreground'>{t('patient')}</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {billingData.data.patient_id.fullname}
                  </div>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    {t('invoiceNo')}
                  </Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {billingData.data._id}
                  </div>
                </div>
                <div className='sm:px-4 sm:text-center'>
                  <Label className='text-xs text-muted-foreground'>{t('date')}</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    {format(billingData.data.created_at, 'dd.MM.yyyy')}
                  </div>
                </div>
                <div className='sm:px-4 sm:text-center'>
                  <Label className='text-xs text-muted-foreground'>{t('status')}</Label>
                  <div>{getStatusBadge(billingData.data.status)}</div>
                </div>
              </div>
            </Card>

            {/* Analyses Section */}
            {billingData.data.examination_id?.analyses &&
              billingData.data.examination_id.analyses.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    {t('analyses')}
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('analysisType')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('level')}
                          </th>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('clinicalIndications')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('status')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('date')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.analyses.map(
                          (analysis) => (
                            <tr key={analysis._id} className='border-b'>
                              <td className='py-2 px-4 text-sm'>
                                {typeof analysis.analysis_type === 'object'
                                  ? analysis.analysis_type.name
                                  : analysis.analysis_type}
                              </td>
                              <td className='py-2 px-4 text-center'>
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                                  {analysis.level === 'ODDIY' ? t('levels.normal') : 
                                   analysis.level === 'SHOSHILINCH' ? t('levels.urgent') : 
                                   analysis.level === 'JUDA_SHOSHILINCH' ? t('levels.veryUrgent') : 
                                   analysis.level || '-'}
                                </span>
                              </td>
                              <td className='py-2 px-4 text-sm'>
                                {analysis.analysis_type?.description || '-'}
                              </td>
                              <td className='py-2 px-4 text-center'>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    analysis.status === 'PENDING' ||
                                    analysis.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : analysis.status === 'COMPLETED' ||
                                          analysis.status === 'completed'
                                        ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {analysis.status === 'pending' || analysis.status === 'PENDING'
                                    ? t('pending')
                                    : analysis.status === 'completed' || analysis.status === 'COMPLETED'
                                    ? t('completed')
                                    : analysis.status}
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
                                  {t('analysisType')}
                                </Label>
                                <div className='text-sm font-medium'>
                                  {typeof analysis.analysis_type === 'object'
                                    ? analysis.analysis_type.name
                                    : analysis.analysis_type}
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  analysis.status === 'PENDING' ||
                                  analysis.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : analysis.status === 'COMPLETED' ||
                                      analysis.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {analysis.status === 'pending' || analysis.status === 'PENDING'
                                  ? t('pending')
                                  : analysis.status === 'completed' || analysis.status === 'COMPLETED'
                                  ? t('completed')
                                  : analysis.status}
                              </span>
                            </div>

                            <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('level')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700'>
                                    {analysis.level === 'ODDIY' ? t('levels.normal') : 
                                     analysis.level === 'SHOSHILINCH' ? t('levels.urgent') : 
                                     analysis.level === 'JUDA_SHOSHILINCH' ? t('levels.veryUrgent') : 
                                     analysis.level || '-'}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('date')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  {format(
                                    new Date(analysis.created_at),
                                    'dd.MM.yyyy'
                                  )}
                                </div>
                              </div>
                            </div>

                            {analysis.analysis_type?.description && (
                              <div className='pt-2 border-t'>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('clinicalIndications')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  {analysis.analysis_type?.description}
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

            {/* Services from Examination Section */}
            {(billingData.data.examination_id as any)?.services &&
              (billingData.data.examination_id as any).services.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    {t('examinationServices')}
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('serviceName')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('code')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('quantity')}
                          </th>
                          <th className='text-right py-3 px-4 font-medium text-sm'>
                            {t('price')}
                          </th>
                          <th className='text-right py-3 px-4 font-medium text-sm'>
                            {t('subtotal')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(billingData.data.examination_id as any).services.map(
                          (service: any) => (
                            <ServiceItem key={service._id} service={service} />
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {(billingData.data.examination_id as any).services.map(
                      (service: any) => (
                        <Card key={service._id} className='p-0 overflow-hidden'>
                          <ServiceItem service={service} isMobile />
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Images Section */}
            {billingData.data.examination_id?.images &&
              billingData.data.examination_id.images.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    {t('images')}
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('imagingType')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('time')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.images.map((image) => (
                          <tr key={image._id} className='border-b'>
                            <td className='py-2 px-4'>
                              <div className='font-medium text-sm'>
                                {image.imaging_type_id?.name || t('unknown')}
                              </div>
                              {/* {image._id && (
                                <div className='text-xs text-muted-foreground'>
                                  ID: {image._id}
                                </div>
                              )} */}
                            </td>
                            <td className='py-2 px-4 text-center text-sm text-muted-foreground'>
                              {format(
                                new Date(image.created_at),
                                'dd.MM.yyyy HH:mm'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {billingData.data.examination_id.images.map((image) => (
                      <Card key={image._id} className='p-3'>
                        <div className='space-y-2'>
                          <div>
                            <Label className='text-xs text-muted-foreground'>
                              {t('imagingType')}
                            </Label>
                            <div className='text-sm font-medium mt-1'>
                              {image.imaging_type_id?.name || t('unknown')}
                            </div>
                            {/* {image._id && (
                              <div className='text-xs text-muted-foreground mt-0.5'>
                                ID: {image._id}
                              </div>
                            )} */}
                          </div>

                          <div className='pt-2 border-t'>
                            <Label className='text-xs text-muted-foreground'>
                              {t('time')}
                            </Label>
                            <div className='text-sm mt-1'>
                              {format(
                                new Date(image.created_at),
                                'dd.MM.yyyy HH:mm'
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

            {/* Rooms Section */}
            {billingData.data.examination_id?.rooms &&
              billingData.data.examination_id.rooms.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    {t('rooms')}
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('room')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('floor')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('startDate')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('endDate')}
                          </th>
                          <th className='text-right py-3 px-4 font-medium text-sm'>
                            {t('price')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.rooms.map(
                          (room, index) => (
                            <tr key={room._id || index} className='border-b'>
                              <td className='py-2 px-4'>
                                <div className='font-medium text-sm'>
                                  {room.room_name || t('unknown')}
                                </div>
                                {/* {room.room_id && (
                                  <div className='text-xs text-muted-foreground'>
                                    ID: {room.room_id}
                                  </div>
                                )} */}
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
                                {room.end_date
                                  ? format(
                                      new Date(room.end_date),
                                      'dd.MM.yyyy'
                                    )
                                  : (room as any).estimated_leave_time && (
                                      <span className='text-yellow-600'>
                                        {t('ongoing')} (
                                        {format(
                                          new Date(
                                            (room as any).estimated_leave_time
                                          ),
                                          'dd.MM.yyyy'
                                        )}
                                        )
                                      </span>
                                    )}
                              </td>
                              <td className='py-2 px-4 text-right font-semibold text-sm'>
                                {formatCurrency(room.room_price || 0)}
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
                                  {room.room_name || t('unknown')}
                                </div>
                              </div>
                              {room.floor_number && (
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                                  {room.floor_number}-{t('floorSuffix')}
                                </span>
                              )}
                            </div>

                            <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('startDate')}
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
                                  {t('endDate')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  {room.end_date ? (
                                    format(
                                      new Date(room.end_date),
                                      'dd.MM.yyyy'
                                    )
                                  ) : (room as any).estimated_leave_time ? (
                                    format(
                                      new Date(
                                        (room as any).estimated_leave_time
                                      ),
                                      'dd.MM.yyyy'
                                    )
                                  ) : (
                                    <span className='text-yellow-600'>
                                      {t('ongoing')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className='pt-2 border-t flex justify-between items-center'>
                              <span className='text-xs text-muted-foreground'>
                                {t('price')}:
                              </span>
                              <span className='font-semibold text-sm'>
                                {formatCurrency(room.room_price || 0)}
                              </span>
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Patient Service Items Section */}
            {billingData.data.examination_id?.service?.items &&
              billingData.data.examination_id.service.items.length > 0 && (
                <div>
                  <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                    {t('services')}
                  </Label>

                  {/* Desktop Table */}
                  <div className='hidden md:block border rounded-lg overflow-hidden'>
                    <table className='w-full'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('serviceName')}
                          </th>
                          <th className='text-left py-3 px-4 font-medium text-sm'>
                            {t('notes')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('daysCount')}
                          </th>
                          <th className='text-center py-3 px-4 font-medium text-sm'>
                            {t('completedDays')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.data.examination_id.service.items.map(
                          (item: any) => (
                            <tr key={item._id} className='border-b'>
                              <td className='py-2 px-4 text-sm'>
                                {item.service_type_id?.name || t('unknown')}
                              </td>
                              <td className='py-2 px-4 text-sm text-muted-foreground'>
                                {item?.service_type_id?.description || '-'}
                              </td>
                              <td className='py-2 px-4 text-center text-sm'>
                                {item.days?.filter(
                                  (i: any) =>
                                    i.date !== null && i.date !== undefined
                                ).length || 0}
                              </td>
                              <td className='py-2 px-4 text-center text-sm'>
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                                  {item.days?.filter(
                                    (day: any) => day.is_completed
                                  ).length || 0}
                                </span>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className='md:hidden space-y-3'>
                    {billingData.data.examination_id.service.items.map(
                      (item: any) => (
                        <Card key={item._id} className='p-3'>
                          <div className='space-y-2'>
                            <div>
                              <Label className='text-xs text-muted-foreground'>
                                {t('serviceName')}
                              </Label>
                              <div className='text-sm font-medium mt-1'>
                                {item.service_type_id?.name || t('unknown')}
                              </div>
                            </div>

                            {item.notes && (
                              <div className='pt-2 border-t'>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('notes')}
                                </Label>
                                <div className='text-sm mt-1'>{item.notes}</div>
                              </div>
                            )}

                            <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('daysCount')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  {item.days?.length || 0}
                                </div>
                              </div>
                              <div>
                                <Label className='text-xs text-muted-foreground'>
                                  {t('completedDays')}
                                </Label>
                                <div className='text-sm mt-1'>
                                  <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700'>
                                    {item.days?.filter(
                                      (day: any) => day.is_completed
                                    ).length || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Services */}
            <div>
              <Label className='text-base sm:text-lg font-semibold mb-3 block'>
                {t('servicePrices')}
              </Label>

              {/* Desktop Table */}
              <div className='hidden md:block border rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-muted'>
                    <tr>
                      <th className='text-left py-3 px-4 font-medium text-sm'>
                        {t('serviceName')}
                      </th>
                      <th className='text-center py-3 px-4 font-medium text-sm w-[170px]'>
                        {t('type')}
                      </th>
                      <th className='text-center py-3 px-4 font-medium text-sm w-24'>
                        {t('quantity')}
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm w-48'>
                        {t('price')}
                      </th>
                      {isEditMode && (
                        <th className='text-center py-3 px-4 font-medium text-sm'>
                          {t('action')}
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
                            <Select
                              value={service.service_type}
                              onValueChange={(value) =>
                                handleUpdateService(
                                  service.id,
                                  'service_type',
                                  value
                                )
                              }
                            >
                              <SelectTrigger className='h-9 text-sm w-[170px]'>
                                <SelectValue placeholder={t('selectType')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='KORIK'>
                                  {getPaymentMethodDisplay('KORIK', 'purpose')}
                                </SelectItem>
                                <SelectItem value='XIZMAT'>
                                  {getPaymentMethodDisplay('XIZMAT', 'purpose')}
                                </SelectItem>
                                <SelectItem value='XONA'>
                                  {getPaymentMethodDisplay('XONA', 'purpose')}
                                </SelectItem>
                                <SelectItem value='TASVIR'>
                                  {getPaymentMethodDisplay('TASVIR', 'purpose')}
                                </SelectItem>
                                <SelectItem value='TAHLIL'>
                                  {getPaymentMethodDisplay('TAHLIL', 'purpose')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className='text-center text-sm'>
                              {getPaymentMethodDisplay(
                                service.service_type,
                                'purpose'
                              )}
                            </div>
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
                              className='w-16 mx-auto text-center text-sm'
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
                              className='text-right text-sm w-36 ml-auto'
                            />
                          ) : (
                            <div className='text-right text-sm'>
                              {formatCurrency(service.price)}
                            </div>
                          )}
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
                  {t('addService')}
                </Button>
              )}

              {/* Mobile Cards */}
              <div className='md:hidden space-y-3'>
                {services.map((service) => (
                  <Card key={service.id} className='p-3'>
                    <div className='space-y-3'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          {t('serviceName')}
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

                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          {t('serviceType')}
                        </Label>
                        {isEditMode ? (
                          <Select
                            value={service.service_type}
                            onValueChange={(value) =>
                              handleUpdateService(
                                service.id,
                                'service_type',
                                value
                              )
                            }
                          >
                            <SelectTrigger className='text-sm'>
                              <SelectValue placeholder={t('selectType')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='KORIK'>
                                {getPaymentMethodDisplay('KORIK', 'purpose')}
                              </SelectItem>
                              <SelectItem value='XIZMAT'>
                                {getPaymentMethodDisplay('XIZMAT', 'purpose')}
                              </SelectItem>
                              <SelectItem value='XONA'>
                                {getPaymentMethodDisplay('XONA', 'purpose')}
                              </SelectItem>
                              <SelectItem value='TASVIR'>
                                {getPaymentMethodDisplay('TASVIR', 'purpose')}
                              </SelectItem>
                              <SelectItem value='TAHLIL'>
                                {getPaymentMethodDisplay('TAHLIL', 'purpose')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className='text-sm'>
                            {getPaymentMethodDisplay(
                              service.service_type,
                              'purpose'
                            )}
                          </div>
                        )}
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            {t('quantity')}
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
                            {t('price')}
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

                      {isEditMode && (
                        <Button
                          size='sm'
                          variant='destructive'
                          onClick={() => handleRemoveService(service.id)}
                          className='w-full mt-2'
                        >
                          {t('delete')}
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
                  {t('addService')}
                </Button>
              )}
            </div>

            {/* Payment Info */}
            <Card className='p-3 sm:p-4 bg-primary/5'>
              <Label className='text-base font-semibold mb-3 block'>
                {t('paymentInfo')}
              </Label>
              <div className='space-y-2'>
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>
                    {isEditMode ? t('newServicesTotal') : t('totalAmount')}
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
                    <span className='text-muted-foreground'>{t('previousTotal')}</span>
                    <span className='font-semibold'>
                      {formatCurrency(billingData.data.total_amount)}
                    </span>
                  </div>
                )}n                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>{t('paidAmount')}</span>
                  <span className='font-semibold text-success'>
                    {formatCurrency(billingData.data.paid_amount)}
                  </span>
                </div>
                <div className='flex justify-between items-center text-sm border-t pt-2'>
                  <span className='font-semibold'>{t('remainingDebt')}</span>
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
                      {t('paymentHistory')}
                    </Label>
                    <div className='space-y-2'>
                      {billingData.data.payments.map((payment) => (
                        <div
                          key={payment._id}
                          className='flex justify-between items-center text-xs sm:text-sm p-2 bg-background rounded'
                        >
                          <div className='flex items-center gap-4'>
                            <span>
                              {getPaymentMethodDisplay(
                                payment.payment_method,
                                'type'
                              )}
                            </span>
                            <span className='text-muted-foreground'>
                              {format(payment.payment_date, 'dd.MM.yyyy HH:mm')}
                            </span>
                            <span>
                              {getPaymentMethodDisplay(
                                payment.payment_type,
                                'purpose'
                              )}
                            </span>
                          </div>
                          <span className='font-semibold'>
                            {formatCurrency(payment.amount || 0)}
                          </span>
                        </div>
                      ))}
                      <div className='flex justify-between items-center text-sm font-semibold pt-2 border-t'>
                        <span>{t('totalPaid')}</span>
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
                  {t('addPayment')}
                </Label>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                  <div>
                    <Label className='text-sm mb-1.5 block'>
                      {t('paymentAmount')}
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
                    <Label className='text-sm mb-1.5 block'>{t('paymentMethod')}</Label>
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
                            {t('cash')}
                          </div>
                        </SelectItem>
                        <SelectItem value={PAYMENT.CARD}>{t('card')}</SelectItem>
                        <SelectItem value={PAYMENT.ONLINE}>Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className='text-sm mb-1.5 block'>{t('paymentType')}</Label>
                    <Select
                      value={paymentType}
                      onValueChange={(value: ServiceType) =>
                        setPaymentType(value)
                      }
                    >
                      <SelectTrigger className='text-sm'>
                        <SelectValue placeholder={t('selectPaymentType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='KORIK'>{t('serviceTypes.examination')}</SelectItem>
                        <SelectItem value='XIZMAT'>{t('service')}</SelectItem>
                        <SelectItem value='XONA'>{t('serviceTypes.room')}</SelectItem>
                        <SelectItem value='TASVIR'>{t('serviceTypes.image')}</SelectItem>
                        <SelectItem value='TAHLIL'>{t('serviceTypes.analysis')}</SelectItem>
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
                      {isPaymentUpdating ? t('adding') : t('addPayment')}
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
