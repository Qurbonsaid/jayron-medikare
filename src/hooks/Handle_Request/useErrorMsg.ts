/* eslint-disable @typescript-eslint/no-explicit-any */
export const useErrorMsg = () => (error: any) => {
  // If error is a string, return it directly
  if (typeof error === 'string') {
    return error;
  }

  // If error is an object, check various possible message locations
  if (typeof error === 'object' && error !== null) {
    // Check for your API's error format: {statusCode, statusMsg, msg}
    if (error.msg) {
      return error.msg;
    }

    // Check for statusMsg
    if (error.statusMsg) {
      return error.statusMsg;
    }

    // Check for message field (common format)
    if (error.message) {
      return error.message;
    }

    // Check nested error objects
    if (error.error?.msg) {
      return error.error.msg;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    // Check data.msg
    if (error.data?.msg) {
      return error.data.msg;
    }

    if (error.data?.message) {
      return error.data.message;
    }

    // Check for array of errors (validation errors)
    if (Array.isArray(error) && error.length > 0) {
      return error[0]?.msg || error[0]?.message || error[0];
    }

    // Check for password validation error
    if (error[0]?.password) {
      return error[0].password;
    }

    // If we have a status code, show a generic message with it
    if (error.statusCode) {
      return `Хатолик (${error.statusCode}): ${
        error.statusMsg || 'Номаълум хатолик'
      }`;
    }
  }

  return 'Номаълум хатолик юз берди';
};
