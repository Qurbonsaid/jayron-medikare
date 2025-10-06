import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Plus, Calendar, Activity, Droplet, FileText } from "lucide-react";

interface Bed {
  id: string;
  number: string;
  patient: string | null;
  status: "free" | "occupied" | "reserved";
}

const Inpatient = () => {
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
        return "bg-green-500/20 border-green-500";
      case "occupied":
        return "bg-red-500/20 border-red-500";
      case "reserved":
        return "bg-yellow-500/20 border-yellow-500";
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
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Стационар Бўлими</h1>
            <p className="text-muted-foreground mt-1">Ётоқхона бошқаруви ва бемор парвариши</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Янги Қабул
          </Button>
        </div>

        <Tabs defaultValue="beds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="beds">Ётоқлар Харитаси</TabsTrigger>
            <TabsTrigger value="admission">Қабул</TabsTrigger>
            <TabsTrigger value="vitals">Витал Белгилар</TabsTrigger>
            <TabsTrigger value="mar">Дори Берии</TabsTrigger>
            <TabsTrigger value="fluids">Суюқлик Баланси</TabsTrigger>
          </TabsList>

          {/* Bed Occupancy Map */}
          <TabsContent value="beds">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ётоқлар Холати - 1-Қават</CardTitle>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500"></div>
                      <span>Бўш: {beds.filter(b => b.status === "free").length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500"></div>
                      <span>Банд: {beds.filter(b => b.status === "occupied").length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500"></div>
                      <span>Захира: {beds.filter(b => b.status === "reserved").length}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {beds.map((bed) => (
                    <Card
                      key={bed.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${getBedStatusColor(bed.status)}`}
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <BedDouble className="h-8 w-8" />
                        <div className="font-bold text-lg">Ётоқ {bed.number}</div>
                        <Badge variant={bed.status === "free" ? "default" : "secondary"}>
                          {getBedStatusText(bed.status)}
                        </Badge>
                        {bed.patient && (
                          <p className="text-sm font-semibold">{bed.patient}</p>
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
                <CardTitle>Янги Бемор Қабул Қилиш</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label>Тасхис (ICD-10)</Label>
                  <Input placeholder="Тасхис коди ва номини киритинг" />
                </div>

                <div>
                  <Label>Шикоят ва Анамнез</Label>
                  <Textarea
                    placeholder="Беморнинг асосий шикоятлари ва касаллик тарихи..."
                    rows={5}
                  />
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

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Бекор Қилиш</Button>
                  <Button>Қабул Қилиш</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vital Signs Chart */}
          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Витал Белгилар Графиги</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Бугун
                    </Button>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Янги Ўлчов
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <p className="font-semibold">Бемор: Алиев Азамат Ахмедович</p>
                  <p className="text-sm text-muted-foreground">Ётоқ: 101 | Тасхис: Пневмония</p>
                </div>

                {/* Simple line chart visualization */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Ҳарорат (°C)
                    </h3>
                    <div className="relative h-32 bg-muted rounded-lg p-4">
                      <div className="flex items-end justify-between h-full">
                        {vitalSignsData.map((data, idx) => (
                          <div key={idx} className="flex flex-col items-center gap-2">
                            <div className="text-xs font-semibold">{data.temp}°</div>
                            <div
                              className="w-12 bg-primary rounded-t"
                              style={{ height: `${(data.temp - 36) * 40}%` }}
                            ></div>
                            <div className="text-xs text-muted-foreground">{data.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <Label className="text-sm">Қон Босими</Label>
                        <div className="text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].bp}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">mmHg</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <Label className="text-sm">Юрак Уриши</Label>
                        <div className="text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].pulse}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">уриш/дақиқа</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <Label className="text-sm">Ҳарорат</Label>
                        <div className="text-2xl font-bold mt-2">
                          {vitalSignsData[vitalSignsData.length - 1].temp}°C
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Цельсий</p>
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
                  <p className="font-semibold">Бемор: Каримова Малика Шавкатовна</p>
                  <p className="text-sm text-muted-foreground">Ётоқ: 103</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Дори Номи</th>
                        <th className="text-left p-3">Дозаси</th>
                        <th className="text-center p-3">08:00</th>
                        <th className="text-center p-3">12:00</th>
                        <th className="text-center p-3">16:00</th>
                        <th className="text-center p-3">20:00</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-accent/50">
                        <td className="p-3">Амоксициллин</td>
                        <td className="p-3">500мг</td>
                        <td className="p-3 text-center">
                          <Badge variant="default" className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="default" className="bg-green-500">✓</Badge>
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
                          <Badge variant="default" className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="default" className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-accent/50">
                        <td className="p-3">Омепразол</td>
                        <td className="p-3">20мг</td>
                        <td className="p-3 text-center">
                          <Badge variant="default" className="bg-green-500">✓</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">-</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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

          {/* IV Fluid Balance */}
          <TabsContent value="fluids">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5" />
                    Суюқлик Баланси Ҳисоблаш
                  </CardTitle>
                  <Button size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Ҳисобот
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Input */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Кирим (мл)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>IV Инфузия</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Оғиздан</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Назогастрал</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="pt-3 border-t flex justify-between font-bold">
                        <span>Жами Кирим:</span>
                        <span>0 мл</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Output */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Чиқим (мл)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Сийдик</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Дренаж</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>Қусиш</Label>
                        <Input type="number" placeholder="0" className="w-24 text-right" />
                      </div>
                      <div className="pt-3 border-t flex justify-between font-bold">
                        <span>Жами Чиқим:</span>
                        <span>0 мл</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Balance Summary */}
                <Card className="bg-primary/5 border-primary">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Жами Кирим</p>
                        <p className="text-2xl font-bold">0 мл</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Жами Чиқим</p>
                        <p className="text-2xl font-bold">0 мл</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Баланс</p>
                        <p className="text-2xl font-bold text-primary">0 мл</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Label>Изоҳлар</Label>
                  <Textarea
                    placeholder="Суюқлик баланси ҳақида қўшимча маълумот..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Тозалаш</Button>
                  <Button>Сақлаш</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Inpatient;
