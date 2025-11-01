import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import DayView from './components/DayView';
import MonthView from './components/MonthView';
import NewAppointment, {
  AppointmentFormData,
} from './components/NewAppointment';
import WeekView from './components/WeekView';
import { doctors, statusOptions } from '@/constants/doctors';

interface Appointment {
  day: number;
  time: number;
  patient: string;
  type: string;
  status: string;
  doctor: string;
  phone: string;
}

const Appointments = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Sample appointments data (0 = Monday, 6 = Sunday)
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      day: 0,
      time: 9,
      patient: 'Алиев Жасур',
      type: 'Дастлабки',
      status: 'new',
      doctor: 'Др. Алимов',
      phone: '+998 90 123 45 67',
    },
    {
      day: 0,
      time: 9.5,
      patient: 'Каримова Нодира',
      type: 'Такрорий',
      status: 'confirmed',
      doctor: 'Др. Нурматова',
      phone: '+998 91 234 56 78',
    },
    {
      day: 1,
      time: 10,
      patient: 'Усмонов Азиз',
      type: 'Кўрикдан кейин',
      status: 'confirmed',
      doctor: 'Др. Алимов',
      phone: '+998 93 345 67 89',
    },
    {
      day: 2,
      time: 14,
      patient: 'Рахимова Малика',
      type: 'Дастлабки',
      status: 'new',
      doctor: 'Др. Нурматова',
      phone: '+998 94 456 78 90',
    },
    {
      day: 3,
      time: 11,
      patient: 'Юлдашев Отабек',
      type: 'Такрорий',
      status: 'completed',
      doctor: 'Др. Алимов',
      phone: '+998 95 567 89 01',
    },
    {
      day: 4,
      time: 15,
      patient: 'Исмоилова Дилноза',
      type: 'Дастлабки',
      status: 'confirmed',
      doctor: 'Др. Нурматова',
      phone: '+998 97 678 90 12',
    },
  ]);

  // Filter appointments based on selected filters
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const doctorMatch =
        selectedDoctor === 'all' || apt.doctor === selectedDoctor;
      const statusMatch =
        selectedStatus === 'all' || apt.status === selectedStatus;
      return doctorMatch && statusMatch;
    });
  }, [appointments, selectedDoctor, selectedStatus]);

  // Handle new appointment submission
  const handleNewAppointment = (formData: AppointmentFormData) => {
    // Convert time string to decimal (e.g., "09:30" -> 9.5)
    const [hours, minutes] = formData.time.split(':').map(Number);
    const timeDecimal = hours + minutes / 60;

    // Get day of week (0 = Monday in our system, but Date.getDay() returns 0 = Sunday)
    const dayOfWeek = formData.date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to our system

    const doctorNames: { [key: string]: string } = {
      alimov: 'Др. Алимов',
      nurmatova: 'Др. Нурматова',
      karimov: 'Др. Каримов',
      rakhimova: 'Др. Раҳимова',
    };

    const typeNames: { [key: string]: string } = {
      initial: 'Дастлабки',
      followup: 'Такрорий',
      consultation: 'Маслаҳат',
      checkup: 'Текширув',
    };

    const newAppointment: Appointment = {
      day: adjustedDay,
      time: timeDecimal,
      patient: formData.patientName,
      type: typeNames[formData.type] || formData.type,
      status: 'new',
      doctor: doctorNames[formData.doctor] || formData.doctor,
      phone: formData.phone,
    };

    setAppointments([...appointments, newAppointment]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'border-l-4 border-l-primary bg-primary/5';
      case 'confirmed':
        return 'border-l-4 border-l-success bg-success/5';
      case 'completed':
        return 'border-l-4 border-l-muted bg-muted';
      case 'cancelled':
        return 'border-l-4 border-l-danger bg-danger/5';
      default:
        return '';
    }
  };

  return (
    <div className='min-h-screen bg-background pb-20 sm:pb-0'>
      <main className='w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6'>
        {/* Controls Navbar */}
        <Card className='card-shadow mb-3 sm:mb-4 lg:mb-6 border-0 sm:border'>
          <div className='p-2.5 sm:p-4 lg:p-5'>
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4'>
              {/* View Toggle Buttons */}
              <div className='flex gap-1 sm:gap-2 w-full sm:w-auto'>
                <Button
                  variant={view === 'day' ? 'default' : 'outline'}
                  onClick={() => setView('day')}
                  className={`${
                    view === 'day'
                      ? 'gradient-primary text-white'
                      : 'bg-background'
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Кунлик
                </Button>
                <Button
                  variant={view === 'week' ? 'default' : 'outline'}
                  onClick={() => setView('week')}
                  className={`${
                    view === 'week'
                      ? 'gradient-primary text-white'
                      : 'bg-background'
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Ҳафталик
                </Button>
                <Button
                  variant={view === 'month' ? 'default' : 'outline'}
                  onClick={() => setView('month')}
                  className={`${
                    view === 'month'
                      ? 'gradient-primary text-white'
                      : 'bg-background'
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Ойлик
                </Button>
              </div>

              {/* Filter Selects */}
              <div className='grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 w-full sm:w-auto'>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className='w-full sm:w-32 lg:w-40 text-[10px] sm:text-xs lg:text-sm h-8 sm:h-9 lg:h-10 bg-background'>
                    <SelectValue placeholder='Шифокор' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value='all'
                      className='text-[11px] sm:text-xs lg:text-sm'
                    >
                      Барча шифокорлар
                    </SelectItem>
                    {doctors.map(i => (
                    <SelectItem
                      key={i.username}
                      value={i.username}
                      className='text-[11px] sm:text-xs lg:text-sm'
                    >
                      {i.fullName}
                    </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className='w-full sm:w-32 lg:w-40 text-[10px] sm:text-xs lg:text-sm h-8 sm:h-9 lg:h-10 bg-background'>
                    <SelectValue placeholder='Ҳолат' />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(i => (
                    <SelectItem
                      key={i.value}
                      value={i.value}
                      className='text-[11px] sm:text-xs lg:text-sm'
                    >
                      {i.label}
                    </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* View Content */}
        {view === 'day' && (
          <DayView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            getStatusColor={getStatusColor}
          />
        )}

        {view === 'week' && (
          <WeekView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            getStatusColor={getStatusColor}
          />
        )}

        {view === 'month' && (
          <MonthView
            appointments={filteredAppointments}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            getStatusColor={getStatusColor}
          />
        )}

        {/* Status Legend - Only show for week view */}
        {view === 'week' && (
          <div className='mt-2.5 sm:mt-4 lg:mt-5 flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 px-2 py-2 sm:py-0 bg-card sm:bg-transparent rounded-lg sm:rounded-none'>
            <div className='flex items-center gap-1 sm:gap-1.5'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-primary rounded-sm flex-shrink-0'></div>
              <span className='text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap'>
                Янги
              </span>
            </div>
            <div className='flex items-center gap-1 sm:gap-1.5'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-success rounded-sm flex-shrink-0'></div>
              <span className='text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap'>
                Тасдиқланган
              </span>
            </div>
            <div className='flex items-center gap-1 sm:gap-1.5'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-slate-400 rounded-sm flex-shrink-0'></div>
              <span className='text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap'>
                Бажарилган
              </span>
            </div>
            <div className='flex items-center gap-1 sm:gap-1.5'>
              <div className='w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-danger rounded-sm flex-shrink-0'></div>
              <span className='text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap'>
                Бекор қилинган
              </span>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <Button
          size='lg'
          onClick={() => setIsNewAppointmentOpen(true)}
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 rounded-full w-14 h-14 sm:w-15 sm:h-15 lg:w-16 lg:h-16 gradient-primary shadow-lg hover:shadow-xl active:scale-90 transition-all duration-150 z-50 touch-manipulation'
          aria-label='Янги навбат қўшиш'
        >
          <Plus className='w-6 h-6 sm:w-6 sm:h-6 lg:w-7 lg:h-7 stroke-[2.5]' />
        </Button>

        {/* New Appointment Modal */}
        <NewAppointment
          open={isNewAppointmentOpen}
          onOpenChange={setIsNewAppointmentOpen}
          onSubmit={handleNewAppointment}
        />
      </main>
    </div>
  );
};

export default Appointments;
