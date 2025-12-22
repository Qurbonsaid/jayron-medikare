import {
  MedicalImage,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "date-fns";
import { Image as ImageIcon, Maximize2, Minimize2, Download } from "lucide-react";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { BodyPartConstants } from "@/constants/BodyPart";
import { useGetOneMedicalImageQuery } from "@/app/api/radiologyApi";
import { SERVER_URL } from "@/constants/ServerUrl";
import { formatPhoneNumber } from "@/lib/utils";
import { getFileTypeInfo, getFileIcon, downloadFile } from "@/lib/fileTypeUtils";
import { PDFViewer } from "./viewers/PDFViewer";
import { WordViewer } from "./viewers/WordViewer";
import { ExcelViewer } from "./viewers/ExcelViewer";
import { RTFViewer } from "./viewers/RTFViewer";
import { MDFXViewer } from "./viewers/MDFXViewer";
import { DownloadOnlyCard } from "./viewers/DownloadOnlyCard";

// Tana qismlari uchun o'zbek nomlari
const bodyPartLabels: Record<string, string> = {
  [BodyPartConstants.HEAD]: "Бош",
  [BodyPartConstants.NECK]: "Бўйин",
  [BodyPartConstants.CHEST]: "Кўкрак қафаси",
  [BodyPartConstants.ABDOMEN]: "Қорин бўшлиғи",
  [BodyPartConstants.PELVIS]: "Тос суяги",
  [BodyPartConstants.SPINE]: "Умуртқа поғонаси",
  [BodyPartConstants.ARM]: "Қўл",
  [BodyPartConstants.LEG]: "Оёқ",
  [BodyPartConstants.KNEE]: "Тизза",
  [BodyPartConstants.SHOULDER]: "Елка",
  [BodyPartConstants.HAND]: "Кафт",
  [BodyPartConstants.FOOT]: "Оёқ табани",
};

interface ViewMedicalImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalImage: MedicalImage | null;
}

