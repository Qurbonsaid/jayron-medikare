import { useGetAllHistoryQuery } from '@/app/api/historyApi';
import type { HistoryItem } from '@/app/api/historyApi/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CalendarIcon,
  Eye,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { IconLeft, IconRight } from 'react-day-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDateLocale } from '@/hooks/useDateLocale';

// Truncate text helper
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const History = () => {
  const { t } = useTranslation('history');
  const dateLocale = useDateLocale();
  const navigate = useNavigate();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // API Query
  const { data, isLoading, isFetching } = useGetAllHistoryQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
  });

  const historyItems = data?.data || [];
  const pagination = data?.pagination;

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCurrentPage(1);
  };

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedHistory(item);
    setIsDetailModalOpen(true);
  };

  const hasFilters = searchQuery || startDate || endDate;

  // Prescription text formatter
  const formatPrescriptions = (prescriptions: string[] | undefined, maxLength: number = 40) => {
    if (!prescriptions || prescriptions.length === 0) return '-';
    const firstPrescription = prescriptions[0];
    const truncated = truncateText(firstPrescription, maxLength);
    if (prescriptions.length > 1) {
      return `${truncated} (+${prescriptions.length - 1})`;
    }
    return truncated;
  };

  return (
    <div className='min-h-screen bg-background'>
      <main className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8'>
        {/* Page Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6'>
          <div>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-1'>
              {t('title')}
            </h1>
            <p className='text-xs sm:text-sm text-muted-foreground'>
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className='card-shadow mb-4 sm:mb-6'>
          <div className='p-3 sm:p-4 lg:p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4'>
              {/* Search - takes more space */}
              <div className='col-span-1 sm:col-span-2 lg:col-span-4'>
                <label className='block text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-1.5'>
                  {t('search')}
                </label>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    className='pl-9 h-9 sm:h-10 text-sm'
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className='col-span-1 lg:col-span-3'>
                <label className='block text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-1.5'>
                  {t('startDate')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full h-9 sm:h-10 justify-start text-left font-normal text-sm',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4 flex-shrink-0' />
                      <span className='truncate'>
                        {startDate
                          ? format(startDate, 'dd.MM.yyyy', { locale: dateLocale })
                          : t('startDate')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setCurrentPage(1);
                      }}
                      locale={dateLocale}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className='col-span-1 lg:col-span-3'>
                <label className='block text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-1.5'>
                  {t('endDate')}
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full h-9 sm:h-10 justify-start text-left font-normal text-sm',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4 flex-shrink-0' />
                      <span className='truncate'>
                        {endDate
                          ? format(endDate, 'dd.MM.yyyy', { locale: dateLocale })
                          : t('endDate')}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setCurrentPage(1);
                      }}
                      locale={dateLocale}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filter Button - always visible */}
              <div className='col-span-1 sm:col-span-2 lg:col-span-2 flex items-end'>
                <Button
                  variant='outline'
                  onClick={handleClearFilters}
                  disabled={!hasFilters}
                  className='w-full h-9 sm:h-10 text-sm'
                >
                  <X className='w-4 h-4 mr-1 sm:mr-2' />
                  <span className='hidden sm:inline'>{t('clearFilter')}</span>
                  <span className='sm:hidden'>{t('clearFilter')}</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className='card-shadow'>
          {isLoading ? (
            <div className='p-6 sm:p-8'>
              <LoadingSpinner
                size='lg'
                text={t('loading')}
                className='justify-center'
              />
            </div>
          ) : historyItems.length === 0 ? (
            <div className='p-6 sm:p-8'>
              <EmptyState
                icon={FileText}
                title={t('noResults')}
                description={t('noResultsDescription')}
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className='hidden md:block overflow-x-auto'>
                <Table className='[&_th]:border-r [&_th:last-child]:border-r-0 [&_td]:border-r [&_td:last-child]:border-r-0'>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[50px] text-center'>{t('table.number')}</TableHead>
                      <TableHead className='min-w-[150px]'>{t('table.patientInfo')}</TableHead>
                      <TableHead className='min-w-[150px]'>{t('table.diagnosis')}</TableHead>
                      <TableHead className='min-w-[250px]'>{t('table.prescriptions')}</TableHead>
                      <TableHead className='w-[80px] text-center'>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item, index) => (
                      <TableRow key={item._id}>
                        <TableCell className='text-center font-medium'>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </TableCell>
                        <TableCell>
                          {/* XL da to'liq ko'rsatish, kichik ekranlarda tooltip */}
                          <span className='hidden xl:block font-medium'>
                            {item.patient_info || '-'}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='xl:hidden font-medium cursor-default block'>
                                {truncateText(item.patient_info, 20)}
                              </span>
                            </TooltipTrigger>
                            {item.patient_info && item.patient_info.length > 20 && (
                              <TooltipContent side='top' className='max-w-[300px] xl:hidden'>
                                <p>{item.patient_info}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {/* XL da to'liq ko'rsatish, kichik ekranlarda tooltip */}
                          <span className='hidden xl:block text-sm'>
                            {item.diagnosis || '-'}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='xl:hidden text-sm cursor-default block'>
                                {truncateText(item.diagnosis, 25)}
                              </span>
                            </TooltipTrigger>
                            {item.diagnosis && item.diagnosis.length > 25 && (
                              <TooltipContent side='top' className='max-w-[400px] xl:hidden'>
                                <p>{item.diagnosis}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          {/* XL da to'liq ko'rsatish, kichik ekranlarda tooltip */}
                          <div className='hidden xl:block text-sm space-y-0.5'>
                            {item.prescriptions && item.prescriptions.length > 0 ? (
                              item.prescriptions.slice(0, 3).map((p, idx) => (
                                <p key={idx} className='text-sm'>
                                  <span className='font-bold'>{idx + 1}.</span> {p}
                                </p>
                              ))
                            ) : (
                              '-'
                            )}
                            {item.prescriptions && item.prescriptions.length > 3 && (
                              <p className='text-sm text-muted-foreground'>
                                +{item.prescriptions.length - 3} {t('pagination.items')}...
                              </p>
                            )}
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='xl:hidden text-sm cursor-default block'>
                                {formatPrescriptions(item.prescriptions, 40)}
                              </span>
                            </TooltipTrigger>
                            {item.prescriptions && item.prescriptions.length > 0 && (
                              <TooltipContent side='top' className='max-w-[500px] xl:hidden'>
                                <div className='space-y-1'>
                                  {item.prescriptions.slice(0, 5).map((p, idx) => (
                                    <p key={idx} className='text-xs'>
                                      <span className='font-bold'>{idx + 1}.</span> {p}
                                    </p>
                                  ))}
                                  {item.prescriptions.length > 5 && (
                                    <p className='text-xs text-muted-foreground'>
                                      +{item.prescriptions.length - 5} {t('pagination.items')}...
                                    </p>
                                  )}
                                </div>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center justify-center'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => handleViewDetails(item)}
                              title={t('viewDetails')}
                              className='h-8 w-8'
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className='md:hidden divide-y'>
                {historyItems.map((item, index) => (
                  <div key={item._id} className='p-3 sm:p-4'>
                    <div className='flex items-start justify-between gap-2 mb-2'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded'>
                          #{(currentPage - 1) * itemsPerPage + index + 1}
                        </span>
                        <span className='text-xs text-muted-foreground'>
                          {item.completed_date
                            ? format(new Date(item.completed_date), 'dd.MM.yyyy', {
                                locale: dateLocale,
                              })
                            : '-'}
                        </span>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleViewDetails(item)}
                        className='h-7 px-2'
                      >
                        <Eye className='w-3.5 h-3.5 mr-1' />
                        <span className='text-xs'>{t('viewDetails')}</span>
                      </Button>
                    </div>

                    <div className='space-y-1.5'>
                      <div>
                        <span className='text-xs text-muted-foreground'>{t('table.patientInfo')}:</span>
                        <p className='text-sm font-medium'>{item.patient_info || '-'}</p>
                      </div>

                      <div>
                        <span className='text-xs text-muted-foreground'>{t('table.diagnosis')}:</span>
                        <p className='text-sm'>{truncateText(item.diagnosis, 50)}</p>
                      </div>

                      {item.prescriptions && item.prescriptions.length > 0 && (
                        <div>
                          <span className='text-xs text-muted-foreground'>{t('table.prescriptions')}:</span>
                          <p className='text-sm'>
                            {item.prescriptions[0].length > 60
                              ? item.prescriptions[0].substring(0, 60) + '...'
                              : item.prescriptions[0]}
                            {item.prescriptions.length > 1 && (
                              <span className='text-muted-foreground'> (+{item.prescriptions.length - 1})</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.total_pages > 0 && (
                <div className='px-3 xl:px-6 py-2 xl:py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3'>
                  <div className='flex items-center justify-between gap-2'>
                    <div className='text-xs xl:text-sm text-muted-foreground min-w-max'>
                      {t('pagination.page')} {currentPage} {t('pagination.of')}{' '}
                      {pagination.total_pages} ({t('pagination.total')}:{' '}
                      {pagination.total_count})
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      disabled={currentPage === 1 || isFetching}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className='text-xs xl:text-sm'
                    >
                      <IconLeft className='w-4 h-4' />
                      <span className='hidden sm:inline'>{t('pagination.prev')}</span>
                    </Button>
                    {(() => {
                      const pages = [];
                      const showPages = new Set<number>();

                      // Har doim 1-sahifani ko'rsat
                      showPages.add(1);

                      // Har doim oxirgi sahifani ko'rsat
                      if (pagination.total_pages > 1) {
                        showPages.add(pagination.total_pages);
                      }

                      // Joriy sahifa va uning atrofidagi sahifalarni ko'rsat
                      for (
                        let i = Math.max(2, currentPage - 1);
                        i <=
                        Math.min(
                          pagination.total_pages - 1,
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
                              className='px-1 flex items-center text-xs xl:text-sm'
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
                            disabled={isFetching}
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
                      disabled={currentPage === pagination.total_pages || isFetching}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className='text-xs xl:text-sm'
                    >
                      <span className='hidden sm:inline'>{t('pagination.next')}</span>
                      <IconRight className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className='w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6'>
            <DialogHeader>
              <DialogTitle className='text-lg sm:text-xl'>{t('viewDetails')}</DialogTitle>
            </DialogHeader>
            {selectedHistory && (
              <div className='space-y-4 mt-2'>
                {/* Patient Info */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
                  <div>
                    <label className='text-xs sm:text-sm font-medium text-muted-foreground'>
                      {t('table.patientInfo')}
                    </label>
                    <p className='mt-1 text-sm sm:text-base font-medium'>{selectedHistory.patient_info}</p>
                  </div>
                  <div>
                    <label className='text-xs sm:text-sm font-medium text-muted-foreground'>
                      {t('table.completedDate')}
                    </label>
                    <p className='mt-1 text-sm sm:text-base'>
                      {selectedHistory.completed_date
                        ? format(new Date(selectedHistory.completed_date), 'dd.MM.yyyy HH:mm', {
                            locale: dateLocale,
                          })
                        : '-'}
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <label className='text-xs sm:text-sm font-medium text-muted-foreground'>
                    {t('table.diagnosis')}
                  </label>
                  <p className='mt-1 text-sm sm:text-base'>{selectedHistory.diagnosis || '-'}</p>
                </div>

                {/* Prescriptions */}
                <div>
                  <label className='text-xs sm:text-sm font-medium text-muted-foreground'>
                    {t('table.prescriptions')}
                  </label>
                  <div className='mt-2 space-y-1.5 bg-muted/50 p-3 sm:p-4 rounded-lg max-h-[40vh] overflow-y-auto'>
                    {selectedHistory.prescriptions && selectedHistory.prescriptions.length > 0 ? (
                      selectedHistory.prescriptions.map((prescription, idx) => (
                        <div key={idx} className='text-xs sm:text-sm'>
                          <span className='font-bold'>{idx + 1}.</span> {prescription}
                        </div>
                      ))
                    ) : (
                      <span className='text-muted-foreground text-sm'>-</span>
                    )}
                  </div>
                </div>

                {/* Batafsil button */}
                {selectedHistory.examination_id && (
                  <div className='pt-2'>
                    <Button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        navigate(`/examination/${selectedHistory.examination_id}`);
                      }}
                      className='w-full sm:w-auto'
                    >
                      <Eye className='w-4 h-4 mr-2' />
                      {t('viewDetails')}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default History;
