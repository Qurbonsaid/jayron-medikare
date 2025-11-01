import { useHandleError } from './useHandleError';

export type Params = {
  request: () => Promise<any>;
  onSuccess?: (data?: any) => Promise<void> | void;
  onError?: (error?: any) => Promise<void> | void;
  onFinally?: () => Promise<void> | void;
};

export const useHandleRequest = () => {
  const handleError = useHandleError();

  return async ({ request, onSuccess, onError, onFinally }: Params) => {
    try {
      const result = await request();
      const errors =
        result?.error?.data?.errors ||
        result?.error?.data ||
        result?.error ||
        result?.errors?.data?.errors ||
        result?.errors?.data ||
        result?.errors;

      if (errors) {
        if (onError) {
          await onError(errors);
        } else {
          handleError(errors);
        }
        return;
      }

      if (onSuccess) {
        await onSuccess(result);
      }
    } catch (ex: any) {
      if (onError) {
        await onError(ex);
      } else {
        handleError(ex);
      }
    } finally {
      if (onFinally) {
        try {
          await onFinally();
        } catch (finallyError) {
          console.error('Error in onFinally callback:', finallyError);
        }
      }
    }
  };
};
