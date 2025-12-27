import {
  useDeleteRoomMutation,
  useRemovePatientRoomMutation,
} from "@/app/api/roomApi";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface RemovePatientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient_id: string;
}

export const RemovePatient = ({
  open,
  onOpenChange,
  patient_id,
}: RemovePatientProps) => {
  const { t } = useTranslation("inpatient");
  const [removePatient, { isLoading }] = useRemovePatientRoomMutation();
  const handleRequest = useHandleRequest();
  const { id: roomId } = useParams();

  const handleDeleteRoom = async () => {
    await handleRequest({
      request: async () =>
        await removePatient({ id: roomId, patient_id }).unwrap(),
      onSuccess: () => {
        toast.success(t("patientRemovedSuccess"));
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || t("deleteError"));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{t("removePatientTitle")}</DialogTitle>
        <DialogDescription>
          {t("removePatientConfirmation")}
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDeleteRoom}
          >
            {isLoading ? t("deleting") : t("yesDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
