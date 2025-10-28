import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, Filter, Phone, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Patients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const allPatients = [
    {
      id: 'P-001',
      name: 'Алиев Жасур Абдуллаевич',
      age: 35,
      gender: 'Эркак',
      phone: '+998 90 123 45 67',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-002',
      name: 'Каримова Нодира Рахимовна',
      age: 42,
      gender: 'Аёл',
      phone: '+998 91 234 56 78',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-003',
      name: 'Усмонов Азиз Шухратович',
      age: 28,
      gender: 'Эркак',
      phone: '+998 93 345 67 89',
      doctor: 'Др. Нурматова',
    },
    {
      id: 'P-004',
      name: 'Рахимова Малика Ахмедовна',
      age: 55,
      gender: 'Аёл',
      phone: '+998 94 456 78 90',
      doctor: 'Др. Алимов',
    },
    {
      id: 'P-005',
      name: 'Хасанов Фаррух Баходирович',
      age: 31,
      gender: 'Эркак',
      phone: '+998 95 567 89 01',
      doctor: 'Др. Каримов',
    },
  ];

  const patients = allPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  );

  return (
    <div className='min-h-screen bg-background'>
      {/* Header - Commented out as it's handled by AppLayout */}
      {/* <header className='bg-card border-b sticky top-0 z-10 card-shadow'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-6'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className='w-5 h-5' />
              </Button>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 gradient-primary rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-7 h-7 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
                <span className='text-xl font-bold'>JAYRON MEDSERVIS</span>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold'>
                ДА
              </div>
            </div>
          </div>
        </div>
      </header> */}

      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-1 sm:mb-2'>Беморлар Рўйхати</h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Барча беморларни кўриш ва бошқариш
            </p>
          </div>
          <Button className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'>+ Янги Бемор</Button>
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4'>
              <div className='sm:col-span-2 lg:col-span-5'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  <Input
                    placeholder='ФИО, телефон ёки ID бўйича қидириш...'
                    className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className='lg:col-span-2'>
                <Select>
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Жинси' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='male'>Эркак</SelectItem>
                    <SelectItem value='female'>Аёл</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-2'>
                <Select>
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Ҳолат' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='active'>Актив</SelectItem>
                    <SelectItem value='inactive'>Ноактив</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-2'>
                <Select>
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Шифокор' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='alimov'>Др. Алимов</SelectItem>
                    <SelectItem value='nurmatova'>Др. Нурматова</SelectItem>
                    <SelectItem value='karimov'>Др. Каримов</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-1'>
                <Button variant='outline' className='w-full h-10 sm:h-12'>
                  <Filter className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='ml-2 sm:hidden'>Filter</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        {!isLoading && patients.length > 0 && (
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Жами:{' '}
              <span className='font-semibold text-foreground'>
                {patients.length}
              </span>{' '}
              бемор
            </p>
            <Select defaultValue='25'>
              <SelectTrigger className='w-full sm:w-32 h-9 sm:h-10 text-sm'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Patients Table/Cards or Empty State */}
        {isLoading ? (
          <Card className='card-shadow p-8 sm:p-12'>
            <LoadingSpinner
              size='lg'
              text='Юкланмоқда...'
              className='justify-center'
            />
          </Card>
        ) : patients.length === 0 ? (
          <Card className='card-shadow p-4 sm:p-0'>
            <EmptyState
              icon={Users}
              title={searchQuery ? 'Ҳеч нарса топилмади' : 'Ҳали беморлар йўқ'}
              description={
                searchQuery
                  ? 'Қидирув сўзини текширинг ёки филтрни ўзгартиринг'
                  : 'Биринчи беморни қўшиш учун қуйидаги тугмани босинг'
              }
              actionLabel={
                searchQuery ? 'Филтрни тозалаш' : '+ Янги Бемор Қўшиш'
              }
              onAction={() =>
                searchQuery ? setSearchQuery('') : navigate('/patients/new')
              }
            />
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='block lg:hidden space-y-3 sm:space-y-4'>
              {patients.map((patient) => (
                <Card key={patient.id} className='card-shadow'>
                  <div className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded'>
                            {patient.id}
                          </span>
                        </div>
                        <h3 className='font-semibold text-base sm:text-lg mb-1'>
                          {patient.name}
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                          {patient.age} йош / {patient.gender}
                        </p>
                      </div>
                    </div>
                    <div className='space-y-2 mb-3'>
                      <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <Phone className='w-4 h-4 text-muted-foreground' />
                        <span>{patient.phone}</span>
                      </div>
                      <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <Users className='w-4 h-4 text-muted-foreground' />
                        <span>{patient.doctor}</span>
                      </div>
                    </div>
                    <Button
                      size='sm'
                      className='w-full gradient-primary'
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      <Eye className='w-4 h-4 mr-2' />
                      Кўриш
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <Card className='card-shadow hidden lg:block'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'>
                      ID
                    </th>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'>
                      ФИО
                    </th>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'>
                      Ёш/Жинс
                    </th>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'>
                      Телефон
                    </th>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'>
                      Шифокор
                    </th>
                    <th className='px-4 xl:px-6 py-3 xl:py-4 text-center text-xs xl:text-sm font-semibold'>
                      Ҳаракатлар
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {patients.map((patient) => (
                    <tr
                      key={patient.id}
                      className='hover:bg-accent/50 transition-smooth'
                    >
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
                        {patient.id}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4'>
                        <div className='font-medium text-sm xl:text-base'>{patient.name}</div>
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                        {patient.age} йош / {patient.gender}
                      </td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>{patient.phone}</td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>{patient.doctor}</td>
                      <td className='px-4 xl:px-6 py-3 xl:py-4'>
                        <div className='flex justify-center'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => navigate(`/patient/${patient.id}`)}
                            className='hover:bg-primary hover:text-white transition-smooth text-xs xl:text-sm'
                          >
                            <Eye className='w-3 h-3 xl:w-4 xl:h-4 mr-1 xl:mr-2' />
                            Кўриш
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Pagination */}
              <div className='px-4 xl:px-6 py-3 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='text-xs xl:text-sm text-muted-foreground'>
                1-{patients.length} дан {patients.length} та кўрсатилмоқда
              </div>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' disabled className='text-xs xl:text-sm'>
                    Олдинги
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    className='bg-primary text-white text-xs xl:text-sm'
                  >
                    1
                  </Button>
                  <Button variant='outline' size='sm' disabled className='text-xs xl:text-sm'>
                    Кейинги
                  </Button>
                </div>
              </div>
            </Card>

            {/* Mobile Pagination */}
            <div className='block lg:hidden mt-4'>
              <Card className='card-shadow p-4'>
                <div className='flex flex-col gap-3'>
                  <div className='text-xs sm:text-sm text-muted-foreground text-center'>
                    1-{patients.length} дан {patients.length} та кўрсатилмоқда
                  </div>
                  <div className='flex gap-2 justify-center'>
                    <Button variant='outline' size='sm' disabled className='flex-1 text-xs sm:text-sm'>
                      Олдинги
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='bg-primary text-white px-4 text-xs sm:text-sm'
                    >
                      1
                    </Button>
                    <Button variant='outline' size='sm' disabled className='flex-1 text-xs sm:text-sm'>
                      Кейинги
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Patients;
