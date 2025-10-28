import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface TestResult {
  orderId: string;
  patientName: string;
  testType: string;
  orderedDate: string;
  diagnostika:string;
  priority: "Оддий" | "Шошилинч" | "Жуда шошилинч";
  status: "Кутилмоқда" | "Тайёр" | "Тасдиқланган";
}

interface TestParameter {
  name: string;
  unit: string;
  normalRange: string;
  result?: string;
}

const LabResults = () => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<TestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [comments, setComments] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "graph">("table");
  const [selectedPatient, setSelectedPatient] = useState("all");

  // Mock data
  const pendingResults: TestResult[] = [
    {
      orderId: "LAB-2025-001",
      patientName: "Алиев Анвар Рашидович",
      testType: "Умумий қон таҳлили",
      orderedDate: "07.10.2025 09:30",
      priority: "Оддий",
      status: "Кутилмоқда",
      diagnostika:"Karonavirus"
    },
    {
      orderId: "LAB-2025-002",
      patientName: "Каримова Нилуфар Азизовна",
      testType: "Биохимия қони",
      orderedDate: "07.10.2025 10:15",
      priority: "Шошилинч",
      status: "Тайёр",
      diagnostika:"Revmatizm"
    },
    {
      orderId: "LAB-2025-003",
      patientName: "Усмонов Жахонгир Баходирович",
      testType: "Умумий сийдик таҳлили",
      orderedDate: "06.10.2025 14:20",
      priority: "Оддий",
      status: "Тасдиқланган",
      diagnostika:"Animiya"
    }
  ];

  const [testParameters, setTestParameters] = useState<TestParameter[]>([
    { name: "Гемоглобин", unit: "g/dL", normalRange: "13-17", result: "" },
    { name: "Эритроцит", unit: "10^12/L", normalRange: "4.0-5.5", result: "" },
    { name: "Лейкоцит", unit: "10^9/L", normalRange: "4.0-9.0", result: "" },
    { name: "Тромбоцит", unit: "10^9/L", normalRange: "150-400", result: "" },
    { name: "СОЭ", unit: "mm/h", normalRange: "0-15", result: "" },
  ]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { class: string; icon: React.ElementType}> = {
      "Кутилмоқда": { class: "bg-warning/10 text-warning border-warning/20", icon: Clock },
      "Тайёр": { class: "bg-success/10 text-success border-success/20", icon: CheckCircle },
      "Тасдиқланган": { class: "bg-primary/10 text-primary border-primary/20", icon: FileText }
    };
    const config = variants[status] || variants["Кутилмоқда"];
    const Icon = config.icon;
    return (
      <Badge className={`${config.class} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      "Оддий": "bg-gray-100 text-gray-700",
      "Шошилинч": "bg-warning/10 text-warning border-warning/20 border",
      "Жуда шошилинч": "bg-danger/10 text-danger border-danger/20 border"
    };
    return <Badge className={colors[priority] || colors["Оддий"]}>{priority}</Badge>;
  };

  const calculateFlag = (value: string, normalRange: string) => {
    if (!value || !normalRange) return null;
    const val = parseFloat(value);
    const [min, max] = normalRange.split("-").map(v => parseFloat(v));
    
    if (val < min) return { icon: "⬇️", color: "text-blue-600", bg: "bg-blue-50" };
    if (val > max) return { icon: "⬆️", color: "text-danger", bg: "bg-red-50" };
    return { icon: "✓", color: "text-success", bg: "bg-green-50" };
  };

  const handleResultChange = (index: number, value: string) => {
    const newParams = [...testParameters];
    newParams[index].result = value;
    setTestParameters(newParams);
  };

  const openResultModal = (order: TestResult) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setIsVerified(false);
    setComments("");
  };

  const handleSubmitResults = () => {
    if (!isVerified) {
      toast.error("Илтимос, натижаларни тасдиқланг");
      return;
    }

    // Check for critical values
    const hasCritical = testParameters.some(param => {
      if (!param.result) return false;
      const flag = calculateFlag(param.result, param.normalRange);
      return flag && flag.icon !== "✓";
    });

    if (hasCritical) {
      toast.warning("Огоҳлантириш: Танқидий қийматлар аниқланди!", {
        description: "Шифокорга автоматик хабар юборилди"
      });
    }

    toast.success("Натижалар муваффақиятли юборилди", {
      description: "Шифокорга билдиришнома юборилди"
    });
    
    setIsModalOpen(false);
  };

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
                <h1 className="text-2xl font-bold">Таҳлил натижалари</h1>
                <p className="text-sm text-muted-foreground">Лаборатория текширувлари натижалари</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setViewMode(viewMode === "table" ? "graph" : "table")}>
                {viewMode === "table" ? <TrendingUp className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                {viewMode === "table" ? "График кўриниши" : "Жадвал кўриниши"}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                PDF юклаш
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Бемор танлаш</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Барча беморлар" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Барча беморлар</SelectItem>
                  <SelectItem value="patient1">Алиев Анвар</SelectItem>
                  <SelectItem value="patient2">Каримова Нилуфар</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Бошланғич сана</Label>
              <Input type="date" />
            </div>
            <div>
              <Label>Тугаш санаси</Label>
              <Input type="date" />
            </div>
          </div>
        </Card>

        {/* Pending Results Table */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Кутилаётган натижалар</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Буюртма №</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Бемор</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Таҳлил тури</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Сана</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Диагностика</th>

                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Устунлик</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳолат</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳаракатлар</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingResults.map((result) => (
                    <tr key={result.orderId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{result.orderId}</td>
                      <td className="py-3 px-4">{result.patientName}</td>
                      <td className="py-3 px-4">{result.testType}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{result.orderedDate}</td>
                      <td className="py-3 px-4">{result.diagnostika}</td>
                      <td className="py-3 px-4">{getPriorityBadge(result.priority)}</td>
                      <td className="py-3 px-4">{getStatusBadge(result.status)}</td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          onClick={() => openResultModal(result)}
                          disabled={result.status === "Тасдиқланган"}
                        >
                          {result.status === "Кутилмоқда" ? "Киритиш" : "Кўриш"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </main>

      {/* Result Entry Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedOrder?.testType}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>Буюртма: {selectedOrder?.orderId}</span>
              <span>•</span>
              <span>Бемор: {selectedOrder?.patientName}</span>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Test Parameters Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Тест</th>
                    <th className="text-left py-3 px-4 font-medium">Натижа</th>
                    <th className="text-left py-3 px-4 font-medium">Бирлик</th>
                    <th className="text-left py-3 px-4 font-medium">Меъёр</th>
                    <th className="text-left py-3 px-4 font-medium">Байроқ</th>
                  </tr>
                </thead>
                <tbody>
                  {testParameters.map((param, index) => {
                    const flag = param.result ? calculateFlag(param.result, param.normalRange) : null;
                    return (
                      <tr key={index} className={`border-b ${flag ? flag.bg : ""}`}>
                        <td className="py-3 px-4 font-medium">{param.name}</td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            step="0.01"
                            value={param.result}
                            onChange={(e) => handleResultChange(index, e.target.value)}
                            className="w-32"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{param.unit}</td>
                        <td className="py-3 px-4 text-muted-foreground">{param.normalRange}</td>
                        <td className="py-3 px-4">
                          {flag && (
                            <span className={`text-2xl ${flag.color}`}>
                              {flag.icon}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Comments */}
            <div>
              <Label>Изоҳ (ихтиёрий)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Қўшимча изоҳлар..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Verification */}
            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="verify"
                checked={isVerified}
                onCheckedChange={(checked) => setIsVerified(checked as boolean)}
              />
              <label
                htmlFor="verify"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Тасдиқланган - Лаборант: Иброҳимова Нилуфар
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Бекор қилиш
            </Button>
            <Button variant="secondary" onClick={() => toast.success("Драфт сақланди")}>
              Драфт сақлаш
            </Button>
            <Button onClick={handleSubmitResults} className="bg-success hover:bg-success/90">
              <CheckCircle className="w-4 h-4 mr-2" />
              Юбориш ва хабар бериш
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LabResults;