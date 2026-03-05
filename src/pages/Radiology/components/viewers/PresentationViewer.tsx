import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { downloadFile } from '@/lib/fileTypeUtils';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import JSZip from 'jszip';

// PPTX XML Namespace
const NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main';

// Slayd ma'lumotlari
interface SlideData {
  number: number;
  textBlocks: string[];
  images: string[]; // base64 data URL
}

// PPTX parse natijasi
interface PresentationData {
  slides: SlideData[];
  slideWidth: number;
  slideHeight: number;
}

// Rasm MIME turlari
const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  emf: 'image/x-emf',
  wmf: 'image/x-wmf',
};

/**
 * PPTX faylni parse qilib, slaydlar, rasmlar va matnlarni ajratib olish.
 * PPTX = ZIP fayl (ppt/slides/slideN.xml, ppt/media/*, ...)
 */
const parsePPTX = async (
  arrayBuffer: ArrayBuffer
): Promise<PresentationData> => {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const parser = new DOMParser();

  // Slayd o'lchamlarini olish (ppt/presentation.xml dan)
  let slideWidth = 16;
  let slideHeight = 9;
  const presentationFile = zip.file('ppt/presentation.xml');
  if (presentationFile) {
    const xml = await presentationFile.async('text');
    const doc = parser.parseFromString(xml, 'application/xml');
    const sldSzElements = doc.getElementsByTagName('p:sldSz');
    const sldSz = sldSzElements[0];
    if (sldSz) {
      const cx = parseInt(sldSz.getAttribute('cx') || '0', 10);
      const cy = parseInt(sldSz.getAttribute('cy') || '0', 10);
      if (cx && cy) {
        slideWidth = cx;
        slideHeight = cy;
      }
    }
  }

  // Har bir slaydni parse qilish
  const slides: SlideData[] = [];
  let slideNum = 1;

  while (true) {
    const slideFile = zip.file(`ppt/slides/slide${slideNum}.xml`);
    if (!slideFile) break;

    const slideXml = await slideFile.async('text');
    const doc = parser.parseFromString(slideXml, 'application/xml');

    // Matnlarni ajratib olish (a:p > a:t elementlar)
    const textBlocks: string[] = [];
    const paragraphs = doc.getElementsByTagNameNS(NS_A, 'p');
    for (let i = 0; i < paragraphs.length; i++) {
      const runs = paragraphs[i].getElementsByTagNameNS(NS_A, 't');
      let paragraphText = '';
      for (let j = 0; j < runs.length; j++) {
        paragraphText += runs[j].textContent || '';
      }
      if (paragraphText.trim()) {
        textBlocks.push(paragraphText.trim());
      }
    }

    // Rasmlarni relationships orqali ajratib olish
    const images: string[] = [];
    const relsFile = zip.file(
      `ppt/slides/_rels/slide${slideNum}.xml.rels`
    );
    if (relsFile) {
      const relsXml = await relsFile.async('text');
      const relsDoc = parser.parseFromString(relsXml, 'application/xml');
      const relationships = relsDoc.getElementsByTagName('Relationship');

      for (let i = 0; i < relationships.length; i++) {
        const rel = relationships[i];
        const type = rel.getAttribute('Type') || '';
        if (type.includes('/image')) {
          const target = rel.getAttribute('Target') || '';
          // target = ../media/image1.png -> ppt/media/image1.png
          const mediaPath = target.replace(/^\.\.\//, 'ppt/');
          const imageFile = zip.file(mediaPath);
          if (imageFile) {
            try {
              const base64 = await imageFile.async('base64');
              const ext =
                mediaPath.split('.').pop()?.toLowerCase() || 'png';
              const mime = MIME_TYPES[ext] || `image/${ext}`;
              images.push(`data:${mime};base64,${base64}`);
            } catch {
              // Rasmni o'qib bo'lmasa, o'tkazib yuborish
            }
          }
        }
      }
    }

    slides.push({ number: slideNum, textBlocks, images });
    slideNum++;
  }

  return { slides, slideWidth, slideHeight };
};

interface PresentationViewerProps {
  url: string;
  filename?: string;
  isFullscreen?: boolean;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = memo(
  ({ url, filename, isFullscreen }) => {
    const { t } = useTranslation('radiology');
    const [slides, setSlides] = useState<SlideData[]>([]);
    const [aspectRatio, setAspectRatio] = useState('16/9');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [scale, setScale] = useState(100);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const thumbnailsRef = useRef<HTMLDivElement>(null);

    // Drag-to-scroll
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({
      x: 0,
      y: 0,
      scrollLeft: 0,
      scrollTop: 0,
    });

    // Ctrl+Scroll zoom
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const onWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? -10 : 10;
          setScale((prev) => Math.max(50, Math.min(300, prev + delta)));
        }
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    // Drag handlers (boshqa viewerlar bilan bir xil pattern)
    const handleDragStart = useCallback((e: React.MouseEvent) => {
      const el = scrollRef.current;
      if (!el) return;
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop,
      };
    }, []);

    const handleDragMove = useCallback(
      (e: React.MouseEvent) => {
        if (!isDragging) return;
        const el = scrollRef.current;
        if (!el) return;
        e.preventDefault();
        el.scrollLeft =
          dragStartRef.current.scrollLeft -
          (e.clientX - dragStartRef.current.x);
        el.scrollTop =
          dragStartRef.current.scrollTop -
          (e.clientY - dragStartRef.current.y);
      },
      [isDragging]
    );

    const handleDragEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    // PPTX faylni yuklash va parse qilish
    useEffect(() => {
      const loadPresentation = async () => {
        try {
          setLoading(true);
          setError('');

          const response = await fetch(url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const arrayBuffer = await response.arrayBuffer();

          const data = await parsePPTX(arrayBuffer);
          setSlides(data.slides);
          setCurrentSlide(0);

          // Aspect ratio hisoblash
          if (data.slideWidth && data.slideHeight) {
            const ratio = data.slideWidth / data.slideHeight;
            if (Math.abs(ratio - 16 / 9) < 0.1) {
              setAspectRatio('16/9');
            } else if (Math.abs(ratio - 4 / 3) < 0.1) {
              setAspectRatio('4/3');
            } else {
              setAspectRatio(`${data.slideWidth}/${data.slideHeight}`);
            }
          }
        } catch (err) {
          console.error('PPTX yuklashda xatolik:', err);
          setError(t('viewers.presentation.loadError'));
        } finally {
          setLoading(false);
        }
      };

      loadPresentation();
    }, [url, t]);

    const handleDownload = useCallback(() => {
      downloadFile(url, filename);
    }, [url, filename]);

    const goToPrevSlide = useCallback(() => {
      setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToNextSlide = useCallback(() => {
      setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
    }, [slides.length]);

    const zoomIn = useCallback(() => {
      setScale((prev) => Math.min(prev + 10, 300));
    }, []);

    const zoomOut = useCallback(() => {
      setScale((prev) => Math.max(prev - 10, 50));
    }, []);

    const resetZoom = useCallback(() => {
      setScale(100);
    }, []);

    // Slayd o'zgarganda thumbnail scroll qilish
    useEffect(() => {
      if (!thumbnailsRef.current) return;
      const activeThumb = thumbnailsRef.current.querySelector(
        `[data-slide="${currentSlide}"]`
      );
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, [currentSlide]);

    // Loading
    if (loading) {
      return (
        <div className='flex items-center justify-center h-[60vh]'>
          <div className='text-center space-y-2'>
            <Loader2 className='w-8 h-8 animate-spin mx-auto text-primary' />
            <p className='text-sm text-muted-foreground'>
              {t('viewers.presentation.loading')}
            </p>
          </div>
        </div>
      );
    }

    // Xatolik
    if (error) {
      return (
        <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
          <p className='text-destructive'>{error}</p>
          <Button onClick={handleDownload} variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            {t('viewers.presentation.download')}
          </Button>
        </div>
      );
    }

    // Slaydlar topilmadi
    if (slides.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
          <p className='text-muted-foreground'>
            {t('viewers.presentation.noSlides')}
          </p>
          <Button onClick={handleDownload} variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            {t('viewers.presentation.download')}
          </Button>
        </div>
      );
    }

    const currentSlideData = slides[currentSlide];
    const hasImages = currentSlideData.images.length > 0;
    const hasText = currentSlideData.textBlocks.length > 0;

    return (
      <div ref={containerRef} className='w-full h-full flex flex-col gap-2'>
        {/* Controls */}
        <div className='flex flex-wrap justify-between items-center gap-2 bg-muted/50 p-2 rounded-lg flex-shrink-0'>
          {/* Slayd navigatsiyasi */}
          <div className='flex items-center gap-1'>
            <Button
              onClick={goToPrevSlide}
              disabled={currentSlide <= 0}
              size='sm'
              variant='outline'
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <span className='text-sm px-2 min-w-[80px] text-center'>
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              onClick={goToNextSlide}
              disabled={currentSlide >= slides.length - 1}
              size='sm'
              variant='outline'
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>

          {/* Zoom */}
          <div className='flex items-center gap-1'>
            <Button
              onClick={zoomOut}
              disabled={scale <= 50}
              size='sm'
              variant='outline'
            >
              <ZoomOut className='w-4 h-4' />
            </Button>
            <span className='text-sm px-2 min-w-[50px] text-center'>
              {scale}%
            </span>
            <Button
              onClick={zoomIn}
              disabled={scale >= 300}
              size='sm'
              variant='outline'
            >
              <ZoomIn className='w-4 h-4' />
            </Button>
            <Button
              onClick={resetZoom}
              size='sm'
              variant='outline'
              title={t('viewer.resetZoom')}
            >
              <RotateCcw className='w-4 h-4' />
            </Button>
          </div>

          {/* Download */}
          <Button onClick={handleDownload} size='sm' variant='outline'>
            <Download className='w-4 h-4 mr-2' />
            <span className='hidden sm:inline'>{t('viewer.download')}</span>
          </Button>
        </div>

        {/* Slayd kontenti */}
        <Card className='flex-1 overflow-hidden'>
          <CardContent
            ref={scrollRef}
            className={`p-0 ${
              isFullscreen
                ? 'h-[calc(100vh-180px)]'
                : 'h-[45vh] sm:h-[50vh] xl:h-[55vh]'
            } overflow-auto select-none`}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className='origin-top-left p-4'
              style={{
                transform: `scale(${scale / 100})`,
                transformOrigin: 'top left',
                minWidth: scale > 100 ? `${scale}%` : '100%',
                minHeight: scale > 100 ? `${scale}%` : 'auto',
              }}
            >
              {/* Slayd */}
              <div
                className='bg-white rounded-lg shadow-lg border mx-auto overflow-hidden relative'
                style={{
                  aspectRatio,
                  maxWidth: '100%',
                }}
              >
                {/* Rasmlar */}
                {hasImages && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${
                      currentSlideData.images.length === 1
                        ? 'p-0'
                        : 'p-4 gap-2'
                    }`}
                  >
                    {currentSlideData.images.length === 1 ? (
                      <img
                        src={currentSlideData.images[0]}
                        alt={`Slide ${currentSlide + 1}`}
                        className='w-full h-full object-contain'
                        draggable={false}
                      />
                    ) : (
                      <div className='grid grid-cols-2 gap-2 w-full h-full p-4'>
                        {currentSlideData.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Slide ${currentSlide + 1} image ${i + 1}`}
                            className='w-full h-full object-contain'
                            draggable={false}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Matn */}
                {hasText && (
                  <div
                    className={`${
                      hasImages
                        ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-8'
                        : 'absolute inset-0 flex flex-col items-center justify-center p-8'
                    }`}
                  >
                    {currentSlideData.textBlocks.map((text, i) => (
                      <p
                        key={i}
                        className={`${
                          hasImages
                            ? 'text-white text-sm sm:text-base'
                            : i === 0
                              ? 'text-gray-800 text-xl sm:text-2xl font-bold mb-3'
                              : 'text-gray-600 text-base sm:text-lg'
                        } text-center mb-1`}
                      >
                        {text}
                      </p>
                    ))}
                  </div>
                )}

                {/* Bo'sh slayd */}
                {!hasImages && !hasText && (
                  <div className='absolute inset-0 flex items-center justify-center text-muted-foreground'>
                    <p className='text-sm'>
                      {t('viewers.presentation.emptySlide')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Slayd thumbnaillar (pastda) */}
        {slides.length > 1 && (
          <div
            ref={thumbnailsRef}
            className='flex gap-1.5 overflow-x-auto pb-1 flex-shrink-0'
          >
            {slides.map((slide, index) => (
              <button
                key={index}
                data-slide={index}
                onClick={() => setCurrentSlide(index)}
                className={`flex-shrink-0 w-16 h-10 sm:w-20 sm:h-12 rounded border-2 overflow-hidden transition-all ${
                  currentSlide === index
                    ? 'border-primary ring-1 ring-primary/50 shadow-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className='w-full h-full bg-white flex items-center justify-center text-[8px] text-muted-foreground p-0.5 relative'>
                  {slide.images.length > 0 ? (
                    <img
                      src={slide.images[0]}
                      alt={`Slide ${index + 1}`}
                      className='w-full h-full object-contain'
                      draggable={false}
                    />
                  ) : slide.textBlocks.length > 0 ? (
                    <span className='line-clamp-2 text-center leading-tight'>
                      {slide.textBlocks[0]}
                    </span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                  <span className='absolute bottom-0 right-0 bg-black/60 text-white text-[7px] px-1 rounded-tl'>
                    {index + 1}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PresentationViewer.displayName = 'PresentationViewer';
