import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { useState } from 'react';

interface FormState {
  code: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  requirements: string[];
}

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: ServiceData | null;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ServiceFormDialog({
  open,
  onOpenChange,
  editingService,
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  isLoading,
}: ServiceFormDialogProps) {
  const [requirementInput, setRequirementInput] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue =
      value === '' ? 0 : parseFloat(value.replace(/^0+(?=\d)/, '')) || 0;
    setForm((prev) => ({ ...prev, [name]: numValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAddRequirement = (value: string) => {
    if (!value.trim()) return;

    if (form.requirements.includes(value.trim())) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <p className='text-red-500 text-sm mt-1'>{errors.description}</p>
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
                value={form.duration_minutes === 0 ? '' : form.duration_minutes}
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
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Бекор қилиш
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className='bg-blue-600 text-white'
          >
            {isLoading ? 'Сақланмоқда...' : 'Сақлаш'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
