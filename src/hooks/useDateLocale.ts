import { uz } from 'date-fns/locale';

/**
 * Hook to get the date-fns locale
 * Always returns Uzbek locale to avoid time/date confusion across different UI languages
 */
export const useDateLocale = () => {
  return uz;
};

export default useDateLocale;
