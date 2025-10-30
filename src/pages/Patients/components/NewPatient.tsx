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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
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
  gender: z.enum(['Эркак', 'Аёл'], { required_error: 'Жинсни танланг' }),
  bloodType: z.string().optional(),
  phone: z
    .string()
    .regex(phoneRegex, 'Телефон рақами нотўғри форматда (+998 XX XXX XX XX)'),
  email: z
    .string()
    .email('Email нотўғри форматда')
    .optional()
    .or(z.literal('')),
  address: z.string().min(5, 'Манзил камида 5 та белгидан иборат бўлиши керак'),
  city: z
    .string()
    .min(2, 'Шаҳар номи камида 2 та ҳарфдан иборат бўлиши керак')
    .optional()
    .or(z.literal('')),
  region: z.string().optional(),
  zipCode: z
    .string()
    .regex(/^\d{6}$/, 'Почта индекси 6 та рақамдан иборат бўлиши керак')
    .optional()
    .or(z.literal('')),
  emergencyContactName: z
    .string()
    .min(3, 'ФИО камида 3 та белгидан иборат бўлиши керак')
    .optional()
    .or(z.literal('')),
  emergencyContactPhone: z
    .string()
    .regex(phoneRegex, 'Телефон рақами нотўғри форматда')
    .optional()
    .or(z.literal('')),
  emergencyContactRelation: z.string().optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  currentMedications: z.string().optional(),
  insuranceCompany: z.string().optional(),
  insuranceNumber: z.string().optional(),
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
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface NewPatientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewPatient = ({ open, onOpenChange }: NewPatientProps) => {
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      gender: undefined,
      bloodType: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      region: '',
      zipCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      allergies: '',
      chronicDiseases: '',
      currentMedications: '',
      insuranceCompany: '',
      insuranceNumber: '',
      passportSeries: '',
      passportNumber: '',
      notes: '',
    },
  });

  const onSubmit = (data: PatientFormData) => {
    const submitData = {
      ...data,
      birthDate: format(data.birthDate, 'dd.MM.yyyy'),
      fullName: `${data.lastName} ${data.firstName} ${
        data.middleName || ''
      }`.trim(),
    };

    console.log('=== ЯНГИ БЕМОР МАЪЛУМОТЛАРИ ===');
    console.log('Толиқ исм:', submitData.fullName);
    console.log('Туғилган сана:', submitData.birthDate);
    console.log('Жинси:', submitData.gender);
    console.log('Қон гурухи:', submitData.bloodType || 'Кўрсатилмаган');
    console.log('Телефон:', submitData.phone);
    console.log('Email:', submitData.email || 'Кўрсатилмаган');
    console.log('Манзил:', submitData.address);
    console.log('Шаҳар:', submitData.city || 'Кўрсатилмаган');
    console.log('Вилоят:', submitData.region || 'Кўрсатилмаган');
    console.log('Почта индекси:', submitData.zipCode || 'Кўрсатилмаган');
    console.log('Фавқулодда алоқа:', {
      name: submitData.emergencyContactName || 'Кўрсатилмаган',
      phone: submitData.emergencyContactPhone || 'Кўрсатилмаган',
      relation: submitData.emergencyContactRelation || 'Кўрсатилмаган',
    });
    console.log('Аллергия:', submitData.allergies || 'Йўқ');
    console.log('Сурункали касалликлар:', submitData.chronicDiseases || 'Йўқ');
    console.log('Ҳозирги дорилар:', submitData.currentMedications || 'Йўқ');
    console.log('Суғурта:', {
      company: submitData.insuranceCompany || 'Кўрсатилмаган',
      number: submitData.insuranceNumber || 'Кўрсатилмаган',
    });
    console.log('Паспорт:', {
      series: submitData.passportSeries || 'Кўрсатилмаган',
      number: submitData.passportNumber || 'Кўрсатилмаган',
    });
    console.log('Қўшимча эслатмалар:', submitData.notes || 'Йўқ');
    console.log('===============================');
    console.log('Толиқ JSON:', JSON.stringify(submitData, null, 2));

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
                        <Popover>
                          <PopoverTrigger
                            className='border-2 border-slate-400'
                            asChild
                          >
                            <FormControl>
                              <Button
                                variant='outline'
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'dd.MM.yyyy')
                                ) : (
                                  <span>Санани танланг</span>
                                )}
                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                            <SelectItem value='Эркак'>Эркак</SelectItem>
                            <SelectItem value='Аёл'>Аёл</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='bloodType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Қон гурухи</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='border-2 border-slate-400'>
                              <SelectValue placeholder='Қон гурухини танланг' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='O(I)+'>O(I)+</SelectItem>
                            <SelectItem value='O(I)-'>O(I)-</SelectItem>
                            <SelectItem value='A(II)+'>A(II)+</SelectItem>
                            <SelectItem value='A(II)-'>A(II)-</SelectItem>
                            <SelectItem value='B(III)+'>B(III)+</SelectItem>
                            <SelectItem value='B(III)-'>B(III)-</SelectItem>
                            <SelectItem value='AB(IV)+'>AB(IV)+</SelectItem>
                            <SelectItem value='AB(IV)-'>AB(IV)-</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            {...field}
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

                  <FormField
                    control={form.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Шаҳар</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Тошкент'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='region'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Вилоят</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Тошкент вилояти'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='zipCode'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Почта индекси</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='100000'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Фавқулодда ҳолатлар учун алоқа
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <FormField
                    control={form.control}
                    name='emergencyContactName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Толиқ исм'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='emergencyContactPhone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='+998 90 123 45 67'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='emergencyContactRelation'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Қариндошлик</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Ота, она, ака...'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

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
                          <Textarea
                            className='border-slate-400 border-2'
                            placeholder='Аллергия ҳақида маълумот киритинг...'
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='chronicDiseases'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сурункали касалликлар</FormLabel>
                        <FormControl>
                          <Textarea
                            className='border-slate-400 border-2'
                            placeholder='Сурункали касалликлар ҳақида маълумот...'
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='currentMedications'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ҳозирги дорилар</FormLabel>
                        <FormControl>
                          <Textarea
                            className='border-slate-400 border-2'
                            placeholder='Ҳозирда қабул қилаётган дорилар...'
                            rows={2}
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
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Суғурта ва ҳужжатлар
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='insuranceCompany'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Суғурта компанияси</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='Компания номи'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='insuranceNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Суғурта рақами</FormLabel>
                        <FormControl>
                          <Input
                            className='border-slate-400 border-2'
                            placeholder='1234567890'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='passportSeries'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Паспорт серияси</FormLabel>
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
                      <FormItem>
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

              {/* Additional Notes */}
              <div className='space-y-4'>
                <h3 className='text-base sm:text-lg font-semibold'>
                  Қўшимча эслатмалар
                </h3>
                <FormField
                  control={form.control}
                  name='notes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Эслатмалар</FormLabel>
                      <FormControl>
                        <Textarea
                          className='border-slate-400 border-2'
                          placeholder='Қўшимча маълумот ёки эслатмалар...'
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className='p-4 sm:p-6 pt-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Бекор қилиш
          </Button>
          <Button
            type='submit'
            onClick={form.handleSubmit(onSubmit)}
            className='gradient-primary'
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
