import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  Printer,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const PatientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock patient data
  const patient = {
    id: 'P-001',
    name: 'Алиев Жасур Абдуллаевич',
    age: 35,
    gender: 'Эркак',
    phone: '+998 90 123 45 67',
    email: 'j.aliev@example.com',
    address: 'Тошкент ш., Мирзо Улуғбек т., Буюк Ипак Йўли к., 45-уй',
    allergies: ['Пенициллин', 'Арахис'],
    medicalHistory: [
      { condition: 'Гипертония', year: '2020' },
      { condition: 'Диабет 2-тури', year: '2018' },
    ],
    medications: [
      { name: 'Метформин', dosage: '500 мг', frequency: 'Кунига 2 марта' },
      { name: 'Лосартан', dosage: '50 мг', frequency: 'Кунига 1 марта' },
    ],
    familyHistory: [
      { relative: 'Отаси', condition: 'Инфаркт (65 ёшда)' },
      { relative: 'Онаси', condition: 'Диабет' },
    ],
    vitalSigns: {
      date: '15.01.2025',
      bp: '130/85',
      pulse: '78',
      temp: '36.6',
      weight: '82',
    },
  };

  return (
    <div className='min-h-screen bg-background'>
      <main className='container px-2 sm:px-2 lg:px-2 py-2 sm:py-2 lg:py-2'>
        {/* Patient Header Card */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='flex flex-col md:flex-row gap-6'>
              {/* Profile Photo */}
              <div className='flex-shrink-0 mx-auto md:mx-0'>
                <div className='w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 gradient-primary rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl font-bold'>
                  {patient.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              </div>

              {/* Patient Info */}
              <div className='flex-1'>
                <div className='flex flex-col md:flex-row justify-between mb-4'>
                  <div>
                    <h1 className='text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-center md:text-left'>
                      {patient.name}
                    </h1>
                    <div className='flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground justify-center md:justify-start'>
                      <span>{patient.age} йош</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>ID: {patient.id}</span>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2 mt-4 md:mt-0 justify-center md:justify-end'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                    >
                      <Edit className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Таҳрирлаш</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                    >
                      <FileText className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Ҳисобот</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='flex-1 sm:flex-none'
                    >
                      <Printer className='w-4 h-4 sm:mr-2' />
                      <span className='hidden sm:inline'>Чоп этиш</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 px-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Phone className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0' />
                <span className='text-sm sm:text-base'>{patient.phone}</span>
              </div>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Mail className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0' />
                <span className='text-sm sm:text-base break-all'>
                  {patient.email}
                </span>
              </div>
              <div className='flex items-start gap-2 justify-center md:justify-start sm:col-span-2 lg:col-span-1'>
                <MapPin className='w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5' />
                <span className='text-xs sm:text-sm text-center md:text-left'>
                  {patient.address}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Allergy Warning */}
        {patient.allergies.length > 0 && (
          <Card className='bg-gradient-to-r from-danger/10 to-warning/10 border-danger mb-4 sm:mb-6'>
            <div className='p-3 sm:p-4'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <AlertTriangle className='w-6 h-6 sm:w-8 sm:h-8 text-danger flex-shrink-0' />
                <div>
                  <h3 className='font-bold text-base sm:text-lg mb-1'>
                    АЛЛЕРГИЯЛАР:
                  </h3>
                  <p className='text-danger-foreground font-semibold text-sm sm:text-base'>
                    {patient.allergies.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue='general' className='space-y-4 sm:space-y-6'>
          <TabsList className='grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto gap-1'>
            <TabsTrigger
              value='general'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Умумий
            </TabsTrigger>
            <TabsTrigger
              value='visits'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Ташрифлар
            </TabsTrigger>
            <TabsTrigger
              value='tests'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Таҳлиллар
            </TabsTrigger>
            <TabsTrigger
              value='images'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Тасвирлар
            </TabsTrigger>
            <TabsTrigger
              value='prescriptions'
              className='py-2 sm:py-3 text-xs sm:text-sm'
            >
              Рецептлар
            </TabsTrigger>
          </TabsList>

          <TabsContent value='general' className='space-y-4 sm:space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              {/* Medical History */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Тиббий Тарих
                  </h3>
                  <ul className='space-y-2'>
                    {patient.medicalHistory.map((item, idx) => (
                      <li
                        key={idx}
                        className='flex flex-col sm:flex-row justify-between py-2 border-b last:border-0 gap-1 sm:gap-0'
                      >
                        <span className='text-sm sm:text-base'>
                          {item.condition}
                        </span>
                        <span className='text-xs sm:text-sm text-muted-foreground'>
                          {item.year}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Current Medications */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Доимий Дорилар
                  </h3>
                  <div className='space-y-3'>
                    {patient.medications.map((med, idx) => (
                      <div key={idx} className='p-3 bg-accent rounded-lg'>
                        <h4 className='font-semibold text-sm sm:text-base'>
                          {med.name}
                        </h4>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                          {med.dosage} - {med.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Family History */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Оилавий Тарих
                  </h3>
                  <ul className='space-y-2'>
                    {patient.familyHistory.map((item, idx) => (
                      <li
                        key={idx}
                        className='flex flex-col sm:flex-row justify-between py-2 border-b last:border-0 gap-1 sm:gap-0'
                      >
                        <span className='font-medium text-sm sm:text-base'>
                          {item.relative}:
                        </span>
                        <span className='text-xs sm:text-sm text-muted-foreground'>
                          {item.condition}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Latest Vital Signs */}
              <Card className='card-shadow'>
                <div className='p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Сўнгги Витал Белгилар
                  </h3>
                  <p className='text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4'>
                    {patient.vitalSigns.date}
                  </p>
                  <div className='grid grid-cols-2 gap-2 sm:gap-4'>
                    <div className='p-2 sm:p-3 bg-accent rounded-lg'>
                      <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>
                        Қон босими
                      </p>
                      <p className='text-base sm:text-xl font-bold'>
                        {patient.vitalSigns.bp}
                      </p>
                      <p className='text-[10px] sm:text-xs'>mmHg</p>
                    </div>
                    <div className='p-2 sm:p-3 bg-accent rounded-lg'>
                      <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>
                        Пульс
                      </p>
                      <p className='text-base sm:text-xl font-bold'>
                        {patient.vitalSigns.pulse}
                      </p>
                      <p className='text-[10px] sm:text-xs'>/мин</p>
                    </div>
                    <div className='p-2 sm:p-3 bg-accent rounded-lg'>
                      <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>
                        Температура
                      </p>
                      <p className='text-base sm:text-xl font-bold'>
                        {patient.vitalSigns.temp}
                      </p>
                      <p className='text-[10px] sm:text-xs'>°C</p>
                    </div>
                    <div className='p-2 sm:p-3 bg-accent rounded-lg'>
                      <p className='text-[10px] sm:text-xs text-muted-foreground mb-1'>
                        Вазн
                      </p>
                      <p className='text-base sm:text-xl font-bold'>
                        {patient.vitalSigns.weight}
                      </p>
                      <p className='text-[10px] sm:text-xs'>кг</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value='visits'>
            <Card className='card-shadow'>
              <div className='p-4 sm:p-6 text-center text-sm sm:text-base text-muted-foreground'>
                Ташрифлар тарихи...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='tests'>
            <Card className='card-shadow'>
              <div className='p-4 sm:p-6 text-center text-sm sm:text-base text-muted-foreground'>
                Таҳлиллар натижалари...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='images'>
            <Card className='card-shadow'>
              <div className='p-4 sm:p-6 text-center text-sm sm:text-base text-muted-foreground'>
                Тиббий тасвирлар...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value='prescriptions'>
            <Card className='card-shadow'>
              <div className='p-4 sm:p-6 text-center text-sm sm:text-base text-muted-foreground'>
                Рецептлар тарихи...
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Action */}
        <div className='mt-4 sm:mt-6 flex justify-center'>
          <Button
            size='lg'
            className='gradient-primary h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto'
            onClick={() => navigate('/new-visit')}
          >
            + Янги Кўрик Яратиш
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
