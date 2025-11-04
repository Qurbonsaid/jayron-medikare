import { useGetAllPatientQuery } from '@/app/api/patientApi/patientApi';
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
import NewPatient from './components/NewPatient';

const Patients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>(
    'all'
  );
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: patientdata, isLoading } = useGetAllPatientQuery({
    page: currentPage,
    limit: itemsPerPage,
    gender: genderFilter !== 'all' ? genderFilter : undefined,
    doctor_id: doctorFilter !== 'all' ? doctorFilter : undefined,
    search:searchQuery || undefined
  });

  console.log(patientdata);

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8'>
          <div>
            <h1 className='text-2xl sm:text-3xl font-bold mb-1 sm:mb-2'>
              Беморлар Рўйхати
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Барча беморларни кўриш ва бошқариш
            </p>
          </div>
          <Button
            className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'
            onClick={() => setShowNewPatient(true)}
          >
            + Янги Бемор
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-4 sm:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4'>
              <div className='sm:col-span-2 lg:col-span-6'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground' />
                  <Input
                    placeholder='ФИО, телефон ёки ID бўйича қидириш...'
                    className='pl-9 sm:pl-10 h-10 sm:h-12 text-sm sm:text-base'
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className='lg:col-span-2'>
                <Select
                  value={genderFilter}
                  onValueChange={(value) => {
                    setGenderFilter(value as 'all' | 'male' | 'female');
                    setCurrentPage(1);
                  }}
                >
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
                <Select
                  value={doctorFilter}
                  onValueChange={(value) => {
                    setDoctorFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className='h-10 sm:h-12 text-sm sm:text-base'>
                    <SelectValue placeholder='Шифокор' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Барчаси</SelectItem>
                    <SelectItem value='Др. Алимов'>Др. Алимов</SelectItem>
                    <SelectItem value='Др. Нурматова'>Др. Нурматова</SelectItem>
                    <SelectItem value='Др. Каримов'>Др. Каримов</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='lg:col-span-2'>
                <Button
                  variant='outline'
                  className='w-full h-10 sm:h-12'
                  onClick={() => {
                    setSearchQuery('');
                    setGenderFilter('all');
                    setDoctorFilter('all');
                    setCurrentPage(1);
                  }}
                >
                  <Filter className='w-4 h-4 sm:w-5 sm:h-5' />
                  <span className='ml-2'>Тозалаш</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        {!isLoading && patientdata.data.length > 0 && (
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Жами:{' '}
              <span className='font-semibold text-foreground'>
                {patientdata.data.length}
              </span>{' '}
              бемор
            </p>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
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
        ) : patientdata.data.length === 0 ? (
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
                searchQuery ? setSearchQuery('') : setShowNewPatient(true)
              }
            />
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='block lg:hidden space-y-3 sm:space-y-4'>
              {patientdata.data.map((patient) => (
                <Card key={patient._id} className='card-shadow'>
                  <div className='p-4'>
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded'>
                            {patient.patient_id}
                          </span>
                        </div>
                        <h3 className='font-semibold text-base sm:text-lg mb-1'>
                          {patient.fullname}
                        </h3>
                        <p className='text-xs sm:text-sm text-muted-foreground'>
                          {patient.gender === 'male' ? 'Эркак' : 'Аёл'}
                        </p>
                      </div>
                    </div>
                    <div className='space-y-2 mb-3'>
                      <div className='flex items-center gap-2 text-xs sm:text-sm'>
                        <Phone className='w-4 h-4 text-muted-foreground' />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.diagnosis && patient.diagnosis.length > 0 && (
                        <div className='flex items-center gap-2 text-xs sm:text-sm'>
                          <Users className='w-4 h-4 text-muted-foreground' />
                          <span>{patient.diagnosis[0]}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size='sm'
                      className='w-full gradient-primary'
                      onClick={() => navigate(`/patient/${patient._id}`)}
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
                      {[
                        'ID',
                        'ФИО',
                        'Жинс',
                        'Телефон',
                        'Шифокор',
                        'Диагноз',
                        'Ҳаракатлар',
                      ].map((i) => (
                        <th
                          key={i}
                          className='px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold'
                        >
                          {i}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {patientdata.data.map((patient) => (
                      <tr
                        key={patient._id}
                        className='hover:bg-accent/50 transition-smooth'
                      >
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm font-medium text-primary'>
                          {patient.patient_id}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4'>
                          <div className='font-medium text-sm xl:text-base'>
                            {patient.fullname}
                          </div>
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.gender === 'male' ? 'Эркак' : 'Аёл'}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.phone}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          -
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm'>
                          {patient.diagnosis && patient.diagnosis.length > 0
                            ? patient.diagnosis.join(', ')
                            : 'Йўқ'}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4'>
                          <div className='flex justify-center'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                navigate(`/patient/${patient._id}`)
                              }
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
                  {patientdata.pagination.prev_page
                    ? (patientdata.pagination.page - 1) *
                        patientdata.pagination.limit +
                      1
                    : 1}{' '}
                  - {patientdata.pagination.total_items} дан{' '}
                  {patientdata.pagination.limit} та кўрсатилмоқда
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className='text-xs xl:text-sm'
                  >
                    Олдинги
                  </Button>
                  {(() => {
                    const pages = [];
                    const showPages = new Set<number>();

                    // Har doim 1-sahifani ko'rsat
                    showPages.add(1);

                    // Har doim oxirgi sahifani ko'rsat
                    if (patientdata.pagination.total_pages > 1) {
                      showPages.add(patientdata.pagination.total_pages);
                    }

                    // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                    for (
                      let i = Math.max(2, currentPage - 1);
                      i <=
                      Math.min(
                        patientdata.pagination.total_pages - 1,
                        currentPage + 1
                      );
                      i++
                    ) {
                      showPages.add(i);
                    }

                    const sortedPages = Array.from(showPages).sort(
                      (a, b) => a - b
                    );

                    sortedPages.forEach((page, index) => {
                      // Ellipsis qo'shish agar sahifalar orasida bo'sh joy bo'lsa
                      if (index > 0 && sortedPages[index - 1] !== page - 1) {
                        pages.push(
                          <span
                            key={`ellipsis-${page}`}
                            className='px-2 flex items-center text-xs xl:text-sm'
                          >
                            ...
                          </span>
                        );
                      }

                      // Sahifa tugmasi
                      pages.push(
                        <Button
                          key={page}
                          variant='outline'
                          size='sm'
                          onClick={() => setCurrentPage(page)}
                          className={`text-xs xl:text-sm ${
                            page === currentPage
                              ? 'bg-primary text-white hover:bg-primary/60 hover:text-white'
                              : ''
                          }`}
                        >
                          {page}
                        </Button>
                      );
                    });

                    return pages;
                  })()}
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={
                      currentPage === patientdata.pagination.total_pages
                    }
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className='text-xs xl:text-sm'
                  >
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
                    {patientdata.pagination.prev_page
                      ? (patientdata.pagination.page - 1) *
                          patientdata.pagination.limit +
                        1
                      : 1}{' '}
                    -{' '}
                    {Math.min(
                      patientdata.pagination.page *
                        patientdata.pagination.limit,
                      patientdata.pagination.total_items
                    )}{' '}
                    дан {patientdata.pagination.total_items} та кўрсатилмоқда
                  </div>
                  <div className='flex gap-2 justify-center flex-wrap'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='text-xs sm:text-sm px-3'
                    >
                      Олдинги
                    </Button>
                    {(() => {
                      const pages = [];
                      const showPages = new Set<number>();

                      // Har doim 1 va oxirgi sahifani ko'rsat
                      showPages.add(1);
                      if (patientdata.pagination.total_pages > 1) {
                        showPages.add(patientdata.pagination.total_pages);
                      }

                      // Joriy sahifa va uning atrofidagi 1 ta sahifani ko'rsat
                      if (
                        currentPage > 1 &&
                        currentPage < patientdata.pagination.total_pages
                      ) {
                        showPages.add(currentPage);
                      }
                      if (currentPage - 1 > 1) {
                        showPages.add(currentPage - 1);
                      }
                      if (
                        currentPage + 1 <
                        patientdata.pagination.total_pages
                      ) {
                        showPages.add(currentPage + 1);
                      }

                      const sortedPages = Array.from(showPages).sort(
                        (a, b) => a - b
                      );

                      sortedPages.forEach((page, index) => {
                        // Ellipsis qo'shish
                        if (index > 0 && sortedPages[index - 1] !== page - 1) {
                          pages.push(
                            <span
                              key={`ellipsis-${page}`}
                              className='px-2 flex items-center text-xs sm:text-sm'
                            >
                              ...
                            </span>
                          );
                        }

                        // Sahifa tugmasi
                        pages.push(
                          <Button
                            key={page}
                            variant='outline'
                            size='sm'
                            onClick={() => setCurrentPage(page)}
                            className={`text-xs sm:text-sm px-3 min-w-[32px] ${
                              page === currentPage
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : ''
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      });

                      return pages;
                    })()}
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={
                        currentPage === patientdata.pagination.total_pages
                      }
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='text-xs sm:text-sm px-3'
                    >
                      Кейинги
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </main>

      {/* New Patient Modal */}
      <NewPatient open={showNewPatient} onOpenChange={setShowNewPatient} />
    </div>
  );
};

export default Patients;
