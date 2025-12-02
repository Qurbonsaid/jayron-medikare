import { MedicationApi } from '@/app/api/medication/medication';
import {
  MedicationCreated,
  MedicationGetAllRes,
} from '@/app/api/medication/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { usePermission } from '@/hooks/usePermission';
import {
  Droplets,
  Eye,
  Filter,
  PackagePlus,
  Paintbrush,
  Pencil,
  Pill,
  Plus,
  Search,
  Syringe,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export enum MedicationForm {
  SOLID = 'solid',
  LIQUID = 'liquid',
  INJECTION = 'injection',
  TOPICAL = 'topical',
}

function Medication() {
  const { canCreate, canUpdate, canDelete } = usePermission('medication');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterForm, setFilterForm] = useState<MedicationForm | 'all'>('all');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<
    string | null
  >(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleRequest = useHandleRequest();

  // RTK Query hooks
  const {
    data: medicationsData,
    isLoading,
    refetch,
  } = MedicationApi.useGetAllMedicationsQuery({
    page,
    limit: 10,
    search: searchTerm,
    form: filterForm !== 'all' ? filterForm : undefined,
    is_active: filterActive,
  });

  useEffect(() => {
    refetch();
  }, [searchTerm, filterForm, filterActive]);

  const { data: selectedMedication } = MedicationApi.useGetOneMedicationQuery(
    { id: selectedMedicationId! },
    { skip: !selectedMedicationId }
  );

  const [createMedication, { isLoading: isCreating }] =
    MedicationApi.useCreateMedicationMutation();
  const [updateMedication, { isLoading: isUpdating }] =
    MedicationApi.useUpdateMedicationMutation();
  const [deleteMedication, { isLoading: isDeleting }] =
    MedicationApi.useDeleteMedicationMutation();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterForm, filterActive]);

  // Form state
  const [formData, setFormData] = useState<MedicationCreated>({
    name: '',
    form: MedicationForm.SOLID,
    dosage: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      form: MedicationForm.SOLID,
      dosage: '',
      is_active: true,
    });
  };

  const handleCreate = async () => {
    await handleRequest({
      request: () => createMedication(formData).unwrap(),
      onSuccess: () => {
        toast.success("Muvaffaqiyat! Dori muvaffaqiyatli qo'shildi");
        setIsCreateOpen(false);
        resetForm();
        refetch();
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  const handleUpdate = async () => {
    if (!selectedMedicationId) return;

    await handleRequest({
      request: () =>
        updateMedication({
          id: selectedMedicationId,
          body: formData,
        }).unwrap(),
      onSuccess: async () => {
        toast.success('Muvaffaqiyat! Dori muvaffaqiyatli yangilandi ');
        setIsEditOpen(false);
        setSelectedMedicationId(null);
        resetForm();
        await refetch();
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await handleRequest({
      request: () => deleteMedication({ id: deleteId }).unwrap(),
      onSuccess: async () => {
        toast.success("Muvaffaqiyat! Dori muvaffaqiyatli o'chirildi");
        setIsDeleteOpen(false);
        setDeleteId(null);
        refetch();
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  const handleEdit = (medication: MedicationGetAllRes['data'][0]) => {
    setSelectedMedicationId(medication._id);
    setFormData({
      name: medication.name,
      form: medication.form,
      dosage: medication.dosage,
      is_active: medication.is_active,
    });
    setIsEditOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedMedicationId(id);
    setIsViewOpen(true);
  };

  const getFormIcon = (form: MedicationForm) => {
    switch (form) {
      case MedicationForm.SOLID:
        return <Pill className='h-4 w-4' />;
      case MedicationForm.LIQUID:
        return <Droplets className='h-4 w-4' />;
      case MedicationForm.INJECTION:
        return <Syringe className='h-4 w-4' />;
      case MedicationForm.TOPICAL:
        return <Paintbrush className='h-4 w-4' />;
    }
  };

  const getFormLabel = (form: MedicationForm) => {
    const labels = {
      [MedicationForm.SOLID]: 'Qattiq',
      [MedicationForm.LIQUID]: 'Suyuq',
      [MedicationForm.INJECTION]: 'Inyeksiya',
      [MedicationForm.TOPICAL]: 'Tashqi',
    };
    return labels[form];
  };

  const getFormColor = (form: MedicationForm) => {
    const colors = {
      [MedicationForm.SOLID]: 'bg-blue-500/10 text-blue-600 border-blue-200',
      [MedicationForm.LIQUID]: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
      [MedicationForm.INJECTION]:
        'bg-purple-500/10 text-purple-600 border-purple-200',
      [MedicationForm.TOPICAL]:
        'bg-green-500/10 text-green-600 border-green-200',
    };
    return colors[form];
  };

  return (
    <div className='container mx-auto py-4 px-4 sm:py-6 space-y-4 sm:space-y-6'>
      {/* Header Section */}
      <div className='flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2'>
            <PackagePlus className='h-6 w-6 sm:h-8 sm:w-8 text-primary' />
            Dorilar boshqaruvi
          </h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Barcha dorilarni ko'ring, tahrirlang va boshqaring
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            size='lg'
            className='gap-2 w-full md:w-auto'
          >
            <Plus className='h-4 w-4' />
            <span className='sm:inline'>Yangi dori qo'shish</span>
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader className='pb-3 sm:pb-6'>
          <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <Filter className='h-4 w-4 sm:h-5 sm:w-5' />
            Filter va qidiruv
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='search' className='text-sm'>
                Qidiruv
              </Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Dori nomini kiriting...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-9 h-10'
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm'>Shakl bo'yicha</Label>
              <Select
                value={filterForm}
                onValueChange={(value) =>
                  setFilterForm(value as MedicationForm | 'all')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Shakl tanlang' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Barchasi</SelectItem>
                  <SelectItem value={MedicationForm.SOLID}>
                    <div className='flex items-center gap-2'>
                      <Pill className='h-4 w-4' />
                      Qattiq
                    </div>
                  </SelectItem>
                  <SelectItem value={MedicationForm.LIQUID}>
                    <div className='flex items-center gap-2'>
                      <Droplets className='h-4 w-4' />
                      Suyuq
                    </div>
                  </SelectItem>
                  <SelectItem value={MedicationForm.INJECTION}>
                    <div className='flex items-center gap-2'>
                      <Syringe className='h-4 w-4' />
                      Inyeksiya
                    </div>
                  </SelectItem>
                  <SelectItem value={MedicationForm.TOPICAL}>
                    <div className='flex items-center gap-2'>
                      <Paintbrush className='h-4 w-4' />
                      Tashqi
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Holat bo'yicha</Label>
              <Select
                value={
                  filterActive === undefined
                    ? 'all'
                    : filterActive
                    ? 'active'
                    : 'inactive'
                }
                onValueChange={(value) =>
                  setFilterActive(
                    value === 'all' ? undefined : value === 'active'
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Holat tanlang' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Barchasi</SelectItem>
                  <SelectItem value='active'>Faol</SelectItem>
                  <SelectItem value='inactive'>Faol emas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Table */}
      <Card>
        <CardHeader className='pb-3 sm:pb-6'>
          <CardTitle className='text-base sm:text-lg'>
            Dorilar ro'yxati
          </CardTitle>
          <CardDescription className='text-sm'>
            {medicationsData?.pagination.total_items || 0} ta dori topildi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className='hidden md:block rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-muted/50'>
                  <TableHead className='w-[50px]'>#</TableHead>
                  <TableHead>Nomi</TableHead>
                  <TableHead>Shakl</TableHead>
                  <TableHead>Dozasi</TableHead>
                  <TableHead>Holat</TableHead>
                  <TableHead className='text-right'>Amallar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-10'>
                      <div className='flex items-center justify-center gap-2'>
                        <div className='h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                        <span className='text-muted-foreground'>
                          Yuklanmoqda...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : medicationsData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-10'>
                      <div className='flex flex-col items-center gap-2'>
                        <PackagePlus className='h-12 w-12 text-muted-foreground/50' />
                        <p className='text-muted-foreground'>
                          Dorilar topilmadi
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  medicationsData?.data.map((medication, index) => (
                    <TableRow
                      key={medication._id}
                      className='hover:bg-muted/50'
                    >
                      <TableCell className='font-medium'>
                        {(page - 1) * 10 + index + 1}
                      </TableCell>
                      <TableCell className='font-medium'>
                        {medication.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant='outline'
                          className={`gap-1 ${getFormColor(medication.form)}`}
                        >
                          {getFormIcon(medication.form)}
                          {getFormLabel(medication.form)}
                        </Badge>
                      </TableCell>
                      <TableCell>{medication.dosage}</TableCell>
                      <TableCell>
                        {medication.is_active ? (
                          <Badge
                            variant='outline'
                            className='bg-green-500/10 text-green-600 border-green-200'
                          >
                            Faol
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='bg-gray-500/10 text-gray-600 border-gray-200'
                          >
                            Faol emas
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => handleView(medication._id)}
                            className='h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600'
                          >
                            <Eye className='h-4 w-4' />
                          </Button>
                          {canUpdate && (
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => handleEdit(medication)}
                              className='h-8 w-8 hover:bg-amber-500/10 hover:text-amber-600'
                            >
                              <Pencil className='h-4 w-4' />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size='icon'
                              variant='ghost'
                              onClick={() => {
                                setDeleteId(medication._id);
                                setIsDeleteOpen(true);
                              }}
                              className='h-8 w-8 hover:bg-red-500/10 hover:text-red-600'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className='md:hidden space-y-3'>
            {isLoading ? (
              <div className='text-center py-10'>
                <div className='flex items-center justify-center gap-2'>
                  <div className='h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
                  <span className='text-sm text-muted-foreground'>
                    Yuklanmoqda...
                  </span>
                </div>
              </div>
            ) : medicationsData?.data.length === 0 ? (
              <div className='text-center py-10'>
                <div className='flex flex-col items-center gap-2'>
                  <PackagePlus className='h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50' />
                  <p className='text-sm text-muted-foreground'>
                    Dorilar topilmadi
                  </p>
                </div>
              </div>
            ) : (
              medicationsData?.data.map((medication, index) => (
                <Card
                  key={medication._id}
                  className='relative overflow-hidden hover:shadow-md transition-shadow'
                >
                  <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50'></div>
                  <CardContent className='pt-4 pb-4 pl-5'>
                    <div className='space-y-2'>
                      {/* Header */}
                      <div className='flex items-start justify-between'>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs font-medium text-muted-foreground'>
                              #{(page - 1) * 10 + index + 1}
                            </span>
                          </div>
                          <h3 className='font-semibold text-lg'>
                            {medication.name}
                          </h3>
                        </div>
                        <div className='shrink-0'>
                          {medication.is_active ? (
                            <Badge
                              variant='outline'
                              className='bg-green-500/10 text-green-600 border-green-200 text-xs'
                            >
                              Faol
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-gray-500/10 text-gray-600 border-gray-200 text-xs'
                            >
                              Faol emas
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Details */}
                      <div className='grid grid-cols-2 gap-12'>
                        <div className='space-y-1 grid'>
                          <Label className='text-xs text-muted-foreground'>
                            Shakl
                          </Label>
                          <Badge
                            variant='outline'
                            className={`gap-1 ${getFormColor(medication.form)}`}
                          >
                            {getFormIcon(medication.form)}
                            {getFormLabel(medication.form)}
                          </Badge>
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs text-muted-foreground'>
                            Dozasi
                          </Label>
                          <p className='font-medium'>{medication.dosage}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Actions */}
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleView(medication._id)}
                          className='flex-1 gap-2'
                        >
                          <Eye className='h-4 w-4' />
                          Ko'rish
                        </Button>
                        {canUpdate && (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEdit(medication)}
                            className='flex-1 gap-2'
                          >
                            <Pencil className='h-4 w-4' />
                            Tahrirlash
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size='icon'
                            variant='ghost'
                            onClick={() => {
                              setDeleteId(medication._id);
                              setIsDeleteOpen(true);
                            }}
                            className='h-8 w-8 hover:bg-red-500/10 hover:text-red-600'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {medicationsData && medicationsData.pagination.total_pages > 1 && (
            <div className='mt-6'>
              <Separator className='mb-4' />
              <div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-2'>
                <div className='text-sm text-muted-foreground'>
                  <span className='font-medium'>
                    {medicationsData.pagination.total_items}
                  </span>{' '}
                  ta doridan{' '}
                  <span className='font-medium'>
                    {(page - 1) * 10 + 1}-
                    {Math.min(
                      page * 10,
                      medicationsData.pagination.total_items
                    )}
                  </span>{' '}
                  ko'rsatilmoqda
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className='hidden sm:flex'
                  >
                    Birinchi
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Oldingi
                  </Button>

                  {/* Page Numbers */}
                  <div className='flex items-center gap-1'>
                    {(() => {
                      const totalPages = medicationsData.pagination.total_pages;
                      const pages = [];
                      const showPages = 5;
                      let startPage = Math.max(
                        1,
                        page - Math.floor(showPages / 2)
                      );
                      const endPage = Math.min(
                        totalPages,
                        startPage + showPages - 1
                      );

                      if (endPage - startPage < showPages - 1) {
                        startPage = Math.max(1, endPage - showPages + 1);
                      }
                      if (startPage > 1) {
                        pages.push(
                          <Button
                            key='start-ellipsis'
                            variant='ghost'
                            size='sm'
                            disabled
                            className='hidden sm:flex'
                          >
                            ...
                          </Button>
                        );
                      }

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <Button
                            key={i}
                            variant={page === i ? 'default' : 'outline'}
                            size='sm'
                            onClick={() => setPage(i)}
                            className='min-w-[40px]'
                          >
                            {i}
                          </Button>
                        );
                      }

                      if (endPage < totalPages) {
                        pages.push(
                          <Button
                            key='end-ellipsis'
                            variant='ghost'
                            size='sm'
                            disabled
                            className='hidden sm:flex'
                          >
                            ...
                          </Button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPage((p) =>
                        Math.min(medicationsData.pagination.total_pages, p + 1)
                      )
                    }
                    disabled={page === medicationsData.pagination.total_pages}
                  >
                    Keyingi
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPage(medicationsData.pagination.total_pages)
                    }
                    disabled={page === medicationsData.pagination.total_pages}
                    className='hidden sm:flex'
                  >
                    Oxirgi
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <Plus className='h-4 w-4 sm:h-5 sm:w-5' />
              Yangi dori qo'shish
            </DialogTitle>
            <DialogDescription className='text-sm'>
              Yangi dori ma'lumotlarini kiriting
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name' className='text-sm'>
                Dori nomi *
              </Label>
              <Input
                id='name'
                placeholder='Masalan: Paracetamol'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='form' className='text-sm'>
                  Shakl *
                </Label>
                <Select
                  value={formData.form}
                  onValueChange={(value) =>
                    setFormData({ ...formData, form: value as MedicationForm })
                  }
                >
                  <SelectTrigger id='form'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MedicationForm.SOLID}>
                      <div className='flex items-center gap-2'>
                        <Pill className='h-4 w-4' />
                        Qattiq (Tabletka, Kapsula)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.LIQUID}>
                      <div className='flex items-center gap-2'>
                        <Droplets className='h-4 w-4' />
                        Suyuq (Sirop, Suspenziya)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.INJECTION}>
                      <div className='flex items-center gap-2'>
                        <Syringe className='h-4 w-4' />
                        Inyeksiya (In'ektsiya)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.TOPICAL}>
                      <div className='flex items-center gap-2'>
                        <Paintbrush className='h-4 w-4' />
                        Tashqi (Malham, Krem)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='dosage' className='text-sm'>
                  Dozasi *
                </Label>
                <Input
                  id='dosage'
                  placeholder='Masalan: 500mg'
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                />
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='is_active'
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor='is_active' className='cursor-pointer'>
                Faol holat
              </Label>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsCreateOpen(false)}
              className='w-full sm:w-auto'
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className='w-full sm:w-auto'
            >
              {isCreating ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedMedicationId(null);
            resetForm();
          }
        }}
      >
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg sm:text-xl'>
              <Pencil className='h-4 w-4 sm:h-5 sm:w-5' />
              Dorini tahrirlash
            </DialogTitle>
            <DialogDescription className='text-sm'>
              Dori ma'lumotlarini o'zgartiring
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='edit-name' className='text-sm'>
                Dori nomi *
              </Label>
              <Input
                id='edit-name'
                placeholder='Masalan: Paracetamol'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-form' className='text-sm'>
                  Shakl *
                </Label>
                <Select
                  value={formData.form}
                  onValueChange={(value) =>
                    setFormData({ ...formData, form: value as MedicationForm })
                  }
                >
                  <SelectTrigger id='edit-form'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MedicationForm.SOLID}>
                      <div className='flex items-center gap-2'>
                        <Pill className='h-4 w-4' />
                        Qattiq (Tabletka, Kapsula)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.LIQUID}>
                      <div className='flex items-center gap-2'>
                        <Droplets className='h-4 w-4' />
                        Suyuq (Sirop, Suspenziya)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.INJECTION}>
                      <div className='flex items-center gap-2'>
                        <Syringe className='h-4 w-4' />
                        Inyeksiya (In'ektsiya)
                      </div>
                    </SelectItem>
                    <SelectItem value={MedicationForm.TOPICAL}>
                      <div className='flex items-center gap-2'>
                        <Paintbrush className='h-4 w-4' />
                        Tashqi (Malham, Krem)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='edit-dosage' className='text-sm'>
                  Dozasi *
                </Label>
                <Input
                  id='edit-dosage'
                  placeholder='Masalan: 500mg'
                  value={formData.dosage}
                  onChange={(e) =>
                    setFormData({ ...formData, dosage: e.target.value })
                  }
                />
              </div>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='edit-is_active'
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor='edit-is_active' className='cursor-pointer'>
                Faol holat
              </Label>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditOpen(false);
                setSelectedMedicationId(null);
                resetForm();
              }}
              className='w-full sm:w-auto'
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className='w-full sm:w-auto'
            >
              {isUpdating ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) {
            setSelectedMedicationId(null);
          }
        }}
      >
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl'>
              <Eye className='h-5 w-5' />
              Dori haqida ma'lumot
            </DialogTitle>
            <DialogDescription>To'liq ma'lumotlarni ko'ring</DialogDescription>
          </DialogHeader>

          {selectedMedication?.data && (
            <div className='space-y-6 py-4'>
              <div className='grid gap-4'>
                <div className='space-y-2'>
                  <Label className='text-xs sm:text-sm text-muted-foreground'>
                    Dori nomi
                  </Label>
                  <div className='text-lg sm:text-xl font-semibold break-words'>
                    {selectedMedication.data.name}
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>Shakl</Label>
                    <div>
                      <Badge
                        variant='outline'
                        className={`gap-2 text-base px-3 py-1 ${getFormColor(
                          selectedMedication.data.form
                        )}`}
                      >
                        {getFormIcon(selectedMedication.data.form)}
                        {getFormLabel(selectedMedication.data.form)}
                      </Badge>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>Dozasi</Label>
                    <div className='text-lg font-medium'>
                      {selectedMedication.data.dosage}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='space-y-2'>
                  <Label className='text-muted-foreground'>Holat</Label>
                  <div>
                    {selectedMedication.data.is_active ? (
                      <Badge className='bg-green-500 text-white'>✓ Faol</Badge>
                    ) : (
                      <Badge variant='secondary'>○ Faol emas</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>
                      Yaratilgan sana
                    </Label>
                    <div className='text-sm'>
                      {new Date(
                        selectedMedication.data.created_at
                      ).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label className='text-muted-foreground'>
                      Oxirgi yangilanish
                    </Label>
                    <div className='text-sm'>
                      {new Date(
                        selectedMedication.data.updated_at
                      ).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => {
                setIsViewOpen(false);
                setSelectedMedicationId(null);
              }}
              className='w-full sm:w-auto'
            >
              Yopish
            </Button>
            <Button
              onClick={() => {
                setIsViewOpen(false);
                if (selectedMedication?.data) {
                  handleEdit(selectedMedication.data);
                }
              }}
              className='gap-2 w-full sm:w-auto'
            >
              <Pencil className='h-4 w-4' />
              Tahrirlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>Dorini o‘chirish</DialogTitle>
            <DialogDescription>
              Haqiqatdan ham bu dorini o‘chirmoqchimisiz?
              <br />
              <span className='font-semibold text-red-600'>
                Bu amalni qaytarib bo‘lmaydi.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsDeleteOpen(false)}>
              Bekor qilish
            </Button>

            <Button
              variant='destructive'
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'O‘chirilmoqda...' : 'Ha, o‘chirilsin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Medication;
