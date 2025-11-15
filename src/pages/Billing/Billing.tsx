import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import NewBilling from './components/NewBilling';

interface Invoice {
  invoiceNumber: string;
  patientName: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Тўланмаган' | 'Қисман тўланган' | 'Тўланган';
}

export interface Service {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Billing = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [selectedExaminationId, setSelectedExaminationId] = useState('');

  // Mock data
  const invoices: Invoice[] = [
    {
      invoiceNumber: 'INV-2025-001',
      patientName: 'Алиев Анвар Рашидович',
      date: '07.10.2025',
      totalAmount: 500000,
      paidAmount: 500000,
      balance: 0,
      status: 'Тўланган',
    },
    {
      invoiceNumber: 'INV-2025-002',
      patientName: 'Каримова Нилуфар Азизовна',
      date: '07.10.2025',
      totalAmount: 850000,
      paidAmount: 400000,
      balance: 450000,
      status: 'Қисман тўланган',
    },
    {
      invoiceNumber: 'INV-2025-003',
      patientName: 'Усмонов Жахонгир Баходирович',
      date: '06.10.2025',
      totalAmount: 320000,
      paidAmount: 0,
      balance: 320000,
      status: 'Тўланмаган',
    },
  ];

  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'Консультация терапевта',
      quantity: 1,
      unitPrice: 150000,
      total: 150000,
    },
    {
      id: '2',
      name: 'Умумий қон таҳлили',
      quantity: 1,
      unitPrice: 80000,
      total: 80000,
    },
  ]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Тўланмаган: 'bg-danger/10 text-danger border-danger/20 border',
      'Қисман тўланган': 'bg-warning/10 text-warning border-warning/20 border',
      Тўланган: 'bg-success/10 text-success border-success/20 border',
    };
    return <Badge className={colors[status] || ''}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  const calculateSubtotal = () => {
    return services.reduce((sum, service) => sum + service.total, 0);
  };

  const calculateGrandTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discount;
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setServices(
      services.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Илтимос, тўлов миқдорини киритинг');
      return;
    }

    toast.success('Тўлов қайд қилинди', {
      description: `${formatCurrency(parseFloat(paymentAmount))} - ${
        paymentMethod === 'cash' ? 'Нақд' : 'Карта'
      }`,
    });
    setPaymentAmount('');
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='min-h-screen bg-background'>
      {/* Main Content */}
      <main className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6'>
        {/* Add Button */}
        <div className='mb-4 sm:mb-6'>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-9 sm:pl-10 text-sm'
                />
              </div>
            </div>
            <div>
              <Label>Ҳолат</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder='Барчаси' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Барчаси</SelectItem>
                  <SelectItem value='Тўланмаган'>Тўланмаган</SelectItem>
                  <SelectItem value='Қисман тўланган'>
                    Қисман тўланган
                  </SelectItem>
                  <SelectItem value='Тўланган'>Тўланган</SelectItem>
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
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                      Ҳисоб №
                    </th>
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
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                      Ҳолат
                    </th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground text-sm'>
                      Ҳаракатлар
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.invoiceNumber}
                      className='border-b hover:bg-muted/50 transition-colors'
                    >
                      <td className='py-3 px-4 font-medium text-sm'>
                        {invoice.invoiceNumber}
                      </td>
                      <td className='py-3 px-4 text-sm'>
                        {invoice.patientName}
                      </td>
                      <td className='py-3 px-4 text-sm text-muted-foreground'>
                        {invoice.date}
                      </td>
                      <td className='py-3 px-4 text-right font-semibold text-sm'>
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className='py-3 px-4 text-right text-success text-sm'>
                        {formatCurrency(invoice.paidAmount)}
                      </td>
                      <td className='py-3 px-4 text-right text-danger font-semibold text-sm'>
                        {formatCurrency(invoice.balance)}
                      </td>
                      <td className='py-3 px-4'>
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setIsInvoiceModalOpen(true)}
                          >
                            Кўриш
                          </Button>
                          {invoice.status !== 'Тўланган' && (
                            <Button size='sm'>Тўлаш</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Invoices Cards - Mobile/Tablet View */}
        <div className='lg:hidden space-y-3'>
          <h2 className='text-lg font-semibold px-1 mb-2'>
            Ҳисоб-фактуралар рўйхати
          </h2>
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.invoiceNumber} className='p-4'>
              <div className='space-y-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <div className='font-semibold text-sm truncate'>
                      {invoice.patientName}
                    </div>
                    <div className='text-xs text-muted-foreground mt-0.5'>
                      {invoice.invoiceNumber}
                    </div>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>

                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <div className='text-xs text-muted-foreground mb-1'>
                      Сана
                    </div>
                    <div className='font-medium'>{invoice.date}</div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs text-muted-foreground mb-1'>
                      Жами
                    </div>
                    <div className='font-semibold'>
                      {formatCurrency(invoice.totalAmount)}
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3 text-sm'>
                  <div>
                    <div className='text-xs text-muted-foreground mb-1'>
                      Тўланган
                    </div>
                    <div className='font-medium text-success'>
                      {formatCurrency(invoice.paidAmount)}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-xs text-muted-foreground mb-1'>
                      Қолдиқ
                    </div>
                    <div className='font-semibold text-danger'>
                      {formatCurrency(invoice.balance)}
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 pt-2 border-t'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className='flex-1 text-xs'
                  >
                    Кўриш
                  </Button>
                  {invoice.status !== 'Тўланган' && (
                    <Button size='sm' className='flex-1 text-xs'>
                      Тўлаш
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Payment History Summary */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6'>
          <Card className='p-4 sm:p-5 lg:p-6'>
            <div className='text-xs sm:text-sm text-muted-foreground mb-1'>
              Бугунги даромад
            </div>
            <div className='text-xl sm:text-2xl font-bold text-success'>
              {formatCurrency(1270000)}
            </div>
          </Card>
          <Card className='p-4 sm:p-5 lg:p-6'>
            <div className='text-xs sm:text-sm text-muted-foreground mb-1'>
              Бу ҳафта
            </div>
            <div className='text-xl sm:text-2xl font-bold'>
              {formatCurrency(5840000)}
            </div>
          </Card>
          <Card className='p-4 sm:p-5 lg:p-6 sm:col-span-2 lg:col-span-1'>
            <div className='text-xs sm:text-sm text-muted-foreground mb-1'>
              Қарзлар жами
            </div>
            <div className='text-xl sm:text-2xl font-bold text-danger'>
              {formatCurrency(770000)}
            </div>
          </Card>
        </div>
      </main>

      {/* Invoice Modal */}
      <NewBilling
        isInvoiceModalOpen={isInvoiceModalOpen}
        setIsInvoiceModalOpen={setIsInvoiceModalOpen}
        addService={addService}
        services={services}
        updateService={updateService}
        formatCurrency={formatCurrency}
        removeService={removeService}
        discount={discount}
        setDiscount={setDiscount}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        selectedExaminationId={selectedExaminationId}
        setSelectedExaminationId={setSelectedExaminationId}
        calculateSubtotal={calculateSubtotal}
        calculateGrandTotal={calculateGrandTotal}
      />
    </div>
  );
};

export default Billing;
