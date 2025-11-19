import {
  MedicalImage,
  PatientInfo,
  ImagingTypeInfo,
  ExaminationInfo,
} from "@/app/api/radiologyApi/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { formatDate } from "date-fns";
import { Image as ImageIcon, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { BodyPartConstants } from "@/constants/BodyPart";
import { useGetOneMedicalImageQuery } from "@/app/api/radiologyApi";
import { SERVER_URL } from "@/constants/ServerUrl";

// Tana qismlari uchun o'zbek nomlari
const bodyPartLabels: Record<string, string> = {
  [BodyPartConstants.HEAD]: "Бош",
  [BodyPartConstants.NECK]: "Бўйин",
  [BodyPartConstants.CHEST]: "Кўкрак",
  [BodyPartConstants.ABDOMEN]: "Қорин",
  [BodyPartConstants.PELVIS]: "Тос",
  [BodyPartConstants.SPINE]: "Умуртқа поғонаси",
  [BodyPartConstants.ARM]: "Қўл",
  [BodyPartConstants.LEG]: "Оёқ",
  [BodyPartConstants.KNEE]: "Тиззя",
  [BodyPartConstants.SHOULDER]: "Елка",
  [BodyPartConstants.HAND]: "Кафт",
  [BodyPartConstants.FOOT]: "Тобан",
};

interface ViewMedicalImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalImage: MedicalImage | null;
}

