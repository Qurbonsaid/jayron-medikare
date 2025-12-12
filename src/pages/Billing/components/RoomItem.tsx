import { Room } from '@/app/api/examinationApi/types';
import { formatCurrency } from './BillingBadge';

interface Props {
  room: Room;
  isMobile?: boolean;
}

export const RoomItem = ({ isMobile, room }: Props) => {
  console.log(room);

  const days = Math.ceil(
    (new Date(room?.end_date || room?.estimated_leave_time).getTime() -
      new Date(room?.start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalPrice = days ? room?.room_price * days : room?.room_price;

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
                <span className='text-muted-foreground'>Кириш:</span>
                <div className='font-medium'>
                  {new Date(room?.start_date).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
            {room?.end_date ? (
              <div>
                <span className='text-muted-foreground'>Чиқиш:</span>
                <div className='font-medium'>
                  {new Date(room.end_date).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            ) : (
              <div>
                <span className='text-muted-foreground'>Чиқиш:</span>
                <div className='font-medium'>
                  {new Date(room?.estimated_leave_time).toLocaleDateString(
                    'uz-UZ'
                  )}
                </div>
              </div>
            )}
          </div>
          {days && (
            <div className='text-xs'>
              <span className='text-muted-foreground'>Кунлар сони:</span>
              <span className='font-medium ml-1'>{days}</span>
            </div>
          )}
          <div className='pt-2 border-t flex justify-between items-center'>
            <span className='text-xs text-muted-foreground'>Нархи:</span>
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
        <td className='py-3 px-4 text-sm text-muted-foreground text-center'>
          <span className=' bg-orange-500 p-2 rounded-lg text-white'>{new Date(room?.estimated_leave_time).toLocaleDateString('uz-UZ')}</span>
        </td>
      ) : (
        <td className='py-3 px-4 text-sm text-muted-foreground text-center'>
          -
        </td>
      )}

      <td className='py-3 px-4 text-sm text-center'>{days > 0 || '-'}</td>
      <td className='py-3 px-4 text-sm text-right font-semibold'>
        {formatCurrency(totalPrice)}
      </td>
    </tr>
  );
};
