import { MedicationApi } from '@/app/api/medication/medication';
import {
  useCreatePrecriptionTemplateMutation,
  useDeletePrecriptionTemplateMutation,
  useGetAllPrecriptionTemplateQuery,
  useUpdatePrecriptionTemplateMutation,
} from '@/app/api/prescriptionTemplateApi/prescriptionTemplateApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ComboBox } from '@/components/ui/combobox';
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface TemplateItem {
  medication_id: string;
  addons: string;
  frequency: number;
  duration: number;
  instructions: string;
}

export default function MedicationTemplates() {
  const { t } = useTranslation('templates');
  const { canCreate, canUpdate, canDelete } = usePermission('templates');
  const handleRequest = useHandleRequest();

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  // Medication search and pagination
  const [medicationSearch, setMedicationSearch] = useState('');
  const [medicationPage, setMedicationPage] = useState(1);
  const [allMedications, setAllMedications] = useState<any[]>([]);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateItems, setTemplateItems] = useState<TemplateItem[]>([
    {
      medication_id: '',
      addons: '',
      frequency: 1,
      duration: 1,
      instructions: '',
    },
  ]);

  // RTK Query hooks
  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useGetAllPrecriptionTemplateQuery({
    page,
    limit: 20,
    ...(searchTerm && { name: searchTerm }),
  });

  const { data: medicationsData, isLoading: isMedicationsLoading } =
    MedicationApi.useGetAllMedicationsQuery({
      page: medicationPage,
      limit: 20,
      ...(medicationSearch && { search: medicationSearch }),
    });

  // Update medications list when data changes
  React.useEffect(() => {
    if (medicationsData?.data) {
      if (medicationPage === 1) {
        setAllMedications(medicationsData.data);
      } else {
        setAllMedications((prev) => [...prev, ...medicationsData.data]);
      }
    }
  }, [medicationsData, medicationPage]);

  // Reset medication list on search change
  React.useEffect(() => {
    setMedicationPage(1);
    setAllMedications([]);
  }, [medicationSearch]);

  const [createTemplate] = useCreatePrecriptionTemplateMutation();
  const [updateTemplate] = useUpdatePrecriptionTemplateMutation();
  const [deleteTemplate] = useDeletePrecriptionTemplateMutation();

  const resetForm = () => {
    setTemplateName('');
    setTemplateItems([
      {
        medication_id: '',
        addons: '',
        frequency: 1,
        duration: 1,
        instructions: '',
      },
    ]);
    setSelectedTemplateId(null);
    // Don't reset medication search and page to preserve loaded medications
  };

  const handleCreate = async () => {
    if (!templateName.trim()) {
      toast.error(t('errors.nameRequired', 'Шаблон номи киритилиши керак'));
      return;
    }

    const validItems = templateItems.filter((item) => item.medication_id);
    if (validItems.length === 0) {
      toast.error(
        t('errors.itemsRequired', 'Камида битта дори танланиши керак')
      );
      return;
    }

    await handleRequest({
      request: async () => {
        const result = await createTemplate({
          name: templateName,
          items: validItems,
        });
        return result;
      },
      onSuccess: () => {
        toast.success(t('success.created', 'Шаблон яратилди'));
        setIsCreateOpen(false);
        resetForm();
        refetch();
      },
    });
  };

  const handleEdit = async () => {
    if (!selectedTemplateId) return;
    if (!templateName.trim()) {
      toast.error(t('errors.nameRequired', 'Шаблон номи киритилиши керак'));
      return;
    }

    const validItems = templateItems.filter((item) => item.medication_id);
    if (validItems.length === 0) {
      toast.error(
        t('errors.itemsRequired', 'Камида битта дори танланиши керак')
      );
      return;
    }

    await handleRequest({
      request: async () => {
        const result = await updateTemplate({
          id: selectedTemplateId,
          body: {
            name: templateName,
            items: validItems,
          },
        });
        return result;
      },
      onSuccess: () => {
        toast.success(t('success.updated', 'Шаблон янгиланди'));
        setIsEditOpen(false);
        resetForm();
        refetch();
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await handleRequest({
      request: async () => {
        const result = await deleteTemplate(deleteId);
        return result;
      },
      onSuccess: () => {
        toast.success(t('success.deleted', 'Шаблон ўчирилди'));
        setIsDeleteOpen(false);
        setDeleteId(null);
        refetch();
      },
    });
  };

  const openEditDialog = (template: GetResponse) => {
    setSelectedTemplateId(template._id);
    setTemplateName(template.name);

    // Extract medications from template and add to allMedications
    const templateMedications = template.items
      .map((item) => item.medication_id)
      .filter((med) => med !== null)
      .map((med) => ({
        _id: med!._id,
        name: med!.name,
        form: med!.form,
      }));

    // Merge with existing medications, avoiding duplicates
    setAllMedications((prev) => {
      const existingIds = new Set(prev.map((m) => m._id));
      const newMeds = templateMedications.filter(
        (med) => !existingIds.has(med._id)
      );
      return [...newMeds, ...prev];
    });

    setTemplateItems(
      template.items.map((item) => ({
        medication_id: item.medication_id?._id || '',
        addons: item.addons,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }))
    );
    setIsEditOpen(true);
  };

  const openViewDialog = (template: GetResponse) => {
    setSelectedTemplateId(template._id);
    setTemplateName(template.name);

    // Extract medications from template and add to allMedications
    const templateMedications = template.items
      .map((item) => item.medication_id)
      .filter((med) => med !== null)
      .map((med) => ({
        _id: med!._id,
        name: med!.name,
        form: med!.form,
      }));

    // Merge with existing medications, avoiding duplicates
    setAllMedications((prev) => {
      const existingIds = new Set(prev.map((m) => m._id));
      const newMeds = templateMedications.filter(
        (med) => !existingIds.has(med._id)
      );
      return [...newMeds, ...prev];
    });

    setTemplateItems(
      template.items.map((item) => ({
        medication_id: item.medication_id?._id || '',
        addons: item.addons,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }))
    );
    setIsViewOpen(true);
  };

  const addItem = () => {
    setTemplateItems([
      ...templateItems,
      {
        medication_id: '',
        addons: '',
        frequency: 1,
        duration: 1,
        instructions: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TemplateItem, value: any) => {
    const newItems = [...templateItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setTemplateItems(newItems);
  };

  const getMedicationName = (id: string) => {
    const medication = medicationsData?.data?.find((m) => m._id === id);
    return medication ? medication.name : '-';
  };

  const renderForm = (readOnly = false) => (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>{t('fields.name', 'Шаблон номи')}</Label>
        <Input
          id='name'
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder={t('placeholders.name', 'Шаблон номини киритинг')}
          disabled={readOnly}
        />
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label>{t('fields.medications', 'Дорилар')}</Label>
          {!readOnly && (
            <Button type='button' variant='outline' size='sm' onClick={addItem}>
              <Plus className='h-4 w-4 mr-1' />
              {t('buttons.addMedication', 'Дори қўшиш')}
            </Button>
          )}
        </div>

        {templateItems.map((item, index) => (
          <Card key={index} className='p-4'>
            <div className='space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <Label>{t('fields.medication', 'Дори')}</Label>
                    <ComboBox
                      value={item.medication_id}
                      onValueChange={(value) =>
                        updateItem(index, 'medication_id', value)
                      }
                      disabled={readOnly}
                      placeholder={t(
                        'placeholders.selectMedication',
                        'Дори танланг'
                      )}
                      searchPlaceholder={t(
                        'placeholders.searchMedication',
                        'Дори қидириш...'
                      )}
                      emptyText={t('noMedications', 'Дорилар топилмади')}
                      loadingText={t('loading', 'Юкланмоқда...')}
                      searchValue={medicationSearch}
                      onSearchChange={(value) => {
                        setMedicationSearch(value);
                      }}
                      options={
                        allMedications?.map((med) => ({
                          value: med._id,
                          label: med.name,
                          sublabel: med.form,
                        })) || []
                      }
                      isLoading={isMedicationsLoading}
                      hasMore={
                        medicationsData
                          ? medicationPage <
                            medicationsData.pagination.total_pages
                          : false
                      }
                      onScroll={(e) => {
                        const target = e.currentTarget;
                        const scrollPercentage =
                          (target.scrollTop /
                            (target.scrollHeight - target.clientHeight)) *
                          100;
                        if (
                          scrollPercentage > 80 &&
                          !isMedicationsLoading &&
                          medicationsData &&
                          medicationPage <
                            medicationsData.pagination.total_pages
                        ) {
                          setMedicationPage((prev) => prev + 1);
                        }
                      }}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.addons', 'Қўшимча')}</Label>
                    <Input
                      value={item.addons}
                      onChange={(e) =>
                        updateItem(index, 'addons', e.target.value)
                      }
                      placeholder={t('placeholders.addons', 'Қўшимча')}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.frequency', 'Кунига неча марта')}</Label>
                    <Input
                      type='number'
                      min='1'
                      value={item.frequency}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Prevent leading zeros and ensure minimum value of 1
                        const numValue =
                          value === ''
                            ? 1
                            : Math.max(1, parseInt(value, 10) || 1);
                        updateItem(index, 'frequency', numValue);
                      }}
                      disabled={readOnly}
                    />
                  </div>

                  <div>
                    <Label>{t('fields.duration', 'Неча кунга')}</Label>
                    <Input
                      type='number'
                      min='1'
                      value={item.duration}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Prevent leading zeros and ensure minimum value of 1
                        const numValue =
                          value === ''
                            ? 1
                            : Math.max(1, parseInt(value, 10) || 1);
                        updateItem(index, 'duration', numValue);
                      }}
                      disabled={readOnly}
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <Label>{t('fields.instructions', 'Кўрсатмалар')}</Label>
                    <Input
                      value={item.instructions}
                      onChange={(e) =>
                        updateItem(index, 'instructions', e.target.value)
                      }
                      placeholder={t(
                        'placeholders.instructions',
                        'Кўрсатмалар'
                      )}
                      disabled={readOnly}
                    />
                  </div>
                </div>

                {!readOnly && templateItems.length > 1 && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeItem(index)}
                    className='ml-2'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('placeholders.search', 'Шаблон қидириш...')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className='pl-9'
          />
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            {t('buttons.create', 'Янги шаблон')}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.name', 'Номи')}</TableHead>
              <TableHead>{t('table.itemsCount', 'Дорилар сони')}</TableHead>
              <TableHead>{t('table.createdAt', 'Яратилган')}</TableHead>
              <TableHead className='text-right'>
                {t('table.actions', 'Амаллар')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8'>
                  {t('loading', 'Юкланмоқда...')}
                </TableCell>
              </TableRow>
            ) : templatesData?.data && templatesData.data.length > 0 ? (
              templatesData.data.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className='font-medium'>{template.name}</TableCell>
                  <TableCell>{template.items.length}</TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openViewDialog(template)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      {canUpdate && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => openEditDialog(template)}
                        >
                          <Pencil className='h-4 w-4' />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => {
                            setDeleteId(template._id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className='text-center py-8'>
                  {t('noData', 'Маълумот топилмади')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {templatesData && templatesData.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  page === 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
            {[...Array(templatesData.totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={() => setPage(i + 1)}
                  isActive={page === i + 1}
                  className='cursor-pointer'
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPage((p) => Math.min(templatesData.totalPages, p + 1))
                }
                className={
                  page === templatesData.totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.create.title', 'Янги шаблон яратиш')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.create.description', 'Дорилар шаблонини яратинг')}
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}
            >
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button onClick={handleCreate}>
              {t('buttons.save', 'Сақлаш')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.edit.title', 'Шаблонни таҳрирлаш')}
            </DialogTitle>
            <DialogDescription>
              {t('dialogs.edit.description', 'Шаблон маълумотларини янгиланг')}
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
            >
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button onClick={handleEdit}>
              {t('buttons.update', 'Янгилаш')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.view.title', 'Шаблон тафсилотлари')}
            </DialogTitle>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsViewOpen(false);
                resetForm();
              }}
            >
              {t('buttons.close', 'Ёпиш')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('dialogs.delete.title', 'Шаблонни ўчириш')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'dialogs.delete.description',
                'Ҳақиқатан ҳам бу шаблонни ўчирмоқчимисиз? Бу амални қайтариб бўлмайди.'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              {t('buttons.cancel', 'Бекор қилиш')}
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              {t('buttons.delete', 'Ўчириш')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
