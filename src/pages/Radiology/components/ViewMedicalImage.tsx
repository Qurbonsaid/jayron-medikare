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
import { formatDate } from "date-fns";
import { Image as ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { BodyPartConstants } from "@/constants/BodyPart";
import { useGetOneMedicalImageQuery } from "@/app/api/radiologyApi";

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
  const { data: getMedicalImage, isLoading } = useGetOneMedicalImageQuery(
    { id: medicalImage?._id || "" },
    { skip: !medicalImage?._id }
  );

  if (!medicalImage) return null;

  const getPatientName = () => {
    if (typeof medicalImage.examination_id === "string") return "Номаълум";
    const exam = medicalImage.examination_id as ExaminationInfo;
    if (typeof exam?.patient_id === "string") return "Номаълум";
    return exam?.patient_id?.fullname || "Номаълум";
  };

  const getPatientPhone = () => {
    if (typeof medicalImage.examination_id === "string") return "-";
    const exam = medicalImage.examination_id as ExaminationInfo;
    if (typeof exam?.patient_id === "string") return "-";
    return exam?.patient_id?.phone || "-";
  };

  const getImagingTypeName = () => {
    if (typeof medicalImage.imaging_type_id === "string") return "Номаълум";
    return (
      (medicalImage.imaging_type_id as ImagingTypeInfo)?.name || "Номаълум"
    );
  };

  const getBodyPartLabel = () => {
    if (!medicalImage.body_part) return "Кўрсатилмаган";
    return bodyPartLabels[medicalImage.body_part] || medicalImage.body_part;
  };

  const handleResetView = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] sm:max-w-[90vw] lg:max-w-6xl p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0 border-b">
          <DialogTitle className="text-xl sm:text-2xl">
            {getImagingTypeName()} - {getPatientName()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 max-h-[calc(95vh-100px)]">
          {/* Thumbnails */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <ScrollArea className="h-[120px] lg:h-[calc(95vh-200px)]">
              <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
                {medicalImage.image_paths?.map((path, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      handleResetView();
                    }}
                    className={`aspect-square bg-muted rounded-lg cursor-pointer border-2 transition-all overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={path}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Main Viewer */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <Card className="bg-black rounded-lg relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] overflow-hidden">
              {medicalImage.image_paths &&
              medicalImage.image_paths.length > 0 ? (
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transition: "transform 0.2s ease-in-out",
                  }}
                  className="flex items-center justify-center p-4 max-h-full"
                >
                  <img
                    src={medicalImage.image_paths[selectedImageIndex]}
                    alt={`Таsvир ${selectedImageIndex + 1}`}
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23333' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3EТаsvир топилмади%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <ImageIcon className="w-16 h-16 sm:w-24 sm:h-24 mb-4" />
                  <p className="text-sm sm:text-base">Таsvир йўқ</p>
                </div>
              )}

              {/* Image Counter */}
              {medicalImage.image_paths &&
                medicalImage.image_paths.length > 0 && (
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-lg text-sm">
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0
                            ? medicalImage.image_paths!.length - 1
                            : prev - 1
                        )
                      }
                    >
                      <svg
                        className="w-6 h-6"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white"
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === medicalImage.image_paths!.length - 1
                            ? 0
                            : prev + 1
                        )
                      }
                    >
                      <svg
                        className="w-6 h-6"
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
              <div className="absolute bottom-4 bg-black/80 rounded-lg p-2 flex flex-wrap justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                  disabled={zoom <= 50}
                >
                  <span className="text-lg">−</span>
                </Button>
                <span className="text-xs sm:text-sm text-white px-2 flex items-center min-w-[60px] justify-center">
                  {zoom}%
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                  disabled={zoom >= 200}
                >
                  <span className="text-lg">+</span>
                </Button>
                <div className="w-px bg-white/30 mx-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setRotation(rotation - 90)}
                  title="Чапга айлантириш"
                >
                  <span className="text-lg">↺</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => setRotation(rotation + 90)}
                  title="Ўнгга айлантириш"
                >
                  <span className="text-lg">↻</span>
                </Button>
                <div className="w-px bg-white/30 mx-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={handleResetView}
                  title="Асл ҳолатга қайтариш"
                >
                  Қайта
                </Button>
              </div>
            </Card>
          </div>

          {/* Info */}
          <div className="lg:col-span-3 order-3">
            <ScrollArea className="h-full max-h-[300px] lg:max-h-[calc(95vh-200px)]">
              <div className="space-y-3">
                <Card className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    Бемор маълумотлари
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Исм:</span>
                      <span className="font-medium text-right">
                        {getPatientName()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Телефон:</span>
                      <span className="font-medium">{getPatientPhone()}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">
                    Текшириш маълумотлари
                  </h3>
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Сана:</span>
                      <span className="font-medium">
                        {formatDate(
                          new Date(medicalImage.created_at),
                          "dd.MM.yyyy"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Тури:</span>
                      <span className="font-medium">
                        {getImagingTypeName()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        Танасининг қисми:
                      </span>
                      <span className="font-medium text-right">
                        {getBodyPartLabel()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Тасвирлар:</span>
                      <span className="font-medium">
                        {medicalImage.image_paths?.length || 0} та
                      </span>
                    </div>
                  </div>
                </Card>

                {medicalImage.description && (
                  <Card className="p-3 sm:p-4">
                    <h3 className="font-semibold mb-3 text-sm sm:text-base">
                      Тавсиф
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {medicalImage.description}
                    </p>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
