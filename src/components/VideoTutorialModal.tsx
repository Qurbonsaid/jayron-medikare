import { useLazyGetAboutVideoByTypeQuery } from '@/app/api/aboutVideoApi';
import { roleToVideoType, VideoType } from '@/app/api/aboutVideoApi/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMeQuery } from '@/app/api/authApi/authApi';
import { RoleConstants } from '@/constants/Roles';
import { cn } from '@/lib/utils';
import { Loader2, PlayCircle, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SERVER_URL } from '@/constants/ServerUrl';

interface VideoTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoTutorialModal({ open, onOpenChange }: VideoTutorialModalProps) {
  const { t } = useTranslation('sidebar');
  const { data: userData, isLoading: userLoading } = useMeQuery();
  const [fetchVideo, { data: videoData, isLoading: videoLoading, error }] = useLazyGetAboutVideoByTypeQuery();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Get user role and convert to VideoType
  const userRole = userData?.data?.role as RoleConstants | undefined;
  const videoType: VideoType | undefined = userRole ? roleToVideoType[userRole] : undefined;

  // Fetch video when modal opens
  useEffect(() => {
    if (open && videoType) {
      setVideoError(false);
      fetchVideo(videoType);
    }
  }, [open, videoType, fetchVideo]);

  // Reset video when modal closes
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  // Get full video URL
  const getVideoUrl = () => {
    if (!videoData?.data?.video_url) return '';
    const url = videoData.data.video_url;
    // If URL is relative, prepend SERVER_URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${SERVER_URL}${url.startsWith('/') ? url.slice(1) : url}`;
  };

  const isLoading = userLoading || videoLoading;
  const hasVideo = !!(videoData?.data?.video_url) && !videoError;
  const hasError = !!(error) || videoError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          'w-[95vw] max-w-2xl p-0 overflow-hidden',
          'sm:rounded-xl'
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className='p-2 pb-0'>
          <DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
            <PlayCircle className='h-5 w-5 text-primary' />
            {t('videoTutorial.title', 'Video qo\'llanma')}
          </DialogTitle>
        </DialogHeader>

        <div className='relative w-full bg-black aspect-video'>
          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center bg-muted/50'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
          )}

          {hasError && !isLoading && (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <AlertCircle className='h-12 w-12' />
              <p className='text-sm text-center px-4'>
                {t('videoTutorial.notFound', 'Video topilmadi')}
              </p>
            </div>
          )}

          {hasVideo && !isLoading && (
            <video
              ref={videoRef}
              className='w-full h-full'
              src={getVideoUrl()}
              controls
              controlsList='nodownload'
              playsInline
              crossOrigin='anonymous'
              onError={handleVideoError}
            >
              {t('videoTutorial.browserNotSupported', 'Brauzeringiz video playerni qo\'llab-quvvatlamaydi.')}
            </video>
          )}

          {!hasVideo && !hasError && !isLoading && (
            <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
              <PlayCircle className='h-12 w-12' />
              <p className='text-sm text-center px-4'>
                {t('videoTutorial.noVideo', 'Bu rol uchun video mavjud emas')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default VideoTutorialModal;
