import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Patients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const patients = [
    { id: "P-001", name: "Алиев Жасур Абдуллаевич", age: 35, gender: "Эркак", phone: "+998 90 123 45 67", doctor: "Др. Алимов" },
    { id: "P-002", name: "Каримова Нодира Рахимовна", age: 42, gender: "Аёл", phone: "+998 91 234 56 78", doctor: "Др. Алимов" },
    { id: "P-003", name: "Усмонов Азиз Шухратович", age: 28, gender: "Эркак", phone: "+998 93 345 67 89", doctor: "Др. Нурматова" },
    { id: "P-004", name: "Рахимова Малика Ахмедовна", age: 55, gender: "Аёл", phone: "+998 94 456 78 90", doctor: "Др. Алимов" },
    { id: "P-005", name: "Хасанов Фаррух Баходирович", age: 31, gender: "Эркак", phone: "+998 95 567 89 01", doctor: "Др. Каримов" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 card-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">JAYRON MEDSERVIS</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                ДА
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Беморлар Рўйхати</h1>
            <p className="text-muted-foreground">Барча беморларни кўриш ва бошқариш</p>
          </div>
          <Button className="gradient-primary h-12 px-6">
            + Янги Бемор
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="card-shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="ФИО, телефон ёки ID бўйича қидириш..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Жинси" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Барчаси</SelectItem>
                    <SelectItem value="male">Эркак</SelectItem>
                    <SelectItem value="female">Аёл</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Ҳолат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Барчаси</SelectItem>
                    <SelectItem value="active">Актив</SelectItem>
                    <SelectItem value="inactive">Ноактив</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Шифокор" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Барчаси</SelectItem>
                    <SelectItem value="alimov">Др. Алимов</SelectItem>
                    <SelectItem value="nurmatova">Др. Нурматова</SelectItem>
                    <SelectItem value="karimov">Др. Каримов</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <Button variant="outline" className="w-full h-12">
                  <Filter className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Жами: <span className="font-semibold text-foreground">{patients.length}</span> бемор
          </p>
          <Select defaultValue="25">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patients Table */}
        <Card className="card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">ФИО</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ёш/Жинс</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Телефон</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Шифокор</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Ҳаракатлар</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-accent/50 transition-smooth">
                    <td className="px-6 py-4 text-sm font-medium text-primary">{patient.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{patient.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {patient.age} йош / {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-sm">{patient.phone}</td>
                    <td className="px-6 py-4 text-sm">{patient.doctor}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/patient/${patient.id}`)}
                          className="hover:bg-primary hover:text-white transition-smooth"
                        >
                          <Eye className="w-4 h-4 mr-2" />
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
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              1-5 дан 5 та кўрсатилмоқда
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Олдинги
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Кейинги
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Patients;
