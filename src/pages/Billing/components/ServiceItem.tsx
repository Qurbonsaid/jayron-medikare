import { useGetOneServiceQuery } from '@/app/api/serviceApi/serviceApi';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Props {
  serviceId: string;
  quantity?: number;
  price?: number;
  isMobile?: boolean;
}

export const ServiceItem = ({
  serviceId,
  quantity = 1,
  price,
  isMobile = false,
}: Props) => {
  const { data, isLoading } = useGetOneServiceQuery(serviceId);

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

  const service = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  // Use examination price if provided, otherwise use service default price
  const unitPrice = price !== undefined ? price : service.price;
  const totalPrice = unitPrice * quantity;

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='font-semibold text-sm'>{service.name}</div>
              <div className='text-xs text-primary font-medium mt-1'>
                {service.code}
              </div>
            </div>
            <span className='text-xs px-2 py-1 rounded-md bg-muted'>
              x{quantity}
            </span>
          </div>
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
      <td className='py-3 px-4 text-sm'>{service.name}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='text-primary font-medium'>{service.code}</span>
      </td>
      <td className='py-3 px-4 text-sm text-center'>{quantity}</td>
      <td className='py-3 px-4 text-sm text-right'>
        {formatCurrency(unitPrice)}
      </td>
      <td className='py-3 px-4 text-sm text-right font-semibold'>
        {formatCurrency(totalPrice)}
      </td>
    </tr>
  );
};
