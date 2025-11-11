import { useDeleteCorpusMutation } from "@/app/api/corpusApi";
import { Corpuses } from "@/app/api/corpusApi/types";
import { useDeleteRoomMutation } from "@/app/api/roomApi";
import { Room } from "@/app/api/roomApi/types";
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

interface DeleteWarnRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
}

export const DeleteWarnRoom = ({
  open,
  onOpenChange,
  room,
}: DeleteWarnRoomProps) => {
  const [deleteRoom, { isLoading: isDeletedLoading }] = useDeleteRoomMutation();
  const handleRequest = useHandleRequest();

  const handleDeleteRoom = async () => {
    await handleRequest({
      request: async () => await deleteRoom({ id: room._id }).unwrap(),
      onSuccess: () => {
        toast.success("Xona муваффақиятли Ochirildi");
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
        <DialogTitle>Xonani o'chirish</DialogTitle>
        <DialogDescription>
          Rostan ham <span className="font-semibold">{room.room_name}</span> -
          Xonani o'chirmoqchimisiz?
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            variant="destructive"
            disabled={isDeletedLoading}
            onClick={handleDeleteRoom}
          >
            {isDeletedLoading ? "O'chirilmoqda..." : "Ha, oʻchirilsin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
