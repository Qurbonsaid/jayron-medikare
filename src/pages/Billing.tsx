import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Printer, Send, Download, Search, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Invoice {
  invoiceNumber: string;
  patientName: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: "Тўланмаган" | "Қисман тўланган" | "Тўланган";
}

interface Service {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const Billing = () => {
  const navigate = useNavigate();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);

  // Mock data
  const invoices: Invoice[] = [
    {
      invoiceNumber: "INV-2025-001",
      patientName: "Алиев Анвар Рашидович",
      date: "07.10.2025",
      totalAmount: 500000,
      paidAmount: 500000,
      balance: 0,
      status: "Тўланган"
    },
    {
      invoiceNumber: "INV-2025-002",
      patientName: "Каримова Нилуфар Азизовна",
      date: "07.10.2025",
      totalAmount: 850000,
      paidAmount: 400000,
      balance: 450000,
      status: "Қисман тўланган"
    },
    {
      invoiceNumber: "INV-2025-003",
      patientName: "Усмонов Жахонгир Баходирович",
      date: "06.10.2025",
      totalAmount: 320000,
      paidAmount: 0,
      balance: 320000,
      status: "Тўланмаган"
    }
  ];

  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "Консультация терапевта", quantity: 1, unitPrice: 150000, total: 150000 },
    { id: "2", name: "Умумий қон таҳлили", quantity: 1, unitPrice: 80000, total: 80000 },
  ]);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Тўланмаган": "bg-danger/10 text-danger border-danger/20 border",
      "Қисман тўланган": "bg-warning/10 text-warning border-warning/20 border",
      "Тўланган": "bg-success/10 text-success border-success/20 border"
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " сўм";
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
      name: "",
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, field: keyof Service, value: any) => {
    setServices(services.map(service => {
      if (service.id === id) {
        const updated = { ...service, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return service;
    }));
  };

  const removeService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleRecordPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Илтимос, тўлов миқдорини киритинг");
      return;
    }

    toast.success("Тўлов қайд қилинди", {
      description: `${formatCurrency(parseFloat(paymentAmount))} - ${paymentMethod === "cash" ? "Нақд" : "Карта"}`
    });
    setPaymentAmount("");
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Ҳисоб-китоб</h1>
                <p className="text-sm text-muted-foreground">Тўлов ва ҳисоб-фактуралар</p>
              </div>
            </div>
            <Button onClick={() => setIsInvoiceModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Янги ҳисоб-фактура
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label>Қидириш</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Бемор номи ёки ҳисоб-фактура рақами..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Ҳолат</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Барчаси" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Барчаси</SelectItem>
                  <SelectItem value="Тўланмаган">Тўланмаган</SelectItem>
                  <SelectItem value="Қисман тўланган">Қисман тўланган</SelectItem>
                  <SelectItem value="Тўланган">Тўланган</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ҳисоб-фактуралар рўйхати</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳисоб №</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Бемор</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Сана</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Жами</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Тўланган</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Қолдиқ</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳолат</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳаракатлар</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.invoiceNumber} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">{invoice.patientName}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.date}</td>
                      <td className="py-3 px-4 text-right font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="py-3 px-4 text-right text-success">{formatCurrency(invoice.paidAmount)}</td>
                      <td className="py-3 px-4 text-right text-danger font-semibold">{formatCurrency(invoice.balance)}</td>
                      <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setIsInvoiceModalOpen(true)}>
                            Кўриш
                          </Button>
                          {invoice.status !== "Тўланган" && (
                            <Button size="sm">Тўлаш</Button>
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

        {/* Payment History Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Бугунги даромад</div>
            <div className="text-2xl font-bold text-success">{formatCurrency(1270000)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Бу ҳафта</div>
            <div className="text-2xl font-bold">{formatCurrency(5840000)}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-1">Қарзлар жами</div>
            <div className="text-2xl font-bold text-danger">{formatCurrency(770000)}</div>
          </Card>
        </div>
      </main>

      {/* Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Янги ҳисоб-фактура</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Patient Info */}
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Бемор</Label>
                  <div className="font-semibold">Каримова Нилуфар Азизовна</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">ID</Label>
                  <div className="font-semibold">PAT-2025-0042</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Телефон</Label>
                  <div className="font-semibold">+998 90 123 45 67</div>
                </div>
              </div>
            </Card>

            {/* Services Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Хизматлар</Label>
                <Button variant="outline" size="sm" onClick={addService}>
                  <Plus className="w-4 h-4 mr-2" />
                  Хизмат қўшиш
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Хизмат номи</th>
                      <th className="text-center py-3 px-4 font-medium">Сони</th>
                      <th className="text-right py-3 px-4 font-medium">Нархи</th>
                      <th className="text-right py-3 px-4 font-medium">Жами</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="py-2 px-4">
                          <Input
                            value={service.name}
                            onChange={(e) => updateService(service.id, 'name', e.target.value)}
                            placeholder="Хизмат номи..."
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) => updateService(service.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 mx-auto text-center"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <Input
                            type="number"
                            value={service.unitPrice}
                            onChange={(e) => updateService(service.id, 'unitPrice', parseInt(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="py-2 px-4 text-right font-semibold">
                          {formatCurrency(service.total)}
                        </td>
                        <td className="py-2 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(service.id)}
                            className="text-danger hover:text-danger"
                          >
                            ×
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Чегирма (сўм)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <Card className="p-4 bg-primary/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Оралиқ жами:</span>
                    <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Чегирма:</span>
                    <span className="text-danger">-{formatCurrency(discount)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-semibold">Жами тўлов:</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(calculateGrandTotal())}</span>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Тўлов миқдори</Label>
                  <Input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>Тўлов усули</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Нақд
                        </div>
                      </SelectItem>
                      <SelectItem value="card">Карта</SelectItem>
                      <SelectItem value="click">Click</SelectItem>
                      <SelectItem value="payme">Payme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleRecordPayment}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Тўловни қайд қилиш
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
              Бекор қилиш
            </Button>
            <Button variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Беморга юбориш
            </Button>
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Чоп этиш
            </Button>
            <Button>
              Сақлаш
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Billing;