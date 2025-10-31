import { Calendar, CheckCircle, MessageSquare, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const appointments = [
    {
      time: '09:00',
      patient: 'Алиев Жасур',
      type: 'Дастлабки қабул',
      status: 'new',
    },
    {
      time: '09:30',
      patient: 'Каримова Нодира',
      type: 'Такрорий қабул',
      status: 'confirmed',
    },
    {
      time: '10:00',
      patient: 'Усмонов Азиз',
      type: 'Кўрикдан кейин',
      status: 'confirmed',
    },
    {
      time: '10:30',
      patient: 'Рахимова Малика',
      type: 'Дастлабки қабул',
      status: 'new',
    },
  ];

  const recentActivity = [
    { time: '10 дақиқа олдин', action: 'Алиев Жасур учун SOAP ёзув қўшилди' },
    { time: '25 дақиқа олдин', action: 'Каримова Нодира учун рецепт ёзилди' },
    {
      time: '1 соат олдин',
      action: 'Усмонов Азиз учун қон таҳлили буюртма қилинди',
    },
    {
      time: '2 соат олдин',
      action: 'Янги бемор рўйхатдан ўтди: Рахимова Малика',
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Хуш келибсиз, Др. Алимов!</h1>
          <p className='text-muted-foreground'>
            Бугун,{' '}
            {new Date().toLocaleDateString('uz-UZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <StatCard
            title='Бугунги Беморлар'
            value='12'
            icon={Calendar}
            variant='default'
          />
          <StatCard
            title='Навбатдаги Беморлар'
            value='4'
            icon={Clock}
            variant='warning'
          />
          <StatCard
            title='Бажарилган Кўриклар'
            value='8'
            icon={CheckCircle}
            variant='success'
          />
          <StatCard
            title='Янги Хабарлар'
            value='3'
            icon={MessageSquare}
            variant='danger'
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Today's Appointments */}
          <div>
            <Card className='card-shadow'>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-xl font-bold'>Бугунги Навбат</h2>
                  <Button
                    onClick={() => navigate('/appointments')}
                    className='gradient-primary'
                  >
                    + Қўшиш
                  </Button>
                </div>

                <div className='space-y-3'>
                  {appointments.map((apt, idx) => (
                    <div
                      key={idx}
                      className='p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer bg-card'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                          <div className='text-center'>
                            <div className='text-2xl font-bold text-primary'>
                              {apt.time}
                            </div>
                          </div>
                          <div>
                            <h3 className='font-semibold'>{apt.patient}</h3>
                            <p className='text-sm text-muted-foreground'>
                              {apt.type}
                            </p>
                          </div>
                        </div>
                        <Button size='sm' className='gradient-success'>
                          Бошлаш
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className='card-shadow'>
              <div className='p-6'>
                <h2 className='text-xl font-bold mb-4'>Охирги Фаолият</h2>
                <div className='space-y-4'>
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className='flex gap-3'>
                      <div className='w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0'></div>
                      <div>
                        <p className='text-sm'>{activity.action}</p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
