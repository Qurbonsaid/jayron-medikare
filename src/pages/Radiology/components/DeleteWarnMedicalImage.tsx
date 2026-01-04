import { useDeleteMedicalImageMutation } from "@/app/api/radiologyApi";
import { MedicalImage, PatientInfo } from "@/app/api/radiologyApi/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface DeleteWarnMedicalImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalImage: MedicalImage | null;
}

export const DeleteWarnMedicalImage = ({
  open,
  onOpenChange,
  medicalImage,
}: DeleteWarnMedicalImageProps) => {
  const { t } = useTranslation("radiology");
  const [deleteMedicalImage, { isLoading }] = useDeleteMedicalImageMutation();
  const handleRequest = useHandleRequest();

  const getPatientName = () => {
    if (!medicalImage) return t("unknown");
    if (typeof medicalImage.patient_id === "string") return t("unknown");
    return (medicalImage.patient_id as PatientInfo)?.fullname || t("unknown");
  };

  const handleDelete = async () => {
    if (!medicalImage?._id) return;

    await handleRequest({
      request: async () =>
        await deleteMedicalImage({ id: medicalImage._id }).unwrap(),
      onSuccess: () => {
        toast.success(t("imageDeletedSuccess"));
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
        <DialogTitle>{t("deleteMedicalImage")}</DialogTitle>
        <DialogDescription>
          {t("deleteMedicalImageConfirm", { patientName: getPatientName() })}
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? t("deleting") : t("yesDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
