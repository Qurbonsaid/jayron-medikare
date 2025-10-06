import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Edit, FileText, Printer, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PatientProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock patient data
  const patient = {
    id: "P-001",
    name: "Алиев Жасур Абдуллаевич",
    age: 35,
    gender: "Эркак",
    phone: "+998 90 123 45 67",
    email: "j.aliev@example.com",
    address: "Тошкент ш., Мирзо Улуғбек т., Буюк Ипак Йўли к., 45-уй",
    allergies: ["Пенициллин", "Арахис"],
    medicalHistory: [
      { condition: "Гипертония", year: "2020" },
      { condition: "Диабет 2-тури", year: "2018" },
    ],
    medications: [
      { name: "Метформин", dosage: "500 мг", frequency: "Кунига 2 марта" },
      { name: "Лосартан", dosage: "50 мг", frequency: "Кунига 1 марта" },
    ],
    familyHistory: [
      { relative: "Отаси", condition: "Инфаркт (65 ёшда)" },
      { relative: "Онаси", condition: "Диабет" },
    ],
    vitalSigns: {
      date: "15.01.2025",
      bp: "130/85",
      pulse: "78",
      temp: "36.6",
      weight: "82",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 card-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button variant="ghost" size="icon" onClick={() => navigate("/patients")}>
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Patient Header Card */}
        <Card className="card-shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 gradient-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>

              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
                    <div className="flex flex-wrap gap-4 text-muted-foreground">
                      <span>{patient.age} йош</span>
                      <span>•</span>
                      <span>{patient.gender}</span>
                      <span>•</span>
                      <span>ID: {patient.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Таҳрирлаш
                    </Button>
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Ҳисобот
                    </Button>
                    <Button variant="outline">
                      <Printer className="w-4 h-4 mr-2" />
                      Чоп этиш
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Allergy Warning */}
        {patient.allergies.length > 0 && (
          <Card className="bg-gradient-to-r from-danger/10 to-warning/10 border-danger mb-6">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-danger flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-1">АЛЛЕРГИЯЛАР:</h3>
                  <p className="text-danger-foreground font-semibold">
                    {patient.allergies.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="general" className="py-3">Умумий</TabsTrigger>
            <TabsTrigger value="visits" className="py-3">Ташрифлар</TabsTrigger>
            <TabsTrigger value="tests" className="py-3">Таҳлиллар</TabsTrigger>
            <TabsTrigger value="images" className="py-3">Тасвирлар</TabsTrigger>
            <TabsTrigger value="prescriptions" className="py-3">Рецептлар</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Medical History */}
              <Card className="card-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Тиббий Тарих</h3>
                  <ul className="space-y-2">
                    {patient.medicalHistory.map((item, idx) => (
                      <li key={idx} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.condition}</span>
                        <span className="text-muted-foreground">{item.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Current Medications */}
              <Card className="card-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Доимий Дорилар</h3>
                  <div className="space-y-3">
                    {patient.medications.map((med, idx) => (
                      <div key={idx} className="p-3 bg-accent rounded-lg">
                        <h4 className="font-semibold">{med.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {med.dosage} - {med.frequency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Family History */}
              <Card className="card-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Оилавий Тарих</h3>
                  <ul className="space-y-2">
                    {patient.familyHistory.map((item, idx) => (
                      <li key={idx} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium">{item.relative}:</span>
                        <span className="text-muted-foreground">{item.condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Latest Vital Signs */}
              <Card className="card-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Сўнгги Витал Белгилар</h3>
                  <p className="text-sm text-muted-foreground mb-4">{patient.vitalSigns.date}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-accent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Қон босими</p>
                      <p className="text-xl font-bold">{patient.vitalSigns.bp}</p>
                      <p className="text-xs">mmHg</p>
                    </div>
                    <div className="p-3 bg-accent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Пульс</p>
                      <p className="text-xl font-bold">{patient.vitalSigns.pulse}</p>
                      <p className="text-xs">/мин</p>
                    </div>
                    <div className="p-3 bg-accent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Температура</p>
                      <p className="text-xl font-bold">{patient.vitalSigns.temp}</p>
                      <p className="text-xs">°C</p>
                    </div>
                    <div className="p-3 bg-accent rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Вазн</p>
                      <p className="text-xl font-bold">{patient.vitalSigns.weight}</p>
                      <p className="text-xs">кг</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="visits">
            <Card className="card-shadow">
              <div className="p-6 text-center text-muted-foreground">
                Ташрифлар тарихи...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card className="card-shadow">
              <div className="p-6 text-center text-muted-foreground">
                Таҳлиллар натижалари...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="images">
            <Card className="card-shadow">
              <div className="p-6 text-center text-muted-foreground">
                Тиббий тасвирлар...
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions">
            <Card className="card-shadow">
              <div className="p-6 text-center text-muted-foreground">
                Рецептлар тарихи...
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Action */}
        <div className="mt-6 flex justify-center">
          <Button 
            size="lg" 
            className="gradient-primary h-14 px-8 text-base"
            onClick={() => navigate("/new-visit")}
          >
            + Янги Кўрик Яратиш
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PatientProfile;
