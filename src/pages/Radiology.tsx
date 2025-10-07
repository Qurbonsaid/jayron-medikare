import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

interface RadiologyOrder {
  orderId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  status: string;
  scheduledDate: string;
}

const Radiology = () => {
  const navigate = useNavigate();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [rotation, setRotation] = useState(0);

  const orders: RadiologyOrder[] = [
    {
      orderId: "RAD-2025-001",
      patientName: "Алиев Анвар Рашидович",
      modality: "МРТ",
      bodyPart: "Бош мия",
      status: "Буюртма берилган",
      scheduledDate: "08.10.2025 10:00"
    },
    {
      orderId: "RAD-2025-002",
      patientName: "Каримова Нилуфар Азизовна",
      modality: "КТ",
      bodyPart: "Ўпка",
      status: "Бажарилмоқда",
      scheduledDate: "07.10.2025 14:30"
    },
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      "Буюртма берилган": "bg-blue-100 text-blue-700",
      "Бажарилмоқда": "bg-warning/10 text-warning border-warning/20 border",
      "Тайёр": "bg-success/10 text-success border-success/20 border",
      "Хулоса ёзилган": "bg-primary/10 text-primary border-primary/20 border"
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const handleSubmitOrder = () => {
    toast.success("Рентген буюртмаси юборилди");
    setIsOrderModalOpen(false);
  };

  const handleResetView = () => {
    setZoom(100);
    setBrightness(50);
    setContrast(50);
    setRotation(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Рентген / МРТ / КТ</h1>
                <p className="text-sm text-muted-foreground">Тасвирлаш текширувлари</p>
              </div>
            </div>
            <Button onClick={() => setIsOrderModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Янги буюртма
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Orders List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Буюртмалар рўйхати</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Буюртма №</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Бемор</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Тури</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Қисм</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳолат</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Режа</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ҳаракатлар</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{order.orderId}</td>
                      <td className="py-3 px-4">{order.patientName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{order.modality}</Badge>
                      </td>
                      <td className="py-3 px-4">{order.bodyPart}</td>
                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.scheduledDate}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" onClick={() => setIsViewerOpen(true)}>
                          Кўриш
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </main>

      {/* New Order Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Янги рентген буюртмаси</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Бемор танлаш</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Беморни танланг..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient1">Алиев Анвар Рашидович</SelectItem>
                  <SelectItem value="patient2">Каримова Нилуфар Азизовна</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Тури</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Танланг..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mri">МРТ</SelectItem>
                    <SelectItem value="ct">КТ</SelectItem>
                    <SelectItem value="xray">Рентген</SelectItem>
                    <SelectItem value="ultrasound">УЗИ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Танани қисми</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Танланг..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brain">Бош мия</SelectItem>
                    <SelectItem value="chest">Ўпка</SelectItem>
                    <SelectItem value="spine">Умуртқа</SelectItem>
                    <SelectItem value="abdomen">Қорин бўшлиғи</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Клиник кўрсатма</Label>
              <Textarea
                placeholder="Текшириш сабаби ва клиник маълумотлар..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Устунлик</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Оддий</SelectItem>
                    <SelectItem value="urgent">Шошилинч</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Режалаштирилган сана</Label>
                <Input type="datetime-local" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderModalOpen(false)}>
              Бекор қилиш
            </Button>
            <Button onClick={handleSubmitOrder}>
              Юбориш
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DICOM Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">МРТ - Бош мия | Алиев Анвар</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-4 h-[75vh]">
            {/* Left Panel - Thumbnails */}
            <div className="col-span-2 bg-muted/20 rounded-lg p-2 overflow-y-auto">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((slice) => (
                  <div key={slice} className="aspect-square bg-gray-700 rounded cursor-pointer hover:ring-2 ring-primary">
                    <div className="w-full h-full flex items-center justify-center text-white text-sm">
                      Slice {slice}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Viewer */}
            <div className="col-span-7 bg-black rounded-lg relative overflow-hidden">
              <div 
                className="w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  transition: 'all 0.2s'
                }}
              >
                <div className="w-96 h-96 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🧠</div>
                    <div className="text-sm text-gray-400">DICOM изображение</div>
                  </div>
                </div>
              </div>

              {/* Viewer Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-2 flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setZoom(Math.max(50, zoom - 10))}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm px-2">{zoom}%</span>
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setZoom(Math.min(200, zoom + 10))}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-600 mx-2" />
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setRotation(rotation - 90)}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setRotation(rotation + 90)}>
                  <RotateCw className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-600 mx-2" />
                <Button size="icon" variant="ghost" className="text-white">
                  <Ruler className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-white">
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-600 mx-2" />
                <Button size="sm" variant="ghost" className="text-white" onClick={handleResetView}>
                  Қайта ўрнатиш
                </Button>
              </div>
            </div>

            {/* Right Panel - Info & Report */}
            <div className="col-span-3 space-y-4 overflow-y-auto">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Текшириш маълумотлари</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сана:</span>
                    <span className="font-medium">07.10.2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тури:</span>
                    <span className="font-medium">МРТ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Протокол:</span>
                    <span className="font-medium">T1, T2, FLAIR</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Радиолог хулосаси</h3>
                <div className="mb-3">
                  <Label className="text-xs">Шаблон</Label>
                  <Select>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Танланг..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Норма</SelectItem>
                      <SelectItem value="stroke">Инсульт</SelectItem>
                      <SelectItem value="tumor">Ўсма</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Хулоса ёзинг..."
                  rows={8}
                  className="text-sm"
                />
                <Button className="w-full mt-3" size="sm">
                  Хулосани юбориш
                </Button>
              </Card>

              {/* Brightness/Contrast Controls */}
              <Card className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Ёруғлик: {brightness}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Контраст: {contrast}%</Label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Radiology;