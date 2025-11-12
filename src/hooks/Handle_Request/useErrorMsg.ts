type ApiErrorResponse = {
  data?: {
    error?: {
      statusCode?: number
      statusMsg?: string
      msg?: string
    }
    msg?: string
  }
  error?: {
    statusCode?: number
    statusMsg?: string
    msg?: string
  }
  statusCode?: number
  statusMsg?: string
  message?: string
}

export const useErrorMsg = () => (error: ApiErrorResponse | string | null | undefined) => {
  if (!error) return 'Номаълум хатолик юз берди';


  if (typeof error === 'string') return error;

  // RTK Query yoki API structure bilan moslash
  if (error.data?.error?.msg) return error.data.error.msg;
  if (error.data?.msg) return error.data.msg;
  if (error.error?.msg) return error.error.msg;

  if (error.statusMsg) return error.statusMsg;
  if (error.message) return error.message;

  if (error.statusCode) {
    return `Хатолик (${error.statusCode}): ${error.statusMsg || 'Номаълум хатолик'}`;
  }

  return 'Номаълум хатолик юз берди';
}

