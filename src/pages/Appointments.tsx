import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Appointments = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"day" | "week" | "month">("week");

  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 08:00 to 20:00
  const weekDays = ["Душанба", "Сешанба", "Чоршанба", "Пайшанба", "Жума", "Шанба", "Якшанба"];

  const appointments = [
    { day: 0, time: 9, patient: "Алиев Жасур", type: "Дастлабки", status: "new" },
    { day: 0, time: 9.5, patient: "Каримова Нодира", type: "Такрорий", status: "confirmed" },
    { day: 1, time: 10, patient: "Усмонов Азиз", type: "Кўрикдан кейин", status: "confirmed" },
    { day: 2, time: 14, patient: "Рахимова Малика", type: "Дастлабки", status: "new" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "border-l-4 border-l-primary bg-primary/5";
      case "confirmed":
        return "border-l-4 border-l-success bg-success/5";
      case "completed":
        return "border-l-4 border-l-muted bg-muted";
      case "cancelled":
        return "border-l-4 border-l-danger bg-danger/5";
      default:
        return "";
    }
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
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Навбатлар</h1>
                  <p className="text-sm text-muted-foreground">Тақвим кўриниши</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Controls */}
        <Card className="card-shadow mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant={view === "day" ? "default" : "outline"}
                  onClick={() => setView("day")}
                  className={view === "day" ? "gradient-primary" : ""}
                >
                  Кунлик
                </Button>
                <Button
                  variant={view === "week" ? "default" : "outline"}
                  onClick={() => setView("week")}
                  className={view === "week" ? "gradient-primary" : ""}
                >
                  Ҳафталик
                </Button>
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  onClick={() => setView("month")}
                  className={view === "month" ? "gradient-primary" : ""}
                >
                  Ойлик
                </Button>
              </div>

              <div className="flex gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Шифокор" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Барча шифокорлар</SelectItem>
                    <SelectItem value="alimov">Др. Алимов</SelectItem>
                    <SelectItem value="nurmatova">Др. Нурматова</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Ҳолат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Барча ҳолатлар</SelectItem>
                    <SelectItem value="new">Янги</SelectItem>
                    <SelectItem value="confirmed">Тасдиқланган</SelectItem>
                    <SelectItem value="completed">Бажарилган</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Week Calendar View */}
        <Card className="card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-4 font-semibold border-r">Вақт</div>
                {weekDays.map((day, idx) => (
                  <div key={idx} className="p-4 text-center font-semibold border-r last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {timeSlots.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b">
                    <div className="p-4 border-r bg-muted/20 text-sm font-medium">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    {weekDays.map((_, dayIdx) => {
                      const apt = appointments.find((a) => a.day === dayIdx && Math.floor(a.time) === hour);
                      return (
                        <div
                          key={dayIdx}
                          className="p-2 border-r last:border-r-0 min-h-20 hover:bg-accent/50 transition-smooth relative"
                        >
                          {apt && (
                            <div
                              className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-smooth ${getStatusColor(apt.status)}`}
                            >
                              <p className="font-semibold text-sm">{apt.patient}</p>
                              <p className="text-xs text-muted-foreground mt-1">{apt.type}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm">Янги</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="text-sm">Тасдиқланган</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <span className="text-sm">Бажарилган</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-danger rounded"></div>
            <span className="text-sm">Бекор қилинган</span>
          </div>
        </div>

        {/* Floating Add Button */}
        <Button
          size="lg"
          className="fixed bottom-8 right-8 rounded-full w-16 h-16 gradient-primary shadow-lg hover:shadow-xl transition-smooth"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </main>
    </div>
  );
};

export default Appointments;
