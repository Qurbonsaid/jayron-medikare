import {
  useCreateAnalysisParameterMutation,
  useGetDiagnosticByIdQuery,
  useUpdateAnalysisParameterMutation,
} from '@/app/api/diagnostic/diagnosticApi';
import {
  AnalysisParamCreateRequest,
  AnalysisParameter,
} from '@/app/api/diagnostic/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest';
import { useRouteActions } from '@/hooks/RBS';
import { addParameterSchema } from '@/validation/validationAddDiagnostic';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface FormState {
  parameter_code: string;
  parameter_name: string;
  unit: string;
  description: string;
  male: { min: string; max: string; value: string };
  female: { min: string; max: string; value: string };
  general: { min: string; max: string; value: string };
  value_type: 'NUMBER' | 'STRING';
  gender_type: 'GENERAL' | 'MALE_FEMALE';
}

export default function AnalysisParamsModal() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetDiagnosticByIdQuery(id!);
  const { canCreate, canUpdate, canDelete } =
    useRouteActions('/analysisById/:id');
  const [params, setParams] = useState<AnalysisParameter[]>([]);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingParam, setEditingParam] = useState<AnalysisParameter | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    parameter_code: '',
    parameter_name: '',
    unit: '',
    description: '',
    male: { min: '', max: '', value: '' },
    female: { min: '', max: '', value: '' },
    general: { min: '', max: '', value: '' },
    value_type: 'NUMBER',
    gender_type: 'MALE_FEMALE',
  });

  const [createParameter, { isLoading: creating }] =
    useCreateAnalysisParameterMutation();
  const [updateParameter, { isLoading: updating }] =
    useUpdateAnalysisParameterMutation();
  const handleRequest = useHandleRequest();

  useEffect(() => {
    if (data?.data?.analysis_parameters) {
      setParams(data.data.analysis_parameters);
    }
  }, [data]);

  const handleDelete = (id: string) => {
    setParams((prev) => prev.filter((p) => p._id !== id));
    toast.success('Parametr o‘chirildi');
    setDeleteId(null);
  };

  const getDisabledState = (range) => {
    const hasValue = range.value?.trim() !== '';
    const hasNumber = range.min?.trim() !== '' || range.max?.trim() !== '';

    return {
      disableMinMax: hasValue, // min/max disable bo'ladigan holat
      disableValue: hasNumber, // value disable bo'ladigan holat
    };
  };

  const maleDisabled = getDisabledState(form.male);
  const femaleDisabled = getDisabledState(form.female);
  const generalDisabled = getDisabledState(form.general);

  const disableMinMaxForBoth =
    maleDisabled.disableMinMax || femaleDisabled.disableMinMax;

  const disableValueForBoth =
    maleDisabled.disableValue || femaleDisabled.disableValue;

  const disableMinMaxForBothGeneral = generalDisabled.disableMinMax;

  const disableValueForBothGeneral = generalDisabled.disableValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 1. Normal range validatsiyasi
  const validateNormalRangeRealtime = (form: FormState) => {
    if (form.gender_type === 'MALE_FEMALE') {
      const maleFilled =
        form.male.min.trim() !== '' ||
        form.male.max.trim() !== '' ||
        form.male.value.trim() !== '';
      const femaleFilled =
        form.female.min.trim() !== '' ||
        form.female.max.trim() !== '' ||
        form.female.value.trim() !== '';

      if (!maleFilled && !femaleFilled) {
        return 'Erkak yoki Ayol qiymatidan kamida bittasi to‘ldirilishi kerak';
      }
    }

    if (form.gender_type === 'GENERAL') {
      const generalFilled =
        form.general.min.trim() !== '' ||
        form.general.max.trim() !== '' ||
        form.general.value.trim() !== '';

      if (!generalFilled) {
        return 'Umumiy qiymatdan kamida bittasi to‘ldirilishi kerak';
      }
    }

    return null;
  };

  const validateMaleFemale = () => {
    const maleFilled = form.male.min || form.male.max;
    const femaleFilled = form.female.min || form.female.max;
    const mfStringFilled = form.male.value || form.female.value;

    // Agar bittasi boshlangan bo‘lsa → hammasi shart bo‘ladi
    if (maleFilled || femaleFilled) {
      if (
        !form.male.min ||
        !form.male.max ||
        !form.female.min ||
        !form.female.max
      ) {
        setErrors((prev) => ({
          ...prev,
          normal_range: 'Iltimos, barcha Min va Max maydonlarini to‘ldiring!',
        }));
        return false;
      }
    } else if (mfStringFilled) {
      if (!form.male.value || !form.female.value) {
        setErrors((prev) => ({
          ...prev,
          normal_range: 'Iltimos, barcha qiymat  maydonlarini to‘ldiring!',
        }));
        return false;
      }
    }

    // Xatoni o‘chirib qo‘yish
    setErrors((prev) => ({ ...prev, normal_range: '' }));
    return true;
  };

  const handleNormalChange = (
    type: 'male' | 'female' | 'general',
    key: 'min' | 'max' | 'value',
    value: string
  ) => {
    setForm((prev) => {
      const updated = { ...prev[type], [key]: value };

      let newValueType = prev.value_type;

      if (key === 'value' && value.trim() !== '') {
        updated.min = '';
        updated.max = '';
        newValueType = 'STRING';
      } else if ((key === 'min' || key === 'max') && value.trim() !== '') {
        updated.value = '';
        newValueType = 'NUMBER';
      }

      const newForm = { ...prev, [type]: updated, value_type: newValueType };

      // Validatsiyani darhol tekshirish
      const validationError = validateNormalRangeRealtime(newForm);
      setErrors((prevErrors) => ({
        ...prevErrors,
        normal_range: validationError || '',
      }));

      return newForm;
    });
  };

  const handleGenderTypeChange = (type: 'GENERAL' | 'MALE_FEMALE') => {
    setForm((prev) => ({ ...prev, gender_type: type }));
  };

  const buildRange = (range: { min: string; max: string; value: string }) => {
    if (range.value.trim() !== '')
      return { min: 0, max: 0, value: range.value };
    return {
      min: Number(range.min) || 0,
      max: Number(range.max) || 0,
      value: '',
    };
  };

  const openEdit = (param: AnalysisParameter) => {
    setEditingParam(null);
    setForm({
      parameter_code: param.parameter_code,
      parameter_name: param.parameter_name,
      unit: param.unit,
      description: param.description,
      value_type: param.value_type as 'NUMBER' | 'STRING',
      gender_type: param.gender_type as 'GENERAL' | 'MALE_FEMALE',
      male: {
        min: String(param.normal_range.male.min),
        max: String(param.normal_range.male.max),
        value: param.normal_range.male.value,
      },
      female: {
        min: String(param.normal_range.female.min),
        max: String(param.normal_range.female.max),
        value: param.normal_range.female.value,
      },
      general: {
        min: String(param.normal_range.general.min),
        max: String(param.normal_range.general.max),
        value: param.normal_range.general.value,
      },
    });
    setEditingParam(param);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!id) return;
    setErrors({});

    if (form.gender_type === 'MALE_FEMALE') {
      if (!validateMaleFemale()) return; // ❗ VALIDATSIYA SHU YERDA
    }

    if (form.general.min && !form.general.max) {
      setErrors((prev) => ({
        ...prev,
        normal_range: 'Iltimos, Max qiymatni ham to‘ldiring!',
      }));
      return; // ❗ So'rov ketmaydi
    }

    if (form.general.max && !form.general.min) {
      setErrors((prev) => ({
        ...prev,
        normal_range: 'Iltimos, Min qiymatni ham to‘ldiring!',
      }));
      return; // ❗ So'rov ketmaydi
    }

    let generalRange = { min: 0, max: 0, value: '' };

    if (form.gender_type === 'GENERAL') {
      generalRange = buildRange(form.general);
    }

    const payload: AnalysisParamCreateRequest = {
      analysis_id: id,
      parameter_code: form.parameter_code,
      parameter_name: form.parameter_name,
      unit: form.unit,
      description: form.description,
      normal_range: {
        male: buildRange(form.male),
        female: buildRange(form.female),
        general: generalRange,
      },
      value_type: form.value_type,
      gender_type: form.gender_type,
    };

    await handleRequest({
      request: () =>
        editingParam
          ? updateParameter({ id: editingParam._id, data: payload })
          : createParameter(payload),
      onSuccess: (result) => {
        // Backend'dan kelgan yangi parameter
        const newParam = result?.data?.data || result?.data;

        if (editingParam) {
          setParams((prev) =>
            prev.map((p) =>
              p._id === editingParam._id
                ? newParam || {
                    ...p,
                    ...payload,
                    normal_range: payload.normal_range,
                  }
                : p
            )
          );
          toast.success('Parametr muvaffaqiyatli yangilandi 🎉');
        } else {
          // Backend'dan kelgan to'liq data
          if (newParam && newParam._id) {
            setParams((prev) => [...prev, newParam]);
          } else {
            // Fallback
            setParams((prev) => [
              ...prev,
              { ...payload, _id: Date.now().toString() } as AnalysisParameter,
            ]);
          }
          toast.success("Parametr muvaffaqiyatli qo'shildi 🎉");
        }

        setOpen(false);
        setEditingParam(null);
        setForm({
          parameter_code: '',
          parameter_name: '',
          unit: '',
          description: '',
          male: { min: '', max: '', value: '' },
          female: { min: '', max: '', value: '' },
          general: { min: '', max: '', value: '' },
          value_type: 'NUMBER',
          gender_type: 'MALE_FEMALE',
        });
      },
      onError: (err) => {
        toast.error(err?.data?.error?.msg);
      },
    });
  };

  const maleHasAny =
    form.male.min.trim() !== '' ||
    form.male.max.trim() !== '' ||
    form.male.value.trim() !== '';

  const femaleHasAny =
    form.female.min.trim() !== '' ||
    form.female.max.trim() !== '' ||
    form.female.value.trim() !== '';

  const isGeneralDisabled = maleHasAny || femaleHasAny;

  const generalHasAny =
    form.general.min.trim() !== '' ||
    form.general.max.trim() !== '' ||
    form.general.value.trim() !== '';

  const isMaleFemaleDisabled = generalHasAny;

  const onSaveParameter = () => {
    const validationError = validateNormalRange(form);
    if (validationError) {
      // Toast o'rniga input ostiga chiqarish
      setErrors((prev) => ({ ...prev, normal_range: validationError }));
      return;
    }

    const result = addParameterSchema().safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0]] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    handleSubmit();
  };

  const validateNormalRange = (form: FormState) => {
    if (form.gender_type === 'MALE_FEMALE') {
      const maleFilled =
        form.male.min.trim() !== '' ||
        form.male.max.trim() !== '' ||
        form.male.value.trim() !== '';
      const femaleFilled =
        form.female.min.trim() !== '' ||
        form.female.max.trim() !== '' ||
        form.female.value.trim() !== '';

      if (!maleFilled && !femaleFilled) {
        return 'Erkak yoki Ayol qiymatidan kamida bittasi to‘ldirilishi kerak';
      }
    }

    if (form.gender_type === 'GENERAL') {
      const generalFilled =
        form.general.min.trim() !== '' ||
        form.general.max.trim() !== '' ||
        form.general.value.trim() !== '';

      if (!generalFilled) {
        return 'Umumiy qiymatdan kamida bittasi to‘ldirilishi kerak';
      }
    }

    return null;
  };

  useEffect(() => {
    if (data?.data) {
      console.log('getById data:', data.data);
      setParams(data.data.analysis_parameters);
    }
  }, [data]);

  if (isLoading) return <p className='p-4'>Yuklanmoqda...</p>;
  if (isError || !data)
    return <p className='p-4 text-red-500'>Xatolik yuz berdi!</p>;

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      <header className='bg-card border-b sticky top-0 z-10'>
        <div className='w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div className='min-w-0'>
              <h1 className='text-lg sm:text-xl font-bold truncate'>
                {data.data.code}
              </h1>
              <p className='text-xs sm:text-sm text-muted-foreground truncate'>
                {data.data.name}
              </p>
            </div>
          </div>
          {canCreate ? (
            <Button
              className='bg-blue-600 hover:bg-blue-700 text-white'
              onClick={() => {
                setEditingParam(null);
                setForm({
                  parameter_code: '',
                  parameter_name: '',
                  unit: '',
                  description: '',
                  male: { min: '', max: '', value: '' },
                  female: { min: '', max: '', value: '' },
                  general: { min: '', max: '', value: '' },
                  value_type: 'NUMBER',
                  gender_type: 'MALE_FEMALE',
                });
                setOpen(true);
              }}
            >
              + Parametr qo‘shish
            </Button>
          ) : (
            ''
          )}
        </div>
      </header>

      {/* Mobile Card View */}
      <div className='p-4 sm:p-6 block lg:hidden space-y-4'>
        {params.map((param, index) => {
          const { general, male, female } = param.normal_range;
          const isGeneral =
            general &&
            (general.value || general.min !== 0 || general.max !== 0);
          const display = isGeneral
            ? general.value
              ? general.value
              : `${general.min}-${general.max}`
            : `${male.value || `${male.min}-${male.max}`} / ${
                female.value || `${female.min}-${female.max}`
              }`;

          return (
            <Card
              key={param._id}
              className='rounded-2xl shadow-md border border-gray-100 overflow-hidden'
            >
              <div className='p-3 space-y-2'>
                {/* Header */}
                <div className='flex items-start justify-between'>
                  <div>
                    <h3 className='font-semibold text-base text-gray-900'>
                      {param.parameter_code}
                    </h3>
                    <p className='text-xs text-muted-foreground'>
                      Nomi:{' '}
                      <span className='font-medium'>
                        {param.parameter_name}
                      </span>
                    </p>
                  </div>
                  <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium'>
                    #{index + 1}
                  </span>
                </div>

                {/* Body info */}
                <div className='space-y-2 text-sm'>
                  <div className='flex  gap-3'>
                    <span className='text-muted-foreground'>Jinsi:</span>
                    <span className='font-medium'>
                      {isGeneral ? 'Umumiy' : 'Erkak / Ayol'}
                    </span>
                  </div>
                  <div className='flex  gap-3'>
                    <span className='text-muted-foreground'>Qiymat:</span>
                    <span className='font-medium text-blue-600'>{display}</span>
                  </div>
                  <div className='flex  gap-3'>
                    <span className='text-muted-foreground'>Birligi:</span>
                    <span className='font-medium'>{param.unit}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-1.5 pt-1'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1 flex items-center justify-center gap-1 text-[11px] py-1.5 h-7'
                    onClick={() => openEdit(param)}
                  >
                    <Edit size={12} />
                    Tahrirlash
                  </Button>

                  <Dialog
                    open={deleteId === param._id}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) setDeleteId(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='flex-1 flex items-center justify-center gap-1 text-red-600 border-red-300 hover:bg-red-50 text-[11px] py-1.5 h-7'
                        onClick={() => setDeleteId(param._id)}
                      >
                        <Trash2 size={12} />
                        O‘chirish
                      </Button>
                    </DialogTrigger>

                    <DialogContent className='max-w-xs rounded-xl'>
                      <DialogTitle className='text-sm'>
                        Parametr o‘chirish
                      </DialogTitle>
                      <p className='text-xs text-muted-foreground'>
                        Rostan ham ushbu parameterni o‘chirmoqchimisiz?
                      </p>
                      <DialogFooter className='flex justify-end gap-2 pt-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-7 text-xs'
                        >
                          Yo‘q
                        </Button>
                        <Button
                          size='sm'
                          className='bg-red-600 text-white h-7 text-xs'
                          onClick={() => handleDelete(param._id)}
                        >
                          Ha
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className='p-4 sm:p-6'>
        <Card className='card-shadow hidden lg:block'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-muted/50'>
                <tr>
                  {[
                    'ID',
                    'Parametr kodi',
                    'Parametr nomi',
                    'Jinsi',
                    'Qiymatlari',
                    'Birligi',
                    'Harakatlar',
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
                {params.map((param, index) => {
                  const { general, male, female } = param.normal_range;
                  const isGeneral =
                    general &&
                    (general.value || general.min !== 0 || general.max !== 0);
                  const display = isGeneral
                    ? general.value
                      ? general.value
                      : `${general.min}-${general.max}`
                    : `${male.value || `${male.min}-${male.max}`} / ${
                        female.value || `${female.min}-${female.max}`
                      }`;

                  return (
                    <tr
                      key={param._id}
                      className='hover:bg-accent/50 transition-smooth'
                    >
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
                        {index + 1}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4'>
                        <div className='font-medium text-sm xl:text-base'>
                          {param.parameter_code}
                        </div>
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                        {param.parameter_name}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                        {isGeneral ? 'Umumiy' : 'Erkak / Ayol'}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                        {display}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                        {param.unit}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4'>
                        <div className='flex justify-center gap-3'>
                          {canUpdate && (
                            <Button
                              size='icon'
                              variant='outline'
                              className='h-7 w-7'
                              onClick={() => openEdit(param)}
                            >
                              <Edit size={16} />
                            </Button>
                          )}

                          {/* Delete dialog */}
                          {canDelete && (
                            <Dialog
                              open={deleteId === param._id}
                              onOpenChange={(isOpen) => {
                                if (!isOpen) setDeleteId(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size='icon'
                                  variant='outline'
                                  className='h-7 w-7 text-red-500 border-red-300 hover:bg-red-50'
                                  onClick={() => setDeleteId(param._id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='max-w-xs rounded-xl'>
                                <DialogTitle>Parametr o‘chirish</DialogTitle>
                                <p className='text-sm text-muted-foreground'>
                                  Rostan ham ushbu parameterni
                                  o‘chirmoqchimisiz?
                                </p>
                                <DialogFooter className='flex justify-end gap-2'>
                                  <Button
                                    variant='outline'
                                    onClick={() => setDeleteId(null)}
                                  >
                                    Yo‘q
                                  </Button>
                                  <Button
                                    className='bg-red-600 text-white'
                                    onClick={() => handleDelete(param._id)}
                                  >
                                    Ha
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setErrors({});
          }
        }}
      >
        <DialogContent className='w-[95%] sm:max-w-lg mx-auto p-6 sm:p-8 rounded-xl overflow-y-auto max-h-[90vh]'>
          <DialogHeader>
            <DialogTitle>
              {editingParam
                ? 'Parametrni tahrirlash'
                : 'Yangi parametr qo‘shish'}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3'>
            <Label>Parametr kodi</Label>
            <Input
              name='parameter_code'
              value={form.parameter_code}
              onChange={handleChange}
              placeholder='Cod kiriting'
            />
            {errors.parameter_code && (
              <p className='text-red-500 text-sm'>{errors.parameter_code}</p>
            )}
            <Label>Parametr nomi</Label>
            <Input
              name='parameter_name'
              value={form.parameter_name}
              onChange={handleChange}
              placeholder='Nomini kiriting'
            />
            {errors.parameter_name && (
              <p className='text-red-500 text-sm'>{errors.parameter_name}</p>
            )}
            <Label>Parametr birligi</Label>
            <Input
              name='unit'
              value={form.unit}
              onChange={handleChange}
              placeholder='Birlikni kiriting'
            />
            {errors.unit && (
              <p className='text-red-500 text-sm'>{errors.unit}</p>
            )}
            <Label>Parametrga tavsif bering</Label>
            <Input
              name='description'
              value={form.description}
              onChange={handleChange}
              placeholder='Izoh qoldiring'
            />
            {errors.description && (
              <p className='text-red-500 text-sm'>{errors.description}</p>
            )}

            {/* Gender type radios — faqat create holatida */}
            {!editingParam && (
              <div className='flex gap-4'>
                <label className='flex items-center gap-1'>
                  <input
                    type='radio'
                    checked={form.gender_type === 'MALE_FEMALE'}
                    onChange={() => handleGenderTypeChange('MALE_FEMALE')}
                    disabled={isMaleFemaleDisabled}
                  />
                  Erkak/Ayol
                </label>
                <label className='flex items-center gap-1'>
                  <input
                    type='radio'
                    checked={form.gender_type === 'GENERAL'}
                    onChange={() => handleGenderTypeChange('GENERAL')}
                    disabled={isGeneralDisabled}
                  />
                  Umumiy
                </label>
              </div>
            )}

            {/* Inputs */}
            {form.gender_type === 'MALE_FEMALE' && (
              <>
                <Label>Erkak</Label>
                <div className='grid grid-cols-3 gap-2'>
                  <Input
                    disabled={disableMinMaxForBoth}
                    value={form.male.min}
                    placeholder='Min'
                    type='number'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNormalChange('male', 'min', e.target.value)
                    }
                  />

                  <Input
                    disabled={disableMinMaxForBoth}
                    value={form.male.max}
                    placeholder='Max'
                    type='number'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNormalChange('male', 'max', e.target.value)
                    }
                  />

                  <Input
                    disabled={disableValueForBoth}
                    value={form.male.value}
                    placeholder='Qiymat'
                    type='string'
                    onChange={(e) =>
                      handleNormalChange('male', 'value', e.target.value)
                    }
                  />
                </div>
                <Label>Ayol</Label>
                <div className='grid grid-cols-3 gap-2'>
                  <Input
                    disabled={disableMinMaxForBoth}
                    value={form.female.min}
                    placeholder='Min'
                    type='number'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNormalChange('female', 'min', e.target.value)
                    }
                  />

                  <Input
                    disabled={disableMinMaxForBoth}
                    value={form.female.max}
                    placeholder='Max'
                    type='number'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      handleNormalChange('female', 'max', e.target.value)
                    }
                  />

                  <Input
                    disabled={disableValueForBoth}
                    value={form.female.value}
                    placeholder='Qiymat'
                    type='string'
                    onChange={(e) =>
                      handleNormalChange('female', 'value', e.target.value)
                    }
                  />
                </div>
                {errors.normal_range && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.normal_range}
                  </p>
                )}
              </>
            )}

            {form.gender_type === 'GENERAL' && (
              <>
                <Label>Umumiy</Label>
                <div className='grid grid-cols-3 gap-2'>
                  <Input
                    type='number'
                    value={form.general.min}
                    disabled={disableMinMaxForBothGeneral}
                    onChange={(e) =>
                      handleNormalChange('general', 'min', e.target.value)
                    }
                    placeholder='Min'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />

                  <Input
                    type='number'
                    value={form.general.max}
                    disabled={disableMinMaxForBothGeneral}
                    onChange={(e) =>
                      handleNormalChange('general', 'max', e.target.value)
                    }
                    placeholder='Max'
                    onKeyDown={(e) => {
                      if (
                        e.key === ',' ||
                        e.key === 'e' ||
                        e.key === 'E' ||
                        e.key === '+' ||
                        e.key === '-'
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />

                  <Input
                    type='string'
                    value={form.general.value}
                    onChange={(e) =>
                      handleNormalChange('general', 'value', e.target.value)
                    }
                    disabled={disableValueForBothGeneral}
                    placeholder='Qiymat'
                  />
                </div>
                {errors.normal_range && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.normal_range}
                  </p>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setOpen(false);
                setErrors({});
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={onSaveParameter}
              disabled={creating || updating}
              className='bg-blue-600 text-white'
            >
              {creating || updating ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
