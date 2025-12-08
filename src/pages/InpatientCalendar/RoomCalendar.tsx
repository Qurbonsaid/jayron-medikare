import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ArrowLeft, Users, Bed } from "lucide-react";
import {
  useGetAllBookingsQuery,
  useGetAvailableRoomsQuery,
} from "@/app/api/bookingApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval,
  isValid,
} from "date-fns";
import { uz } from "date-fns/locale";
import { toast } from "sonner";
import { formatPhoneNumber } from "@/lib/utils";
import {
  BookingModal,
  UpdateBookingModal,
  DeleteBookingModal,
  BookingDetailModal,
} from "./components";
import type { Booking } from "@/app/api/bookingApi";

const RoomCalendar = () => {
  const { roomId, corpusId } = useParams<{
    roomId: string;
    corpusId: string;
  }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get initial week start from URL param or default to current week
  const getInitialWeekStart = () => {
    const startDateParam = searchParams.get("startDate");
    if (startDateParam) {
      try {
        // Parse date from URL (YYYY-MM-DD format)
        const parsedDate = parseISO(startDateParam);
        if (isValid(parsedDate)) {
          // Return the start of the week containing this date
          return startOfWeek(parsedDate, { weekStartsOn: 1 });
        }
      } catch (error) {
        console.error("Error parsing startDate:", error);
      }
    }
    // Default to current week
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  };

  const [weekStart, setWeekStart] = useState<Date>(getInitialWeekStart());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Calculate week range
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Hafta boshlanishi va tugashi uchun to'g'ri vaqt formatini yaratish
  // Start: YYYY-MM-DDT00:00:00.000Z (kun boshlanishi)
  // End: YYYY-MM-DDT23:59:59.999Z (kun tugashi)
  const formatDateToStart = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00.000Z`;
  };

  const formatDateToEnd = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59:59.999Z`;
  };

  const apiStartDate = formatDateToStart(weekStart);
  const apiEndDate = formatDateToEnd(weekEnd);

  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetAllBookingsQuery(
      {
        room_id: roomId,
        start_date: apiStartDate,
        end_date: apiEndDate,
      },
      { skip: !roomId }
    );

  // Fetch available rooms data - bu yerdan xona ma'lumotlarini olamiz
  const { data: availableRoomsData, isLoading: roomsLoading } =
    useGetAvailableRoomsQuery(
      {
        corpus_id: corpusId || "",
        room_id: roomId || "",
        start_date: apiStartDate,
        end_date: apiEndDate,
      },
      { skip: !corpusId || !roomId }
    );

  // Bizning xonamizni topish - API endi faqat bitta xonani qaytaradi
  const roomData = availableRoomsData?.data[0];

  // Navigation handlers
  const handlePreviousWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Booking rangini aniqlash
  const getBookingColor = (isRealPatient: boolean) => {
    // Real bemor - yashil, Bron qilingan - ko'k
    return isRealPatient ? "bg-green-300" : "bg-blue-300";
  };

  // Booking label (Одам бор / Бронь)
  const getBookingLabel = (isRealPatient: boolean) => {
    return isRealPatient ? "Одам бор" : "Бронь";
  };

  // Bronni qaysi kunlarda ko'rsatish kerakligini aniqlash
  const getBookingDays = (booking: Booking) => {
    // UTC sanani YYYY-MM-DD formatga o'zgartirish (faqat sana, vaqtsiz)
    const startStr = booking.start_at.split("T")[0]; // "2025-12-07"
    const endStr = booking.end_at.split("T")[0]; // "2025-12-14"

    return weekDays.map((day) => {
      // Kunni YYYY-MM-DD formatga o'zgartirish
      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, "0");
      const dayNum = String(day.getDate()).padStart(2, "0");
      const dayStr = `${year}-${month}-${dayNum}`;

      // Boshlanish kunidan boshlanadi, tugash kunida KIRADI (<=)
      // Masalan: 2-7 dekabr = 2, 3, 4, 5, 6, 7 (7 ham kiradi)
      // Masalan: 7-14 dekabr = 7, 8, 9, 10, 11, 12, 13, 14 (7 ham kiradi)
      return dayStr >= startStr && dayStr <= endStr;
    });
  };

  // Bronlarni joylar bo'yicha guruhlash (smart algorithm)
  const assignBookingsToBeds = (bookings: Booking[]) => {
    const beds: Booking[][] = Array.from(
      { length: roomData?.patient_capacity || 0 },
      () => []
    );

    // Bronlarni boshlanish sanasi bo'yicha, keyin yaratilgan vaqti bo'yicha tartiblash
    // Eski bronlar birinchi qatorga, yangi bronlar keyingi qatorlarga
    const sortedBookings = [...bookings].sort((a, b) => {
      const startDiff =
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      if (startDiff !== 0) return startDiff;

      // Agar start_at bir xil bo'lsa, created_at bo'yicha tartiblash
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    sortedBookings.forEach((booking) => {
      const bookingStart = parseISO(booking.start_at);
      const bookingEnd = parseISO(booking.end_at);

      // Bo'sh joy topish - bronlar bir-biriga to'qnashmasa
      let bedIndex = beds.findIndex((bed) => {
        if (bed.length === 0) return true;

        // Oxirgi bron bilan to'qnashuvni tekshirish
        const lastBooking = bed[bed.length - 1];
        const lastEnd = parseISO(lastBooking.end_at);

        // Agar yangi bron oxirgi bron TUGAGANIDAN keyin boshlansa - joy bo'sh
        // 7-dekabr tugasa, 8-dekabrdan boshlasa bo'ladi (7 = 7 emas!)
        return bookingStart > lastEnd;
      });

      // Agar bo'sh joy topilmasa, birinchi bo'sh joyni topish
      if (bedIndex === -1) {
        bedIndex = beds.findIndex((bed) => bed.length === 0);
      }

      // Agar hali bo'sh joy bo'lsa, qo'shish
      if (bedIndex !== -1) {
        beds[bedIndex].push(booking);
      }
    });

    return beds;
  };

  // Bo'sh katak bosilganda - yangi bron ochish
  const handleEmptyCellClick = (day: Date) => {
    // Bugungi kunni olish
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tanlangan kunni olish
    const selectedDay = new Date(day);
    selectedDay.setHours(0, 0, 0, 0);

    // Agar o'tgan kun bo'lsa - xabar berish
    if (selectedDay < today) {
      toast.error("Ўтган санага бронь қилиб бўлмайди");
      return;
    }

    // Sanani to'g'ri formatda o'tkazish (timezone muammosiz)
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const dayNum = String(day.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${dayNum}`);
    setShowBookingModal(true);
  };

  // Handle booking click
  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailModal(true);
  };

  if (roomsLoading || bookingsLoading) {
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
          <p className="text-lg text-muted-foreground">Хона топилмади</p>
          <Button
            onClick={() => navigate("/inpatient-calendar")}
            className="mt-4"
          >
            Орқага қайтиш
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate occupied beds from backend available_beds data
  const totalBeds = roomData.patient_capacity;
  const availableBeds = roomData.available_beds;
  const occupiedBeds = totalBeds - availableBeds;

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

        <Button
          onClick={() => {
            // Haftaning boshidan yoki bugundan (qaysi katta bo'lsa)
            const today = new Date();
            const startDate = weekStart > today ? weekStart : today;

            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            const day = String(startDate.getDate()).padStart(2, "0");
            setSelectedDate(`${year}-${month}-${day}`);
            setShowBookingModal(true);
          }}
        >
          Yangi bron
        </Button>
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
              <div className="col-span-1 bg-blue-500 text-white p-4 border-b-2 border-r-2 border-white">
                <div className="space-y-2">
                  <p className="font-extrabold text-xl">
                    {roomData?.room_name}
                  </p>
                  <div className="text-sm font-semibold space-y-1.5">
                    <div className="flex items-center">
                      <span>Сиғим: {totalBeds}</span>
                    </div>
                    <div className="flex items-center">
                      <span>Банд: {occupiedBeds}</span>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={
                          availableBeds === 0
                            ? "text-red-400"
                            : "text-green-300"
                        }
                      >
                        Бўш: {availableBeds}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {weekDays.map((day, index) => {
                const isToday =
                  format(day, "yyyy-MM-dd") ===
                  format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={index}
                    className={`text-center p-3 border-b-2 border-r border-white ${isToday
                        ? "bg-blue-400 text-white font-bold"
                        : "bg-blue-500 text-white"
                      }`}
                  >
                    <p className="text-xs font-semibold uppercase">
                      {format(day, "EEEEEE", { locale: uz })}
                    </p>
                    <p
                      className={`font-bold ${isToday ? "text-3xl" : "text-2xl"
                        }`}
                    >
                      {format(day, "dd")}
                    </p>
                    <p className="text-xs opacity-90">
                      {format(day, "MMM", { locale: uz })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Beds Grid - bed_number asosida guruhlash */}
            {(() => {
              const allBookings = bookingsData?.data || [];
              const weekBookings = allBookings.filter((booking) => {
                const bookingDays = getBookingDays(booking);
                return bookingDays.some((hasBooking) => hasBooking);
              });

              // Bronlarni bed_number bo'yicha guruhlash
              const bedGroups: Booking[][] = Array.from(
                { length: roomData.patient_capacity },
                () => []
              );

              // Har bir bronni o'z bed_number ga joylashtirish
              weekBookings.forEach((booking) => {
                if (
                  booking.bed_number &&
                  booking.bed_number > 0 &&
                  booking.bed_number <= roomData.patient_capacity
                ) {
                  bedGroups[booking.bed_number - 1].push(booking);
                }
              });

              // Har bir joydagi bronlarni created_at bo'yicha tartiblash
              bedGroups.forEach((bed) => {
                bed.sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
                );
              });

              // Availability ma'lumotlari
              const availability = roomData.availability || [];

              return bedGroups.map((bedBookings, bedIndex) => {
                // Bu joy uchun availability ma'lumoti
                const bedAvailability = availability[bedIndex];

                // Bo'shalish sanasini aniqlash
                let availabilityInfo = null;
                if (bedAvailability) {
                  if (bedAvailability.status === "available") {
                    availabilityInfo = { text: "Бўш", color: "text-green-600" };
                  } else if (bedAvailability.available_from) {
                    // Format: "14 Dek" (no year, short month)
                    const date = new Date(bedAvailability.available_from);
                    const formatted = format(date, "d MMM", { locale: uz });
                    availabilityInfo = {
                      text: formatted,
                      color: "text-gray-700",
                    };
                  }
                } else {
                  // Agar availability yo'q bo'lsa, bronlardan hisoblaymiz
                  const lastBooking =
                    bedBookings.length > 0
                      ? bedBookings[bedBookings.length - 1]
                      : null;

                  if (lastBooking) {
                    availabilityInfo = {
                      text: format(parseISO(lastBooking.end_at), "d MMM", {
                        locale: uz,
                      }),
                      color: "text-gray-700",
                    };
                  } else {
                    availabilityInfo = { text: "Бўш", color: "text-green-600" };
                  }
                }

                return (
                  <div key={bedIndex} className="grid grid-cols-8 gap-0">
                    {/* Bed Label */}
                    <div className="col-span-1 bg-gray-50 p-3 border-b border-r-2 border-gray-200">
                      <div className="space-y-2">
                        <p className="text-lg font-extrabold text-gray-800">
                          {bedIndex + 1}-жой
                        </p>
                        {availabilityInfo && (
                          <Badge
                            variant="outline"
                            className={`text-sm font-semibold ${availabilityInfo.color}`}
                          >
                            {availabilityInfo.text}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Days for this bed */}
                    {weekDays.map((day, dayIndex) => {
                      // Bu kunda qaysi bron aktiv?
                      const activeBooking = bedBookings.find((booking) => {
                        const bookingDays = getBookingDays(booking);
                        return bookingDays[dayIndex];
                      });

                      const isToday =
                        format(day, "yyyy-MM-dd") ===
                        format(new Date(), "yyyy-MM-dd");

                      // Bu bronning birinchi yoki oxirgi kunimimi aniqlash
                      // isFirstDay: bronning boshlanish sanasi shu kunga to'g'ri kelsami
                      // isLastDay: bronning tugash sanasi shu kunga to'g'ri kelsami
                      const dayStr = format(day, "yyyy-MM-dd");
                      const isFirstDay = activeBooking
                        ? activeBooking.start_at.split("T")[0] === dayStr
                        : false;
                      const isLastDay = activeBooking
                        ? activeBooking.end_at.split("T")[0] === dayStr
                        : false;
                      const isMiddleDay =
                        activeBooking && !isFirstDay && !isLastDay;

                      return (
                        <div
                          key={dayIndex}
                          className={`p-2 border-b border-r border-gray-200 min-h-[70px] ${isToday ? "bg-red-50" : ""
                            }`}
                        >
                          {activeBooking ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    style={{
                                      borderTopLeftRadius: isFirstDay
                                        ? "0.5rem"
                                        : "0",
                                      borderBottomLeftRadius: isFirstDay
                                        ? "0.5rem"
                                        : "0",
                                      borderTopRightRadius: isLastDay
                                        ? "0.5rem"
                                        : "0",
                                      borderBottomRightRadius: isLastDay
                                        ? "0.5rem"
                                        : "0",
                                      borderLeft: isFirstDay
                                        ? `6px solid ${activeBooking.is_real_patient ? "green" : "blue"}`
                                        : "none",
                                      borderRight: isLastDay
                                        ? `6px solid ${activeBooking.is_real_patient ? "green" : "blue"}`
                                        : "none",
                                      borderTop: `1px solid ${activeBooking.is_real_patient ? "green" : "blue"}`,
                                      borderBottom: `1px solid ${activeBooking.is_real_patient ? "green" : "blue"}`,
                                    }}
                                    className={`h-full min-h-[54px] p-2 cursor-pointer ${getBookingColor(
                                      activeBooking.is_real_patient || false
                                    )} shadow hover:shadow-md transition-all`}
                                    onClick={() =>
                                      handleBookingClick(activeBooking)
                                    }
                                  >
                                    <p className="font-extrabold text-sm truncate text-gray-900">
                                      {typeof activeBooking.patient_id ===
                                        "object"
                                        ? activeBooking.patient_id.fullname
                                          .split(" ")
                                          .slice(0, 2)
                                          .join(" ")
                                        : "Номаълум"}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-800 mt-1">
                                      {
                                        activeBooking.start_at
                                          .split("T")[0]
                                          .split("-")[2]
                                      }{" "}
                                      -{" "}
                                      {
                                        activeBooking.end_at
                                          .split("T")[0]
                                          .split("-")[2]
                                      }
                                    </p>
                                    <p className="text-xs font-medium text-gray-700 mt-0.5">
                                      {getBookingLabel(activeBooking.is_real_patient || false)}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-xs p-3"
                                >
                                  <div className="space-y-1.5">
                                    <p className="font-bold text-base">
                                      {typeof activeBooking.patient_id ===
                                        "object"
                                        ? activeBooking.patient_id.fullname
                                        : "Номаълум"}
                                    </p>
                                    {typeof activeBooking.patient_id ===
                                      "object" &&
                                      activeBooking.patient_id.phone && (
                                        <p className="text-sm">
                                          {formatPhoneNumber(activeBooking.patient_id.phone)}
                                        </p>
                                      )}
                                    <p className="text-sm">
                                      {format(
                                        parseISO(activeBooking.start_at),
                                        "d MMMM",
                                        { locale: uz }
                                      )}{" "}
                                      -{" "}
                                      {format(
                                        parseISO(activeBooking.end_at),
                                        "d MMMM",
                                        { locale: uz }
                                      )}{" "}
                                      |{" "}
                                      {getBookingLabel(activeBooking.is_real_patient || false)}
                                    </p>

                                    {activeBooking?.note && (
                                      <p className="text-sm">
                                        {activeBooking?.note}
                                      </p>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div
                              className="h-full min-h-[54px] rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                              onClick={() => handleEmptyCellClick(day)}
                            >
                              <span className="text-xs font-medium">Бўш</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}
          </div>
        </Card>
      )}

      {/* Modals */}
      <BookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        corpusId={corpusId || ""}
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
