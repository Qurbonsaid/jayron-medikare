import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { uz } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';

interface NewAppointmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (appointment: AppointmentFormData) => void;
}

export interface AppointmentFormData {
  patientName: string;
  phone: string;
  date: Date;
  time: string;
  doctor: string;
  type: string;
  notes: string;
}

const NewAppointment = ({
  open,
  onOpenChange,
  onSubmit,
}: NewAppointmentProps) => {
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    phone: '',
    date: new Date(),
    time: '',
    doctor: '',
    type: '',
    notes: '',
  });

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return [
      `${hour.toString().padStart(2, '0')}:00`,
      `${hour.toString().padStart(2, '0')}:30`,
    ];
  }).flat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.phone ||
      !date ||
      !formData.time ||
      !formData.doctor ||
      !formData.type
    ) {
      alert('Илтимос, барча майдонларни тўлдиринг!');
      return;
    }

    onSubmit({
      ...formData,
      date: date,
    });

    // Reset form
    setFormData({
      patientName: '',
      phone: '',
      date: new Date(),
      time: '',
      doctor: '',
      type: '',
      notes: '',
    });
    setDate(undefined);
    onOpenChange(false);
  };

  const handleChange = (field: keyof AppointmentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl font-bold'>
            Янги навбат қўшиш
          </DialogTitle>
          <DialogDescription>
            Беморнинг навбат маълумотларини киритинг
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            {/* Patient Name */}
            <div className='grid gap-2'>
              <Label htmlFor='patientName' className='text-sm font-semibold'>
                Беморнинг исми <span className='text-danger'>*</span>
              </Label>
              <Input
                id='patientName'
                placeholder='Мисол: Алиев Жасур'
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
                className='w-full'
                required
              />
            </div>

            {/* Phone */}
            <div className='grid gap-2'>
              <Label htmlFor='phone' className='text-sm font-semibold'>
                Телефон рақами <span className='text-danger'>*</span>
              </Label>
              <Input
                id='phone'
                type='tel'
                placeholder='+998 90 123 45 67'
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className='w-full'
                required
              />
            </div>

            {/* Date & Time Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Date Picker */}
              <div className='grid gap-2'>
                <Label className='text-sm font-semibold'>
                  Сана <span className='text-danger'>*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-start text-left font-normal'
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {date ? (
                        format(date, 'PPP', { locale: uz })
                      ) : (
                        <span>Санани танланг</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={uz}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Select */}
              <div className='grid gap-2'>
                <Label htmlFor='time' className='text-sm font-semibold'>
                  Вақт <span className='text-danger'>*</span>
                </Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => handleChange('time', value)}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <Clock className='mr-2 h-4 w-4' />
                    <SelectValue placeholder='Вақтни танланг' />
                  </SelectTrigger>
                  <SelectContent className='max-h-60'>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Doctor & Type Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* Doctor Select */}
              <div className='grid gap-2'>
                <Label htmlFor='doctor' className='text-sm font-semibold'>
                  Шифокор <span className='text-danger'>*</span>
                </Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => handleChange('doctor', value)}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Шифокорни танланг' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='alimov'>Др. Алимов</SelectItem>
                    <SelectItem value='nurmatova'>Др. Нурматова</SelectItem>
                    <SelectItem value='karimov'>Др. Каримов</SelectItem>
                    <SelectItem value='rakhimova'>Др. Раҳимова</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Appointment Type */}
              <div className='grid gap-2'>
                <Label htmlFor='type' className='text-sm font-semibold'>
                  Навбат тури <span className='text-danger'>*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Турини танланг' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='initial'>Дастлабки кўрик</SelectItem>
                    <SelectItem value='followup'>Такрорий кўрик</SelectItem>
                    <SelectItem value='consultation'>Маслаҳат</SelectItem>
                    <SelectItem value='checkup'>Текширув</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className='grid gap-2'>
              <Label htmlFor='notes' className='text-sm font-semibold'>
                Қўшимча маълумот
              </Label>
              <Textarea
                id='notes'
                placeholder='Навбат ҳақида қўшимча маълумотлар...'
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                className='min-h-20 resize-none'
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Бекор қилиш
            </Button>
            <Button type='submit' className='gradient-primary'>
              Навбат қўшиш
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointment;
