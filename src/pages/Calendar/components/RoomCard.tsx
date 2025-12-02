import { useGetRoomsFromRoomApiQuery } from "@/app/api/roomApi";
import { Booking } from "@/app/api/bookingApi/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Bed, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { uz } from "date-fns/locale";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UpdateBookingModal } from "./UpdateBookingModal";
import { DeleteBookingModal } from "./DeleteBookingModal";
import { BookingDetailModal } from "./BookingDetailModal";

interface RoomCardProps {
  corpusId: string;
  weekDays: Date[];
  bookings: Booking[];
  onAddBooking: (roomId: string) => void;
}

export const RoomCard = ({
  corpusId,
  weekDays,
  bookings,
  onAddBooking,
}: RoomCardProps) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: roomsData, isLoading: roomsLoading } =
    useGetRoomsFromRoomApiQuery(
      {
        corpus_id: corpusId,
        page: 1,
        limit: 100,
      },
      { skip: !corpusId }
    );

  if (roomsLoading) {
    return (
      <Card className="p-12">
        <LoadingSpinner size="lg" text="Хоналар юкланмоқда..." />
      </Card>
    );
  }

  if (!roomsData?.data || roomsData.data.length === 0) {
    return (
      <Card className="p-8">
        <EmptyState
          icon={Bed}
          title="Хоналар топилмади"
          description="Ушбу корпусда хоналар мавжуд эмас"
        />
      </Card>
    );
  }

  // Booking uchun ranglarni aniqlash
  const getBookingColor = (booking: Booking, bedIndex: number) => {
    const colors = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600",
      "from-purple-400 to-purple-600",
      "from-pink-400 to-pink-600",
      "from-orange-400 to-orange-600",
      "from-teal-400 to-teal-600",
    ];
    return colors[bedIndex % colors.length];
  };

  // Bookingni qaysi kunlarda ko'rsatish kerakligini aniqlash
  const getBookingDays = (booking: Booking) => {
    const startDate = parseISO(booking.start_at);
    const endDate = parseISO(booking.end_at);

    return weekDays.map((day) => {
      const dayStart = new Date(new Date(day).setHours(0, 0, 0, 0));
      const dayEnd = new Date(new Date(day).setHours(23, 59, 59, 999));

      return isWithinInterval(dayStart, { start: startDate, end: endDate }) ||
        isWithinInterval(dayEnd, { start: startDate, end: endDate }) ||
        isWithinInterval(startDate, { start: dayStart, end: dayEnd })
        ? true
        : false;
    });
  };

  return (
    <>
      <div className="space-y-3">
        {roomsData.data.map((room) => {
          // Ushbu xona uchun bookinglar
          const roomBookings = bookings.filter(
            (b) => typeof b.room_id === "object" && b.room_id._id === room._id
          );

          // Xona bandligi foizi
          const occupancyPercent =
            room.patient_capacity > 0
              ? Math.round((room.patient_occupied / room.patient_capacity) * 100)
              : 0;

          return (
            <Card
              key={room._id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-white"
            >
              <div className="grid grid-cols-8 gap-0">
                {/* Room Info Column */}
                <div className="col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 border-r-2 border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {room.room_name}
                      </h3>
                      <Badge
                        variant={
                          room.patient_occupied === room.patient_capacity
                            ? "destructive"
                            : room.patient_occupied > 0
                            ? "default"
                            : "secondary"
                        }
                        className="mt-1"
                      >
                        {room.patient_capacity} жойлик
                      </Badge>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Бандлик</span>
                        <span className="font-bold text-gray-900">
                          {occupancyPercent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            occupancyPercent === 100
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : occupancyPercent > 50
                              ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                              : "bg-gradient-to-r from-green-500 to-green-600"
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>
                          Банд: <strong>{room.patient_occupied}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Bed className="w-3 h-3" />
                        <span>
                          Бўш:{" "}
                          <strong>
                            {room.patient_capacity - room.patient_occupied}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {/* Add Booking Button */}
                    <Button
                      size="sm"
                      onClick={() => onAddBooking(room._id)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Бронлаш
                    </Button>

                    {/* Floor Info */}
                    <div className="pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-500">
                        {room.floor_number}-қават
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {room.room_price.toLocaleString()} сўм/кун
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Grid */}
                <div className="col-span-7 relative">
                  {/* Beds Grid */}
                  <div className="divide-y divide-gray-100">
                    {Array.from({ length: room.patient_capacity }).map(
                      (_, bedIndex) => (
                        <div
                          key={bedIndex}
                          className="grid grid-cols-7 divide-x divide-gray-100 min-h-[80px] relative"
                        >
                          {weekDays.map((day, dayIndex) => {
                            // Bu joy uchun bu kunda booking bormi?
                            const dayBookings = roomBookings.filter((booking) => {
                              const bookingDays = getBookingDays(booking);
                              return bookingDays[dayIndex];
                            });

                            const bedBooking = dayBookings[bedIndex];

                            return (
                              <div
                                key={dayIndex}
                                className={`p-2 transition-all duration-200 ${
                                  format(day, "yyyy-MM-dd") ===
                                  format(new Date(), "yyyy-MM-dd")
                                    ? "bg-blue-50/50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                {bedBooking ? (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={`relative h-full min-h-[60px] rounded-lg p-2 cursor-pointer group bg-gradient-to-br ${getBookingColor(
                                          bedBooking,
                                          bedIndex
                                        )} text-white shadow-md hover:shadow-lg transition-all`}
                                        onClick={() =>
                                          setSelectedBooking(bedBooking)
                                        }
                                      >
                                        <div className="space-y-1">
                                          <p className="font-bold text-sm truncate">
                                            {typeof bedBooking.patient_id ===
                                            "object"
                                              ? bedBooking.patient_id.fullname
                                              : "Номаълум"}
                                          </p>
                                          <p className="text-xs opacity-90">
                                            {format(
                                              parseISO(bedBooking.start_at),
                                              "dd.MM"
                                            )}{" "}
                                            -{" "}
                                            {format(
                                              parseISO(bedBooking.end_at),
                                              "dd.MM"
                                            )}
                                          </p>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {bedIndex + 1}-жой
                                          </Badge>
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 bg-white/20 hover:bg-white/40"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <MoreVertical className="h-3 w-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedBooking(bedBooking);
                                                  setShowDetailModal(true);
                                                }}
                                              >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Кўриш
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedBooking(bedBooking);
                                                  setShowUpdateModal(true);
                                                }}
                                              >
                                                <Edit className="h-4 w-4 mr-2" />
                                                Таҳрирлаш
                                              </DropdownMenuItem>
                                              <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setSelectedBooking(bedBooking);
                                                  setShowDeleteModal(true);
                                                }}
                                              >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Ўчириш
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="space-y-1">
                                        <p className="font-semibold">
                                          {typeof bedBooking.patient_id ===
                                          "object"
                                            ? bedBooking.patient_id.fullname
                                            : "Номаълум"}
                                        </p>
                                        <p className="text-xs">
                                          {typeof bedBooking.patient_id ===
                                            "object" &&
                                            bedBooking.patient_id.phone}
                                        </p>
                                        <p className="text-xs">
                                          {format(
                                            parseISO(bedBooking.start_at),
                                            "dd MMM yyyy",
                                            { locale: uz }
                                          )}{" "}
                                          -{" "}
                                          {format(
                                            parseISO(bedBooking.end_at),
                                            "dd MMM yyyy",
                                            { locale: uz }
                                          )}
                                        </p>
                                        {bedBooking.note && (
                                          <p className="text-xs italic">
                                            {bedBooking.note}
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ) : (
                                  <div className="h-full min-h-[60px] rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer">
                                    <span className="text-xs">Бўш</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <UpdateBookingModal
        open={showUpdateModal}
        onOpenChange={setShowUpdateModal}
        booking={selectedBooking}
      />
      <DeleteBookingModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        booking={selectedBooking}
      />
      <BookingDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        booking={selectedBooking}
      />
    </>
  );
};
