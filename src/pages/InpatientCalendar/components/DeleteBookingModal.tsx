import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteBookingMutation } from "@/app/api/bookingApi";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";
import { AlertTriangle, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Booking } from "@/app/api/bookingApi/types";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export const DeleteBookingModal = ({
  open,
  onOpenChange,
  booking,
}: DeleteBookingModalProps) => {
  const handleRequest = useHandleRequest();
  const [deleteBooking, { isLoading }] = useDeleteBookingMutation();

  const handleDelete = async () => {
    if (!booking) return;

    await handleRequest({
      request: async () =>
        await deleteBooking({
          id: booking._id,
        }).unwrap(),
      onSuccess: () => {
        toast.success("Бронь муваффақиятли ўчирилди");
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Бронь ўчиришда хатолик юз берди");
      },
    });
  };

  if (!booking) return null;

  const patient =
    typeof booking.patient_id === "object" ? booking.patient_id : null;
  const room = typeof booking.room_id === "object" ? booking.room_id : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
            Броньни Ўчириш
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Ушбу амални бекор қилиб бўлмайди
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Сиз ҳақиқатан ҳам ушбу броньни ўчирмоқчимисиз?
          </AlertDescription>
        </Alert>

        {/* Booking Info */}
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="break-words">
              <span className="text-gray-600">Бемор:</span>{" "}
              <strong className="text-gray-900">
                {patient?.fullname || "Номаълум"}
              </strong>
            </div>
            <div className="break-words">
              <span className="text-gray-600">Телефон:</span>{" "}
              <strong className="text-gray-900">
                {formatPhoneNumber(patient?.phone)}
              </strong>
            </div>
            <div className="break-words">
              <span className="text-gray-600">Хона:</span>{" "}
              <strong className="text-gray-900">
                {room?.room_name || "Номаълум"}
              </strong>
            </div>
            <div className="break-words">
              <span className="text-gray-600">Даври:</span>{" "}
              <strong className="text-gray-900">
                {format(new Date(booking.start_at), "dd MMM yyyy", {
                  locale: uz,
                })}{" "}
                -{" "}
                {format(new Date(booking.end_at), "dd MMM yyyy", {
                  locale: uz,
                })}
              </strong>
            </div>
            {booking.note && (
              <div className="break-words">
                <span className="text-gray-600">Изоҳ:</span>{" "}
                <span className="text-gray-900 italic">{booking.note}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Бекор қилиш
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                Ўчириш
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBookingModal;
