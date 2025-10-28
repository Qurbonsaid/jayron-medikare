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
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <main className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
        {/* Controls Navbar */}
        <Card className="card-shadow mb-3 sm:mb-4 lg:mb-6 border-0 sm:border">
          <div className="p-2.5 sm:p-4 lg:p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
              {/* View Toggle Buttons */}
              <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                <Button
                  variant={view === "day" ? "default" : "outline"}
                  onClick={() => setView("day")}
                  className={`${
                    view === "day" ? "gradient-primary text-white" : "bg-background"
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Кунлик
                </Button>
                <Button
                  variant={view === "week" ? "default" : "outline"}
                  onClick={() => setView("week")}
                  className={`${
                    view === "week" ? "gradient-primary text-white" : "bg-background"
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Ҳафталик
                </Button>
                <Button
                  variant={view === "month" ? "default" : "outline"}
                  onClick={() => setView("month")}
                  className={`${
                    view === "month" ? "gradient-primary text-white" : "bg-background"
                  } flex-1 sm:flex-none text-[10px] sm:text-xs lg:text-sm px-2 sm:px-3 py-2 h-8 sm:h-9 lg:h-10 font-medium transition-all`}
                >
                  Ойлик
                </Button>
              </div>

              {/* Filter Selects */}
              <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-32 lg:w-40 text-[10px] sm:text-xs lg:text-sm h-8 sm:h-9 lg:h-10 bg-background">
                    <SelectValue placeholder="Шифокор" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px] sm:text-xs lg:text-sm">Барча шифокорлар</SelectItem>
                    <SelectItem value="alimov" className="text-[11px] sm:text-xs lg:text-sm">Др. Алимов</SelectItem>
                    <SelectItem value="nurmatova" className="text-[11px] sm:text-xs lg:text-sm">Др. Нурматова</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-full sm:w-32 lg:w-40 text-[10px] sm:text-xs lg:text-sm h-8 sm:h-9 lg:h-10 bg-background">
                    <SelectValue placeholder="Ҳолат" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px] sm:text-xs lg:text-sm">Барча ҳолатлар</SelectItem>
                    <SelectItem value="new" className="text-[11px] sm:text-xs lg:text-sm">Янги</SelectItem>
                    <SelectItem value="confirmed" className="text-[11px] sm:text-xs lg:text-sm">Тасдиқланган</SelectItem>
                    <SelectItem value="completed" className="text-[11px] sm:text-xs lg:text-sm">Бажарилган</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar Table */}
        <Card className="card-shadow overflow-hidden border-0 sm:border">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-260px)] lg:max-h-[calc(100vh-280px)] -mx-2 sm:mx-0 px-2 sm:px-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="min-w-[480px] sm:min-w-[640px] lg:min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-1.5 sm:p-2 lg:p-4 font-semibold border-r text-[10px] sm:text-xs lg:text-sm">Вақт</div>
                {weekDays.map((day, idx) => (
                  <div key={idx} className="p-1.5 sm:p-2 lg:p-4 text-center font-semibold border-r last:border-r-0 text-[10px] sm:text-xs lg:text-sm">
                    <span className="hidden md:inline">{day}</span>
                    <span className="md:hidden">{day.slice(0, 2)}</span>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="relative">
                {timeSlots.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b">
                    <div className="p-1.5 sm:p-2 lg:p-4 border-r bg-muted/20 text-[10px] sm:text-xs lg:text-sm font-medium">
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                    {weekDays.map((_, dayIdx) => {
                      const apt = appointments.find((a) => a.day === dayIdx && Math.floor(a.time) === hour);
                      return (
                        <div
                          key={dayIdx}
                          className="p-0.5 sm:p-1 lg:p-2 border-r last:border-r-0 min-h-12 sm:min-h-16 lg:min-h-20 hover:bg-accent/50 transition-smooth relative"
                        >
                          {apt && (
                            <div
                              className={`p-0.5 sm:p-1 lg:p-2 rounded cursor-pointer hover:shadow-md transition-smooth ${getStatusColor(apt.status)}`}
                            >
                              <p className="font-semibold text-[9px] sm:text-[10px] lg:text-sm leading-tight">{apt.patient}</p>
                              <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground mt-0.5 hidden lg:block">{apt.type}</p>
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

        {/* Status Legend */}
        <div className="mt-2.5 sm:mt-4 lg:mt-5 flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 px-2 py-2 sm:py-0 bg-card sm:bg-transparent rounded-lg sm:rounded-none">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-primary rounded-sm flex-shrink-0"></div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap">Янги</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-success rounded-sm flex-shrink-0"></div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap">Тасдиқланган</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-muted rounded-sm flex-shrink-0"></div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap">Бажарилган</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-danger rounded-sm flex-shrink-0"></div>
            <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium whitespace-nowrap">Бекор қилинган</span>
          </div>
        </div>

        {/* Floating Action Button */}
        <Button
          size="lg"
          onClick={() => console.log('Add new appointment')}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 rounded-full w-14 h-14 sm:w-15 sm:h-15 lg:w-16 lg:h-16 gradient-primary shadow-lg hover:shadow-xl active:scale-90 transition-all duration-150 z-50 touch-manipulation"
          aria-label="Янги навбат қўшиш"
        >
          <Plus className="w-6 h-6 sm:w-6 sm:h-6 lg:w-7 lg:h-7 stroke-[2.5]" />
        </Button>
      </main>
    </div>
  );
};

export default Appointments;
