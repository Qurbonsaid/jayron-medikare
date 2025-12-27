import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Appointment {
  day: number;
  time: number;
  patient: string;
  type: string;
  status: string;
  doctor?: string;
  date?: Date;
}

interface MonthViewProps {
  appointments: Appointment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  getStatusColor: (status: string) => string;
}

const MonthView = ({
  appointments,
  currentDate,
  onDateChange,
  getStatusColor,
}: MonthViewProps) => {
  const { t } = useTranslation('appointments');
  const weekDays = [
    t('weekDayMon'),
    t('weekDayTue'),
    t('weekDayWed'),
    t('weekDayThu'),
    t('weekDayFri'),
    t('weekDaySat'),
    t('weekDaySun'),
  ];

  const monthNames = [
    t('monthJanuary'),
    t('monthFebruary'),
    t('monthMarch'),
    t('monthApril'),
    t('monthMay'),
    t('monthJune'),
    t('monthJuly'),
    t('monthAugust'),
    t('monthSeptember'),
    t('monthOctober'),
    t('monthNovember'),
    t('monthDecember'),
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    let startDay = firstDay.getDay();
    // Convert Sunday (0) to 7 for easier calculation (Monday should be 1)
    startDay = startDay === 0 ? 7 : startDay;

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];

    // For demo purposes, using day of week
    // In real app, you'd compare actual dates
    return appointments.filter((apt) => {
      const dayOfWeek = date.getDay();
      return apt.day === dayOfWeek;
    });
  };

  const getStatusBadgeCount = (dayAppointments: Appointment[]) => {
    const statusCounts = {
      new: dayAppointments.filter((a) => a.status === 'new').length,
      confirmed: dayAppointments.filter((a) => a.status === 'confirmed').length,
      completed: dayAppointments.filter((a) => a.status === 'completed').length,
      cancelled: dayAppointments.filter((a) => a.status === 'cancelled').length,
    };
    return statusCounts;
  };

  return (
    <div className='space-y-3 sm:space-y-4'>
      {/* Month Navigation */}
      <Card className='card-shadow border-0 sm:border'>
        <div className='p-2.5 sm:p-4 lg:p-5'>
          <div className='flex items-center justify-between gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePrevMonth}
              className='h-8 sm:h-9 lg:h-10 px-2 sm:px-3'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>

            <div className='flex-1 text-center'>
              <h2 className='text-base sm:text-lg lg:text-xl font-bold'>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={handleNextMonth}
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
              {t('thisMonth')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Month Calendar Grid */}
      <Card className='card-shadow overflow-hidden border-0 sm:border'>
        <div className='overflow-auto max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-320px)] scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'>
          {/* Week Days Header */}
          <div className='grid grid-cols-7 border-b bg-muted/50 sticky top-0 z-10'>
            {weekDays.map((day, idx) => (
              <div
                key={idx}
                className='p-2 sm:p-3 lg:p-4 text-center font-semibold border-r last:border-r-0 text-[10px] sm:text-xs lg:text-sm'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className='grid grid-cols-7'>
            {days.map((date, idx) => {
              const dayAppointments = getAppointmentsForDay(date);
              const statusCounts = getStatusBadgeCount(dayAppointments);

              return (
                <div
                  key={idx}
                  className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border-r border-b last:border-r-0 p-1 sm:p-2 ${
                    !date
                      ? 'bg-muted/20'
                      : isToday(date)
                      ? 'bg-primary/10'
                      : 'hover:bg-accent/30 cursor-pointer transition-smooth'
                  }`}
                >
                  {date && (
                    <div className='h-full flex flex-col'>
                      {/* Day Number */}
                      <div
                        className={`text-xs sm:text-sm lg:text-base font-semibold mb-1 ${
                          isToday(date)
                            ? 'text-primary flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-white'
                            : ''
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      {/* Appointments Preview */}
                      {dayAppointments.length > 0 && (
                        <div className='flex-1 space-y-0.5 sm:space-y-1 overflow-y-auto scrollbar-none'>
                          {dayAppointments.slice(0, 3).map((apt, aptIdx) => (
                            <div
                              key={aptIdx}
                              className={`px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[8px] sm:text-[9px] lg:text-[10px] truncate ${getStatusColor(
                                apt.status
                              )}`}
                            >
                              {apt.patient}
                            </div>
                          ))}

                          {dayAppointments.length > 3 && (
                            <div className='text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground text-center'>
                              +{dayAppointments.length - 3} {t('more')}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Status Dots */}
                      {dayAppointments.length > 0 && (
                        <div className='flex items-center justify-center gap-0.5 sm:gap-1 mt-1'>
                          {statusCounts.new > 0 && (
                            <div
                              className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary'
                              title={`${statusCounts.new} ${t('statusNew').toLowerCase()}`}
                            />
                          )}
                          {statusCounts.confirmed > 0 && (
                            <div
                              className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-success'
                              title={`${statusCounts.confirmed} ${t('statusConfirmed').toLowerCase()}`}
                            />
                          )}
                          {statusCounts.completed > 0 && (
                            <div
                              className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground'
                              title={`${statusCounts.completed} ${t('statusCompleted').toLowerCase()}`}
                            />
                          )}
                          {statusCounts.cancelled > 0 && (
                            <div
                              className='w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-danger'
                              title={`${statusCounts.cancelled} ${t('statusCancelled').toLowerCase()}`}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Monthly Summary */}
      <Card className='card-shadow border-0 sm:border'>
        <div className='p-3 sm:p-4 lg:p-5'>
          <h3 className='text-sm sm:text-base lg:text-lg font-semibold mb-3'>
            {t('monthlyStatistics')}
          </h3>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
            <div className='text-center p-3 bg-primary/5 rounded-lg'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary'>
                {appointments.length * 4}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                {t('totalAppointments')}
              </div>
            </div>
            <div className='text-center p-3 bg-success/5 rounded-lg'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-success'>
                {appointments.filter((apt) => apt.status === 'confirmed')
                  .length * 4}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                {t('statusConfirmed')}
              </div>
            </div>
            <div className='text-center p-3 bg-blue-50 rounded-lg'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-blue-500'>
                {appointments.filter((apt) => apt.status === 'new').length * 4}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                {t('statusNew')}
              </div>
            </div>
            <div className='text-center p-3 bg-muted/20 rounded-lg'>
              <div className='text-xl sm:text-2xl lg:text-3xl font-bold text-muted-foreground'>
                {appointments.filter((apt) => apt.status === 'completed')
                  .length * 4}
              </div>
              <div className='text-[10px] sm:text-xs lg:text-sm text-muted-foreground mt-1'>
                {t('statusCompleted')}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthView;
