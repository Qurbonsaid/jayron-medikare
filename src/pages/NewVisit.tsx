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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-5xl">
        {/* Patient Banner */}
        <Card className="card-shadow mb-4 sm:mb-6 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">
                  {patient.name} <p className="text-muted-foreground text-sm sm:text-base">({patient.age} йош, {patient.gender})</p>
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Сана: {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {patient.allergies.length > 0 && (
                <div className="px-3 sm:px-4 py-2 bg-danger/20 border border-danger rounded-lg">
                  <p className="text-xs sm:text-sm font-semibold text-danger">
                    ⚠ Аллергия: {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* SOAP Form */}
        <div className="space-y-4 sm:space-y-6">
          {/* Subjective */}
          <Card className="card-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">S - Subjective</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Бемор шикояти</p>
                </div>
              </div>
              <Textarea
                placeholder="Беморнинг шикоятларини, симптомларини ва касаллик тарихини ёзинг..."
                className="min-h-24 sm:min-h-32 mb-3 text-sm sm:text-base"
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Шаблонлар</span>
                  <span className="sm:hidden">Шаблон</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Овоздан ёзиш</span>
                  <span className="sm:hidden">Овоз</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Objective */}
          <Card className="card-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-success rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">O - Objective</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Объектив текшируv</p>
                </div>
              </div>
              
              {/* Vital Signs */}
              <div className="mb-4">
                <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Витал Белгилар:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="bp" className="text-xs sm:text-sm">Қон босими</Label>
                    <div className="flex gap-1 sm:gap-2 mt-1">
                      <Input id="bp" placeholder="120" className="w-16 sm:w-20 text-sm" />
                      <span className="self-center text-sm">/</span>
                      <Input placeholder="80" className="w-16 sm:w-20 text-sm" />
                      <span className="self-center text-xs sm:text-sm text-muted-foreground">mmHg</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pulse" className="text-xs sm:text-sm">Пульс</Label>
                    <div className="flex gap-1 sm:gap-2 mt-1">
                      <Input id="pulse" placeholder="72" className="w-20 sm:w-24 text-sm" />
                      <span className="self-center text-xs sm:text-sm text-muted-foreground">/мин</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="temp" className="text-xs sm:text-sm">Температура</Label>
                    <div className="flex gap-1 sm:gap-2 mt-1">
                      <Input id="temp" placeholder="36.6" className="w-20 sm:w-24 text-sm" />
                      <span className="self-center text-xs sm:text-sm text-muted-foreground">°C</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-xs sm:text-sm">Вазн</Label>
                    <div className="flex gap-1 sm:gap-2 mt-1">
                      <Input id="weight" placeholder="70" className="w-20 sm:w-24 text-sm" />
                      <span className="self-center text-xs sm:text-sm text-muted-foreground">кг</span>
                    </div>
                  </div>
                </div>
              </div>

              <Textarea
                placeholder="Физик текшируv натижалари, кузатишлар..."
                className="min-h-24 sm:min-h-32 text-sm sm:text-base"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
          </Card>

          {/* Assessment */}
          <Card className="card-shadow">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-warning rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">A - Assessment</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Ташхис</p>
                </div>
              </div>
              <Input
                placeholder="ICD-10 кодини қидириш (масалан: I10 - Гипертония)"
                className="mb-3 text-sm sm:text-base"
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <div className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
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
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">P - Plan</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Даволаш режаси</p>
                </div>
              </div>
              <Textarea
                placeholder="Даволаш режаси, тавсиялар, кейинги тасриф..."
                className="min-h-24 sm:min-h-32 mb-3 text-sm sm:text-base"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Pill className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Рецепт ёзиш</span>
                  <span className="sm:hidden">Рецепт</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Таҳлил буюриш</span>
                  <span className="sm:hidden">Таҳлил</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto text-sm sm:text-base">
            <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Бекор қилиш
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
            <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Сақлаш
          </Button>
          <Button size="lg" className="gradient-success w-full sm:w-auto text-sm sm:text-base" onClick={handleSave}>
            <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Сақлаш ва Чиқиш
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NewVisit;
