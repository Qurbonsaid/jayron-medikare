import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const users = [
    {
      id: 1,
      name: "Др. Алиев Анвар Рашидович",
      role: "Шифокор",
      department: "Терапия",
      status: "Фаол",
      email: "aliev@clinic.uz"
    },
    {
      id: 2,
      name: "Каримова Нилуфар Азизовна",
      role: "Ҳамшира",
      department: "Хирургия",
      status: "Фаол",
      email: "karimova@clinic.uz"
    },
  ];

  const auditLogs = [
    {
      timestamp: "07.10.2025 14:32",
      user: "Др. Алиев А.Р.",
      action: "Яратилди",
      module: "Янги ташриф",
      ip: "192.168.1.45"
    },
    {
      timestamp: "07.10.2025 14:15",
      user: "Ресепшн: Усмонова М.",
      action: "Янгиланди",
      module: "Навбат",
      ip: "192.168.1.32"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Созламалар</h1>
              <p className="text-sm text-muted-foreground">Тизим ва фойдаланувчи созламалари</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Фойдаланувчилар</TabsTrigger>
            <TabsTrigger value="clinic">Клиника</TabsTrigger>
            <TabsTrigger value="notifications">Билдиришномалар</TabsTrigger>
            <TabsTrigger value="audit">Тарих</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Фойдаланувчилар рўйхати</h2>
                <Button onClick={() => setIsUserModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Янги фойдаланувчи
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">ФИО</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Рол</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Бўлим</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳолат</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳаракатлар</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4">{user.department}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge className="bg-success/10 text-success border-success/20 border">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">Таҳрирлаш</Button>
                            <Button size="sm" variant="outline" className="text-danger">Ўчириш</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Clinic Tab */}
          <TabsContent value="clinic" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Клиника маълумотлари</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>Клиника номи</Label>
                  <Input defaultValue="JAYRON MEDSERVIS" />
                </div>
                <div>
                  <Label>Манзил</Label>
                  <Input defaultValue="Тошкент шаҳри, Юнусобод тумани" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Телефон</Label>
                    <Input defaultValue="+998 71 123 45 67" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input defaultValue="info@jayron.uz" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Иш бошланиш вақти</Label>
                    <Input type="time" defaultValue="08:00" />
                  </div>
                  <div>
                    <Label>Иш тугаш вақти</Label>
                    <Input type="time" defaultValue="20:00" />
                  </div>
                </div>
                <div>
                  <Label>Тил</Label>
                  <Select defaultValue="uz">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uz">Ўзбек тили</SelectItem>
                      <SelectItem value="ru">Русский язык</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Логотип</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Логотип</span>
                    </div>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Юклаш
                    </Button>
                  </div>
                </div>
                <Button>Сақлаш</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">SMS созламалари</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <Label>Провайдер</Label>
                  <Select defaultValue="playmobile">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="playmobile">Playmobile</SelectItem>
                      <SelectItem value="ucell">Ucell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>API калит</Label>
                  <Input type="password" placeholder="••••••••••••" />
                </div>
                <Button variant="outline">Тест SMS юбориш</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Автоматик билдиришномалар</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Навбатдан 1 кун олдин эслатма</Label>
                    <p className="text-sm text-muted-foreground">Навбат вақтидан 1 кун олдин SMS юбориш</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Навбатдан 1 соат олдин эслатма</Label>
                    <p className="text-sm text-muted-foreground">Навбат вақтидан 1 соат олдин SMS юбориш</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Таҳлил натижалари тайёр</Label>
                    <p className="text-sm text-muted-foreground">Лаборатория натижалари тайёр бўлганда хабар бериш</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Аудит тарихи</h2>
                <Button variant="outline">CSV юклаш</Button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Фойдаланувчи қидириш..." className="pl-10" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Вақт</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Фойдаланувчи</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳаракат</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Модул</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP манзил</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground">{log.timestamp}</td>
                        <td className="py-3 px-4 font-medium">{log.user}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{log.action}</Badge>
                        </td>
                        <td className="py-3 px-4">{log.module}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Янги фойдаланувчи қўшиш</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тўлиқ исми</Label>
                <Input placeholder="Фамилия Исм Шариф" />
              </div>
              <div>
                <Label>Фойдаланувчи номи</Label>
                <Input placeholder="username" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" />
              </div>
              <div>
                <Label>Телефон</Label>
                <Input placeholder="+998 XX XXX XX XX" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Рол</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Танланг..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Шифокор</SelectItem>
                    <SelectItem value="nurse">Ҳамшира</SelectItem>
                    <SelectItem value="reception">Ресепшн</SelectItem>
                    <SelectItem value="admin">Админ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Бўлим</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Танланг..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="therapy">Терапия</SelectItem>
                    <SelectItem value="surgery">Хирургия</SelectItem>
                    <SelectItem value="pediatrics">Педиатрия</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Лицензия рақами (шифокорлар учун)</Label>
              <Input placeholder="LIC-XXXXX" />
            </div>

            <div>
              <Label>Парол</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="••••••••" className="flex-1" />
                <Button variant="outline">Яратиш</Button>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Рухсатлар</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm1" />
                  <label htmlFor="perm1" className="text-sm">Беморларни кўриш</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm2" />
                  <label htmlFor="perm2" className="text-sm">Беморларни таҳрирлаш</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="perm3" />
                  <label htmlFor="perm3" className="text-sm">Таҳлил натижаларини киритиш</label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>
              Бекор қилиш
            </Button>
            <Button onClick={() => {
              toast.success("Фойдаланувчи қўшилди");
              setIsUserModalOpen(false);
            }}>
              Қўшиш
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;