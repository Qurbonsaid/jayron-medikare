import { useDeleteImagingTypeMutation } from "@/app/api/radiologyApi";
import { ImagingType } from "@/app/api/radiologyApi/types";
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

interface DeleteWarnImagingTypeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imagingType: ImagingType | null;
}

export const DeleteWarnImagingType = ({
  open,
  onOpenChange,
  imagingType,
}: DeleteWarnImagingTypeProps) => {
  const { t } = useTranslation("radiology");
  const [deleteImagingType, { isLoading }] = useDeleteImagingTypeMutation();
  const handleRequest = useHandleRequest();

  const handleDelete = async () => {
    if (!imagingType?._id) return;

    await handleRequest({
      request: async () =>
        await deleteImagingType({ id: imagingType._id }).unwrap(),
      onSuccess: () => {
        toast.success(t("imagingTypeDeletedSuccess"));
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
        <DialogTitle>{t("deleteImagingType")}</DialogTitle>
        <DialogDescription>
          {t("deleteImagingTypeConfirm", { name: imagingType?.name })}
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? t("deleting") : t("yesDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
