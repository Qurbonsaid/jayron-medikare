import { useTranslation } from 'react-i18next';

export const useBillingStatusBadge = () => {
  const { t } = useTranslation('billing');

  const getBillingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; class: string }> = {
      paid: {
        text: t('paid'),
        class: 'bg-green-100 text-green-700 border text-center border-green-300',
      },
      unpaid: {
        text: t('unpaid'),
        class: 'bg-red-100 text-red-700 border text-center border-red-300',
      },
      partially_paid: {
        text: t('partiallyPaid'),
        class:
          'bg-yellow-100 text-yellow-700 border text-center border-yellow-300',
      },
      completed: {
        text: t('paid'),
        class: 'bg-green-100 text-green-700 border text-center border-green-300',
      },
      incompleted: {
        text: t('unpaid'),
        class: 'bg-red-100 text-red-700 border text-center border-red-300',
      },
      pending: {
        text: t('partiallyPaid'),
        class:
          'bg-yellow-100 text-yellow-700 border text-center border-yellow-300',
      },
    };

    const config = statusConfig[status] || {
      text: status,
      class: 'bg-gray-100 text-gray-700 border text-center border-gray-300',
    };

    return (
      <p
        className={`inline-flex justify-center items-center px-2.5 py-1 rounded-full text-xs font-semibold text-center mx-auto ${config.class}`}
      >
        {config.text}
      </p>
    );
  };

  return { getBillingStatusBadge };
};

// Keep the old function for backward compatibility (without translations)
export const getBillingStatusBadge = (status:string) => {

  const statusConfig: Record<string, { text: string; class: string }> = {
    paid: {
      text: 'Тўланган',
      class: 'bg-green-100 text-green-700 border text-center border-green-300',
    },
    unpaid: {
      text: 'Тўланмаган',
      class: 'bg-red-100 text-red-700 border text-center border-red-300',
    },
    partially_paid: {
      text: 'Қисман тўланған',
      class:
        'bg-yellow-100 text-yellow-700 border text-center border-yellow-300',
    },
    completed: {
      text: 'Тўланған',
      class: 'bg-green-100 text-green-700 border text-center border-green-300',
    },
    incompleted: {
      text: 'Тўланмаган',
      class: 'bg-red-100 text-red-700 border text-center border-red-300',
    },
    pending: {
      text: 'Қисман тўланған',
      class:
        'bg-yellow-100 text-yellow-700 border text-center border-yellow-300',
    },
  };

  const config = statusConfig[status] || {
    text: status,
    class: 'bg-gray-100 text-gray-700 border text-center border-gray-300',
  };

  return (
    <p
      className={`inline-flex justify-center items-center px-2.5 py-1 rounded-full text-xs font-semibold text-center mx-auto ${config.class}`}
    >
      {config.text}
    </p>
  );
};

export const useFormatCurrency = () => {
  const { t } = useTranslation('billing');
  
  const formatCurrencyWithTranslation = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' ' + t('currency');
  };

  return { formatCurrency: formatCurrencyWithTranslation };
};

export const formatCurrency = (amount: number) => (new Intl.NumberFormat('uz-UZ').format(amount) + ' сўм');