export const ViewMedicalImage = ({
  open,
  onOpenChange,
  medicalImage,
}: ViewMedicalImageProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { data: getMedicalImage, isLoading } = useGetOneMedicalImageQuery(
    { id: medicalImage?._id || "" },
    { skip: !medicalImage?._id }
  );

  // Helper functions (defined before useEffect)
  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPan({ x: 0, y: 0 });
  };

  // Reset when image changes
  useEffect(() => {
    handleResetView();
  }, [selectedImageIndex]);

  // Wheel zoom handler
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom((prev) => Math.max(50, Math.min(300, prev + delta)));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  if (!medicalImage) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] sm:max-w-[95vw] sm:max-h-[95vh] md:max-w-[99vw] lg:max-w-6xl xl:max-w-7xl p-0 overflow-hidden">
        <DialogHeader className="p-3 sm:p-4 md:p-5 lg:p-6 pb-2 sm:pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg md:text-xl lg:text-2xl line-clamp-2">
            {medicalImage?.imaging_type_id?.name} -{" "}
            {medicalImage?.patient_id?.fullname || "Номаълум бемор"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 md:gap-3 lg:gap-4 p-2 sm:p-3 md:p-3 lg:p-4 xl:p-6 max-h-[calc(98vh-70px)] sm:max-h-[calc(95vh-85px)] md:max-h-[calc(95vh-90px)] overflow-hidden">
          {/* Thumbnails */}
          <div className="md:col-span-2 lg:col-span-2 order-2 md:order-1">
            <ScrollArea className="h-[100px] sm:h-[120px] md:h-[calc(90vh-140px)] lg:h-[calc(95vh-160px)]">
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-1 gap-1.5 sm:gap-2">
                {medicalImage.image_paths?.map((path, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      handleResetView();
                    }}
                    className={`aspect-square bg-muted rounded-md cursor-pointer border-2 transition-all overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-primary ring-1 sm:ring-2 ring-primary/50"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={getImageUrl(path)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Viewer */}
          <div className="md:col-span-7 lg:col-span-7 order-1 md:order-2">
            <Card
              ref={imageContainerRef}
              className="bg-black rounded-lg relative flex flex-col items-center justify-center h-[250px] xs:h-[300px] sm:h-[350px] md:h-[45vh] lg:h-[55vh] xl:h-[60vh] overflow-hidden touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor:
                  zoom > 100 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              {medicalImage.image_paths &&
              medicalImage.image_paths.length > 0 ? (
                <div
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${
                      zoom / 100
                    }) rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    transition: isDragging
                      ? "none"
                      : "transform 0.2s ease-in-out, filter 0.2s ease-in-out",
                  }}
                  className="flex items-center justify-center p-4 max-h-full"
                >
                  <img
                    src={getImageUrl(
                      medicalImage.image_paths[selectedImageIndex]
                    )}
                    alt={`Таsvір ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-[200px] xs:max-h-[250px] sm:max-h-[300px] md:max-h-[40vh] lg:max-h-[50vh] xl:max-h-[55vh] object-contain rounded-lg select-none"
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23333' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3EТаsvір топілмаді%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 sm:mb-3 md:mb-4" />
                  <p className="text-xs sm:text-sm md:text-base">Таsvір йўқ</p>
                </div>
              )}

              {/* Image Counter */}
              {medicalImage.image_paths &&
                medicalImage.image_paths.length > 0 && (
                  <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/80 text-white px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 rounded-md sm:rounded-lg text-xs sm:text-sm">
                    {selectedImageIndex + 1} / {medicalImage.image_paths.length}
                  </div>
                )}

              {/* Navigation Arrows */}
              {medicalImage.image_paths &&
                medicalImage.image_paths.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0
                            ? medicalImage.image_paths!.length - 1
                            : prev - 1
                        )
                      }
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === medicalImage.image_paths!.length - 1
                            ? 0
                            : prev + 1
                        )
                      }
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </>
                )}

              {/* Controls */}
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/90 rounded-md sm:rounded-lg p-1 sm:p-1.5 md:p-2 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 md:gap-2 backdrop-blur-sm max-w-[95%]">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  disabled={zoom <= 50}
                  title="Кичрайтириш"
                >
                  <span className="text-base sm:text-lg md:text-xl">−</span>
                </Button>
                <span className="text-[10px] sm:text-xs md:text-sm text-white px-1 sm:px-1.5 md:px-2 flex items-center min-w-[40px] sm:min-w-[50px] md:min-w-[60px] justify-center">
                  {zoom}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                  onClick={() => setZoom(Math.min(300, zoom + 10))}
                  disabled={zoom >= 300}
                  title="Катталаштириш"
                >
                  <span className="text-base sm:text-lg md:text-xl">+</span>
                </Button>
                <div className="w-px bg-white/30 h-6 sm:h-7 md:h-8 mx-0.5 sm:mx-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                  onClick={() => setRotation(rotation - 90)}
                  title="Чапга айлантириш"
                >
                  <span className="text-base sm:text-lg md:text-xl">↺</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0"
                  onClick={() => setRotation(rotation + 90)}
                  title="Ўнгга айлантириш"
                >
                  <span className="text-base sm:text-lg md:text-xl">↻</span>
                </Button>
                <div className="w-px bg-white/30 h-6 sm:h-7 md:h-8 mx-0.5 sm:mx-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 h-7 sm:h-8 md:h-9 px-2 sm:px-2.5 md:px-3 text-[10px] sm:text-xs md:text-sm"
                  onClick={handleResetView}
                  title="Асл ҳолатга қайтариш"
                >
                  Қайта
                </Button>
              </div>

              {/* Hint for zoom */}
              {zoom === 100 && (
                <div className="hidden sm:block absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 bg-black/70 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 rounded-md sm:rounded-lg backdrop-blur-sm">
                  Ctrl + Scroll - Zoom
                </div>
              )}
            </Card>
          </div>

          {/* Info */}
          <div className="md:col-span-3 lg:col-span-3 order-3">
            <ScrollArea className="h-full max-h-[250px] sm:max-h-[300px] md:max-h-[calc(90vh-140px)] lg:max-h-[calc(95vh-160px)]">
              <div className="space-y-2 sm:space-y-3">
                <Card className="p-2 sm:p-3 md:p-3 lg:p-4">
                  <h3 className="font-semibold mb-2 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                    Бемор маълумотлари
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs md:text-xs lg:text-sm">
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Исм:
                      </span>
                      <span className="font-medium text-right break-words">
                        {medicalImage?.patient_id?.fullname || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Телефон:
                      </span>
                      <span className="font-medium">
                        {medicalImage?.patient_id?.phone || "-"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3 lg:p-4">
                  <h3 className="font-semibold mb-2 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                    Текшириш маълумотлари
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs md:text-xs lg:text-sm">
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Сана:
                      </span>
                      <span className="font-medium">
                        {formatDate(
                          new Date(medicalImage.created_at),
                          "dd.MM.yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Тури:
                      </span>
                      <span className="font-medium text-right break-words">
                        {medicalImage.imaging_type_id?.name || "Номаълум"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Тана қисми:
                      </span>
                      <span className="font-medium text-right break-words">
                        {medicalImage.body_part || "Кўрсатилмаган"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-1 sm:gap-2">
                      <span className="text-muted-foreground flex-shrink-0">
                        Тасвирлар:
                      </span>
                      <span className="font-medium">
                        {medicalImage.image_paths?.length || 0} та
                      </span>
                    </div>
                  </div>
                </Card>

                {medicalImage.description && (
                  <Card className="p-2 sm:p-3 md:p-3 lg:p-4">
                    <h3 className="font-semibold mb-2 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                      Тавсиф
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-xs lg:text-sm text-muted-foreground break-words">
                      {medicalImage.description}
                    </p>
                  </Card>
                )}

                <Card className="p-2 sm:p-3 md:p-3 lg:p-4">
                  <h3 className="font-semibold mb-2 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base">
                    Таsvір созламалари
                  </h3>
                  <div className="space-y-2 sm:space-y-2 md:space-y-3">
                    <div>
                      <Label className="text-[10px] sm:text-xs">
                        Ёруғлик: {brightness}%
                      </Label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) =>
                          setBrightness(parseInt(e.target.value))
                        }
                        className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] sm:text-xs">
                        Контраст: {contrast}%
                      </Label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
