/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from "sonner";
import { useErrorMsg } from "./useErrorMsg";

export const useHandleError = () => {
  const getErrorMsg = useErrorMsg();

  return (error: {msg:string}) => {
    toast.error(getErrorMsg(error));
  };
};
