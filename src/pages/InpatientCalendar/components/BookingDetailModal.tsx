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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              {booking.is_real_patient ? "Бемор маълумотлари" : "Бронь тафсилотлари"}
            </DialogTitle>
            <Badge 
              variant={booking.is_real_patient ? "default" : "outline"}
              className={booking.is_real_patient 
                ? "bg-green-600 hover:bg-green-700 text-xs sm:text-sm" 
                : "text-xs sm:text-sm"
              }
            >
              {booking.is_real_patient ? "Одам бор" : "Бронь"}
            </Badge>
          </div>
          <DialogDescription className="text-sm sm:text-base">
            {booking.is_real_patient 
              ? "Стационардаги бемор ҳақида тўлиқ маълумот"
              : "Бронь ҳақида тўлиқ маълумот"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Patient Info */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="font-bold text-base sm:text-lg text-blue-900">
                Бемор маълумотлари
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700 mb-1">Исм-фамилия</p>
                <p className="font-semibold text-sm sm:text-base text-blue-900 break-words">
                  {patient?.fullname || "Номаълум"}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Телефон</p>
                <p className="font-semibold text-sm sm:text-base text-blue-900 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {formatPhoneNumber(patient?.phone)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Room Info */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <h3 className="font-bold text-base sm:text-lg text-green-900">
                Хона маълумотлари
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-700 mb-1">Корпус</p>
                <Badge variant="outline" className="bg-white text-xs sm:text-sm">
                  Корпус {corpus?.corpus_number || "-"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Хона</p>
                <p className="font-semibold text-sm sm:text-base text-green-900">
                  {room?.room_name || "Номаълум"}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Сиғим</p>
                <p className="font-semibold text-sm sm:text-base text-green-900">
                  {room?.patient_capacity || "-"} жойлик
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 mb-1">Нарх</p>
                <p className="font-semibold text-sm sm:text-base text-green-900 break-words">
                  {formatNumber(room?.room_price)} сўм/кун
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Booking Period */}
          <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <h3 className="font-bold text-base sm:text-lg text-purple-900">Бронь даври</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-purple-700 mb-1">Бошланиши</p>
                <p className="font-semibold text-sm sm:text-base text-purple-900">
                  {format(startDate, "dd MMM yyyy", { locale: uz })}
                </p>
                <p className="text-xs text-purple-600">
                  {format(startDate, "EEEE", { locale: uz })}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Тугаши</p>
                <p className="font-semibold text-sm sm:text-base text-purple-900">
                  {format(endDate, "dd MMM yyyy", { locale: uz })}
                </p>
                <p className="text-xs text-purple-600">
                  {format(endDate, "EEEE", { locale: uz })}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 mb-1">Давомийлиги</p>
                <p className="font-semibold text-sm sm:text-base text-purple-900">{duration} кун</p>
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
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900">Изоҳ</h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 italic break-words">{booking.note}</p>
              </div>
            </>
          )}

          {/* Metadata */}
          <div className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
              <div className="break-words">
                <span>Яратилди: </span>
                <strong>
                  {format(new Date(booking.created_at), "dd.MM.yyyy HH:mm", {
                    locale: uz,
                  })}
                </strong>
              </div>
              <div className="break-words">
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

        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
          {/* Real bemor bo'lsa Edit va Delete ko'rinmasin */}
          {!booking.is_real_patient && onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Ўчириш
            </Button>
          )}
          {!booking.is_real_patient && onEdit && (
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Таҳрирлаш
            </Button>
          )}
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Ёпиш
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailModal;
