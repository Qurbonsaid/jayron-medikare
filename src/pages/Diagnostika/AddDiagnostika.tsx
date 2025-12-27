import {
  useCreateDiagnosticMutation,
  useDeleteDiagnosticMutation,
  useGetAllDiagnosticsQuery,
  useUpdateDiagnosticMutation,
} from '@/app/api/diagnostic/diagnosticApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { CreateAnalysisRequest } from '@/app/api/diagnostic/types';
import { usePermission } from '@/hooks/usePermission';
import { addDiagnosticSchema } from '@/validation/validationAddDiagnostic/validationAddDiagnostic';

export default function DiagnosticsPage() {
  const { t } = useTranslation('diagnostics');
  const { canCreate, canUpdate, canDelete } = usePermission('diagnostic');
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useGetAllDiagnosticsQuery();
  const [createDiagnostic, { isLoading: isCreating }] =
    useCreateDiagnosticMutation();
  const [updateDiagnostic, { isLoading: isUpdating }] =
    useUpdateDiagnosticMutation();
  const [deleteDiagnostic, { isLoading: isDeleting }] =
    useDeleteDiagnosticMutation();
  const handleRequest = useHandleRequest();

  // 🔍 Search filter
  const filtered = data?.data.filter(
    (item) =>
      item.code.toLowerCase().includes(searchCode.toLowerCase()) &&
      item.name.toLowerCase().includes(searchName.toLowerCase())
  );

  // 💾 Qo‘shish yoki Tahrirlash handler
  const handleSave = async () => {
    setErrors({}); // avvalgi xatolarni tozalaymiz

    const schema = addDiagnosticSchema();
    const result = schema.safeParse({
      code: newCode,
      name: newName,
      description: newDescription,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    const data = result.data; // ✅ faqat valid bo‘lgan holatda bu obyekt ishlatiladi

    if (editingId) {
      await handleRequest({
        request: async () =>
          updateDiagnostic({
            id: editingId,
            body: data as CreateAnalysisRequest, // ✅ result emas, data yuboramiz
          }).unwrap(),
        onSuccess: (res) => {
          toast.success(res.message);
          setIsDialogOpen(false);
          clearForm();
        },
        onError: (err) => {
          toast.error(err?.data?.error?.msg);
        },
      });
    } else {
      await handleRequest({
        request: async () =>
          createDiagnostic(data as CreateAnalysisRequest).unwrap(), // ✅ data yuboramiz
        onSuccess: (res) => {
          toast.success(res.message);
          setIsDialogOpen(false);
          clearForm();
        },
        onError: (err) => {
          toast.error(err?.data?.error?.msg);
        },
      });
    }
  };

  const clearForm = () => {
    setNewCode('');
    setNewName('');
    setNewDescription('');
    setEditingId(null);
  };

  const openEditDialog = (item: (typeof filtered)[0]) => {
    setEditingId(item._id);
    setNewCode(item.code);
    setNewName(item.name);
    setNewDescription(item.description);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await handleRequest({
      request: async () => deleteDiagnostic(deleteId).unwrap(),
      onSuccess: (res) => {
        toast.success(t('analysisDeletedSuccess'));
        setIsDeleteDialogOpen(false);
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  if (isLoading) return <p>{t('loading')}</p>;
  if (isError) return <p>{t('errorOccurred')}</p>;

  return (
    <div className='p-4 sm:p-6 space-y-6'>
      {/* HEADER */}
      <div className='flex flex-col sm:flex-row gap-3 sm:items-center justify-between'>
        <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
          <Input
            placeholder={t('searchByCode')}
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className='w-full sm:w-64'
          />

          <Input
            placeholder={t('searchByName')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className='w-full sm:w-64'
          />
        </div>
        {canCreate && (
          <Button
            className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'
            onClick={() => {
              setIsDialogOpen(true);
              clearForm();
            }}
          >
            <Plus size={18} /> {t('add')}
          </Button>
        )}
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setErrors({});
          }
        }}
      >
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('editAnalysis') : t('addNewAnalysis')}
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-3 mt-2'>
            <Label>{t('analysisCode')}</Label>
            <Input
              placeholder={t('enterCode')}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
            />
            {errors.code && (
              <p className='text-red-500 text-sm'>{errors.code}</p>
            )}

            <Label>{t('analysisName')}</Label>
            <Input
              placeholder={t('enterName')}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            {errors.name && (
              <p className='text-red-500 text-sm'>{errors.name}</p>
            )}

            <Label>{t('analysisDescription')}</Label>
            <Input
              placeholder={t('enterDescriptionOptional')}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            {errors.description && (
              <p className='text-red-500 text-sm'>{errors.description}</p>
            )}
          </div>
          <DialogFooter className='mt-4'>
            <Button
              variant='outline'
              onClick={() => {
                setIsDialogOpen(false);
                setErrors({});
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white '
              onClick={handleSave}
              disabled={isCreating || isUpdating}
            >
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogTitle>{t('deleteAnalysis')}</DialogTitle>
          <DialogDescription>
            {t('deleteAnalysisConfirm')}
          </DialogDescription>
          <DialogFooter className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                setIsDeleteDialogOpen(false);
              }}
            >
              {t('no')}
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {t('yesDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CARDS */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
        {filtered?.map((item) => (
          <Card
            key={item._id}
            className='rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 cursor-pointer'
            onClick={() => navigate(`/analysisById/${item._id}`)}
          >
            <CardContent className='p-5 flex items-start justify-between'>
              <div>
                <p className='text-sm text-gray-500 font-medium'>{item.name}</p>
                <h3 className='text-base sm:text-lg font-semibold text-gray-800'>
                  {item.code}
                </h3>
                <p className='text-xs text-gray-500 mt-1'>{item.description}</p>
                <p className='text-xs text-gray-400 mt-1'>
                  {t('parametersCount')}: {item.analysis_parameters?.length || 0}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                {canUpdate && (
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8'
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(item);
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8 text-red-500 border-red-300 hover:bg-red-50'
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(item._id);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* NO DATA */}
      {filtered?.length === 0 && (
        <p className='text-center text-gray-500 py-8'>
          {t('noAnalysisFound')}
        </p>
      )}
    </div>
  );
}
