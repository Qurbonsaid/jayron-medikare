import { useHandleError } from './useHandleError';

export interface Params {
  request: () => Promise<any>;
  onSuccess?: (data: any) => void | Promise<void>;
  onError?: (error: any) => void;
}

export const useHandleRequest = () => {
  const handleError = useHandleError();

  return async ({ request, onSuccess, onError }: Params) => {
    try {
      const result = await request();
      if (onSuccess) {
        await onSuccess(result?.data || result);
      }
    } catch (err) {
      const errors =
        err?.data?.errors ||
        err?.data?.error ||
        err?.errors?.data?.errors ||
        err?.errors?.data ||
        err?.errors;
      if (onError) {
        onError(errors);
      } else {
        handleError(errors);
      }
    }
  };
};
