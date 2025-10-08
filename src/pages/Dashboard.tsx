import { Calendar, Users, CheckCircle, MessageSquare, FileText, Search, FileEdit, Clock, TestTube, DollarSign, BarChart3, ImageIcon, Settings } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  
  const appointments = [
    { time: "09:00", patient: "Алиев Жасур", type: "Дастлабки қабул", status: "new" },
    { time: "09:30", patient: "Каримова Нодира", type: "Такрорий қабул", status: "confirmed" },
    { time: "10:00", patient: "Усмонов Азиз", type: "Кўрикдан кейин", status: "confirmed" },
    { time: "10:30", patient: "Рахимова Малика", type: "Дастлабки қабул", status: "new" },
  ];

  const recentActivity = [
    { time: "10 дақиқа олдин", action: "Алиев Жасур учун SOAP ёзув қўшилди" },
    { time: "25 дақиқа олдин", action: "Каримова Нодира учун рецепт ёзилди" },
    { time: "1 соат олдин", action: "Усмонов Азиз учун қон таҳлили буюртма қилинди" },
    { time: "2 соат олдин", action: "Янги бемор рўйхатдан ўтди: Рахимова Малика" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10 card-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">JAYRON MEDSERVIS</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" className="text-primary font-medium">Бош сахифа</Button>
                <Button variant="ghost" onClick={() => navigate("/patients")}>Беморлар</Button>
                <Button variant="ghost" onClick={() => navigate("/appointments")}>Навбат</Button>
                <Button variant="ghost" onClick={() => navigate("/reports")}>Хисоботлар</Button>
                <Button variant="ghost" onClick={() => navigate("/billing")}>Ҳисоб-китоб</Button>
                <Button variant="ghost" onClick={() => navigate("/settings")}>Созламалар</Button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-danger rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                  ДА
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">Др. Алимов</p>
                  <p className="text-xs text-muted-foreground">Терапевт</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Хуш келибсиз, Др. Алимов!</h1>
          <p className="text-muted-foreground">
            Бугун, {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Бугунги Беморлар"
            value="12"
            icon={Calendar}
            variant="default"
          />
          <StatCard
            title="Навбатдаги Беморлар"
            value="4"
            icon={Clock}
            variant="warning"
          />
          <StatCard
            title="Бажарилган Кўриклар"
            value="8"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Янги Хабарлар"
            value="3"
            icon={MessageSquare}
            variant="danger"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card className="card-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Бугунги Навбат</h2>
                  <Button onClick={() => navigate("/appointments")} className="gradient-primary">
                    + Қўшиш
                  </Button>
                </div>

                <div className="space-y-3">
                  {appointments.map((apt, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border hover:border-primary transition-smooth cursor-pointer bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{apt.time}</div>
                          </div>
                          <div>
                            <h3 className="font-semibold">{apt.patient}</h3>
                            <p className="text-sm text-muted-foreground">{apt.type}</p>
                          </div>
                        </div>
                        <Button size="sm" className="gradient-success">
                          Бошлаш
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="card-shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Тез Амаллар</h2>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/new-visit")}
                  >
                    <FileEdit className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Янги кўрик</div>
                      <div className="text-xs text-muted-foreground">SOAP ёзув яратиш</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/patients")}
                  >
                    <Search className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Бемор қидириш</div>
                      <div className="text-xs text-muted-foreground">Рўйхатдан топиш</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/prescription")}
                  >
                    <FileText className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Рецепт ёзиш</div>
                      <div className="text-xs text-muted-foreground">Дори буюртма қилиш</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/lab-order")}
                  >
                    <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold">Таҳлил буюртмаси</div>
                      <div className="text-xs text-muted-foreground">Лаборатория текширувлари</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/inpatient")}
                  >
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Стационар</div>
                      <div className="text-xs text-muted-foreground">Ётоқхона бошқаруви</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/lab-results")}
                  >
                    <TestTube className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Таҳлил натижалари</div>
                      <div className="text-xs text-muted-foreground">Лаборатория натижалари</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/radiology")}
                  >
                    <ImageIcon className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Рентген/МРТ/КТ</div>
                      <div className="text-xs text-muted-foreground">Тасвирлаш текширувлари</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/billing")}
                  >
                    <DollarSign className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Ҳисоб-китоб</div>
                      <div className="text-xs text-muted-foreground">Тўлов ва хисоб варақлари</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/reports")}
                  >
                    <BarChart3 className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Ҳисоботлар</div>
                      <div className="text-xs text-muted-foreground">Аналитика ва статистика</div>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-auto py-4 hover:bg-accent transition-smooth"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-semibold">Созламалар</div>
                      <div className="text-xs text-muted-foreground">Тизим созламалари</div>
                    </div>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="card-shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Охирги Фаолият</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
