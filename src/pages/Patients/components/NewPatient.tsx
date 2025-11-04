import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const passportSeriesRegex = /^[A-Z]{2}$/;
const passportNumberRegex = /^\d{7}$/;

const patientSchema = z.object({
  lastName: z
    .string()
    .min(2, 'Фамилия камида 2 та ҳарфдан иборат бўлиши керак')
    .max(50, 'Фамилия жуда узун'),
  firstName: z
    .string()
    .min(2, 'Исм камида 2 та ҳарфдан иборат бўлиши керак')
    .max(50, 'Исм жуда узун'),
  middleName: z.string().max(50, 'Отасининг исми жуда узун').optional(),
  birthDate: z.date({ required_error: 'Туғилган санани танланг' }),
  gender: z.enum(['male', 'female'], { required_error: 'Жинсни танланг' }),
  phone: z
    .string()
    .regex(phoneRegex, 'Телефон рақами нотўғри форматда (+998 XX XXX XX XX)'),
  email: z
    .string()
    .email('Email нотўғри форматда')
    .optional()
    .or(z.literal('')),
  address: z.string().min(5, 'Манзил камида 5 та белгидан иборат бўлиши керак'),
  allergies: z.array(z.string()).optional().default([]),

  regularMedications: z
    .array(
      z.object({
        medicine: z.string().min(1, 'Дори номи киритилиши керак'),
        schedule: z.string().min(1, 'Қабул вақти киритилиши керак'),
      })
    )
    .optional()
    .default([]),

  passportSeries: z
    .string()
    .regex(passportSeriesRegex, 'Серия 2 та катта ҳарфдан иборат (AA)')
    .optional()
    .or(z.literal('')),
  passportNumber: z
    .string()
    .regex(passportNumberRegex, 'Рақам 7 та рақамдан иборат')
    .optional()
    .or(z.literal('')),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface NewPatientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewPatient = ({ open, onOpenChange }: NewPatientProps) => {
  const [medicineInput, setMedicineInput] = useState('');
  const [scheduleInput, setScheduleInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      lastName: 'Aliyev',
      firstName: 'Vali',
      middleName: 'Soliyevich',
      gender: 'male',
      birthDate: new Date('1990-01-01'),
      passportSeries: 'AB',
      passportNumber: '1234567',
      phone: '+998912345678',
      email: 'info@artikmuratov.uz',
      address: "Palonchayev Pismadoin ko'chasi 4053-uy",
      allergies: ['Пенициллин', 'Аспирин'],
      regularMedications: [{medicine:"nimadur",schedule:"qachondir"}],
    },
  });

  const onSubmit = (data: PatientFormData) => {
    const submitData = {
      ...data,
      birthDate: format(data.birthDate, 'yyyy-MM-dd'),
      fullName: `${data.lastName} ${data.firstName} ${
        data.middleName || ''
      }`.trim(),
    };
    console.log('Толиқ JSON:', submitData);

    toast.success('Бемор маълумотлари муваффақиятли сақланди!', {
      description: `${submitData.fullName} тизимга қўшилди`,
    });

    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[75vh] p-0 border-2 border-primary/30'>
        <DialogHeader className='p-4 sm:p-6 pb-0'>
          <DialogTitle className='text-xl sm:text-2xl'>
            Янги Бемор Қўшиш
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[calc(75vh-120px)] px-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 pb-4 px-2'
            >
              {/* Personal Information */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Шахсий маълумотлар
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='lastName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Фамилия <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Алиев'
                            className='border-slate-400 border-2'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='firstName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Исм <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Жасур'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='middleName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Отасининг исми</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Абдуллаевич'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='birthDate'
                    render={({ field }) => (
                      <FormItem className='space-y-2'>
                        <FormLabel>
                          Туғилган сана <span className='text-red-500'>*</span>
                        </FormLabel>
                        <div className='flex gap-2'>
                          <FormControl>
                            <Input
                              className='border-slate-400 border-2 flex-1'
                              placeholder='КК.ОО.ЙЙЙЙ (01.01.1990)'
                              value={
                                dateInput ||
                                (field.value
                                  ? format(field.value, 'dd.MM.yyyy')
                                  : '')
                              }
                              onChange={(e) => {
                                let value = e.target.value.replace(
                                  /[^\d.]/g,
                                  ''
                                );

                                // If empty, clear the field and date
                                if (value === '') {
                                  setDateInput('');
                                  field.onChange(undefined);
                                  return;
                                }

                                // Remove extra dots
                                const parts = value.split('.');
                                if (parts.length > 3) {
                                  value = parts.slice(0, 3).join('.');
                                }

                                // Auto format: DD.MM.YYYY
                                const digitsOnly = value.replace(/\./g, '');
                                let formatted = '';

                                if (digitsOnly.length > 0) {
                                  formatted = digitsOnly.slice(0, 2);
                                  if (digitsOnly.length >= 3) {
                                    formatted += '.' + digitsOnly.slice(2, 4);
                                  }
                                  if (digitsOnly.length >= 5) {
                                    formatted += '.' + digitsOnly.slice(4, 8);
                                  }
                                }

                                setDateInput(formatted);

                                // Parse complete date
                                if (formatted.length === 10) {
                                  const [day, month, year] =
                                    formatted.split('.');
                                  const dayNum = parseInt(day);
                                  const monthNum = parseInt(month);
                                  const yearNum = parseInt(year);

                                  if (
                                    dayNum >= 1 &&
                                    dayNum <= 31 &&
                                    monthNum >= 1 &&
                                    monthNum <= 12 &&
                                    yearNum >= 1900 &&
                                    yearNum <= new Date().getFullYear()
                                  ) {
                                    const date = new Date(
                                      yearNum,
                                      monthNum - 1,
                                      dayNum
                                    );
                                    if (date.getDate() === dayNum) {
                                      field.onChange(date);
                                    }
                                  }
                                } else {
                                  // Clear field if not complete date
                                  field.onChange(undefined);
                                }
                              }}
                              maxLength={10}
                            />
                          </FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type='button'
                                variant='outline'
                                size='icon'
                                className='border-2 border-slate-400'
                              >
                                <CalendarIcon className='h-4 w-4' />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className='w-auto p-0'
                              align='start'
                            >
                              <Calendar
                                mode='single'
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  if (date) {
                                    setDateInput(format(date, 'dd.MM.yyyy'));
                                  }
                                }}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='gender'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Жинси <span className='text-red-500'>*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='border-2 border-slate-400'>
                              <SelectValue placeholder='Жинсни танланг' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='male'>Эркак</SelectItem>
                            <SelectItem value='female'>Аёл</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 sm:grid-cols-5 gap-4'>
                      <FormField
                        control={form.control}
                        name='passportSeries'
                        render={({ field }) => (
                          <FormItem className='col-span-2'>
                            <FormLabel>Серияси</FormLabel>
                            <FormControl>
                              <Input
                                className='border-slate-400 border-2'
                                placeholder='AA'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='passportNumber'
                        render={({ field }) => (
                          <FormItem className='col-span-3'>
                            <FormLabel>Паспорт рақами</FormLabel>
                            <FormControl>
                              <Input
                                className='border-slate-400 border-2'
                                placeholder='1234567'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Алоқа маълумотлари
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Телефон <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='+998 90 123 45 67'
                            value={
                              field.value
                                ? field.value.replace(
                                    /(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/,
                                    '$1 $2 $3 $4 $5'
                                  )
                                : ''
                            }
                            onFocus={(e) => {
                              if (!field.value || field.value === '') {
                                field.onChange('+998');
                              }
                            }}
                            onChange={(e) => {
                              let value = e.target.value;

                              // Faqat +998 va raqamlarni qoldirish
                              value = value.replace(/[^\d+]/g, '');

                              // Agar +998 bilan boshlanmasa, uni qo'shish
                              if (!value.startsWith('+998')) {
                                value = '+998';
                              }

                              // Maksimal 9 ta raqam (+998 dan keyin)
                              if (value.length > 13) {
                                value = value.slice(0, 13);
                              }

                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='email@example.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='address'
                    render={({ field }) => (
                      <FormItem className='sm:col-span-2'>
                        <FormLabel>
                          Манзил <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Кўча номи, уй рақами'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Insurance and Documents */}

              {/* Medical Information */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Тиббий маълумотлар
                </h3>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='allergies'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Аллергия</FormLabel>
                        <FormControl>
                          <div className='space-y-3'>
                            {field.value && field.value.length > 0 && (
                              <div className='flex flex-wrap gap-2 p-3 border-2 border-slate-400 rounded-md bg-slate-50'>
                                {field.value.map((allergy, index) => (
                                  <Badge
                                    key={index}
                                    variant='secondary'
                                    className='px-3 py-1.5 text-sm flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                  >
                                    {allergy}
                                    <button
                                      type='button'
                                      onClick={() => {
                                        const newAllergies =
                                          field.value?.filter(
                                            (_, i) => i !== index
                                          );
                                        field.onChange(newAllergies);
                                      }}
                                      className='hover:text-red-900 transition-colors'
                                    >
                                      <X className='w-3 h-3' />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className='flex gap-2'>
                              <Input
                                className='border-slate-400 border-2'
                                placeholder='Аллергия номи (масалан: Пенициллин)'
                                value={allergyInput}
                                onChange={(e) =>
                                  setAllergyInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (allergyInput.trim()) {
                                      const currentAllergies =
                                        field.value || [];
                                      field.onChange([
                                        ...currentAllergies,
                                        allergyInput.trim(),
                                      ]);
                                      setAllergyInput('');
                                    }
                                  }
                                }}
                              />
                              <Button
                                type='button'
                                size='icon'
                                variant='outline'
                                className='border-slate-400 border-2'
                                onClick={() => {
                                  if (allergyInput.trim()) {
                                    const currentAllergies = field.value || [];
                                    field.onChange([
                                      ...currentAllergies,
                                      allergyInput.trim(),
                                    ]);
                                    setAllergyInput('');
                                  }
                                }}
                              >
                                <Plus className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='regularMedications'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ҳозирги дорилар</FormLabel>
                        <FormControl>
                          <div className='space-y-3'>
                            {field.value && field.value.length > 0 && (
                              <div className='flex flex-wrap gap-2 p-3 border-2 border-slate-400 rounded-md bg-slate-50'>
                                {field.value.map((medication, index) => (
                                  <Badge
                                    key={index}
                                    variant='secondary'
                                    className='px-3 py-2 min-w-28 text-sm flex items-center justify-between gap-2 bg-primary/20 hover:bg-primary/20 text-primary border border-primary/30'
                                  >
                                    <div className='flex flex-col items-start'>
                                      <span className='font-semibold'>
                                        {medication.medicine}
                                      </span>
                                      <span className='text-xs text-muted-foreground'>
                                        {medication.schedule}
                                      </span>
                                    </div>
                                    <button
                                      type='button'
                                      onClick={() => {
                                        const newMeds = field.value?.filter(
                                          (_, i) => i !== index
                                        );
                                        field.onChange(newMeds);
                                      }}
                                      className='hover:text-destructive transition-colors ml-2'
                                    >
                                      <X className='w-5 h-5' />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className='grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-2'>
                              <Input
                                className='border-slate-400 border-2'
                                placeholder='Дори номи (масалан: Аспирин)'
                                value={medicineInput}
                                onChange={(e) =>
                                  setMedicineInput(e.target.value)
                                }
                              />
                              <Input
                                className='border-slate-400 border-2'
                                placeholder='Қабул вақти (масалан: Кунига 2 марта)'
                                value={scheduleInput}
                                onChange={(e) =>
                                  setScheduleInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (
                                      medicineInput.trim() &&
                                      scheduleInput.trim()
                                    ) {
                                      const currentMeds = field.value || [];
                                      field.onChange([
                                        ...currentMeds,
                                        {
                                          medicine: medicineInput.trim(),
                                          schedule: scheduleInput.trim(),
                                        },
                                      ]);
                                      setMedicineInput('');
                                      setScheduleInput('');
                                    }
                                  }
                                }}
                              />
                              <Button
                                type='button'
                                size='icon'
                                variant='outline'
                                className='border-slate-400 border-2'
                                onClick={() => {
                                  if (
                                    medicineInput.trim() &&
                                    scheduleInput.trim()
                                  ) {
                                    const currentMeds = field.value || [];
                                    field.onChange([
                                      ...currentMeds,
                                      {
                                        medicine: medicineInput.trim(),
                                        schedule: scheduleInput.trim(),
                                      },
                                    ]);
                                    setMedicineInput('');
                                    setScheduleInput('');
                                  }
                                }}
                              >
                                <Plus className='w-4 h-4' />
                              </Button>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className='p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            className='w-full sm:w-auto order-2 sm:order-1'
          >
            Бекор қилиш
          </Button>
          <Button
            type='submit'
            onClick={form.handleSubmit(onSubmit)}
            className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
          >
            <Save className='w-4 h-4 mr-2' />
            Сақлаш
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPatient;
