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
  const [deleteImagingType, { isLoading }] = useDeleteImagingTypeMutation();
  const handleRequest = useHandleRequest();

  const handleDelete = async () => {
    if (!imagingType?._id) return;

    await handleRequest({
      request: async () =>
        await deleteImagingType({ id: imagingType._id }).unwrap(),
      onSuccess: () => {
        toast.success("Текшириш тури муваффақиятли ўчирилди");
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Ўчиришда хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Текшириш турини ўчириш</DialogTitle>
        <DialogDescription>
          Ростан ҳам <strong>{imagingType?.name}</strong> текшириш турини
          ўчирмоқчимисиз? Бу амални бекор қилиб бўлмайди.
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Бекор қилиш
          </Button>
          <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? "Ўчирилмоқда..." : "Ҳа, ўчирилсин"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
