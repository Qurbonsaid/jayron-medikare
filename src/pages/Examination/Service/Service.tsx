import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetAllServiceQuery,
  useUpdateServiceMutation,
} from '@/app/api/serviceApi/serviceApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { Edit, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const handleRequest = useHandleRequest();

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

  // Temporary input value for requirements array
  const [requirementInput, setRequirementInput] = useState('');

  // Auto refetch when data changes
  useEffect(() => {
    refetch();
  }, [page, limit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Remove leading zeros and convert to number
    const numValue =
      value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
    setForm((prev) => ({ ...prev, [name]: numValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddRequirement = (value: string) => {
    if (!value.trim()) return;

    if (form.requirements.includes(value.trim())) {
      toast.error('Bu talab allaqachon mavjud');
      return;
    }

    setForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, value.trim()],
    }));
    setRequirementInput('');
  };

  const handleRemoveRequirement = (index: number) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.code.trim()) newErrors.code = 'Хизмат коди мажбурий';
    if (!form.name.trim()) newErrors.name = 'Хизмат номи мажбурий';
    if (!form.description.trim()) newErrors.description = 'Тавсиф мажбурий';
    if (form.price <= 0) newErrors.price = 'Нархни киритинг';
    if (form.duration_minutes <= 0)
      newErrors.duration_minutes = 'Давомийликни киритинг';

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
          toast.success('Хизмат муваффақиятли янгиланди 🎉');
          handleClose();
          refetch();
        },
      });
    } else {
      await handleRequest({
        request: () => createService(payload),
        onSuccess: () => {
          toast.success('Хизмат муваффақиятли қўшилди 🎉');
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
        toast.success('Хизмат муваффақиятли ўчирилди');
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
    setRequirementInput('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  if (isLoading) return <p className='p-4'>Юкланмоқда...</p>;
  if (isError || !data)
    return <p className='p-4 text-red-500'>Хатолик юз берди!</p>;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='bg-card border-b'>
        <div className='w-full px-4 sm:px-6 py-5 flex items-center justify-between gap-3'>
          <div className='flex-1 max-w-md'>
            <Input
              placeholder='Хизмат қидириш...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full'
            />
          </div>

          <Button
            className='bg-blue-600 hover:bg-blue-700 text-white'
            onClick={() => setOpen(true)}
          >
            + Хизмат қўшиш
          </Button>
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
                    Номи: <span className='font-bold'>{service.name}</span>
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
                    #{index + 1}
                  </span>
                  {service.is_active ? (
                    <Badge className='bg-green-100 text-green-700 hover:bg-green-100 text-[10px] px-2 py-0'>
                      Актив
                    </Badge>
                  ) : (
                    <Badge className='bg-red-100 text-red-700 hover:bg-red-100 text-[10px] px-2 py-0'>
                      Нофаол
                    </Badge>
                  )}
                </div>
              </div>

              {/* Body info */}
              <div className='space-y-1.5 text-xs sm:text-sm'>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    Нархи:
                  </span>
                  <span className='font-bold text-primary'>
                    {formatCurrency(service.price)}
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    Давомийлик:
                  </span>
                  <span className='font-medium'>
                    {service.duration_minutes} дақиқа
                  </span>
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-muted-foreground font-medium'>
                    Талаблар:
                  </span>
                  <span className='font-medium'>
                    {service.requirements.length > 0
                      ? service.requirements.join(', ')
                      : 'Йўқ'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-1.5 pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 flex items-center justify-center gap-1 text-[11px] sm:text-xs py-1.5 h-7'
                  onClick={() => handleEdit(service)}
                >
                  <Edit size={12} />
                  Таҳрирлаш
                </Button>

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
                      className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-[11px] sm:text-xs py-1.5 h-7'
                      onClick={() => setDeleteId(service._id)}
                      disabled={deleting}
                    >
                      <Trash2 size={12} />
                      Ўчириш
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-xs rounded-xl'>
                    <DialogTitle className='text-sm'>
                      Хизматни ўчириш
                    </DialogTitle>
                    <p className='text-xs text-muted-foreground'>
                      Ростан ҳам ушбу хизматни ўчирмоқчимисиз?
                    </p>
                    <DialogFooter className='flex justify-end gap-2 pt-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 text-xs'
                        onClick={() => setDeleteId(null)}
                      >
                        Йўқ
                      </Button>
                      <Button
                        size='sm'
                        className='bg-red-600 text-white h-7 text-xs'
                        onClick={() => handleDelete(service._id)}
                        disabled={deleting}
                      >
                        {deleting ? 'Ўчирилмоқда...' : 'Ҳа'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                    'Хизмат коди',
                    'Хизмат номи',
                    'Нархи',
                    'Давомийлик',
                    'Талаблар',
                    'Ҳолати',
                    'Ҳаракатлар',
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
                      {service.duration_minutes} дақиқа
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4 text-xs xl:text-sm'>
                      {service.requirements.length > 0
                        ? service.requirements.join(', ')
                        : 'Йўқ'}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4'>
                      {service.is_active ? (
                        <Badge className='bg-green-100 text-green-700 hover:bg-green-100'>
                          Актив
                        </Badge>
                      ) : (
                        <Badge className='bg-red-100 text-red-700 hover:bg-red-100'>
                          Нофаол
                        </Badge>
                      )}
                    </td>
                    <td className='px-3 xl:px-5 py-3 xl:py-4'>
                      <div className='flex justify-center gap-3'>
                        <Button
                          size='icon'
                          variant='outline'
                          className='h-7 w-7'
                          onClick={() => handleEdit(service)}
                        >
                          <Edit size={16} />
                        </Button>

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
                              className='h-7 w-7 text-red-500 border-red-300 hover:bg-red-50'
                              onClick={() => setDeleteId(service._id)}
                              disabled={deleting}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-xs rounded-xl'>
                            <DialogTitle>Хизматни ўчириш</DialogTitle>
                            <p className='text-sm text-muted-foreground'>
                              Ростан ҳам ушбу хизматни ўчирмоқчимисиз?
                            </p>
                            <DialogFooter className='flex justify-end gap-2'>
                              <Button
                                variant='outline'
                                onClick={() => setDeleteId(null)}
                              >
                                Йўқ
                              </Button>
                              <Button
                                className='bg-red-600 text-white'
                                onClick={() => handleDelete(service._id)}
                                disabled={deleting}
                              >
                                {deleting ? 'Ўчирилмоқда...' : 'Ҳа'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh] max-w-xl'>
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Хизматни таҳрирлаш' : 'Янги хизмат қўшиш'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Code */}
            <div>
              <Label>Хизмат коди *</Label>
              <Input
                name='code'
                value={form.code}
                onChange={handleChange}
                placeholder='Масалан: S001'
              />
              {errors.code && (
                <p className='text-red-500 text-sm mt-1'>{errors.code}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <Label>Хизмат номи *</Label>
              <Input
                name='name'
                value={form.name}
                onChange={handleChange}
                placeholder='Масалан: Кўрик'
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label>Тавсиф *</Label>
              <Textarea
                name='description'
                value={form.description}
                onChange={handleChange}
                placeholder='Хизмат ҳақида қисқача маълумот'
                rows={3}
              />
              {errors.description && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Price and Duration */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>Нархи (сўм) *</Label>
                <Input
                  name='price'
                  type='number'
                  value={form.price === 0 ? '' : form.price}
                  onChange={handleNumberChange}
                  placeholder='0'
                  min='0'
                />
                {errors.price && (
                  <p className='text-red-500 text-sm mt-1'>{errors.price}</p>
                )}
              </div>

              <div>
                <Label>Давомийлик (дақиқа) *</Label>
                <Input
                  name='duration_minutes'
                  type='number'
                  value={
                    form.duration_minutes === 0 ? '' : form.duration_minutes
                  }
                  onChange={handleNumberChange}
                  placeholder='0'
                  min='0'
                />
                {errors.duration_minutes && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.duration_minutes}
                  </p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <Label>Талаблар</Label>
              <div className='flex gap-2'>
                <Input
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder='Талаб киритинг'
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement(requirementInput);
                    }
                  }}
                />
                <Button
                  type='button'
                  onClick={() => handleAddRequirement(requirementInput)}
                  size='sm'
                >
                  Қўшиш
                </Button>
              </div>
              <div className='flex flex-wrap gap-2 mt-2'>
                {form.requirements.map((req, index) => (
                  <div
                    key={index}
                    className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2'
                  >
                    {req}
                    <X
                      size={14}
                      className='cursor-pointer hover:text-blue-900'
                      onClick={() => handleRemoveRequirement(index)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Active Checkbox */}
            <div className='flex items-center gap-2'>
              <Checkbox
                id='is_active'
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: checked as boolean,
                  }))
                }
              />
              <Label htmlFor='is_active' className='cursor-pointer'>
                Актив хизмат
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={handleClose}>
              Бекор қилиш
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={creating || updating}
              className='bg-blue-600 text-white'
            >
              {creating || updating ? 'Сақланмоқда...' : 'Сақлаш'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
