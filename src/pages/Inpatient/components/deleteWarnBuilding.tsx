import { useDeleteCorpusMutation } from "@/app/api/corpusApi";
import { Corpuses } from "@/app/api/corpusApi/types";
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

interface DeleteWarnBuildingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oneCorpus: Corpuses;
}

export const DeleteWarnBuilding = ({
  open,
  onOpenChange,
  oneCorpus,
}: DeleteWarnBuildingProps) => {
  const { t } = useTranslation("inpatient");
  const [deleteCorpuses, { isLoading: isDeletedLoading }] =
    useDeleteCorpusMutation();
  const handleRequest = useHandleRequest();

  const handleDeleteCorpus = async () => {
    await handleRequest({
      request: async () =>
        await deleteCorpuses({ id: oneCorpus?._id }).unwrap(),
      onSuccess: () => {
        toast.success(t("buildingDeletedSuccess"));
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
        <DialogTitle>{t("deleteBuilding")}</DialogTitle>
        <DialogDescription>
          {t("deleteConfirmation")}{" "}
          <span className="font-semibold">{oneCorpus.corpus_number}</span> -
          {t("buildingQuestion")}
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={isDeletedLoading}
            onClick={handleDeleteCorpus}
          >
            {isDeletedLoading ? t("deleting") : t("yesDelete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
