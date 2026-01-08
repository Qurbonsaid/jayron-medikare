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
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDateLocale } from '@/hooks/useDateLocale';

// Truncate text helper
const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const History = () => {
  const { t } = useTranslation('history');
  const dateLocale = useDateLocale();

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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[50px] text-center'>{t('table.number')}</TableHead>
                      <TableHead className='min-w-[150px]'>{t('table.patientInfo')}</TableHead>
                      <TableHead className='min-w-[150px]'>{t('table.diagnosis')}</TableHead>
                      <TableHead className='min-w-[200px]'>{t('table.prescriptions')}</TableHead>
                      <TableHead className='w-[120px]'>{t('table.completedDate')}</TableHead>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='font-medium cursor-default block'>
                                {truncateText(item.patient_info, 20)}
                              </span>
                            </TooltipTrigger>
                            {item.patient_info && item.patient_info.length > 20 && (
                              <TooltipContent side='top' className='max-w-[300px]'>
                                <p>{item.patient_info}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-sm cursor-default block'>
                                {truncateText(item.diagnosis, 25)}
                              </span>
                            </TooltipTrigger>
                            {item.diagnosis && item.diagnosis.length > 25 && (
                              <TooltipContent side='top' className='max-w-[400px]'>
                                <p>{item.diagnosis}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-sm cursor-default block'>
                                {formatPrescriptions(item.prescriptions, 40)}
                              </span>
                            </TooltipTrigger>
                            {item.prescriptions && item.prescriptions.length > 0 && (
                              <TooltipContent side='top' className='max-w-[500px]'>
                                <div className='space-y-1'>
                                  {item.prescriptions.slice(0, 5).map((p, idx) => (
                                    <p key={idx} className='text-xs'>
                                      {idx + 1}. {p}
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
                        <TableCell className='text-sm'>
                          {item.completed_date
                            ? format(new Date(item.completed_date), 'dd.MM.yyyy', {
                                locale: dateLocale,
                              })
                            : '-'}
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
                <div className='border-t px-3 sm:px-4 lg:px-6 py-3 sm:py-4'>
                  <div className='flex flex-col sm:flex-row items-center justify-between gap-3'>
                    {/* Total info */}
                    <div className='text-xs sm:text-sm text-muted-foreground order-2 sm:order-1'>
                      {t('pagination.total')}: {pagination.total_count} {t('pagination.items')}
                    </div>

                    {/* Pagination controls */}
                    <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto'>
                      {/* Items per page */}
                      <div className='flex items-center gap-2'>
                        <span className='text-xs sm:text-sm text-muted-foreground whitespace-nowrap'>
                          {t('pagination.perPage')}:
                        </span>
                        <Select
                          value={String(itemsPerPage)}
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value));
                            setCurrentPage(1);
                          }}
                        >
                          <SelectTrigger className='w-[70px] h-8 text-sm'>
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

                      {/* Page navigation */}
                      {pagination.total_pages > 1 && (
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || isFetching}
                            className='h-8 w-8'
                          >
                            <ChevronLeft className='w-4 h-4' />
                          </Button>

                          <div className='flex items-center gap-1'>
                            {/* Show page numbers for desktop */}
                            <div className='hidden sm:flex items-center gap-1'>
                              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                let pageNum: number;
                                if (pagination.total_pages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= pagination.total_pages - 2) {
                                  pageNum = pagination.total_pages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                    size='icon'
                                    onClick={() => setCurrentPage(pageNum)}
                                    disabled={isFetching}
                                    className='h-8 w-8 text-xs'
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>

                            {/* Show simple text for mobile */}
                            <span className='sm:hidden px-2 text-sm whitespace-nowrap'>
                              {currentPage} / {pagination.total_pages}
                            </span>
                          </div>

                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() =>
                              setCurrentPage((p) => Math.min(pagination.total_pages, p + 1))
                            }
                            disabled={currentPage === pagination.total_pages || isFetching}
                            className='h-8 w-8'
                          >
                            <ChevronRight className='w-4 h-4' />
                          </Button>
                        </div>
                      )}
                    </div>
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
                          {idx + 1}. {prescription}
                        </div>
                      ))
                    ) : (
                      <span className='text-muted-foreground text-sm'>-</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default History;
