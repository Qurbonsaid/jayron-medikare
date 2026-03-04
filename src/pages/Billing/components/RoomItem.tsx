import { Room } from '@/app/api/examinationApi/types';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from './BillingBadge';

interface Props {
  room: Room;
  isMobile?: boolean;
}

export const RoomItem = ({ isMobile, room }: Props) => {
  const { t } = useTranslation('billing');

  const getEndDate = () => {
    if (room?.end_date) {
      const endDate = new Date(room.end_date);
      const startDate = new Date(room.start_date);

      
      if (endDate > startDate) {
        return endDate;
      }
    }
    
    return room?.estimated_leave_time 
    ? new Date(room.estimated_leave_time) 
      : new Date();
  };
  
  const endDate = getEndDate();
  const startDate = new Date(room?.start_date);
  
  // Check if using estimated_leave_time (not completed)
  const isOngoing = !room?.end_date || new Date(room.end_date) <= startDate;

  const startDay = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const endDay = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  const diffDays = Math.floor(
    (endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  const days = diffDays <= 0 ? 0 : diffDays + 1;

  const totalPrice = days > 0 ? room?.room_price * days : 0;

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='font-semibold text-sm'>
              {room?.room_name || ''}
            </span>
            <span className='text-xs px-2 py-1 rounded-md bg-muted'>
              {room?.status || 'active'}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            {room?.start_date && (
              <div>
                <span className='text-muted-foreground'>{t('entryDate')}:</span>
                <div className='font-medium'>
                  {startDate.toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
            {isOngoing ? (
              <div>
                <span className='text-muted-foreground'>{t('exitDate')}:</span>
                <div className='font-medium text-yellow-600'>
                  {t('ongoing')} ({endDate.toLocaleDateString('uz-UZ')})
                </div>
              </div>
            ) : (
              <div>
                <span className='text-muted-foreground'>{t('exitDate')}:</span>
                <div className='font-medium'>
                  {endDate.toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
          </div>
          {days && (
            <div className='text-xs'>
              <span className='text-muted-foreground'>{t('daysCount')}:</span>
              <span className='font-medium ml-1'>{days}</span>
            </div>
          )}
          <div className='pt-2 border-t flex justify-between items-center'>
            <span className='text-xs text-muted-foreground'>{t('price')}:</span>
            <span className='font-semibold text-sm'>
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className='border-b last:border-0'>
      <td className='py-3 px-4 text-sm'>{room?.room_name}</td>
      <td className='py-3 px-4 text-sm text-center'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted'>
          {room?.status || 'active'}
        </span>
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground text-center'>
        {room?.start_date
          ? new Date(room.start_date).toLocaleDateString('uz-UZ')
          : '-'}
      </td>
      {room?.end_date ? (
        <td className='py-3 px-4 text-sm text-muted-foreground text-center'>
          {new Date(room?.end_date).toLocaleDateString('uz-UZ')}
        </td>
      ) : room?.estimated_leave_time ? (
        <td className='py-3 px-4 text-sm text-center'>
          <span className='text-yellow-600'>
            {t('ongoing')} (
            {new Date(room?.estimated_leave_time).toLocaleDateString('uz-UZ')})
          </span>
        </td>
      ) : (
        <td className='py-3 px-4 text-sm text-center'>
          <span className='text-yellow-600'>{t('ongoing')}</span>
        </td>
      )}

      <td className='py-3 px-4 text-sm text-center'>{days || '-'}</td>
      <td className='py-3 px-4 text-sm text-right font-semibold'>
        {formatCurrency(totalPrice)}
      </td>
    </tr>
  );
};
