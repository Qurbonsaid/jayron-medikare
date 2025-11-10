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
  const [deleteCorpuses, { isLoading: isDeletedLoading }] =
    useDeleteCorpusMutation();
  const handleRequest = useHandleRequest();

  const handleDeleteCorpus = async () => {
    await handleRequest({
      request: async () =>
        await deleteCorpuses({ id: oneCorpus?._id }).unwrap(),
      onSuccess: () => {
        toast.success("Korpus муваффақиятли Ochirildi");
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Ochirishda хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Korpusni o'chirish</DialogTitle>
        <DialogDescription>
          Rostan ham{" "}
          <span className="font-semibold">{oneCorpus.corpus_number}</span> -
          Korpusni o'chirmoqchimisiz?
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            disabled={isDeletedLoading}
            onClick={handleDeleteCorpus}
          >
            {isDeletedLoading ? "O'chirilmoqda..." : "Ha, oʻchirilsin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
