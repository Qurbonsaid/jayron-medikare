import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useGetAllBookingsQuery } from "@/app/api/bookingApi";
import { useGetOneRoomQuery } from "@/app/api/roomApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { uz } from "date-fns/locale";
import { toast } from "sonner";
import {
  BookingModal,
  UpdateBookingModal,
  DeleteBookingModal,
  BookingDetailModal,
} from "./components";
import type { Booking } from "@/app/api/bookingApi";

const RoomCalendar = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Fetch room details
  const { data: roomResponse, isLoading: roomLoading } = useGetOneRoomQuery(
    { id: roomId || "" },
    { skip: !roomId }
  );
  const roomData = roomResponse?.data;

  // Calculate week range
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch bookings for this room
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetAllBookingsQuery(
      {
        room_id: roomId,
        start_date: weekStart.toISOString(),
        end_date: weekEnd.toISOString(),
      },
      { skip: !roomId }
    );

  // Navigation handlers
  const handlePreviousWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  // Keyboard shortcuts (← → only, no UI buttons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousWeek();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextWeek();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePreviousWeek, handleNextWeek]);

  // Get booking color based on bed index
  const getBookingColor = (bedIndex: number) => {
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

  // Bronni qaysi kunlarda ko'rsatish kerakligini aniqlash
  const getBookingDays = (booking: Booking) => {
    const startDate = parseISO(booking.start_at);
    const endDate = parseISO(booking.end_at);

    return weekDays.map((day) => {
      const dayStart = new Date(new Date(day).setHours(0, 0, 0, 0));
      const dayEnd = new Date(new Date(day).setHours(23, 59, 59, 999));

      return (
        isWithinInterval(dayStart, { start: startDate, end: endDate }) ||
        isWithinInterval(dayEnd, { start: startDate, end: endDate }) ||
        isWithinInterval(startDate, { start: dayStart, end: dayEnd })
      );
    });
  };

  // Bo'sh katak bosilganda - yangi bron ochish
  const handleEmptyCellClick = (day: Date) => {
    setSelectedDate(day.toISOString());
    setShowBookingModal(true);
  };

  // Handle booking click
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  if (roomLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <p className="text-lg text-muted-foreground">Xona topilmadi</p>
          <Button
            onClick={() => navigate("/inpatient-calendar")}
            className="mt-4"
          >
            Orqaga qaytish
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* Week Navigation */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <p className="text-lg font-semibold">
                {format(weekStart, "d MMMM", { locale: uz })} -{" "}
                {format(weekEnd, "d MMMM yyyy", { locale: uz })}
              </p>
            </div>

            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <Button onClick={() => setShowBookingModal(true)}>Yangi bron</Button>
      </div>

      {/* Calendar Grid */}
      {bookingsLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-hidden bg-white shadow-lg">
          <div className="overflow-x-auto">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-0 sticky top-0 bg-white z-10">
              <div className="col-span-1 bg-blue-600 text-white p-3 border-b-2 border-r-2 border-white font-bold text-center">
                Хона / Жой
              </div>
              {weekDays.map((day, index) => {
                const isToday =
                  format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={index}
                    className={`text-center p-3 border-b-2 border-r border-white ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <p className="text-xs font-semibold">
                      {format(day, "EEEEEE", { locale: uz })}
                    </p>
                    <p className="text-lg font-bold">{format(day, "dd")}</p>
                    <p className="text-xs opacity-90">
                      {format(day, "MMM", { locale: uz })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Beds Grid - har bir joy alohida qator */}
            {Array.from({ length: roomData.patient_capacity }).map(
              (_, bedIndex) => (
                <div key={bedIndex} className="grid grid-cols-8 gap-0">
                  {/* Bed Label */}
                  <div className="col-span-1 bg-gray-50 p-3 border-b border-r-2 border-gray-200 flex items-center justify-center">
                    <Badge variant="outline" className="text-sm font-bold">
                      {bedIndex + 1}-жой
                    </Badge>
                  </div>

                  {/* Days for this bed */}
                  {weekDays.map((day, dayIndex) => {
                    // Bu joy uchun bu kunda booking bormi?
                    const allBookings = bookingsData?.data || [];
                    const dayBookings = allBookings.filter((booking) => {
                      const bookingDays = getBookingDays(booking);
                      return bookingDays[dayIndex];
                    });

                    // Bu joy uchun bronni topish (bedIndex ga mos)
                    const bedBooking = dayBookings[bedIndex];

                    const isToday =
                      format(day, "yyyy-MM-dd") ===
                      format(new Date(), "yyyy-MM-dd");

                    return (
                      <div
                        key={dayIndex}
                        className={`p-2 border-b border-r border-gray-200 min-h-[70px] ${
                          isToday ? "bg-blue-50" : ""
                        }`}
                      >
                        {bedBooking ? (
                          <div
                            className={`h-full min-h-[54px] rounded-md p-2 cursor-pointer bg-gradient-to-br ${getBookingColor(
                              bedIndex
                            )} text-white shadow hover:shadow-md transition-all`}
                            onClick={() => handleBookingClick(bedBooking)}
                          >
                            <p className="font-bold text-xs truncate">
                              {typeof bedBooking.patient_id === "object"
                                ? bedBooking.patient_id.fullname
                                : "Номаълум"}
                            </p>
                            <p className="text-[10px] opacity-90 mt-1">
                              {format(parseISO(bedBooking.start_at), "dd.MM")} -{" "}
                              {format(parseISO(bedBooking.end_at), "dd.MM")}
                            </p>
                          </div>
                        ) : (
                          <div
                            className="h-full min-h-[54px] rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                            onClick={() => handleEmptyCellClick(day)}
                          >
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
        </Card>
      )}

      {/* Modals */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        corpusId={
          typeof roomData.corpus_id === "object"
            ? roomData.corpus_id._id
            : typeof roomData.corpus_id === "string"
            ? roomData.corpus_id
            : ""
        }
        roomId={roomId}
        defaultStartDate={selectedDate || new Date().toISOString()}
      />

      {selectedBooking && (
        <>
          <BookingDetailModal
            open={showDetailModal}
            onOpenChange={setShowDetailModal}
            booking={selectedBooking}
            onEdit={() => {
              setShowDetailModal(false);
              setShowUpdateModal(true);
            }}
            onDelete={() => {
              setShowDetailModal(false);
              setShowDeleteModal(true);
            }}
          />

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
        </>
      )}
    </div>
  );
};

export default RoomCalendar;
