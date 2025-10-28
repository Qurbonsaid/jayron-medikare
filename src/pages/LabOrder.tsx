import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, Send } from "lucide-react";

interface Test {
  id: string;
  name: string;
  code: string;
  selected: boolean;
}

const LabOrder = () => {
  const [priority, setPriority] = useState("normal");
  const [barcode, setBarcode] = useState("");
  const [tests, setTests] = useState<Test[]>([
    { id: "1", name: "Умумий қон таҳлили", code: "CBC", selected: false },
    { id: "2", name: "Биохимик қон таҳлили", code: "BIO", selected: false },
    { id: "3", name: "Қанд миқдори", code: "GLU", selected: false },
    { id: "4", name: "Умумий сийдик таҳлили", code: "UA", selected: false },
    { id: "5", name: "Липид профили", code: "LIP", selected: false },
    { id: "6", name: "Жигар функцияси", code: "LFT", selected: false },
    { id: "7", name: "Буйрак функцияси", code: "RFT", selected: false },
    { id: "8", name: "Тиреоид гормонлари", code: "THY", selected: false },
  ]);

  const toggleTest = (id: string) => {
    setTests(tests.map(test => 
      test.id === id ? { ...test, selected: !test.selected } : test
    ));
  };

  const generateBarcode = () => {
    const code = `LAB-${Date.now().toString().slice(-8)}`;
    setBarcode(code);
  };

  const selectedTests = tests.filter(t => t.selected);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Таҳлил Буюртмаси</h1>
            <p className="text-muted-foreground mt-1">Янги лаборатория буюртмаси яратиш</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Чоп Этиш
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Юбориш
            </Button>
          </div>
        </div>

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Бемор Маълумоти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Бемор Исми</Label>
                <p className="font-semibold">Каримов Жавлон Алишерович</p>
              </div>
              <div>
                <Label>Туғилган Сана</Label>
                <p className="font-semibold">20.08.1978 (46 йош)</p>
              </div>
              <div>
                <Label>ID</Label>
                <p className="font-semibold">#PAT-2025-001</p>
              </div>
              <div>
                <Label>Diagnostika</Label>
                <p className="font-semibold">Yurak kasalligi</p>
              </div>
              <div>
                <Label>Телефон</Label>
                <p className="font-semibold">+998 91 234 56 78</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Таҳлил Турларини Танланг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tests.map((test) => (
                <div key={test.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={test.id}
                    checked={test.selected}
                    onCheckedChange={() => toggleTest(test.id)}
                  />
                  <Label
                    htmlFor={test.id}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {test.name}
                    <Badge variant="secondary" className="ml-2">{test.code}</Badge>
                  </Label>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-semibold">
                Танланган таҳлиллар: {selectedTests.length}
              </p>
              {selectedTests.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTests.map(test => (
                    <Badge key={test.id} variant="default">{test.name}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Priority Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Устувор Даража</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={priority} onValueChange={setPriority}>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal" className="flex-1 cursor-pointer font-normal">
                  <span className="font-semibold">Оддий</span>
                  <p className="text-sm text-muted-foreground">Натижа 24-48 соат ичида</p>
                </Label>
                <Badge variant="secondary">Оддий</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border mt-3">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent" className="flex-1 cursor-pointer font-normal">
                  <span className="font-semibold">Шошилинч</span>
                  <p className="text-sm text-muted-foreground">Натижа 6-12 соат ичида</p>
                </Label>
                <Badge className="bg-orange-500">Шошилинч</Badge>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border border-border mt-3">
                <RadioGroupItem value="stat" id="stat" />
                <Label htmlFor="stat" className="flex-1 cursor-pointer font-normal">
                  <span className="font-semibold">Жуда Шошилинч</span>
                  <p className="text-sm text-muted-foreground">Натижа 1-2 соат ичида</p>
                </Label>
                <Badge variant="destructive">Жуда Шошилинч</Badge>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Barcode Generator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Намуна Штрих-Коди</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label>Штрих-Код</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg text-center">
                  {barcode ? (
                    <div>
                      <div className="text-2xl font-mono font-bold mb-2">{barcode}</div>
                      <div className="h-16 bg-card flex items-center justify-center">
                        <div className="text-4xl font-mono tracking-widest">||||||||||||</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Штрих-код яратилмаган</p>
                  )}
                </div>
              </div>
              <Button onClick={generateBarcode}>
                <FileText className="mr-2 h-4 w-4" />
                Штрих-Код Яратиш
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Indication */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Клиник Кўрсатма</CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Таҳлил сабаби ва клиник ахвол</Label>
            <Textarea
              placeholder="Мисол: Беморда қондаги қанд миқдори ошган. Қандли диабет шубҳаси. Липид профилини текшириш керак..."
              rows={5}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* Lab Assignment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Лаборант Тайинлаш</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Автоматик тайинланган:</p>
              <p className="font-semibold">Лаборант: Исмоилова Нигора Фарходовна</p>
              <p className="text-sm text-muted-foreground mt-1">Бўш лаборант (Навбатдаги: 3 таҳлил)</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Бекор Қилиш</Button>
          <Button variant="secondary">Сақлаш</Button>
          <Button>Тасдиқлаш ва Юбориш</Button>
        </div>
      </div>
    </div>
  );
};

export default LabOrder;