export const ViewMedicalImage = memo(({
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const { data: getMedicalImage, isLoading } = useGetOneMedicalImageQuery(
    { id: medicalImage?._id || "" },
    { skip: !medicalImage?._id }
  );

  // Get current file info - useMemo bilan optimallashtirish
  const currentFilePath = useMemo(() => 
    medicalImage?.image_paths?.[selectedImageIndex] || "", 
    [medicalImage?.image_paths, selectedImageIndex]
  );
  
  const currentFileInfo = useMemo(() => 
    getFileTypeInfo(currentFilePath), 
    [currentFilePath]
  );
  
  const currentFileType = currentFileInfo.type;
  const isImage = currentFileType === "image";

  // Helper functions - useCallback bilan
  const handleResetView = useCallback(() => {
    setZoom(100);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setPan({ x: 0, y: 0 });
  }, []);

  // Reset when image changes
  useEffect(() => {
    handleResetView();
  }, [selectedImageIndex, handleResetView]);

  // Reset when modal opens/closes or medicalImage changes
  useEffect(() => {
    if (open) {
      // Modal ochilganda 0-indeksdan boshlash
      setSelectedImageIndex(0);
      handleResetView();
    }
  }, [open, medicalImage?._id, handleResetView]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!medicalImage?.image_paths || medicalImage.image_paths.length <= 1)
        return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev === 0 ? medicalImage.image_paths!.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedImageIndex((prev) =>
          prev === medicalImage.image_paths!.length - 1 ? 0 : prev + 1
        );
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, medicalImage, isFullscreen]);

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

  // getImageUrl - useCallback bilan
  const getImageUrl = useCallback((path: string) => {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  }, []);

  // Current file URL
  const currentFileUrl = useMemo(() => 
    getImageUrl(currentFilePath), 
    [getImageUrl, currentFilePath]
  );

  // Current filename
  const currentFilename = useMemo(() => 
    currentFilePath.split('/').pop() || 'file', 
    [currentFilePath]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 100) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      });
    }
  }, [zoom, pan.x, pan.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 100) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, zoom, dragStart.x, dragStart.y]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!medicalImage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] max-h-[98vh] sm:max-w-[95vw] sm:max-h-[95vh] md:max-w-[99vw] lg:max-w-[95vw] xl:max-w-[98vw] p-0 overflow-hidden overflow-y-auto">
        <DialogHeader className="p-2 sm:pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-sm md:text-base lg:text-lg line-clamp-1 sm:line-clamp-2">
            {medicalImage?.imaging_type_id?.name} -{" "}
            {medicalImage?.patient_id?.fullname || "Номаълум бемор"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 h-[calc(98vh-60px)] sm:h-[calc(95vh-75px)] overflow-auto">
          {/* Main Viewer - Left side, 9 columns */}
          <div className="lg:col-span-9 flex flex-col">
            <Card
              ref={imageContainerRef}
              className={`${isImage ? 'bg-black' : 'bg-background'} rounded-lg relative flex flex-col items-center justify-center overflow-hidden ${isImage ? 'touch-none' : ''} transition-all ${
                isFullscreen
                  ? "fixed inset-0 z-[100] rounded-none h-screen w-screen"
                  : "h-full"
              }`}
              onMouseDown={isImage ? handleMouseDown : undefined}
              onMouseMove={isImage ? handleMouseMove : undefined}
              onMouseUp={isImage ? handleMouseUp : undefined}
              onMouseLeave={isImage ? handleMouseUp : undefined}
              style={{
                cursor: isImage && zoom > 100 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              {medicalImage.image_paths &&
              medicalImage.image_paths.length > 0 ? (
                <>
                  {/* Render based on file type */}
                  {currentFileType === "image" && (
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
                        alt={`Тасвир ${selectedImageIndex + 1}`}
                        className={`max-w-full object-contain rounded-lg select-none ${
                          isFullscreen
                            ? "max-h-[85vh]"
                            : "max-h-[300px] xs:max-h-[350px] sm:max-h-[400px] md:max-h-[50vh] lg:max-h-[70vh]"
                        }`}
                        draggable={false}
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23333' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='20'%3EТасвир топилмади%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "pdf" && (
                    <div className="w-full h-full p-4">
                      <PDFViewer
                        url={currentFileUrl}
                        filename={currentFilename}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "word" && (
                    <div className="w-full h-full p-4">
                      <WordViewer
                        url={currentFileUrl}
                        filename={currentFilename}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "excel" && (
                    <div className="w-full h-full p-4">
                      <ExcelViewer
                        url={currentFileUrl}
                        filename={currentFilename}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "rtf" && (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <RTFViewer
                        url={currentFileUrl}
                        filename={currentFilename}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "mdfx" && (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <MDFXViewer
                        url={currentFileUrl}
                        filename={currentFilename}
                      />
                    </div>
                  )}
                  
                  {currentFileType === "other" && (
                    <div className="w-full h-full p-4 flex items-center justify-center">
                      <DownloadOnlyCard
                        url={currentFileUrl}
                        filename={currentFilename}
                        fileType={currentFileInfo.extension || 'other'}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 sm:mb-3 md:mb-4" />
                  <p className="text-xs sm:text-sm md:text-base">Файл йўқ</p>
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

              {/* Controls Panel - Only for images */}
              {isImage && (
                <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/95 rounded-lg p-2 sm:p-3 backdrop-blur-md max-w-[98%] shadow-xl">
                  {/* Zoom & Rotation Controls */}
                  <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 mb-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    disabled={zoom <= 50}
                    title="Zoom Out (Ctrl + Scroll)"
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <span className="text-xs text-white px-2 min-w-[50px] text-center font-mono">
                    {zoom}%
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setZoom(Math.min(300, zoom + 10))}
                    disabled={zoom >= 300}
                    title="Zoom In (Ctrl + Scroll)"
                  >
                    <span className="text-lg">+</span>
                  </Button>
                  <div className="w-px bg-white/30 h-6 mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setRotation(rotation - 90)}
                    title="Rotate Left"
                  >
                    <span className="text-lg">↺</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setRotation(rotation + 90)}
                    title="Rotate Right"
                  >
                    <span className="text-lg">↻</span>
                  </Button>
                  <div className="w-px bg-white/30 h-6 mx-1" />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 sm:h-8 px-2 text-xs"
                    onClick={handleResetView}
                    title="Reset View"
                  >
                    Қайта
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => downloadFile(
                      getImageUrl(medicalImage.image_paths[selectedImageIndex]),
                      medicalImage.image_paths[selectedImageIndex].split('/').pop()
                    )}
                    title="Расмни юклаб олиш"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-7 w-7 sm:h-8 sm:w-8 p-0"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    title={
                      isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"
                    }
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Brightness & Contrast Sliders */}
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[150px]">
                    <span className="text-[10px] text-white/80 whitespace-nowrap">
                      Ёруғлик
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-[10px] text-white font-mono w-8">
                      {brightness}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-[120px] sm:min-w-[150px]">
                    <span className="text-[10px] text-white/80 whitespace-nowrap">
                      Контраст
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-[10px] text-white font-mono w-8">
                      {contrast}%
                    </span>
                  </div>
                </div>
                </div>
              )}

              {/* Hints - Only for images */}
              {isImage && !isFullscreen && (
                <div className="hidden sm:block absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-sm space-y-0.5">
                  <div>🖱️ Ctrl + Scroll - Zoom</div>
                  <div>⌨️ ← → - Navigate</div>
                  <div>🖼️ Click ⛶ - Fullscreen</div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Sidebar - Info + Thumbnails */}
          {!isFullscreen && (
            <div className="lg:col-span-3 flex flex-col-reverse lg:flex-col gap-3 ">
              {/* Info Section */}
              <TooltipProvider>
                <Card className="p-2 sm:p-3 flex-1 min-h-max">
                  <div className="space-y-3">
                    {/* Patient Info */}
                    <div>
                      <h3 className="font-semibold mb-1.5 text-xs sm:text-sm flex items-center gap-1">
                        Бемор
                      </h3>
                      <div className="space-y-1 text-[10px] sm:text-xs">
                        <div className="flex justify-between gap-1">
                          <span className="text-muted-foreground flex-shrink-0">
                            Исм:
                          </span>
                          {medicalImage?.patient_id?.fullname &&
                          medicalImage.patient_id.fullname.length > 20 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-right truncate cursor-help">
                                  {medicalImage.patient_id.fullname.slice(
                                    0,
                                    20
                                  )}
                                  ...
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{medicalImage.patient_id.fullname}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="font-medium text-right">
                              {medicalImage?.patient_id?.fullname || "-"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between gap-1">
                          <span className="text-muted-foreground flex-shrink-0">
                            Телефон:
                          </span>
                          <span className="font-medium">
                            {formatPhoneNumber(medicalImage?.patient_id?.phone)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Examination Info */}
                    <div>
                      <h3 className="font-semibold mb-1.5 text-xs sm:text-sm flex items-center gap-1">
                        Текшириш
                      </h3>
                      <div className="space-y-1 text-[10px] sm:text-xs">
                        <div className="flex justify-between gap-1">
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
                        <div className="flex justify-between gap-1">
                          <span className="text-muted-foreground flex-shrink-0">
                            Тури:
                          </span>
                          {medicalImage.imaging_type_id?.name &&
                          medicalImage.imaging_type_id.name.length > 15 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-right truncate cursor-help">
                                  {medicalImage.imaging_type_id.name.slice(
                                    0,
                                    15
                                  )}
                                  ...
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{medicalImage.imaging_type_id.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="font-medium text-right">
                              {medicalImage.imaging_type_id?.name || "Номаълум"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between gap-1">
                          <span className="text-muted-foreground flex-shrink-0">
                            Қисми:
                          </span>
                          {medicalImage.body_part &&
                          medicalImage.body_part.length > 15 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-right truncate cursor-help">
                                  {medicalImage.body_part.slice(0, 15)}...
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{medicalImage.body_part}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="font-medium text-right">
                              {medicalImage.body_part || "Кўрсатилмаган"}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between gap-1">
                          <span className="text-muted-foreground flex-shrink-0">
                            Файллар:
                          </span>
                          <span className="font-medium">
                            {medicalImage.image_paths?.length || 0} та
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {medicalImage.description && (
                      <div>
                        <h3 className="font-semibold mb-1.5 text-xs sm:text-sm flex items-center gap-1">
                          Тавсиф
                        </h3>
                        {medicalImage.description.length > 100 ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 cursor-help leading-relaxed">
                                {medicalImage.description}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p className="text-xs">
                                {medicalImage.description}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                            {medicalImage.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              </TooltipProvider>

              {/* Thumbnails Grid - 2x2 Grid with Scroll */}
              {medicalImage.image_paths &&
                medicalImage.image_paths.length > 1 && (
                  <div className="flex-shrink-0">
                    <ScrollArea className="h-[120px] sm:h-[160px] md:h-[170px] lg:h-[350px] p-2 rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10">
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-2 gap-4 p-2">
                        {medicalImage.image_paths.map((path, index) => {
                          const fileInfo = getFileTypeInfo(path);
                          const IconComponent = getFileIcon(fileInfo.type);
                          const isImageFile = fileInfo.type === "image";
                          
                          return (
                            <div
                              key={index}
                              onClick={() => {
                                setSelectedImageIndex(index);
                                handleResetView();
                              }}
                              className={`aspect-square bg-muted rounded-lg cursor-pointer border-2 transition-all duration-200 overflow-hidden relative group ${
                                selectedImageIndex === index
                                  ? "border-primary ring-2 ring-primary/50 scale-[1.02] shadow-lg shadow-primary/30"
                                  : "border-border/40 hover:border-primary/60 hover:scale-[1.02] hover:shadow-md"
                              }`}
                            >
                              {isImageFile ? (
                                <img
                                  src={getImageUrl(path)}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement!.innerHTML =
                                      '<div class="w-full h-full flex items-center justify-center bg-muted"><svg class="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-muted gap-1">
                                  <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                                  <span className="text-[8px] sm:text-[9px] font-semibold text-primary uppercase">
                                    {fileInfo.extension}
                                  </span>
                                </div>
                              )}
                              {selectedImageIndex === index && (
                                <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono">
                                {index + 1}
                              </div>
                              {selectedImageIndex === index && (
                                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[8px] px-1 py-0.5 rounded font-medium">
                                  ✓
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

ViewMedicalImage.displayName = 'ViewMedicalImage';
