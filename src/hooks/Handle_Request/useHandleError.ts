 
import { toast } from "sonner";
import { useErrorMsg } from "./useErrorMsg";

export const useHandleError = () => {
  const getErrorMsg = useErrorMsg();

  return (error: unknown) => {
    toast.error(getErrorMsg(error));
  };
};