import {
  useCreatePrecriptionTemplateMutation,
  useDeletePrecriptionTemplateMutation,
  useGetAllPrecriptionTemplateQuery,
  useUpdatePrecriptionTemplateMutation,
} from '@/app/api/prescriptionTemplateApi/prescriptionTemplateApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { usePermission } from '@/hooks/usePermission';
import { Plus, Search } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import MedicationTemplateDialogs from './components/MedicationTemplateDialogs';
import MedicationTemplatesPagination from './components/MedicationTemplatesPagination';
import MedicationTemplatesTable from './components/MedicationTemplatesTable';
import { useMedicationOptions } from './hooks/useMedicationOptions';
import type { TemplateItem } from './medicationTemplateTypes';

const INITIAL_TEMPLATE_ITEM: TemplateItem = {
  medication_id: '',
  addons: '',
  frequency: 1,
  duration: 1,
  instructions: '',
};

export default function MedicationTemplates() {
  const { t } = useTranslation('templates');
  const { canCreate, canUpdate, canDelete } = usePermission('templates');
  const handleRequest = useHandleRequest();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);

  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<
    string | null
  >(null);

  const [templateName, setTemplateName] = React.useState('');
  const [templateItems, setTemplateItems] = React.useState<TemplateItem[]>([
    INITIAL_TEMPLATE_ITEM,
  ]);

  const {
    medicationSearch,
    setMedicationSearch,
    allMedications,
    isMedicationsLoading,
    hasMoreMedications,
    onMedicationListScroll,
    mergeTemplateMedications,
    ensureDefaultMedicationPage,
  } = useMedicationOptions();

  const {
    data: templatesData,
    isLoading,
    refetch,
  } = useGetAllPrecriptionTemplateQuery({
    page,
    limit: 20,
    ...(searchTerm && { search: searchTerm }),
  });

  const [createTemplate] = useCreatePrecriptionTemplateMutation();
  const [updateTemplate] = useUpdatePrecriptionTemplateMutation();
  const [deleteTemplate] = useDeletePrecriptionTemplateMutation();

  const resetForm = React.useCallback(() => {
    setTemplateName('');
    setTemplateItems([INITIAL_TEMPLATE_ITEM]);
    setSelectedTemplateId(null);
  }, []);

  const handleCloseAndReset = React.useCallback(() => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsViewOpen(false);
    resetForm();
  }, [resetForm]);

  const validateForm = () => {
    if (!templateName.trim()) {
      toast.error(t('errors.nameRequired', 'Шаблон номи киритилиши керак'));
      return null;
    }

    const validItems = templateItems.filter((item) => item.medication_id);
    if (validItems.length === 0) {
      toast.error(t('errors.itemsRequired', 'Камида битта дори танланиши керак'));
      return null;
    }

    return validItems;
  };

  const handleCreate = async () => {
    const validItems = validateForm();
    if (!validItems) return;

    await handleRequest({
      request: async () =>
        createTemplate({
          name: templateName,
          items: validItems,
        }),
      onSuccess: () => {
        toast.success(t('success.created', 'Шаблон яратилди'));
        handleCloseAndReset();
        refetch();
      },
    });
  };

  const handleEdit = async () => {
    if (!selectedTemplateId) return;

    const validItems = validateForm();
    if (!validItems) return;

    await handleRequest({
      request: async () =>
        updateTemplate({
          id: selectedTemplateId,
          body: {
            name: templateName,
            items: validItems,
          },
        }),
      onSuccess: () => {
        toast.success(t('success.updated', 'Шаблон янгиланди'));
        handleCloseAndReset();
        refetch();
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    await handleRequest({
      request: async () => deleteTemplate(deleteId),
      onSuccess: () => {
        toast.success(t('success.deleted', 'Шаблон ўчирилди'));
        setIsDeleteOpen(false);
        setDeleteId(null);
        refetch();
      },
    });
  };

  const mapTemplateToForm = (template: GetResponse) => {
    setSelectedTemplateId(template._id);
    setTemplateName(template.name);
    setTemplateItems(
      template.items.map((item) => ({
        medication_id: item.medication_id?._id || '',
        addons: item.addons,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
      }))
    );
  };

  const openCreateDialog = async () => {
    resetForm();
    await ensureDefaultMedicationPage();
    setIsCreateOpen(true);
  };

  const openEditDialog = async (template: GetResponse) => {
    await ensureDefaultMedicationPage();
    mergeTemplateMedications(template);
    mapTemplateToForm(template);
    setIsEditOpen(true);
  };

  const openViewDialog = async (template: GetResponse) => {
    await ensureDefaultMedicationPage();
    mergeTemplateMedications(template);
    mapTemplateToForm(template);
    setIsViewOpen(true);
  };

  const addItem = () => {
    setTemplateItems((prev) => [...prev, INITIAL_TEMPLATE_ITEM]);
  };

  const removeItem = (index: number) => {
    setTemplateItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateItem = (
    index: number,
    field: keyof TemplateItem,
    value: string | number
  ) => {
    setTemplateItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const templates = templatesData?.data ?? [];

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={t('placeholders.search', 'Шаблон қидириш...')}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            className='pl-9'
          />
        </div>

        {canCreate && (
          <Button onClick={() => void openCreateDialog()}>
            <Plus className='h-4 w-4 mr-2' />
            {t('buttons.create', 'Янги шаблон')}
          </Button>
        )}
      </div>

      <MedicationTemplatesTable
        t={t}
        isLoading={isLoading}
        templates={templates}
        canUpdate={canUpdate}
        canDelete={canDelete}
        onView={(template) => void openViewDialog(template)}
        onEdit={(template) => void openEditDialog(template)}
        onDelete={(templateId) => {
          setDeleteId(templateId);
          setIsDeleteOpen(true);
        }}
      />

      <MedicationTemplatesPagination
        page={page}
        totalPages={templatesData?.totalPages || 0}
        onPageChange={setPage}
      />

      <MedicationTemplateDialogs
        t={t}
        templateName={templateName}
        templateItems={templateItems}
        medicationSearch={medicationSearch}
        allMedications={allMedications}
        isMedicationsLoading={isMedicationsLoading}
        hasMoreMedications={hasMoreMedications}
        isCreateOpen={isCreateOpen}
        isEditOpen={isEditOpen}
        isViewOpen={isViewOpen}
        isDeleteOpen={isDeleteOpen}
        onCreateOpenChange={(open) => {
          setIsCreateOpen(open);
          resetForm();
        }}
        onEditOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) resetForm();
        }}
        onViewOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) resetForm();
        }}
        onDeleteOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteId(null);
        }}
        onTemplateNameChange={setTemplateName}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
        onMedicationSearchChange={setMedicationSearch}
        onMedicationListScroll={onMedicationListScroll}
        onCreate={() => void handleCreate()}
        onEdit={() => void handleEdit()}
        onDelete={() => void handleDelete()}
        onCloseAndReset={handleCloseAndReset}
        onDeleteCancel={() => {
          setIsDeleteOpen(false);
          setDeleteId(null);
        }}
      />
    </div>
  );
}
