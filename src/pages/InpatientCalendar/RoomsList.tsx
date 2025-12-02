import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCorpusesQuery } from "@/app/api/corpusApi";
import { useGetAvailableRoomsQuery } from "@/app/api/bookingApi";
import { useNavigate } from "react-router-dom";
import { Bed, Users, Building2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { uz } from "date-fns/locale";

const RoomsList = () => {
  const navigate = useNavigate();
  const [selectedCorpusId, setSelectedCorpusId] = useState<string>("");

  // Sana intervalini memoize qilish (har safar yangi Date() yaratilmasligi uchun)
  const dateRange = useMemo(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  }, []); // faqat component mount bo'lganda yaratiladi

  // Fetch corpuses
  const { data: corpusesData, isLoading: corpusesLoading } =
    useGetCorpusesQuery({
      page: 1,
      limit: 100,
    });

  // Auto-select first corpus
  useEffect(() => {
    if (
      corpusesData?.data &&
      corpusesData.data.length > 0 &&
      !selectedCorpusId
    ) {
      setSelectedCorpusId(corpusesData.data[0]._id);
    }
  }, [corpusesData, selectedCorpusId]);

  // Fetch available rooms for selected corpus
  const {
    data: availableRooms,
    isLoading: roomsLoading,
    error: roomsError,
  } = useGetAvailableRoomsQuery(
    {
      corpus_id: selectedCorpusId,
      ...dateRange,
    },
    { skip: !selectedCorpusId }
  );

  const handleRoomClick = (roomId: string) => {
    navigate(`/inpatient-calendar/${selectedCorpusId}/${roomId}`);
  };

  if (corpusesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header and Corpus Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Стационар Хоналар
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Хонани танланг ва брон қилиш учун календарга ўтинг
          </p>
        </div>

        {/* Corpus Tabs */}
        <Tabs
          value={selectedCorpusId}
          onValueChange={setSelectedCorpusId}
        >
          <TabsList className="inline-flex">
            {corpusesData?.data.map((corpus) => (
              <TabsTrigger
                key={corpus._id}
                value={corpus._id}
                className="flex items-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                Корпус {corpus.corpus_number}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Rooms Grid */}
      {!selectedCorpusId ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
            <p className="text-base sm:text-lg">Корпусни танланг</p>
          </div>
        </Card>
      ) : roomsLoading ? (
        <div className="flex flex-col items-center justify-center h-48 sm:h-64">
          <LoadingSpinner size="lg" />
          <p className="text-xs sm:text-sm text-muted-foreground ml-3 mt-2">
            Хоналар юкланмоқда...
          </p>
        </div>
      ) : roomsError ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-red-500">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
            <p className="text-base sm:text-lg">Хоналарни юклашда хатолик юз берди</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Илтимос, қайтадан уриниб кўринг
            </p>
          </div>
        </Card>
      ) : availableRooms?.data && availableRooms.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {availableRooms.data.map((room) => {
            // Xonaning holati: barchasi bo'sh, yarim to'lgan, to'liq band
            const totalBeds = room.patient_capacity;
            const availableBeds = room.available_beds;
            const occupiedBeds = totalBeds - availableBeds;
            
            let roomBgColor = "bg-background";
            let roomBorderColor = "border-border";
            
            if (occupiedBeds === 0) {
              // Barchasi bo'sh - yashil
              roomBgColor = "bg-green-50 dark:bg-green-950/20";
              roomBorderColor = "border-green-200 dark:border-green-800";
            } else if (occupiedBeds > 0 && occupiedBeds < totalBeds) {
              // Yarim to'lgan - sariq
              roomBgColor = "bg-yellow-50 dark:bg-yellow-950/20";
              roomBorderColor = "border-yellow-200 dark:border-yellow-800";
            } else {
              // To'liq band - qizil
              roomBgColor = "bg-red-50 dark:bg-red-950/20";
              roomBorderColor = "border-red-200 dark:border-red-800";
            }

            // Keyingi bo'shalish sanasini topish (eng oxirgi leave_date)
            const nextAvailable = room.availability
              ?.filter(bed => bed.status === 'booked' && bed.leave_date)
              .sort((a, b) => new Date(b.leave_date!).getTime() - new Date(a.leave_date!).getTime())[0];

            return (
              <Card
                key={room._id}
                className={`p-4 sm:p-6 hover:shadow-md transition-all duration-200 cursor-pointer border-2 ${roomBgColor} ${roomBorderColor} hover:border-primary`}
                onClick={() => handleRoomClick(room._id)}
              >
                <div className="space-y-3 sm:space-y-4">
                  {/* Room Name */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold">{room.room_name}</h3>
                    <div className="p-2 rounded-md bg-muted">
                      <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Beds Grid - har bir joy alohida */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        Жойлар ({totalBeds} та):
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {room.availability?.map((bed, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded-md border text-center text-xs sm:text-sm ${
                            bed.status === 'available'
                              ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                          }`}
                        >
                          <div className="font-semibold">{bed.bed}-жой</div>
                          {bed.status === 'available' ? (
                            <div className="text-[10px] sm:text-xs">Бўш</div>
                          ) : (
                            <div className="text-[10px] sm:text-xs">
                              {bed.leave_date ? format(parseISO(bed.leave_date), "d MMM", { locale: uz }) : 'Банд'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Available Date - faqat to'liq band bo'lsa */}
                  {nextAvailable && availableBeds === 0 && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm pt-2 border-t">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
                        Охирги бўшалиш: {format(parseISO(nextAvailable.leave_date!), "d MMM, yyyy", { locale: uz })}
                      </span>
                    </div>
                  )}

                  {/* Availability Status */}
                  {availableBeds > 0 ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs sm:text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">{availableBeds} та бўш</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-destructive text-xs sm:text-sm">
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span className="font-medium">Тўлиқ банд</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 sm:p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
            <p className="text-base sm:text-lg">Бу корпусда хоналар топилмади</p>
            <p className="text-xs sm:text-sm">
              Ёки танланган вақт оралиғида бўш хоналар йўқ
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RoomsList;
