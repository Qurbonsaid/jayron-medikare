import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useGetCorpusesQuery } from "@/app/api/corpusApi";
import { useGetAllBookingsQuery } from "@/app/api/bookingApi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomCard, BookingModal } from "./components";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { uz } from "date-fns/locale";
import { toast } from "sonner";

const Calendar = () => {
  const [selectedCorpusId, setSelectedCorpusId] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<string | null>(null);

  // Fetch corpuses
  const { data: corpusesData, isLoading: corpusesLoading } = useGetCorpusesQuery({
    page: 1,
    limit: 100,
  });

  // Auto-select first corpus
  useEffect(() => {
    if (corpusesData?.data && corpusesData.data.length > 0 && !selectedCorpusId) {
      setSelectedCorpusId(corpusesData.data[0]._id);
    }
  }, [corpusesData, selectedCorpusId]);

  // Calculate week range
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch bookings for selected week and corpus
  const { data: bookingsData, isLoading: bookingsLoading } = useGetAllBookingsQuery(
    {
      corpus_id: selectedCorpusId,
      start_date: weekStart.toISOString(),
      end_date: weekEnd.toISOString(),
    },
    { skip: !selectedCorpusId }
  );

  // Navigation handlers
  const handlePreviousWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, -7));
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleToday = useCallback(() => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePreviousWeek();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNextWeek();
          break;
        case "t":
        case "T":
          e.preventDefault();
          handleToday();
          break;
        case "n":
        case "N":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowBookingModal(true);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handlePreviousWeek, handleNextWeek, handleToday]);

  const handleAddBooking = (roomId: string) => {
    setSelectedRoomForBooking(roomId);
    setShowBookingModal(true);
  };

  if (corpusesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" text="Юкланмоқда..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Стационар Календари
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Бронлаш ва хоналарни бошқариш тизими
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="hidden sm:flex"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Бугун
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              ⌨️ <strong>Tezkor tugmalar:</strong> ← → hafta o'zgartiruvi | T - Bugunga qaytish | Ctrl+N - Yangi bron
            </p>
          </div>

          {/* Corpus Tabs and Week Navigation */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Corpus Tabs */}
            <Tabs
              value={selectedCorpusId}
              onValueChange={setSelectedCorpusId}
              className="w-full lg:w-auto"
            >
              <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-xl shadow-sm">
                {corpusesData?.data.map((corpus) => (
                  <TabsTrigger
                    key={corpus._id}
                    value={corpus._id}
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg transition-all duration-300 font-semibold"
                  >
                    Korpus {corpus.corpus_number}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Week Navigation */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousWeek}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="flex-1 lg:flex-none bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Hafta</p>
                  <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {format(weekStart, "dd MMM", { locale: uz })} -{" "}
                    {format(weekEnd, "dd MMM yyyy", { locale: uz })}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleNextWeek}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="col-span-1"></div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-xl transition-all ${
                format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-105"
                  : "bg-white border border-gray-200"
              }`}
            >
              <p className="text-xs font-semibold uppercase">
                {format(day, "EEEEEE", { locale: uz })}
              </p>
              <p className="text-lg font-bold">
                {format(day, "dd", { locale: uz })}
              </p>
              <p className="text-xs opacity-80">
                {format(day, "MMM", { locale: uz })}
              </p>
            </div>
          ))}
        </div>

        {/* Room Cards with Timeline */}
        {bookingsLoading ? (
          <Card className="p-12">
            <LoadingSpinner size="lg" text="Хоналар юкланмоқда..." className="justify-center" />
          </Card>
        ) : (
          <RoomCard
            corpusId={selectedCorpusId}
            weekDays={weekDays}
            bookings={bookingsData?.data || []}
            onAddBooking={handleAddBooking}
          />
        )}

        {/* Booking Modal */}
        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          corpusId={selectedCorpusId}
          roomId={selectedRoomForBooking}
          defaultStartDate={weekStart.toISOString()}
        />
      </div>
    </div>
  );
};

export default Calendar;
