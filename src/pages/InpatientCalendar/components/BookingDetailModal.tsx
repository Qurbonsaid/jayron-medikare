import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking } from "@/app/api/bookingApi/types";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { formatPhoneNumber, formatNumber } from "@/lib/utils";
import {
  Calendar,
  User,
  Home,
  Phone,
  FileText,
  Clock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BookingDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const BookingDetailModal = ({
  open,
  onOpenChange,
  booking,
  onEdit,
  onDelete,
}: BookingDetailModalProps) => {
  if (!booking) return null;

  const patient =
    typeof booking.patient_id === "object" ? booking.patient_id : null;
  const room = typeof booking.room_id === "object" ? booking.room_id : null;
  const corpus =
    typeof booking.corpus_id === "object" ? booking.corpus_id : null;

  const startDate = new Date(booking.start_at);
  const endDate = new Date(booking.end_at);
  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Бронь Тафсилотлари
          </DialogTitle>
          <DialogDescription>Бронь ҳақида тўлиқ маълумот</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg text-blue-900">
                Бемор маълумотлари
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700 mb-1">Исм-фамилия</p>
                <p className="font-semibold text-blue-900">
                  {patient?.fullname || "Номаълум"}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Телефон</p>
                <p className="font-semibold text-blue-900 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {formatPhoneNumber(patient?.phone)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Room Info */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Home className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-lg text-green-900">
                Хона маълумотлари
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-700 mb-1">Корпус</p>
                <Badge variant="outline" className="bg-white">
                  Корпус {corpus?.corpus_number || "-"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Хона</p>
                <p className="font-semibold text-green-900">
                  {room?.room_name || "Номаълум"}
                </p>
              </div>
              {/* <div>
                <p className="text-xs text-green-700 mb-1">Қават</p>
                <p className="font-semibold text-green-900">
                  {room?.floor_number || "-"}-қават
                </p>
              </div> */}
              <div>
                <p className="text-xs text-green-700 mb-1">Сиғим</p>
                <p className="font-semibold text-green-900">
                  {room?.patient_capacity || "-"} жойлик
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Нарх</p>
                <p className="font-semibold text-green-900">
                  {formatNumber(room?.room_price)} сўм/кун
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Period */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-lg text-purple-900">Бронь даври</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-purple-700 mb-1">Бошланиши</p>
                <p className="font-semibold text-purple-900">
                  {format(startDate, "dd MMM yyyy", { locale: uz })}
                </p>
                <p className="text-xs text-purple-600">
                  {format(startDate, "EEEE", { locale: uz })}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Тугаши</p>
                <p className="font-semibold text-purple-900">
                  {format(endDate, "dd MMM yyyy", { locale: uz })}
                </p>
                <p className="text-xs text-purple-600">
                  {format(endDate, "EEEE", { locale: uz })}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Давомийлиги</p>
                <p className="font-semibold text-purple-900">{duration} кун</p>
                <p className="text-xs text-purple-600">
                  {Math.floor(duration / 7)} ҳафта {duration % 7} кун
                </p>
              </div>
            </div>
          </div>

          {/* Note */}
          {booking.note && (
            <>
              <Separator />
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Изоҳ</h4>
                </div>
                <p className="text-sm text-gray-700 italic">{booking.note}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <span>Яратилди: </span>
                <strong>
                  {format(new Date(booking.created_at), "dd.MM.yyyy HH:mm", {
                    locale: uz,
                  })}
                </strong>
              </div>
              <div>
                <span>Янгиланди: </span>
                <strong>
                  {format(new Date(booking.updated_at), "dd.MM.yyyy HH:mm", {
                    locale: uz,
                  })}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Ўчириш
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Таҳрирлаш
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Ёпиш</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailModal;
