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

      // Check if the response indicates an error
      // Handle RTK Query error format
      if (result?.error) {
        const error = result.error?.data || result.error;

        if (onError) {
          onError(error);
        } else {
          handleError(error);
        }
        return;
      }

      // Check if response has success: false (API error response)
      if (result?.data?.success === false || result?.success === false) {
        const error =
          result?.data?.error || result?.error || result?.data || result;

        if (onError) {
          onError(error);
        } else {
          handleError(error);
        }
        return;
      }

      // Check for nested errors in various formats
      const errors =
        result?.data?.errors ||
        result?.data?.error ||
        result?.errors?.data?.errors ||
        result?.errors?.data ||
        result?.errors;

      if (errors) {
        if (onError) {
          onError(errors);
        } else {
          handleError(errors);
        }
        return;
      }

      // Success case
      if (onSuccess) {
        await onSuccess(result?.data || result);
      }
    } catch (ex) {
      if (onError) {
        onError(ex);
      } else {
        handleError(ex);
      }
      console.error('❌ Request error:', ex);
    }
  };
};
