interface ServiceData {
  service_type_id:
    | {
        _id: string;
        name: string;
        description?: string;
        price?: number;
        code?: string;
      }
    | string;
  days?: Array<{
    day: number;
    is_completed: boolean;
    date: string | null;
    _id: string;
  }>;
  quantity?: number;
  price?: number;
  total_price?: number;
  notes?: string;
  _id?: string;
}

interface Props {
  service: ServiceData;
  isMobile?: boolean;
}

export const ServiceItem = ({ service, isMobile = false }: Props) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм';
  };

  // Get service type data
  const serviceType =
    typeof service.service_type_id === 'object'
      ? service.service_type_id
      : null;

  if (!serviceType) {
    return null;
  }

  // Quantity can come from either `quantity` or `days.length`
  const quantity = service.quantity ?? service.days?.length ?? 1;

  // Unit price can come from `service_type_id.price` or the service's own `price`
  const unitPrice = serviceType.price ?? service.price ?? 0;

  // Total can come from `total_price` or be derived
  const totalPrice = service.total_price ?? unitPrice * quantity;
  const code = serviceType.code || serviceType.description || '-';

  if (isMobile) {
    return (
      <div className='p-4 border-b last:border-0'>
        <div className='space-y-2'>
          <div className='flex justify-between items-start'>
            <div>
              <div className='font-semibold text-sm'>{serviceType.name}</div>
              <div className='text-xs text-primary font-medium mt-1'>
                {code}
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
      <td className='py-3 px-4 text-sm'>{serviceType.name}</td>
      <td className='py-3 px-4 text-sm'>
        <span className='text-primary font-medium'>{code}</span>
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
