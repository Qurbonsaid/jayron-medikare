import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetAllServiceQuery,
  useUpdateServiceMutation,
} from '@/app/api/serviceApi/serviceApi';
import ServiceFormDialog from '@/components/Service/ServiceFormDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { usePermission } from '@/hooks/usePermission';
import { Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface FormState {
  code: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  requirements: string[];
}

const initialFormState: FormState = {
  code: '',
  name: '',
  description: '',
  price: 0,
  duration_minutes: 0,
  is_active: true,
  requirements: [],
};

export default function Service() {
  const { t } = useTranslation(['common', 'service']);
  const handleRequest = useHandleRequest();
  const { canCreate, canUpdate, canDelete } = usePermission('service');

  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useGetAllServiceQuery({
    page,
    limit,
    search: searchQuery || undefined,
    code: undefined,
    is_active: undefined,
    min_price: undefined,
    max_price: undefined,
  });

  const [createService, { isLoading: creating }] = useCreateServiceMutation();
  const [updateService, { isLoading: updating }] = useUpdateServiceMutation();
  const [deleteService, { isLoading: deleting }] = useDeleteServiceMutation();

  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<ServiceData | null>(
    null
  );
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto refetch when data changes
  useEffect(() => {
    refetch();
  }, [page, limit]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.code.trim()) newErrors.code = t('service:validation.codeRequired');
    if (!form.name.trim()) newErrors.name = t('service:validation.nameRequired');
    if (!form.description.trim()) newErrors.description = t('service:validation.descriptionRequired');
    if (form.price <= 0) newErrors.price = t('service:validation.priceRequired');
    if (form.duration_minutes <= 0)
      newErrors.duration_minutes = t('service:validation.durationRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: createServiceReq = {
      code: form.code,
      name: form.name,
      description: form.description,
      price: form.price,
      duration_minutes: form.duration_minutes,
      is_active: form.is_active,
      requirements: form.requirements,
    };

    if (editingService) {
      await handleRequest({
        request: () => updateService({ id: editingService._id, body: payload }),
        onSuccess: () => {
          toast.success(t('updateSuccess'));
          handleClose();
          refetch();
        },
      });
    } else {
      await handleRequest({
        request: () => createService(payload),
        onSuccess: () => {
          toast.success(t('createSuccess'));
          handleClose();
          refetch();
        },
      });
    }
  };

  const handleEdit = (service: ServiceData) => {
    setEditingService(service);
    setForm({
      code: service.code,
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
      requirements: service.requirements,
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await handleRequest({
      request: () => deleteService(id),
      onSuccess: () => {
        toast.success(t('deleteSuccess'));
        setDeleteId(null);
        refetch();
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    setEditingService(null);
    setForm(initialFormState);
    setErrors({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' ' + t('service:currency');
  };

  if (isLoading) return <p className='p-4'>{t('service:loading')}</p>;
  if (isError || !data)
    return <p className='p-4 text-red-500'>{t('service:error')}</p>;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='bg-card border-b'>
        <div className='w-full px-4 sm:px-6 py-5 flex items-center justify-between gap-3'>
          <div className='flex-1 max-w-md'>
            <Input
              placeholder={t('service:searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
          </div>

          {canCreate && (
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => setOpen(true)}
            >
              + {t('service:addService')}
            </Button>
          )}
        </div>
      </header>

      {/* Mobile Card View */}
      <div className='p-4 sm:p-6 block lg:hidden space-y-4'>
        {data?.data.map((service, index) => (
          <Card
            key={service._id}
            className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
          >
            <div className='p-3 space-y-2'>
              {/* Header */}
              <div className='flex items-start justify-between'>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-semibold text-base text-gray-900 truncate'>
                    {service.code}
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    {t('service:name')}: <span className='font-bold'>{service.name}</span>
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
                    #{index + 1}
                  </span>
                  {service.is_active ? (
                    <Badge className='bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2 py-0'>
                      {t('service:active')}
                    </Badge>
                  ) : (
                    <Badge className='bg-red-100 text-red-700 hover:bg-red-100 text-[10px] px-2 py-0'>
                      {t('service:inactive')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Body info */}
              <div className='space-y-1.5 text-xs sm:text-sm'>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    {t('service:price')}:
                  </span>
                  <span className='font-bold text-primary'>
                    {formatCurrency(service.price)}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    {t('service:duration')}:
                  </span>
                  <span className='font-medium'>
                    {service.duration_minutes} {t('service:minutes')}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    {t('service:requirements')}:
                  </span>
                  <span className='font-medium'>
                    {service.requirements.length > 0
                      ? service.requirements.join(', ')
                      : t('service:none')}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-1.5 pt-2'>
                {canUpdate && (
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs py-1.5 h-7'
                    onClick={() => handleEdit(service)}
                  >
                    <Edit size={12} />
                    {t('service:edit')}
                  </Button>
                )}

                {canDelete && (
                  <Dialog
                    open={deleteId === service._id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) setDeleteId(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-600 text-[11px] sm:text-xs py-1.5 h-7'
                        onClick={() => setDeleteId(service._id)}
                        disabled={deleting}
                      >
                        <Trash2 size={12} />
                        {t('service:delete')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-xs rounded-xl'>
                      <DialogTitle className='text-sm'>
                        {t('service:deleteService')}
                      </DialogTitle>
                      <p className='text-xs text-muted-foreground'>
                        {t('service:deleteConfirm')}
                      </p>
                      <DialogFooter className='flex justify-end gap-2 pt-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 text-xs'
                          onClick={() => setDeleteId(null)}
                        >
                          {t('service:no')}
                        </Button>
                        <Button
                          size='sm'
                          className='bg-red-600 text-white h-7 text-xs'
                          onClick={() => handleDelete(service._id)}
                          disabled={deleting}
                        >
                          {deleting ? t('service:deleting') : t('service:yes')}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className='p-4 sm:p-6'>
        <Card className='card-shadow hidden lg:block'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-muted/50'>
                <tr>
                  {[
                    t('service:serviceCode'),
                    t('service:serviceName'),
                    t('service:price'),
                    t('service:duration'),
                    t('service:requirements'),
                    t('service:status'),
                    t('service:actions'),
                  ].map((i) => (
                    <th
                      key={i}
                      className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
                    >
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y'>
                {data?.data.map((service) => (
                  <tr
                    key={service._id}
                    className='hover:bg-accent/50 transition-smooth'
                  >
                    <td className='px-3 xl:px-5 py-3 xl:py-4'>
                      <div className='font-medium text-sm xl:text-base'>
                        {service.code}
                      </div>
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
                      {service.name}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm font-semibold text-primary'>
                      {formatCurrency(service.price)}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
                      {service.duration_minutes} {t('service:minutes')}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
                      {service.requirements.length > 0
                        ? service.requirements.join(', ')
                        : t('service:none')}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4'>
                      {service.is_active ? (
                        <Badge className='bg-green-100 text-green-700 hover:bg-green-100'>
                          {t('service:active')}
                        </Badge>
                      ) : (
                        <Badge className='bg-red-100 text-red-700 hover:bg-red-100'>
                          {t('service:inactive')}
                        </Badge>
                      )}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4'>
                      <div className='flex justify-center gap-3'>
                        {canUpdate && (
                          <Button
                            size='icon'
                            variant='outline'
                            className='h-7 w-7'
                            onClick={() => handleEdit(service)}
                          >
                            <Edit size={16} />
                          </Button>
                        )}

                        {canDelete && (
                          <Dialog
                            open={deleteId === service._id}
                            onOpenChange={(isOpen) => {
                              if (!isOpen) setDeleteId(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size='icon'
                                variant='outline'
                                className='h-7 w-7 text-red-500 border-red-300 hover:bg-red-50 hover:text-red-500'
                                onClick={() => setDeleteId(service._id)}
                                disabled={deleting}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-xs rounded-xl'>
                              <DialogTitle>{t('service:deleteService')}</DialogTitle>
                              <p className='text-sm text-muted-foreground'>
                                {t('service:deleteConfirm')}
                              </p>
                              <DialogFooter className='flex justify-end gap-2'>
                                <Button
                                  variant='outline'
                                  onClick={() => setDeleteId(null)}
                                >
                                  {t('service:no')}
                                </Button>
                                <Button
                                  className='bg-red-600 text-white'
                                  onClick={() => handleDelete(service._id)}
                                  disabled={deleting}
                                >
                                  {deleting ? t('service:deleting') : t('service:yes')}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ServiceFormDialog
        open={open}
        onOpenChange={handleClose}
        editingService={editingService}
        form={form}
        setForm={setForm}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        isLoading={creating || updating}
      />
    </div>
  );
}
