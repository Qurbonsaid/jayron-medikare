import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetBookingsByPatientQuery } from "@/app/api/bookingApi";
import { formatPhoneNumber } from "@/lib/utils";
import {
  Calendar,
  User,
  Home,
  Building2,
  AlertCircle,
  Eye,
  Bed,
  Clock,
  FileText,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, parseISO, startOfWeek } from "date-fns";
import { uz } from "date-fns/locale";
import type { Booking } from "@/app/api/bookingApi";

interface PatientBookingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string | null;
  onBack: () => void; // Bemor qidiruv modaliga qaytish
}

export const PatientBookingsModal = ({
  open,
  onOpenChange,
  patientId,
  onBack,
}: PatientBookingsModalProps) => {
  const navigate = useNavigate();

  // Fetch patient bookings
  const {
    data: bookingsData,
    isLoading,
    error,
  } = useGetBookingsByPatientQuery(
    { patient_id: patientId || "" },
    { skip: !patientId }
  );

  const bookings = bookingsData?.data || [];

  // Eng oxirgi bronni olish (created_at bo'yicha eng yangi)
  const latestBooking = bookings.length > 0
    ? bookings.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
    : null;

  // Get patient info from booking
  const patientInfo =
    latestBooking && typeof latestBooking.patient_id === "object"
      ? latestBooking.patient_id
      : null;

  const handleViewBooking = () => {
    if (!latestBooking) return;

    // Extract IDs
    const roomId = typeof latestBooking.room_id === "object" ? latestBooking.room_id._id : latestBooking.room_id;
    const corpusId = typeof latestBooking.corpus_id === "object" ? latestBooking.corpus_id._id : latestBooking.corpus_id;

    // Calculate week start from booking start_at
    const bookingStartDate = parseISO(latestBooking.start_at);
    const weekStart = startOfWeek(bookingStartDate, { weekStartsOn: 1 });

    // Format week start for URL parameter (YYYY-MM-DD)
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    // Navigate with startDate parameter
    navigate(`/inpatient-calendar/${corpusId}/${roomId}?startDate=${weekStartStr}`);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    onBack(); // Bemor qidiruv modalini qayta ochish
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground mt-4">
              Маълумотлар юкланмоқда...
            </p>
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Маълумотларни юклашда хатолик юз берди. Илтимос, қайтадан уриниб кўринг.
              </AlertDescription>
            </Alert>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose} className="w-full">
                Ёпиш
              </Button>
            </DialogFooter>
          </div>
        ) : !latestBooking ? (
          <div className="p-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Бронлар
              </DialogTitle>
            </DialogHeader>
            <Card className="p-8 text-center mt-6">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Calendar className="w-16 h-16 opacity-40" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Бронь топилмади</p>
                  <p className="text-sm">
                    Бу беморнинг ҳозирча бирорта ҳам брони йўқ
                  </p>
                </div>
              </div>
            </Card>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={handleClose} className="w-full">
                Ёпиш
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header - Patient Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  {patientInfo && (
                    <>
                      <h2 className="text-xl font-bold">{patientInfo.fullname}</h2>
                      <p className="text-blue-100 text-sm mt-1">
                        {formatPhoneNumber(patientInfo.phone)}
                      </p>
                    </>
                  )}
                  <Badge className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0">
                    {latestBooking.status === "active" ? "Одам бор" : "Бронланган"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Content - Booking Details */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                {/* Date Range */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Бронь муддати</p>
                    <p className="font-semibold text-base mt-1">
                      {format(parseISO(latestBooking.start_at), "d MMMM yyyy", { locale: uz })}
                      {" — "}
                      {format(parseISO(latestBooking.end_at), "d MMMM yyyy", { locale: uz })}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Location Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Corpus */}
                  {typeof latestBooking.corpus_id === "object" && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Корпус</p>
                        <p className="font-semibold text-base mt-1">
                          {latestBooking.corpus_id.corpus_number}-корпус
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Room */}
                  {typeof latestBooking.room_id === "object" && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0">
                        <Home className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Хона</p>
                        <p className="font-semibold text-base mt-1">
                          {latestBooking.room_id.room_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bed Number */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center flex-shrink-0">
                      <Bed className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Жой рақами</p>
                      <p className="font-semibold text-base mt-1">
                        {latestBooking?.bed_number || 0}-жой
                      </p>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-950/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Яратилган вақт</p>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {format(parseISO(latestBooking.created_at), "d MMMM yyyy, HH:mm", { locale: uz })}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Note */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-950/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Изоҳ</p>
                    <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                      {latestBooking?.note || "berilmagan"}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer - Actions */}
            <div className="border-t bg-muted/30 p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleViewBooking}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Календарда кўриш
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 sm:flex-none"
                >
                  Ёпиш
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientBookingsModal;
