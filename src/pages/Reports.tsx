import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet, Printer, TrendingUp, Users, DollarSign, Clock, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("month");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Mock data for charts
  const patientFlowData = [
    { date: "01.10", ambulator: 45, statsionar: 12 },
    { date: "02.10", ambulator: 52, statsionar: 15 },
    { date: "03.10", ambulator: 48, statsionar: 13 },
    { date: "04.10", ambulator: 61, statsionar: 14 },
    { date: "05.10", ambulator: 55, statsionar: 16 },
    { date: "06.10", ambulator: 58, statsionar: 14 },
    { date: "07.10", ambulator: 63, statsionar: 17 },
  ];

  const revenueData = [
    { service: "Консультация", amount: 4500000 },
    { service: "Лаборатория", amount: 3200000 },
    { service: "МРТ/КТ", amount: 2800000 },
    { service: "Рентген", amount: 1500000 },
    { service: "УЗИ", amount: 1800000 },
  ];

  const diseaseData = [
    { name: "ОРВИ (J00-J06)", value: 245, color: "#2196F3" },
    { name: "Гипертония (I10)", value: 189, color: "#4CAF50" },
    { name: "Диабет (E11)", value: 156, color: "#FFC107" },
    { name: "Гастрит (K29)", value: 134, color: "#F44336" },
    { name: "Остеохондроз (M42)", value: 112, color: "#9C27B0" },
    { name: "Бошқалар", value: 324, color: "#607D8B" },
  ];

  const doctorPerformance = [
    { doctor: "Др. Алиев А.Р.", patients: 156, avgTime: "15 мин", revenue: "12,450,000" },
    { doctor: "Др. Каримова Н.А.", patients: 142, avgTime: "18 мин", revenue: "11,200,000" },
    { doctor: "Др. Усмонов Ж.Б.", patients: 128, avgTime: "16 мин", revenue: "9,850,000" },
    { doctor: "Др. Иброҳимова М.С.", patients: 119, avgTime: "17 мин", revenue: "8,900,000" },
    { doctor: "Др. Раҳимов Ф.Х.", patients: 105, avgTime: "19 мин", revenue: "7,600,000" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('uz-UZ').format(value) + " сўм";
  };

  const handleExport = (format: "excel" | "pdf") => {
    console.log(`Exporting to ${format}...`);
    // Implement export logic
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
                <h1 className="text-2xl font-bold">Ҳисоботлар ва аналитика</h1>
                <p className="text-sm text-muted-foreground">Клиника статистикаси ва кўрсаткичлари</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleExport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport("pdf")}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Чоп этиш
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
              <Label>Давр</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Бугун</SelectItem>
                  <SelectItem value="week">Ҳафта</SelectItem>
                  <SelectItem value="month">Ой</SelectItem>
                  <SelectItem value="year">Йил</SelectItem>
                  <SelectItem value="custom">Танлаш</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Бўлим</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Барча бўлимлар</SelectItem>
                  <SelectItem value="therapy">Терапия</SelectItem>
                  <SelectItem value="surgery">Хирургия</SelectItem>
                  <SelectItem value="pediatrics">Педиатрия</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Жами беморлар"
            value="1,248"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
            variant="default"
          />
          <StatCard
            title="Жами даромад"
            value="28.4М"
            icon={DollarSign}
            trend={{ value: 8.3, isPositive: true }}
            variant="success"
          />
          <StatCard
            title="Ўртача кутиш вақти"
            value="14 мин"
            icon={Clock}
            trend={{ value: 5.2, isPositive: false }}
            variant="warning"
          />
          <StatCard
            title="Палата бандлиги"
            value="78%"
            icon={Bed}
            trend={{ value: 3.1, isPositive: true }}
            variant="default"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Patient Flow Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Беморлар оқими
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ambulator" stroke="#2196F3" name="Амбулатор" strokeWidth={2} />
                <Line type="monotone" dataKey="statsionar" stroke="#4CAF50" name="Стационар" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              Даромад хизматлар бўйича
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="service" type="category" width={100} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="amount" fill="#2196F3" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Disease Distribution Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Касалликлар тақсимоти</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={diseaseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {diseaseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Doctor Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Шифокорлар самарадорлиги</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Шифокор</th>
                    <th className="text-center py-2 text-sm font-medium text-muted-foreground">Беморлар</th>
                    <th className="text-center py-2 text-sm font-medium text-muted-foreground">Ўрт. вақт</th>
                    <th className="text-right py-2 text-sm font-medium text-muted-foreground">Даромад</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorPerformance.map((doc, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium">{doc.doctor}</td>
                      <td className="py-3 text-center">
                        <Badge variant="outline">{doc.patients}</Badge>
                      </td>
                      <td className="py-3 text-center text-sm text-muted-foreground">{doc.avgTime}</td>
                      <td className="py-3 text-right font-semibold text-success">{doc.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* SSV Report Generator */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">ССВ ҳисобот яратиш</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Шаблон танлаш</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Ойлик ҳисобот</SelectItem>
                  <SelectItem value="quarterly">Чоракли ҳисобот</SelectItem>
                  <SelectItem value="yearly">Йиллик ҳисобот</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                XML юклаш
              </Button>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel юклаш
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Reports;