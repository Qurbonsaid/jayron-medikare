import { useGetOneRoomQuery } from '@/app/api/roomApi/roomApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Props {
  roomId: string;
  checkInDate?: string;
  checkOutDate?: string;
  days?: number;
  isMobile?: boolean;
}

export const RoomItem = ({
  roomId,
  checkInDate,
  checkOutDate,
  days,
  isMobile = false,
}: Props) => {
  const { data, isLoading } = useGetOneRoomQuery({ id: roomId });

  if (isLoading) {
    return (
      <div className='py-3 px-4 text-center'>
        <LoadingSpinner className='w-4 h-4 mx-auto' />
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const room = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  const totalPrice = days ? room.room_price * days : room.room_price;

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='font-semibold text-sm'>{room.room_name}</span>
            <span className='text-xs px-2 py-1 rounded-md bg-muted'>
              {room.status}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            {checkInDate && (
              <div>
                <span className='text-muted-foreground'>Кириш:</span>
                <div className='font-medium'>
                  {new Date(checkInDate).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
            {checkOutDate && (
              <div>
                <span className='text-muted-foreground'>Чиқиш:</span>
                <div className='font-medium'>
                  {new Date(checkOutDate).toLocaleDateString('uz-UZ')}
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
      <td className='py-3 px-4 text-sm'>{room.room_name}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted'>
          {room.status}
        </span>
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground'>
        {checkInDate ? new Date(checkInDate).toLocaleDateString('uz-UZ') : '-'}
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground'>
        {checkOutDate
          ? new Date(checkOutDate).toLocaleDateString('uz-UZ')
          : '-'}
      </td>
      <td className='py-3 px-4 text-sm text-center'>{days || '-'}</td>
      <td className='py-3 px-4 text-sm text-right font-semibold'>
        {formatCurrency(totalPrice)}
      </td>
    </tr>
  );
};
