import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard, Plus, Printer, Search, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Invoice {
  invoiceNumber: string;
  patientName: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Тўланмаган' | 'Қисман тўланган' | 'Тўланган';
}

interface Service {
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
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6'>
          <DialogHeader>
            <DialogTitle className='text-xl sm:text-2xl'>
              Янги ҳисоб-фактура
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4 sm:space-y-6'>
            {/* Patient Info */}
            <Card className='p-3 sm:p-4 bg-muted/50'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Бемор</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    Каримова Нилуфар Азизовна
                  </div>
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>ID</Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    PAT-2025-0042
                  </div>
                </div>
                <div className='sm:col-span-2 lg:col-span-1'>
                  <Label className='text-xs text-muted-foreground'>
                    Телефон
                  </Label>
                  <div className='font-semibold text-sm sm:text-base'>
                    +998 90 123 45 67
                  </div>
                </div>
              </div>
            </Card>

            {/* Services Table */}
            <div>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3'>
                <Label className='text-base sm:text-lg font-semibold'>
                  Хизматлар
                </Label>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={addService}
                  className='w-full sm:w-auto text-xs sm:text-sm'
                >
                  <Plus className='w-3 h-3 sm:w-4 sm:h-4 mr-2' />
                  Хизмат қўшиш
                </Button>
              </div>

              {/* Desktop Table View */}
              <div className='hidden md:block border rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-muted'>
                    <tr>
                      <th className='text-left py-3 px-4 font-medium text-sm'>
                        Хизмат номи
                      </th>
                      <th className='text-center py-3 px-4 font-medium text-sm'>
                        Сони
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm'>
                        Нархи
                      </th>
                      <th className='text-right py-3 px-4 font-medium text-sm'>
                        Жами
                      </th>
                      <th className='w-16'></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className='border-b'>
                        <td className='py-2 px-4'>
                          <Input
                            value={service.name}
                            onChange={(e) =>
                              updateService(service.id, 'name', e.target.value)
                            }
                            placeholder='Хизмат номи...'
                            className='text-sm'
                          />
                        </td>
                        <td className='py-2 px-4'>
                          <Input
                            type='number'
                            min='1'
                            value={service.quantity}
                            onChange={(e) =>
                              updateService(
                                service.id,
                                'quantity',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className='w-20 mx-auto text-center text-sm'
                          />
                        </td>
                        <td className='py-2 px-4'>
                          <Input
                            type='number'
                            value={service.unitPrice}
                            onChange={(e) =>
                              updateService(
                                service.id,
                                'unitPrice',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='text-right text-sm'
                          />
                        </td>
                        <td className='py-2 px-4 text-right font-semibold text-sm'>
                          {formatCurrency(service.total)}
                        </td>
                        <td className='py-2 px-4'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => removeService(service.id)}
                            className='text-danger hover:text-danger'
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className='md:hidden space-y-3'>
                {services.map((service) => (
                  <Card key={service.id} className='p-3'>
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <Label className='text-xs text-muted-foreground'>
                          Хизмат номи
                        </Label>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => removeService(service.id)}
                          className='text-danger hover:text-danger h-6 w-6 p-0 -mt-1'
                        >
                          ×
                        </Button>
                      </div>
                      <Input
                        value={service.name}
                        onChange={(e) =>
                          updateService(service.id, 'name', e.target.value)
                        }
                        placeholder='Хизмат номи...'
                        className='text-sm'
                      />

                      <div className='grid grid-cols-2 gap-3'>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Сони
                          </Label>
                          <Input
                            type='number'
                            min='1'
                            value={service.quantity}
                            onChange={(e) =>
                              updateService(
                                service.id,
                                'quantity',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className='text-sm'
                          />
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground mb-1.5 block'>
                            Нархи
                          </Label>
                          <Input
                            type='number'
                            value={service.unitPrice}
                            onChange={(e) =>
                              updateService(
                                service.id,
                                'unitPrice',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='text-sm'
                          />
                        </div>
                      </div>

                      <div className='pt-2 border-t flex justify-between items-center'>
                        <span className='text-xs text-muted-foreground'>
                          Жами:
                        </span>
                        <span className='font-semibold text-sm'>
                          {formatCurrency(service.total)}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
              <div className='space-y-3 sm:space-y-4'>
                <div>
                  <Label className='text-sm'>Чегирма (сўм)</Label>
                  <Input
                    type='number'
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    placeholder='0'
                    className='text-sm'
                  />
                </div>

                <Card className='p-3 sm:p-4 bg-primary/5'>
                  <div className='flex justify-between items-center mb-2 text-sm'>
                    <span className='text-muted-foreground'>Оралиқ жами:</span>
                    <span className='font-semibold'>
                      {formatCurrency(calculateSubtotal())}
                    </span>
                  </div>
                  <div className='flex justify-between items-center mb-2 text-sm'>
                    <span className='text-muted-foreground'>Чегирма:</span>
                    <span className='text-danger'>
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                  <div className='border-t pt-2 flex justify-between items-center'>
                    <span className='text-base sm:text-lg font-semibold'>
                      Жами тўлов:
                    </span>
                    <span className='text-lg sm:text-2xl font-bold text-primary'>
                      {formatCurrency(calculateGrandTotal())}
                    </span>
                  </div>
                </Card>
              </div>

              <div className='space-y-3 sm:space-y-4'>
                <div>
                  <Label className='text-sm'>Тўлов миқдори</Label>
                  <Input
                    type='number'
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder='0'
                    className='text-sm'
                  />
                </div>

                <div>
                  <Label className='text-sm'>Тўлов усули</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger className='text-sm'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='cash'>
                        <div className='flex items-center'>
                          <CreditCard className='w-4 h-4 mr-2' />
                          Нақд
                        </div>
                      </SelectItem>
                      <SelectItem value='card'>Карта</SelectItem>
                      <SelectItem value='click'>Click</SelectItem>
                      <SelectItem value='payme'>Payme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className='w-full text-sm'
                  onClick={handleRecordPayment}
                >
                  <CreditCard className='w-4 h-4 mr-2' />
                  Тўловни қайд қилиш
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 flex-col sm:flex-row'>
            <Button
              variant='outline'
              onClick={() => setIsInvoiceModalOpen(false)}
              className='w-full sm:w-auto text-sm'
            >
              Бекор қилиш
            </Button>
            <Button variant='outline' className='w-full sm:w-auto text-sm'>
              <Send className='w-4 h-4 mr-2' />
              Беморга юбориш
            </Button>
            <Button variant='outline' className='w-full sm:w-auto text-sm'>
              <Printer className='w-4 h-4 mr-2' />
              Чоп этиш
            </Button>
            <Button className='w-full sm:w-auto text-sm'>Сақлаш</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;
