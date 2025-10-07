import { useState } from "react";
import { Calendar, FileText, TestTube, Image, Phone, Download, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PatientPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const handleSendOtp = () => {
    if (!phoneNumber) {
      toast.error("Телефон рақамини киритинг");
      return;
    }
    setShowOtp(true);
    toast.success("Тасдиқлаш коди юборилди");
  };

  const handleVerifyOtp = () => {
    if (otpCode.length === 6) {
      setIsLoggedIn(true);
      toast.success("Муваффақиятли кирдингиз!");
    } else {
      toast.error("6 рақамли кодни киритинг");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Бемор портали</h1>
            <p className="text-muted-foreground">JAYRON MEDSERVIS</p>
          </div>

          {!showOtp ? (
            <div className="space-y-4">
              <div>
                <Label>Телефон рақам ёки ID</Label>
                <Input
                  type="tel"
                  placeholder="+998 XX XXX XX XX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleSendOtp}>
                Код олиш
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Тасдиқлаш коди</Label>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-1 text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  {phoneNumber} рақамига юборилди
                </p>
              </div>
              <Button className="w-full" size="lg" onClick={handleVerifyOtp}>
                Тасдиқлаш
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowOtp(false)}>
                Орқага
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Каримова Нилуфар</h2>
                <p className="text-sm text-muted-foreground">ID: PAT-2025-0042</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
              Чиқиш
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Хуш келибсиз, Нилуфар!</h1>
          <p className="text-muted-foreground">Тиббий ёзувларингизни бу ерда кўришингиз мумкин</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Келгуси навбат</p>
                <p className="text-xl font-bold">08.10.2025</p>
                <p className="text-sm text-muted-foreground">10:30 - Др. Алиев</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Янги натижалар</p>
                <p className="text-xl font-bold">2 та</p>
                <p className="text-sm text-success cursor-pointer">Кўриш →</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Фаол рецептлар</p>
                <p className="text-xl font-bold">3 та</p>
                <p className="text-sm text-muted-foreground">Дорилар рўйхати</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments">Навбатлар</TabsTrigger>
            <TabsTrigger value="visits">Ташрифлар</TabsTrigger>
            <TabsTrigger value="tests">Таҳлиллар</TabsTrigger>
            <TabsTrigger value="prescriptions">Рецептлар</TabsTrigger>
          </TabsList>

          {/* Appointments */}
          <TabsContent value="appointments" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Менинг навбатларим</h2>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />
                Навбат олиш
              </Button>
            </div>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">Др. Алиев Анвар Рашидович</h3>
                      <p className="text-sm text-muted-foreground">Терапевт</p>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20 border">
                      Тасдиқланган
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>08.10.2025 (Эртага)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>10:30</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="text-danger">
                      Бекор қилиш
                    </Button>
                    <Button size="sm" variant="outline">
                      Ўзгартириш
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Visits */}
          <TabsContent value="visits" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Ташрифлар тарихи</h2>
            
            {[1, 2].map((_, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">Др. Алиев А.Р. - Консультация</h3>
                      <p className="text-sm text-muted-foreground">05.10.2025</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Батафсил
                  </Button>
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Ташхис:</p>
                  <p className="text-sm text-muted-foreground">ОРВИ (J06.9) - Ўткир юқори nafas йўллари инфекцияси</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Tests */}
          <TabsContent value="tests" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Лаборатория натижалари</h2>

            {[
              { name: "Умумий қон таҳлили", date: "06.10.2025", new: true },
              { name: "Биохимия қони", date: "01.10.2025", new: false }
            ].map((test, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TestTube className="w-5 h-5 text-primary" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{test.name}</h3>
                        {test.new && (
                          <Badge className="bg-success/10 text-success border-success/20 border text-xs">
                            Янги
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{test.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button size="sm">Кўриш</Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Prescriptions */}
          <TabsContent value="prescriptions" className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Рецептлар</h2>

            {[
              { drug: "Амоксициллин 500мг", dosage: "1 таблетка х 3 марта", status: "Фаол", date: "05.10.2025" },
              { drug: "Парацетамол 500мг", dosage: "1 таблетка х 3 марта", status: "Фаол", date: "05.10.2025" },
              { drug: "Витамин C", dosage: "1 таблетка х 1 марта", status: "Тугатилган", date: "25.09.2025" }
            ].map((rx, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{rx.drug}</h3>
                      <p className="text-sm text-muted-foreground">{rx.dosage}</p>
                      <p className="text-xs text-muted-foreground mt-1">Белгиланган: {rx.date}</p>
                    </div>
                  </div>
                  <Badge className={rx.status === "Фаол" ? "bg-success/10 text-success border-success/20 border" : ""}>
                    {rx.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Contact Card */}
        <Card className="p-6 mt-8 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Ёрдамга муҳтожмисиз?</h3>
              <p className="text-sm text-muted-foreground">Бизнинг жамоамиз сизга ёрдам беришга тайёр</p>
              <p className="text-sm font-medium text-primary mt-1">+998 71 123 45 67</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PatientPortal;