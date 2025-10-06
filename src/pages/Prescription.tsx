import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus, Printer, Send, Trash2, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Medication {
  id: string;
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const Prescription = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergyWarning, setAllergyWarning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock drug database
  const drugDatabase = [
    "Парацетамол 500мг",
    "Ибупрофен 400мг",
    "Амоксициллин 500мг",
    "Азитромицин 250мг",
    "Омепразол 20мг",
    "Метформин 500мг",
    "Аспирин 100мг",
    "Диклофенак 50мг",
  ];

  const filteredDrugs = drugDatabase.filter(drug =>
    drug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      drug: "",
      dosage: "",
      frequency: "",
      duration: "",
    };
    setMedications([...medications, newMed]);
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
    
    // Mock allergy check
    if (field === "drug" && value.toLowerCase().includes("амоксициллин")) {
      setAllergyWarning(true);
    }
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Рецепт Ёзиш</h1>
            <p className="text-muted-foreground mt-1">Янги рецепт яратиш</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Чоп Этиш
            </Button>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Дорихонага Юбориш
            </Button>
          </div>
        </div>

        {/* Patient Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Бемор Маълумоти</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Бемор Исми</Label>
                <p className="font-semibold">Алиева Гулнора Ахмедовна</p>
              </div>
              <div>
                <Label>Туғилган Сана</Label>
                <p className="font-semibold">15.03.1985 (39 йош)</p>
              </div>
              <div>
                <Label>Телефон</Label>
                <p className="font-semibold">+998 90 123 45 67</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergy Warning */}
        {allergyWarning && (
          <Alert className="mb-6 border-destructive bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDescription className="text-destructive font-semibold">
              ОГОҲЛАНТИРИШ: Беморда бу дорига аллергия бор! Пенициллин гуруҳи дориларига аллергия.
            </AlertDescription>
          </Alert>
        )}

        {/* Drug Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Дори Қидириш</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Дори номини киритинг..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10"
              />
              {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                  {filteredDrugs.map((drug, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        setSearchTerm(drug);
                        setShowSuggestions(false);
                      }}
                    >
                      {drug}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Medications List */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Дорилар Рўйхати</CardTitle>
            <Button onClick={addMedication} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Дори Қўшиш
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ҳали дорилар қўшилмаган. "Дори Қўшиш" тугмасини босинг.
              </p>
            ) : (
              medications.map((med) => (
                <Card key={med.id} className="border border-border">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <Label>Дори Номи</Label>
                        <Input
                          value={med.drug}
                          onChange={(e) => updateMedication(med.id, "drug", e.target.value)}
                          placeholder="Дори номи"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Дозаси</Label>
                        <Input
                          value={med.dosage}
                          onChange={(e) => updateMedication(med.id, "dosage", e.target.value)}
                          placeholder="500мг"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Label>Қабул Қилиш</Label>
                        <Select
                          value={med.frequency}
                          onValueChange={(value) => updateMedication(med.id, "frequency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Танланг" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1x">Кунига 1 марта</SelectItem>
                            <SelectItem value="2x">Кунига 2 марта</SelectItem>
                            <SelectItem value="3x">Кунига 3 марта</SelectItem>
                            <SelectItem value="4x">Кунига 4 марта</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-3">
                        <Label>Муддати</Label>
                        <Input
                          value={med.duration}
                          onChange={(e) => updateMedication(med.id, "duration", e.target.value)}
                          placeholder="7 кун"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {/* Additional Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Қўшимча Кўрсатмалар</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Бемор учун махсус кўрсатмалар ёки огоҳлантиришлар..."
              rows={4}
            />
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

export default Prescription;
