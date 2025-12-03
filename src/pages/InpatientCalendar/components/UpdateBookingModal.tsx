import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBookingMutation } from "@/app/api/bookingApi";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { Calendar, Save, Edit2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Booking } from "@/app/api/bookingApi/types";
import { format } from "date-fns";

interface UpdateBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export const UpdateBookingModal = ({
  open,
  onOpenChange,
  booking,
}: UpdateBookingModalProps) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const handleRequest = useHandleRequest();
  const [updateBooking, { isLoading }] = useUpdateBookingMutation();

  // Set initial values when booking changes
  useEffect(() => {
    if (booking && open) {
      setStartDate(format(new Date(booking.start_at), "yyyy-MM-dd"));
      setEndDate(format(new Date(booking.end_at), "yyyy-MM-dd"));
      setNote(booking.note || "");
    }
  }, [booking, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!booking) return;

    if (!startDate || !endDate) {
      toast.error("Саналарни киритинг");
      return;
    }

    // Bugungi kunni olish (faqat sana, vaqtsiz)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Boshlanish sanasi bugundan oldin bo'lmasligi kerak
    if (startDate < todayStr) {
      toast.error("Ўтган санага ўзгартириб бўлмайди");
      return;
    }

    // Tugash sanasi boshlanish sanasidan oldin bo'lmasligi kerak
    if (endDate < startDate) {
      toast.error("Тугаш санаси бошланиш санасидан олдин бўлмаслиги керак");
      return;
    }

    await handleRequest({
      request: async () => {
        // Vaqtlarni to'g'ri o'rnatish (timezone muammosiz):
        // Boshlanish: kunning boshi (00:00:00)
        // Tugash: kunning oxiri (23:59:59)
        const startAt = `${startDate}T00:00:00.000Z`;
        const endAt = `${endDate}T23:59:59.999Z`;
        
        return await updateBooking({
          id: booking._id,
          body: {
            start_at: startAt,
            end_at: endAt,
            note: note || undefined,
          },
        }).unwrap();
      },
      onSuccess: () => {
        toast.success("Бронь муваффақиятли янгиланди");
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(
          data?.error?.msg || "Бронь янгилашда хатолик юз берди"
        );
      },
    });
  };

  if (!booking) return null;

  const patient =
    typeof booking.patient_id === "object" ? booking.patient_id : null;
  const room = typeof booking.room_id === "object" ? booking.room_id : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit2 className="w-6 h-6 text-blue-600" />
            Броньни Таҳрирлаш
          </DialogTitle>
          <DialogDescription>
            Бронь маълумотларини янгиланг
          </DialogDescription>
        </DialogHeader>

        {/* Current Booking Info */}
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Бемор:</span>{" "}
              <strong>{patient?.fullname || "Номаълум"}</strong>
            </div>
            <div>
              <span className="text-gray-600">Хона:</span>{" "}
              <strong>{room?.room_name || "Номаълум"}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Бошланиш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">
                Тугаш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Изоҳ (ихтиёрий)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Махсус диета, аллергия ва бошқа маълумотлар..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Бекор қилиш
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !startDate || !endDate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сақлаш
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBookingModal;
