import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Activity, Stethoscope, ClipboardList, Save, X, Pill, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NewVisit = () => {
  const navigate = useNavigate();
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");

  // Mock patient data
  const patient = {
    name: "Алиев Жасур Абдуллаевич",
    age: 35,
    gender: "Эркак",
    allergies: ["Пенициллин"],
  };

  const handleSave = () => {
    // Save logic here
    navigate("/dashboard");
  };

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
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Янги Кўрик</h1>
                  <p className="text-sm text-muted-foreground">SOAP Ёзув</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Patient Banner */}
        <Card className="card-shadow mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {patient.name} <span className="text-muted-foreground">({patient.age} йош, {patient.gender})</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Сана: {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {patient.allergies.length > 0 && (
                <div className="px-4 py-2 bg-danger/20 border border-danger rounded-lg">
                  <p className="text-sm font-semibold text-danger">
                    ⚠ Аллергия: {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* SOAP Form */}
        <div className="space-y-6">
          {/* Subjective */}
          <Card className="card-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">S - Subjective</h3>
                  <p className="text-sm text-muted-foreground">Бемор шикояти</p>
                </div>
              </div>
              <Textarea
                placeholder="Беморнинг шикоятларини, симптомларини ва касаллик тарихини ёзинг..."
                className="min-h-32 mb-3"
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Шаблонлар
                </Button>
                <Button variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" />
                  Овоздан ёзиш
                </Button>
              </div>
            </div>
          </Card>

          {/* Objective */}
          <Card className="card-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-success rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">O - Objective</h3>
                  <p className="text-sm text-muted-foreground">Объектив текшируv</p>
                </div>
              </div>
              
              {/* Vital Signs */}
              <div className="mb-4">
                <h4 className="font-semibold mb-3">Витал Белгилар:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bp">Қон босими</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="bp" placeholder="120" className="w-20" />
                      <span className="self-center">/</span>
                      <Input placeholder="80" className="w-20" />
                      <span className="self-center text-sm text-muted-foreground">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pulse">Пульс</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="pulse" placeholder="72" className="w-24" />
                      <span className="self-center text-sm text-muted-foreground">/мин</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="temp">Температура</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="temp" placeholder="36.6" className="w-24" />
                      <span className="self-center text-sm text-muted-foreground">°C</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight">Вазн</Label>
                    <div className="flex gap-2 mt-1">
                      <Input id="weight" placeholder="70" className="w-24" />
                      <span className="self-center text-sm text-muted-foreground">кг</span>
                    </div>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Физик текшируv натижалари, кузатишлар..."
                className="min-h-32"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </Card>

          {/* Assessment */}
          <Card className="card-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-warning rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">A - Assessment</h3>
                  <p className="text-sm text-muted-foreground">Ташхис</p>
                </div>
              </div>
              <Input
                placeholder="ICD-10 кодини қидириш (масалан: I10 - Гипертония)"
                className="mb-3"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2">
                  I10 - Гипертония
                  <button className="hover:bg-primary/20 rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Plan */}
          <Card className="card-shadow">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">P - Plan</h3>
                  <p className="text-sm text-muted-foreground">Даволаш режаси</p>
                </div>
              </div>
              <Textarea
                placeholder="Даволаш режаси, тавсиялар, кейинги тасриф..."
                className="min-h-32 mb-3"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Pill className="w-4 h-4 mr-2" />
                  Рецепт ёзиш
                </Button>
                <Button variant="outline" size="sm">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Таҳлил буюриш
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            <X className="w-5 h-5 mr-2" />
            Бекор қилиш
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            <Save className="w-5 h-5 mr-2" />
            Сақлаш
          </Button>
          <Button size="lg" className="gradient-success w-full sm:w-auto" onClick={handleSave}>
            <Save className="w-5 h-5 mr-2" />
            Сақлаш ва Чиқиш
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NewVisit;
