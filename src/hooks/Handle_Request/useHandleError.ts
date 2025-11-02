import { toast } from "sonner";
import { useErrorMsg } from "./useErrorMsg";

export const useHandleError = () => {
  const getErrorMsg = useErrorMsg();

  return (error: Parameters<ReturnType<typeof useErrorMsg>>[0]) => {
    toast.error(getErrorMsg(error));
  };
};
