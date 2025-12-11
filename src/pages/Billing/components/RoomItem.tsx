import { Room } from '@/app/api/examinationApi/types';

interface Props {
  room: Room;
  isMobile?: boolean;
}

const day = {
  room_id: '69312ca1be2460b39b6b49d5',
  start_date: '2025-12-10T13:42:57.948Z',
  room_price: 170000,
  room_name: '101-хона',
  floor_number: 1,
  _id: '693978e16c80b185dc028168',
  end_date: '2025-12-10T13:43:23.153Z',
};

export const RoomItem = ({
  isMobile,
  room: { room_name, status, start_date, end_date, room_price },
}: Props) => {
  // const { data, isLoading } = useGetOneRoomQuery({ id: roomId });

  // if (isLoading) {
  //   return (
  //     <div className='py-3 px-4 text-center'>
  //       <LoadingSpinner className='w-4 h-4 mx-auto' />
  //     </div>
  //   );
  // }

  // if (!data?.data) {
  //   return null;
  // }

  // const room = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  const days = Math.ceil(
    (new Date(end_date).getTime() - new Date(start_date).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const totalPrice = days ? room_price * days : room_price;

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span className='font-semibold text-sm'>{room_name}</span>
            <span className='text-xs px-2 py-1 rounded-md bg-muted'>
              {status || 'active'}
            </span>
          </div>
          <div className='grid grid-cols-2 gap-2 text-xs'>
            {start_date && (
              <div>
                <span className='text-muted-foreground'>Кириш:</span>
                <div className='font-medium'>
                  {new Date(start_date).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            )}
            {end_date && (
              <div>
                <span className='text-muted-foreground'>Чиқиш:</span>
                <div className='font-medium'>
                  {new Date(end_date).toLocaleDateString('uz-UZ')}
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
      <td className='py-3 px-4 text-sm'>{room_name}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted'>
          {status}
        </span>
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground'>
        {start_date ? new Date(start_date).toLocaleDateString('uz-UZ') : '-'}
      </td>
      <td className='py-3 px-4 text-sm text-muted-foreground'>
        {end_date ? new Date(end_date).toLocaleDateString('uz-UZ') : '-'}
      </td>
      <td className='py-3 px-4 text-sm text-center'>{days || '-'}</td>
      <td className='py-3 px-4 text-sm text-right font-semibold'>
        {formatCurrency(totalPrice)}
      </td>
    </tr>
  );
};
