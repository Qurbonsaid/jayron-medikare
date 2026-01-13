import { useGetAllServiceQuery } from '@/app/api/serviceApi/serviceApi';
import {
  GetServiceResponse,
  ServiceTemplate,
} from '@/app/api/serviceTemplateApi';
import {
  useCreateServiceTemplateMutation,
  useDeleteServiceTemplateMutation,
  useGetAllServiceTemplateQuery,
  useUpdateServiceTemplateMutation,
} from '@/app/api/serviceTemplateApi/serviceTemplateApi';
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
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface ServiceTemplateItem {
  service_type_id: string;
}

export default function ServiceTemplates() {
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

  // Service search and pagination
  const [serviceSearch, setServiceSearch] = useState('');
  const [servicePage, setServicePage] = useState(1);
  const [allServices, setAllServices] = useState<any[]>([]);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateDuration, setTemplateDuration] = useState(7);
  const [templateItems, setTemplateItems] = useState<ServiceTemplateItem[]>([
    { service_type_id: '' },
  ]);

  // RTK Query hooks
  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useGetAllServiceTemplateQuery({
    page,
    limit: 20,
    ...(searchTerm && { search: searchTerm }),
  });

  const { data: servicesData, isLoading: isServicesLoading } =
    useGetAllServiceQuery({
      page: servicePage,
      limit: 20,
      is_active: true,
      ...(serviceSearch && { search: serviceSearch }),
    });

  // Update services list when data changes
  React.useEffect(() => {
    if (servicesData?.data) {
      if (servicePage === 1) {
        // Replace all services when it's first page or search changed
        setAllServices(servicesData.data);
      } else {
        // Append services for pagination
        setAllServices((prev) => [...prev, ...servicesData.data]);
      }
    }
  }, [servicesData, servicePage]);

  // Reset service page on search change (list will update from query)
  React.useEffect(() => {
    if (serviceSearch) {
      setServicePage(1);
    }
  }, [serviceSearch]);

  const [createTemplate] = useCreateServiceTemplateMutation();
  const [updateTemplate] = useUpdateServiceTemplateMutation();
  const [deleteTemplate] = useDeleteServiceTemplateMutation();

  const resetForm = () => {
    setTemplateName('');
    setTemplateDuration(7);
    setTemplateItems([{ service_type_id: '' }]);
    setSelectedTemplateId(null);
    // Don't reset service search and page to preserve loaded services
  };

  const handleCreate = async () => {
    if (!templateName.trim()) {
      toast.error(t('errors.nameRequired', 'Шаблон номи киритилиши керак'));
      return;
    }

    const validItems = templateItems.filter((item) => item.service_type_id);
    if (validItems.length === 0) {
      toast.error(
        t('errors.itemsRequired', 'Камида битта хизмат танланиши керак')
      );
      return;
    }

    await handleRequest({
      request: async () => {
        const templateData: ServiceTemplate = {
          name: templateName,
          duration: templateDuration,
          items: validItems,
        };
        const result = await createTemplate(templateData);
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

    const validItems = templateItems.filter((item) => item.service_type_id);
    if (validItems.length === 0) {
      toast.error(
        t('errors.itemsRequired', 'Камида битта хизмат танланиши керак')
      );
      return;
    }

    await handleRequest({
      request: async () => {
        const templateData: ServiceTemplate = {
          name: templateName,
          duration: templateDuration,
          items: validItems,
        };
        const result = await updateTemplate({
          id: selectedTemplateId,
          body: templateData,
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

  const openEditDialog = (template: GetServiceResponse) => {
    setSelectedTemplateId(template._id);
    setTemplateName(template.name);
    setTemplateDuration(template.duration);

    // Extract services from template and add to allServices
    const templateServices = template.items
      .map((item) => item.service_type_id)
      .filter((service) => service !== null)
      .map((service) => ({
        _id: service!._id,
        name: service!.name,
        code: '', // Backend doesn't return code in populate, but we can use name
        price: service!.price,
      }));

    // Merge with existing services, avoiding duplicates
    setAllServices((prev) => {
      const existingIds = new Set(prev.map((s) => s._id));
      const newServices = templateServices.filter(
        (service) => !existingIds.has(service._id)
      );
      return [...newServices, ...prev];
    });

    setTemplateItems(
      template.items.map((item) => ({
        service_type_id: item.service_type_id?._id || '',
      }))
    );
    setIsEditOpen(true);
  };

  const openViewDialog = (template: GetServiceResponse) => {
    setSelectedTemplateId(template._id);
    setTemplateName(template.name);
    setTemplateDuration(template.duration);

    // Extract services from template and add to allServices
    const templateServices = template.items
      .map((item) => item.service_type_id)
      .filter((service) => service !== null)
      .map((service) => ({
        _id: service!._id,
        name: service!.name,
        code: '', // Backend doesn't return code in populate, but we can use name
        price: service!.price,
      }));

    // Merge with existing services, avoiding duplicates
    setAllServices((prev) => {
      const existingIds = new Set(prev.map((s) => s._id));
      const newServices = templateServices.filter(
        (service) => !existingIds.has(service._id)
      );
      return [...newServices, ...prev];
    });

    setTemplateItems(
      template.items.map((item) => ({
        service_type_id: item.service_type_id?._id || '',
      }))
    );
    setIsViewOpen(true);
  };

  const addItem = () => {
    setTemplateItems([...templateItems, { service_type_id: '' }]);
  };

  const removeItem = (index: number) => {
    setTemplateItems(templateItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...templateItems];
    newItems[index] = { service_type_id: value };
    setTemplateItems(newItems);
  };

  const getServiceName = (id: string) => {
    const service = servicesData?.data?.find((s) => s._id === id);
    return service ? service.name : '-';
  };

  const renderForm = (readOnly = false) => (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

        <div className='space-y-2'>
          <Label htmlFor='duration'>
            {t('fields.duration', 'Давомийлиги (кун)')}
          </Label>
          <Input
            id='duration'
            type='number'
            min='1'
            value={templateDuration === 0 ? '' : templateDuration}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '') {
                setTemplateDuration(0);
                return;
              }
              // Prevent leading zeros and ensure minimum value of 1
              const numValue = Math.max(1, parseInt(value, 10) || 1);
              setTemplateDuration(numValue);
            }}
            placeholder={t('placeholders.duration', 'Давомийликни киритинг')}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Label>{t('fields.services', 'Хизматлар')}</Label>
          {!readOnly && (
            <Button type='button' variant='outline' size='sm' onClick={addItem}>
              <Plus className='h-4 w-4 mr-1' />
              {t('buttons.addService', 'Хизмат қўшиш')}
            </Button>
          )}
        </div>

        {templateItems.length > 0 && (
          <Card className='overflow-hidden'>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-12'>#</TableHead>
                    <TableHead className='min-w-[250px]'>
                      {t('fields.service', 'Хизмат')}
                    </TableHead>
                    {!readOnly && (
                      <TableHead className='w-20 text-center'>
                        {t('table.actions', 'Амаллар')}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className='font-medium'>{index + 1}</TableCell>
                      <TableCell>
                        <ComboBox
                          value={item.service_type_id}
                          onValueChange={(value) => updateItem(index, value)}
                          disabled={readOnly}
                          placeholder={t(
                            'placeholders.selectService',
                            'Хизмат танланг'
                          )}
                          searchPlaceholder={t(
                            'placeholders.searchService',
                            'Хизмат қидириш...'
                          )}
                          emptyText={t('noServices', 'Хизматлар топилмади')}
                          loadingText={t('loading', 'Юкланмоқда...')}
                          searchValue={serviceSearch}
                          onSearchChange={(value) => {
                            setServiceSearch(value);
                          }}
                          options={
                            allServices?.map((service) => ({
                              value: service._id,
                              label: service.name,
                              sublabel: service.code,
                            })) || []
                          }
                          isLoading={isServicesLoading}
                          hasMore={
                            servicesData
                              ? servicePage <
                                servicesData.pagination.total_pages
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
                              !isServicesLoading &&
                              servicesData &&
                              servicePage < servicesData.pagination.total_pages
                            ) {
                              setServicePage((prev) => prev + 1);
                            }
                          }}
                        />
                      </TableCell>
                      {!readOnly && (
                        <TableCell className='text-center'>
                          {templateItems.length > 1 && (
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
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
              <TableHead>{t('table.duration', 'Давомийлиги')}</TableHead>
              <TableHead>{t('table.itemsCount', 'Хизматлар сони')}</TableHead>
              <TableHead>{t('table.createdAt', 'Яратилган')}</TableHead>
              <TableHead className='text-right'>
                {t('table.actions', 'Амаллар')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='text-center py-8'>
                  {t('loading', 'Юкланмоқда...')}
                </TableCell>
              </TableRow>
            ) : templatesData?.data && templatesData.data.length > 0 ? (
              templatesData.data.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className='font-medium'>{template.name}</TableCell>
                  <TableCell>
                    {template.duration} {t('table.days', 'кун')}
                  </TableCell>
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
                <TableCell colSpan={5} className='text-center py-8'>
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
              {t('dialogs.create.description', 'Хизматлар шаблонини яратинг')}
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
