import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BedDouble,
  Plus,
  Calendar,
  Activity,
  Droplet,
  FileText,
} from "lucide-react";

interface Bed {
  id: string;
  number: string;
  patient: string | null;
  status: "free" | "occupied" | "reserved";
}

const InpatientOld = () => {
  const [beds] = useState<Bed[]>([
    { id: "1", number: "101", patient: "Алиев А.А.", status: "occupied" },
    { id: "2", number: "102", patient: null, status: "free" },
    { id: "3", number: "103", patient: "Каримова М.Ш.", status: "occupied" },
    { id: "4", number: "104", patient: null, status: "reserved" },
    { id: "5", number: "105", patient: "Усмонов Ж.Р.", status: "occupied" },
    { id: "6", number: "106", patient: null, status: "free" },
    { id: "7", number: "107", patient: "Турсунова Н.А.", status: "occupied" },
    { id: "8", number: "108", patient: null, status: "free" },
  ]);

  const vitalSignsData = [
    { time: "08:00", temp: 36.6, bp: "120/80", pulse: 72 },
    { time: "12:00", temp: 37.1, bp: "125/85", pulse: 78 },
    { time: "16:00", temp: 37.4, bp: "130/85", pulse: 82 },
    { time: "20:00", temp: 37.2, bp: "122/80", pulse: 75 },
  ];

  const getBedStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-100 border-green-500";
      case "occupied":
        return "bg-red-100 border-red-500";
      case "reserved":
        return "bg-yellow-100 border-yellow-500";
      default:
        return "bg-muted";
    }
  };

  const getBedStatusText = (status: string) => {
    switch (status) {
      case "free":
        return "Бўш";
      case "occupied":
        return "Банд";
      case "reserved":
        return "Захираланган";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Стационар Бўлими</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ётоқхона бошқаруви ва бемор парвариши
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Янги Қабул
          </Button>
        </div>

        <Tabs defaultValue="beds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="beds">Ётоқлар Харитаси</TabsTrigger>
            <TabsTrigger value="admission">Қабул</TabsTrigger>
            <TabsTrigger value="vitals">Витал Белгилар</TabsTrigger>
            <TabsTrigger value="mar">Дори Берии</TabsTrigger>
            {/* <TabsTrigger value="fluids">Суюқлик Баланси</TabsTrigger> */}
          </TabsList>

          <TabsContent value="beds">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle className=" text-center md:text-left">
                    Ётоқлар Холати - 1-Қават
                  </CardTitle>

                  <div className="flex flex-wrap justify-center md:justify-end gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500"></div>
                      <span>
                        Бўш: {beds.filter((b) => b.status === "free").length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500"></div>
                      <span>
                        Банд:{" "}
                        {beds.filter((b) => b.status === "occupied").length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500"></div>
                      <span>
                        Захира:{" "}
                        {beds.filter((b) => b.status === "reserved").length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {beds.map((bed) => (
                    <Card
                      key={bed.id}
                      className={`p-4 ${getBedStatusColor(bed.status)}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <BedDouble className="h-8 w-8" />
                        <div className="font-bold">Ётоқ {bed.number}</div>
                        <Badge>{getBedStatusText(bed.status)}</Badge>
                        {bed.patient && (
                          <p className="text-sm font-medium">{bed.patient}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admission Form */}
          <TabsContent value="admission">
            <Card>
              <CardHeader>
                <CardTitle>Янги Бемор Қабул</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Бемор Исми</Label>
                    <Input placeholder="Тўлиқ исм" />
                  </div>
                  <div>
                    <Label>Туғилган Сана</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input placeholder="+998 XX XXX XX XX" />
                  </div>
                  <div>
                    <Label>Қабул Санаси</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                <div>
                  <Label>Тасхис</Label>
                  <Input placeholder="ICD-10 код" />
                </div>
                <div>
                  <Label>Шикоят ва Анамнез</Label>
                  <Textarea rows={4} />
                </div>
                <div>
                  <Label>Даволаш Режаси</Label>
                  <Textarea
                    placeholder="Беморнинг даволаш режаси ва тавсиялар..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Ётоқ Рақами</Label>
                    <Input placeholder="101" />
                  </div>
                  <div>
                    <Label>Жавобгар Шифокор</Label>
                    <Input placeholder="Шифокор исми" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Бекор</Button>
                  <Button>Қабул</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs */}
          <TabsContent value="vitals">
            <Card className="w-full overflow-hidden">
              <CardHeader>
                {/* Header responsiv */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-center sm:text-left">
                    Витал Белгилар Графиги
                  </CardTitle>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Бугун
                    </Button>
                    <Button
                      size="sm"
                      className="w-full sm:w-auto justify-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Янги Ўлчов
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="w-full overflow-x-hidden">
                {/* Bemor ma’lumotlari */}
                <div className="mb-6 p-4 bg-muted rounded-lg text-center sm:text-left">
                  <p className="font-semibold text-sm sm:text-base">
                    Бемор: Алиев Азамат Ахмедович
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Ётоқ: 101 | Тасхис: Пневмония
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Harorat charti */}
                  <div className="w-full">
                    <h3 className="font-semibold mb-3 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base">
                      <Activity className="h-5 w-5" />
                      Ҳарорат (°C)
                    </h3>

                    <div className="relative h-36 sm:h-44 bg-muted rounded-lg p-3 sm:p-4 overflow-hidden">
                      <div className="flex items-end justify-between h-full w-full">
                        {vitalSignsData.map((data, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-end gap-1 sm:gap-2 flex-1 min-w-0"
                          >
                            <div className="text-[10px] sm:text-xs font-semibold">
                              {data.temp}°
                            </div>
                            <div
                              className="w-6 sm:w-10 bg-primary rounded-t"
                              style={{ height: `${(data.temp - 36) * 40}%` }}
                            ></div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              {data.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Uchta karta */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="text-center sm:text-left">
                      <CardContent className="pt-4">
                        <Label className="text-xs sm:text-sm">Қон Босими</Label>
                        <div className="text-xl sm:text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].bp}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          mmHg
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center sm:text-left">
                      <CardContent className="pt-4">
                        <Label className="text-xs sm:text-sm">Пульс</Label>
                        <div className="text-xl sm:text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].pulse}
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          bpm
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center sm:text-left">
                      <CardContent className="pt-4">
                        <Label className="text-xs sm:text-sm">Ҳарорат</Label>
                        <div className="text-xl sm:text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].temp}°C
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                          Цельсий
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medication Administration Record */}
          <TabsContent value="mar">
            <Card>
              <CardHeader>
                <CardTitle>Дори Бериш Жадвали (MAR)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="font-semibold">
                    Бемор: Каримова Малика Шавкатовна
                  </p>
                  <p className="text-sm text-muted-foreground">Ётоқ: 103</p>
                </div>

                {/* Desktop view → table */}
                <div className="hidden md:block">
                  <table className="w-full border rounded-lg overflow-hidden">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left">Дори Номи</th>
                        <th className="p-3 text-left">Дозаси</th>
                        <th className="p-3 text-center">08:00</th>
                        <th className="p-3 text-center">12:00</th>
                        <th className="p-3 text-center">16:00</th>
                        <th className="p-3 text-center">20:00</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-accent/50">
                        <td className="p-3">Амоксициллин</td>
                        <td className="p-3">500мг</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-accent/50">
                        <td className="p-3">Парацетамол</td>
                        <td className="p-3">500мг</td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile view → cards */}
                <div className="grid gap-4 md:hidden">
                  {[
                    {
                      name: "Амоксициллин",
                      dose: "500мг",
                      times: {
                        "08:00": "✓",
                        "12:00": "✓",
                        "16:00": "-",
                        "20:00": "-",
                      },
                    },
                    {
                      name: "Парацетамол",
                      dose: "500мг",
                      times: {
                        "08:00": "✓",
                        "12:00": "-",
                        "16:00": "✓",
                        "20:00": "-",
                      },
                    },
                  ].map((med, idx) => (
                    <Card key={idx} className="p-4">
                      <h3 className="font-semibold">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Доза: {med.dose}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {Object.entries(med.times).map(([time, val]) => (
                          <div
                            key={time}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <span className="text-xs">{time}</span>
                            {val === "✓" ? (
                              <Badge className="bg-green-500">✓</Badge>
                            ) : (
                              <Badge variant="secondary">-</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Дори Қўшиш
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fluids */}
          <TabsContent value="fluids">
            <Card className="w-full overflow-hidden">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center justify-center sm:justify-start gap-2">
                    <Droplet className="h-5 w-5 text-primary" />
                    Суюқлик Баланси Ҳисоблаш
                  </CardTitle>
                  <Button size="sm" className="w-full sm:w-auto justify-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Ҳисобот
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 w-full overflow-x-hidden">
                {/* Input & Output section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-center sm:text-left">
                        Кирим (мл)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "IV Инфузия", placeholder: "0" },
                        { label: "Оғиздан", placeholder: "0" },
                        { label: "Назогастрал", placeholder: "0" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center flex-wrap gap-2"
                        >
                          <Label className="text-sm">{item.label}</Label>
                          <Input
                            type="number"
                            placeholder={item.placeholder}
                            className="w-full sm:w-24 text-right"
                          />
                        </div>
                      ))}
                      <div className="pt-3 border-t flex justify-between font-bold text-sm sm:text-base">
                        <span>Жами Кирим:</span>
                        <span>0 мл</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Output */}
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg text-center sm:text-left">
                        Чиқим (мл)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { label: "Сийдик", placeholder: "0" },
                        { label: "Дренаж", placeholder: "0" },
                        { label: "Қусиш", placeholder: "0" },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center flex-wrap gap-2"
                        >
                          <Label className="text-sm">{item.label}</Label>
                          <Input
                            type="number"
                            placeholder={item.placeholder}
                            className="w-full sm:w-24 text-right"
                          />
                        </div>
                      ))}
                      <div className="pt-3 border-t flex justify-between font-bold text-sm sm:text-base">
                        <span>Жами Чиқим:</span>
                        <span>0 мл</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Balance Summary */}
                <Card className="bg-primary/5 border-primary/30">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Жами Кирим
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">0 мл</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Жами Чиқим
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">0 мл</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Баланс</p>
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          0 мл
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                <div>
                  <Label className="text-sm sm:text-base">Изоҳлар</Label>
                  <Textarea
                    placeholder="Суюқлик баланси ҳақида қўшимча маълумот..."
                    rows={3}
                    className="mt-2 w-full resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Тозалаш
                  </Button>
                  <Button className="w-full sm:w-auto">Сақлаш</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InpatientOld;
