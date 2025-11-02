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
  phone?: string;
}

interface DayViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  getStatusColor: (status: string) => string;
}

const DayView = ({
  appointments,
  currentDate,
  onDateChange,
  getStatusColor,
}: DayViewProps) => {
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00

  const dayNames = [
    'Якшанба',
    'Душанба',
    'Сешанба',
    'Чоршанба',
    'Пайшанба',
    'Жума',
    'Шанба',
  ];

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const currentDayOfWeek = dayNames[currentDate.getDay()];

  // Filter appointments for current day
  const todayAppointments = appointments.filter(
    (apt) => apt.day === currentDate.getDay()
  );

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Date Navigation */}
      <Card className='card-shadow border-0 sm:border'>
        <div className='p-2.5 sm:p-4 lg:p-5'>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevDay}
              className='h-8 sm:h-9 lg:h-10 px-2 sm:px-3'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <div className='flex-1 text-center'>
              <h2 className='text-base sm:text-lg lg:text-xl font-bold'>
                {currentDayOfWeek}
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                {formatDate(currentDate)}
              </p>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextDay}
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
              Бугун
            </Button>
          </div>
        </div>
      </Card>

      {/* Day Schedule */}
      <Card className='card-shadow overflow-hidden border-0 sm:border'>
        <div className='overflow-y-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
          <div className='divide-y'>
            {timeSlots.map((hour) => {
              const hourAppointments = todayAppointments.filter(
                (apt) => Math.floor(apt.time) === hour
              );

              return (
                <div
                  key={hour}
                  className='grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr] lg:grid-cols-[120px_1fr] hover:bg-accent/30 transition-smooth'
                >
                  {/* Time Column */}
                  <div className='p-3 sm:p-4 lg:p-5 bg-muted/20 border-r'>
                    <div className='text-xs sm:text-sm lg:text-base font-semibold'>
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className='text-[10px] sm:text-xs text-muted-foreground'>
                      {(hour + 1).toString().padStart(2, '0')}:00
                    </div>
                  </div>

                  {/* Appointments Column */}
                  <div className='p-2 sm:p-3 lg:p-4 min-h-[80px] sm:min-h-[100px] lg:min-h-[120px]'>
                    {hourAppointments.length > 0 ? (
                      <div className='space-y-2'>
                        {hourAppointments.map((apt, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 sm:p-3 lg:p-4 rounded-lg cursor-pointer hover:shadow-md transition-smooth ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex-1 min-w-0'>
                                <h3 className='font-semibold text-sm sm:text-base lg:text-lg truncate'>
                                  {apt.patient}
                                </h3>
                                <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
                                  {apt.type}
                                </p>
                                {apt.doctor && (
                                  <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                                    Шифокор: {apt.doctor}
                                  </p>
                                )}
                                {apt.phone && (
                                  <p className='text-xs sm:text-sm text-muted-foreground'>
                                    Телефон: {apt.phone}
                                  </p>
                                )}
                              </div>
                              <div className='text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap'>
                                {hour.toString().padStart(2, '0')}:
                                {Math.floor((apt.time % 1) * 60)
                                  .toString()
                                  .padStart(2, '0')}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='h-full flex items-center justify-center text-xs sm:text-sm text-muted-foreground'>
                        Навбат йўқ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <Card className='card-shadow border-0 sm:border'>
        <div className='p-3 sm:p-4 lg:p-5'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary'>
                {todayAppointments.length}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                Жами навбатлар
              </div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-success'>
                {
                  todayAppointments.filter((apt) => apt.status === 'confirmed')
                    .length
                }
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                Тасдиқланган
              </div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-blue-500'>
                {todayAppointments.filter((apt) => apt.status === 'new').length}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                Янги
              </div>
            </div>
            <div className='text-center'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-muted-foreground'>
                {
                  todayAppointments.filter((apt) => apt.status === 'completed')
                    .length
                }
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                Бажарилган
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DayView;
