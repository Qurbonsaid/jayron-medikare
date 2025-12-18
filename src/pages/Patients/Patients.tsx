import { useGetAllPatientQuery } from '@/app/api/patientApi/patientApi';
import { useGetUsersQuery } from '@/app/api/userApi/userApi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePermission } from '@/hooks/usePermission';
import { Eye, Filter, Phone, Search, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewPatient from './components/NewPatient';

const Patients = () => {
  const navigate = useNavigate();
  const { canCreate } = usePermission('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>(
    'all'
  );
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryKey, setQueryKey] = useState(0);

  // Infinite scroll states for doctors
  const [doctorPage, setDoctorPage] = useState(1);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [hasMoreDoctors, setHasMoreDoctors] = useState(true);
  const [isLoadingMoreDoctors, setIsLoadingMoreDoctors] = useState(false);

  const {
    data: patientdata,
    isLoading,
    isFetching,
  } = useGetAllPatientQuery({
    page: currentPage,
    limit: itemsPerPage,
    gender: genderFilter !== 'all' ? genderFilter : undefined,
    doctor_id: doctorFilter !== 'all' ? doctorFilter : undefined,
    search: searchQuery || undefined,
    _key: queryKey, // Force new query when key changes
  } as any);

  const { data: doctorsData } = useGetUsersQuery({
    role: 'doctor',
    limit: 20,
    page: doctorPage,
  });

  // Update doctors list when new data arrives
  useEffect(() => {
    if (doctorsData?.data) {
      if (doctorPage === 1) {
        setAllDoctors(doctorsData.data);
      } else {
        setAllDoctors((prev) => {
          const newData = doctorsData.data.filter(
            (doc: any) => !prev.some((d) => d._id === doc._id)
          );
          return [...prev, ...newData];
        });
      }

      const totalPages = doctorsData.pagination?.total_pages || 1;
      setHasMoreDoctors(doctorPage < totalPages);
      setIsLoadingMoreDoctors(false);
    }
  }, [doctorsData, doctorPage]);

  const doctors = allDoctors;
  const patients = patientdata?.data || [];

  const loadMoreDoctors = () => {
    if (!isLoadingMoreDoctors && hasMoreDoctors) {
      setIsLoadingMoreDoctors(true);
      setDoctorPage((prev) => prev + 1);
    }
  };

  const handleDoctorScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (bottom && hasMoreDoctors && !isLoadingMoreDoctors) {
      loadMoreDoctors();
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, genderFilter, doctorFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Refetch data when component mounts (user returns to page)
  useEffect(() => {
    setQueryKey((prev) => prev + 1);
  }, []);

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
          {canCreate && (
            <Button
              className='gradient-primary h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto'
              onClick={() => setShowNewPatient(true)}
            >
              + Янги Бемор
            </Button>
          )}
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
                  <SelectContent
                    className='max-h-[300px]'
                    onScroll={handleDoctorScroll}
                  >
                    <SelectItem value='all'>Барчаси</SelectItem>
                    {doctors.map((doctor: any) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.fullname}
                      </SelectItem>
                    ))}
                    {isLoadingMoreDoctors && (
                      <div className='px-2 py-4 text-center'>
                        <LoadingSpinner
                          size='sm'
                          text='Юкланмоқда...'
                          className='justify-center'
                        />
                      </div>
                    )}
                    {!hasMoreDoctors && doctors.length > 1 && (
                      <div className='px-2 py-2 text-center text-xs text-muted-foreground'>
                        Барча шифокорлар юкланди
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* itemsPerPage moved to pagination area below */}

              <div className='lg:col-span-2'>
                <Button
                  variant='outline'
                  className='w-full h-10 sm:h-12'
                  onClick={() => {
                    setSearchQuery('');
                    setGenderFilter('all');
                    setDoctorFilter('all');
                    setItemsPerPage(20);
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
        {!isLoading && patients.length > 0 && (
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4'>
            <p className='text-sm sm:text-base text-muted-foreground'>
              Жами:{' '}
              <span className='font-semibold text-foreground'>
                {patients.length}
              </span>{' '}
              бемор
              {patientdata?.pagination && (
                <span className='text-xs ml-2'>
                  ({patientdata.pagination.total_items} дан)
                </span>
              )}
            </p>
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
                searchQuery ? setSearchQuery('') : setShowNewPatient(true)
              }
            />
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='block lg:hidden space-y-3 sm:space-y-4'>
              {patients.map((patient) => (
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
                      {patient.diagnosis && (
                        <div className='flex items-center gap-2 text-xs sm:text-sm'>
                          <Users className='w-4 h-4 text-muted-foreground' />
                          <span>{patient?.diagnosis?.diagnosis_id?.name}</span>
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
                    {patients.map((patient) => (
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
                          {patient.diagnosis
                            ? `${patient.diagnosis?.doctor_id?.fullname}`
                            : '-'}
                        </td>
                        <td className='px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm '>
                          {patient?.diagnosis?.diagnosis_id?.name || 'Йўқ'}
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
            </Card>

            {/* Pagination */}
            {patientdata?.pagination &&
              patientdata.pagination.total_pages > 1 && (
                <div className='mt-6 flex flex-col lg:flex-row items-center justify-between gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      Саҳифада:
                    </span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className='h-8 sm:h-10 text-sm sm:text-base w-24'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='10'>10</SelectItem>
                        <SelectItem value='20'>20</SelectItem>
                        <SelectItem value='50'>50</SelectItem>
                        <SelectItem value='100'>100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='flex justify-center w-full lg:w-auto'>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            className={
                              currentPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {/* First page */}
                        {currentPage > 2 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(1)}
                              className='cursor-pointer'
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis before */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Previous page */}
                        {currentPage > 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(currentPage - 1)}
                              className='cursor-pointer'
                            >
                              {currentPage - 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Current page */}
                        <PaginationItem>
                          <PaginationLink isActive className='cursor-default'>
                            {currentPage}
                          </PaginationLink>
                        </PaginationItem>

                        {/* Next page */}
                        {currentPage <
                          (patientdata.pagination?.total_pages || 1) && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => setCurrentPage(currentPage + 1)}
                              className='cursor-pointer'
                            >
                              {currentPage + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Ellipsis after */}
                        {currentPage <
                          (patientdata.pagination?.total_pages || 1) - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}

                        {/* Last page */}
                        {currentPage <
                          (patientdata.pagination?.total_pages || 1) - 1 && (
                          <PaginationItem>
                            <PaginationLink
                              onClick={() =>
                                setCurrentPage(
                                  patientdata.pagination?.total_pages || 1
                                )
                              }
                              className='cursor-pointer'
                            >
                              {patientdata.pagination?.total_pages || 1}
                            </PaginationLink>
                          </PaginationItem>
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(
                                  prev + 1,
                                  patientdata.pagination?.total_pages || 1
                                )
                              )
                            }
                            className={
                              currentPage ===
                              (patientdata.pagination?.total_pages || 1)
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
          </>
        )}
      </main>

      {/* New Patient Modal */}
      <NewPatient open={showNewPatient} onOpenChange={setShowNewPatient} />
    </div>
  );
};

export default Patients;
