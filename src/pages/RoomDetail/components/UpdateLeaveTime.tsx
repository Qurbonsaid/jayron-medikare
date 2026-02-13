import { useUpdateLeaveTimeMutation } from "@/app/api/roomApi";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { Save } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface UpdateLeaveTimeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient_id: string | null;
}

export const UpdateLeaveTime = ({
  open,
  onOpenChange,
  patient_id,
}: UpdateLeaveTimeProps) => {
  const { t } = useTranslation("inpatient");
  const [estimatedLeaveTime, setEstimatedLeaveTime] = useState<string>("");
  const handleRequest = useHandleRequest();
  const { id: roomId } = useParams();
  const [updateLeaveTime, { isLoading: isUpdateLeaveTimeLoading }] =
    useUpdateLeaveTimeMutation();

  const onSubmit = async () => {
    await handleRequest({
      request: async () =>
        await updateLeaveTime({
          id: roomId,
          patient_id: patient_id,
          estimated_leave_time: estimatedLeaveTime,
        }).unwrap(),
      onSuccess: () => {
        toast.success(t("leaveTimeUpdatedSuccess"));
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || t("updateError"));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            {t("updateLeaveTime")}
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="mt-4 w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
            placeholder="Estimated Leave Time"
            value={estimatedLeaveTime}
            onChange={(e) => setEstimatedLeaveTime(e.target.value)}
          />
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isUpdateLeaveTimeLoading}
            onClick={onSubmit}
            className="gradient-primary w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdateLeaveTimeLoading ? t("loading") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
