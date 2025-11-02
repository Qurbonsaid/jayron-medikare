import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Appointment {
  day: number;
  time: number;
  patient: string;
  type: string;
  status: string;
  doctor?: string;
}

interface WeekViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  getStatusColor: (status: string) => string;
}

const WeekView = ({
  appointments,
  currentDate,
  onDateChange,
  getStatusColor,
}: WeekViewProps) => {
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00
  const weekDays = [
    'Душанба',
    'Сешанба',
    'Чоршанба',
    'Пайшанба',
    'Жума',
    'Шанба',
    'Якшанба',
  ];

  const getWeekDates = (date: Date) => {
    const current = new Date(date);
    const first = current.getDate() - current.getDay() + 1; // Monday
    const dates = [];

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(current);
      weekDate.setDate(first + i);
      dates.push(weekDate);
    }

    return dates;
  };

  const weekDates = getWeekDates(currentDate);

  const formatWeekRange = () => {
    const firstDay = weekDates[0];
    const lastDay = weekDates[6];

    const firstStr = `${firstDay.getDate()}.${(firstDay.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;
    const lastStr = `${lastDay.getDate()}.${(lastDay.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${lastDay.getFullYear()}`;

    return `${firstStr} - ${lastStr}`;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Week Navigation */}
      <Card className='card-shadow border-0 sm:border'>
        <div className='p-2.5 sm:p-4 lg:p-5'>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevWeek}
              className='h-8 sm:h-9 lg:h-10 px-2 sm:px-3'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <div className='flex-1 text-center'>
              <h2 className='text-base sm:text-lg lg:text-xl font-bold'>
                Ҳафта
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                {formatWeekRange()}
              </p>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextWeek}
              className='h-8 sm:h-9 lg:h-10 px-2 sm:px-3'
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>

          <div className='mt-3 flex justify-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleToday}
              className='h-8 sm:h-9 text-xs sm:text-sm'
            >
              Бу ҳафта
            </Button>
          </div>
        </div>
      </Card>

      {/* Week Calendar Table */}
      <Card className='card-shadow overflow-hidden border-0 sm:border'>
        <div className='overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-320px)] -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
          <div className='min-w-[480px] sm:min-w-[640px] lg:min-w-[800px]'>
            {/* Header */}
            <div className='grid grid-cols-8 border-b bg-muted/50 sticky top-0 z-10'>
              <div className='p-1.5 sm:p-2 lg:p-4 font-semibold border-r text-[10px] sm:text-xs lg:text-sm'>
                Вақт
              </div>
              {weekDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 sm:p-2 lg:p-4 text-center font-semibold border-r last:border-r-0 text-[10px] sm:text-xs lg:text-sm ${
                    isToday(weekDates[idx]) ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <div className='hidden md:block'>{day}</div>
                  <div className='md:hidden'>{day.slice(0, 2)}</div>
                  <div className='text-[9px] sm:text-[10px] text-muted-foreground mt-0.5'>
                    {weekDates[idx].getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className='relative'>
              {timeSlots.map((hour) => (
                <div key={hour} className='grid grid-cols-8 border-b'>
                  <div className='p-1.5 sm:p-2 lg:p-4 border-r bg-muted/20 text-[10px] sm:text-xs lg:text-sm font-medium'>
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {weekDays.map((_, dayIdx) => {
                    const apt = appointments.find(
                      (a) => a.day === dayIdx && Math.floor(a.time) === hour
                    );
                    return (
                      <div
                        key={dayIdx}
                        className={`p-0.5 sm:p-1 lg:p-2 border-r last:border-r-0 min-h-12 sm:min-h-16 lg:min-h-20 hover:bg-accent/50 transition-smooth relative ${
                          isToday(weekDates[dayIdx]) ? 'bg-primary/5' : ''
                        }`}
                      >
                        {apt && (
                          <div
                            className={`p-0.5 sm:p-1 lg:p-2 rounded cursor-pointer hover:shadow-md transition-smooth ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            <p className='font-semibold text-[9px] sm:text-[10px] lg:text-sm leading-tight'>
                              {apt.patient}
                            </p>
                            <p className='text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground mt-0.5 hidden lg:block'>
                              {apt.type}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeekView;
