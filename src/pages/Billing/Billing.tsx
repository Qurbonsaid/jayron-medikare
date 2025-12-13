import { useGetAllBillingQuery } from '@/app/api/billingApi/billingApi';
import type { service_type as ServiceType } from '@/app/api/billingApi/types';
import CantRead from '@/components/common/CantRead';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouteActions } from '@/hooks/RBS';
import { format } from 'date-fns';
import { FileText, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import {
  formatCurrency,
  getBillingStatusBadge,
} from './components/BillingBadge';
import NewBilling from './components/NewBilling';
import ViewBillingDialog from './components/ViewBillingDialog';

export interface Service {
  id: string;
  name: string;
  service_type: ServiceType;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Custom Billing Status Badge

const Billing = () => {
  const { canRead } = useRouteActions('/billing');

  if (!canRead) return <CantRead />;
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data, isLoading } = useGetAllBillingQuery({});

  const invoices = data?.data || [];

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patient_id.fullname
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      invoice._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (filter: string) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Main Content */}
      <main className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6'>
        {/* Add Button */}
        <div className='mb-4 sm:mb-6 text-right'>
          <Button
            onClick={() => setIsInvoiceModalOpen(true)}
            className='w-full sm:w-auto text-sm'
          >
            <Plus className='w-4 h-4 mr-2' />
            Янги ҳисоб-фактура
          </Button>
        </div>
        {/* Filters */}
        <Card className='p-3 sm:p-4 mb-4 sm:mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4'>
            <div className='md:col-span-2'>
              <Label className='text-xs sm:text-sm'>Қидириш</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground' />
                <Input
                  placeholder='Бемор номи ёки ҳисоб-фактура рақами...'
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='pl-9 sm:pl-10 text-sm'
                />
              </div>
            </div>
            <div>
              <Label>Ҳолат</Label>
              <Select value={statusFilter} onValueChange={handleFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Барчаси' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Барчаси</SelectItem>
                  <SelectItem value='incompleted'>Тўланмаган</SelectItem>
                  <SelectItem value='pending'>Қисман тўланган</SelectItem>
                  <SelectItem value='completed'>Тўланган</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Invoices Table - Desktop View */}
        <Card className='hidden lg:block'>
          <div className='p-4 lg:p-6'>
            <h2 className='text-lg lg:text-xl font-semibold mb-4'>
              Ҳисоб-фактуралар рўйхати
            </h2>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <LoadingSpinner />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title='Ҳисоб-фактуралар топилмади'
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Филтр шартларига мос маълумот топилмади'
                    : 'Ҳали ҳисоб-фактуралар яратилмаган'
                }
              />
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b'>
                      {/* <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Ҳисоб №
                      </th> */}
                      <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Бемор
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Сана
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Жами
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Тўланган
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Қолдиқ
                      </th>
                      <th className='text-center py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Ҳолат
                      </th>
                      <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                        Ҳаракатлар
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.map((invoice) => (
                      <tr
                        key={invoice._id}
                        className='border-b hover:bg-muted/50 transition-colors'
                      >
                        {/* <td className='py-3 px-4 font-medium text-sm'>
                          {invoice._id}
                        </td> */}
                        <td className='py-3 px-4 text-sm'>
                          {invoice.patient_id.fullname}
                        </td>
                        <td className='py-3 px-4 text-sm text-muted-foreground'>
                          {format(invoice.created_at, 'dd-MM-yyy')}
                        </td>
                        <td className='py-3 px-4 text-right font-semibold text-sm'>
                          {formatCurrency(invoice.total_amount)}
                        </td>
                        <td className='py-3 px-4 text-right text-success text-sm'>
                          {formatCurrency(invoice.paid_amount)}
                        </td>
                        <td className='py-3 px-4 text-right text-danger font-semibold text-sm'>
                          {formatCurrency(invoice.debt_amount)}
                        </td>
                        <td className='py-3 px-4 text-center'>
                          {getBillingStatusBadge(invoice.status)}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                setSelectedBillingId(invoice._id);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              Кўриш
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls - Desktop */}
            {!isLoading && filteredInvoices.length > 0 && (
              <div className='flex items-center justify-between px-4 py-4 border-t'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredInvoices.length)} /{' '}
                    {filteredInvoices.length}
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className='w-20 h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Олдинги
                  </Button>
                  <div className='flex items-center gap-1'>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size='sm'
                          className='w-8 h-8'
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Кейинги
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Invoices Cards - Mobile/Tablet View */}
        <div className='lg:hidden space-y-3'>
          <h2 className='text-lg font-semibold px-1 mb-2'>
            Ҳисоб-фактуралар рўйхати
          </h2>
          {isLoading ? (
            <Card className='p-8'>
              <div className='flex justify-center'>
                <LoadingSpinner />
              </div>
            </Card>
          ) : filteredInvoices.length === 0 ? (
            <Card className='p-6'>
              <EmptyState
                icon={FileText}
                title='Ҳисоб-фактуралар топилмади'
                description={
                  searchQuery || statusFilter !== 'all'
                    ? 'Филтр шартларига мос маълумот топилмади'
                    : 'Ҳали ҳисоб-фактуралар яратилмаган'
                }
              />
            </Card>
          ) : (
            paginatedInvoices.map((invoice) => (
              <Card key={invoice._id} className='p-4'>
                <div className='space-y-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex-1 min-w-0'>
                      <div className='font-semibold text-sm truncate'>
                        {invoice.patient_id.fullname}
                      </div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        {invoice._id}
                      </div>
                    </div>
                    {getBillingStatusBadge(invoice.status)}
                  </div>

                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <div className='text-xs text-muted-foreground mb-1'>
                        Сана
                      </div>
                      <div className='font-medium'>
                        {format(invoice.created_at, 'dd-MM-yyy')}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs text-muted-foreground mb-1'>
                        Жами
                      </div>
                      <div className='font-semibold'>
                        {formatCurrency(invoice.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-3 text-sm'>
                    <div>
                      <div className='text-xs text-muted-foreground mb-1'>
                        Тўланган
                      </div>
                      <div className='font-medium text-success'>
                        {formatCurrency(invoice.paid_amount)}
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-xs text-muted-foreground mb-1'>
                        Қолдиқ
                      </div>
                      <div className='font-semibold text-danger'>
                        {formatCurrency(invoice.debt_amount)}
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-2 pt-2 border-t'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setSelectedBillingId(invoice._id);
                        setIsViewDialogOpen(true);
                      }}
                      className='flex-1 text-xs'
                    >
                      Кўриш
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Pagination Controls - Mobile */}
          {!isLoading && filteredInvoices.length > 0 && (
            <Card className='p-3'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='text-muted-foreground'>
                    {startIndex + 1}-
                    {Math.min(endIndex, filteredInvoices.length)} /{' '}
                    {filteredInvoices.length}
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className='w-20 h-8'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='5'>5</SelectItem>
                      <SelectItem value='10'>10</SelectItem>
                      <SelectItem value='20'>20</SelectItem>
                      <SelectItem value='50'>50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center justify-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Олдинги
                  </Button>
                  <span className='text-sm font-medium px-3'>
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Кейинги
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
      {/* Invoice Modal */}
      <NewBilling
        isInvoiceModalOpen={isInvoiceModalOpen}
        setIsInvoiceModalOpen={setIsInvoiceModalOpen}
      />
      {/* View Billing Dialog */}
      <ViewBillingDialog
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false);
          setSelectedBillingId(null);
        }}
        billingId={selectedBillingId}
      />
    </div>
  );
};

export default Billing;
