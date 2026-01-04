import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("inpatient");
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
      toast.error(t("booking.enterDates"));
      return;
    }

    // Bugungi kunni olish (faqat sana, vaqtsiz)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // Boshlanish sanasi bugundan oldin bo'lmasligi kerak
    if (startDate < todayStr) {
      toast.error(t("updateBooking.cannotChangeToPastDate"));
      return;
    }

    // Tugash sanasi boshlanish sanasidan oldin bo'lmasligi kerak
    if (endDate < startDate) {
      toast.error(t("booking.endDateBeforeStartDate"));
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
        toast.success(t("updateBooking.updateSuccess"));
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(
          data?.error?.msg || t("updateBooking.updateError")
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
      <DialogContent className="max-w-xl sm:max-w-2xl p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Edit2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            {t("updateBooking.title")}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {t("updateBooking.description")}
          </DialogDescription>
        </DialogHeader>

        {/* Current Booking Info */}
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="break-words">
              <span className="text-gray-600">{t("updateBooking.patient")}:</span>{" "}
              <strong>{patient?.fullname || t("common.unknown")}</strong>
            </div>
            <div className="break-words">
              <span className="text-gray-600">{t("updateBooking.room")}:</span>{" "}
              <strong>{room?.room_name || t("common.unknown")}</strong>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm sm:text-base">
                {t("booking.startDate")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="text-sm h-10 sm:h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm sm:text-base">
                {t("booking.endDate")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate}
                className="text-sm h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm sm:text-base">{t("booking.noteOptional")}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("booking.notePlaceholder")}
              rows={3}
              className="text-sm sm:text-base resize-none"
            />
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !startDate || !endDate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto text-sm sm:text-base"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  {t("common.save")}
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
