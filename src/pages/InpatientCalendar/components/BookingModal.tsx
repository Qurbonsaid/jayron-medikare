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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetAllPatientQuery } from "@/app/api/patientApi";
import { useGetRoomsFromRoomApiQuery } from "@/app/api/roomApi";
import { useCreateBookingMutation, useGetAvailableRoomsQuery } from "@/app/api/bookingApi";
import { formatPhoneNumber, formatNumber } from "@/lib/utils";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { Calendar, User, Home, Search, Save, AlertCircle, UserPlus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuickAddPatientModal } from "./QuickAddPatientModal";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corpusId: string;
  roomId?: string | null;
  defaultStartDate?: string;
}

export const BookingModal = ({
  open,
  onOpenChange,
  corpusId,
  roomId,
  defaultStartDate,
}: BookingModalProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomId || "");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [searchPatient, setSearchPatient] = useState<string>("");
  const [openPatientPopover, setOpenPatientPopover] = useState(false);
  const [showQuickAddPatient, setShowQuickAddPatient] = useState(false);

  const handleRequest = useHandleRequest();

  // Set default dates
  useEffect(() => {
    if (open && defaultStartDate) {
      const start = new Date(defaultStartDate);
      setStartDate(start.toISOString().split("T")[0]);
      
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Default 7 kun: 15-21 = 21-15+1 = 7
      setEndDate(end.toISOString().split("T")[0]);
    }
  }, [open, defaultStartDate]);

  // Set default room
  useEffect(() => {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  }, [roomId]);

  // Fetch patients
  const { data: patientsData, isLoading: patientsLoading } =
    useGetAllPatientQuery({
      page: 1,
      limit: 100,
      search: searchPatient,
    });

  // Fetch available rooms
  const { data: availableRoomsData, isLoading: roomsLoading } =
    useGetAvailableRoomsQuery(
      {
        corpus_id: corpusId,
        room_id: roomId || undefined, // Agar roomId berilsa, faqat shu xonani olish
        start_date: startDate ? new Date(startDate).toISOString() : undefined,
        end_date: endDate ? new Date(endDate).toISOString() : undefined,
      },
      { skip: !corpusId || !startDate || !endDate }
    );

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Беморни танланг");
      return;
    }

    if (!selectedRoomId) {
      toast.error("Хонани танланг");
      return;
    }

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
      toast.error("Ўтган санага бронь қилиб бўлмайди");
      return;
    }

    // Tugash sanasi boshlanish sanasidan oldin bo'lmasligi kerak
    if (endDate < startDate) {
      toast.error("Тугаш санаси бошланиш санасидан олдин бўлмаслиги керак");
      return;
    }

    // Vaqtlarni to'g'ri o'rnatish (timezone muammosiz):
    // Boshlanish: kunning boshi (00:00:00)
    // Tugash: kunning oxiri (23:59:59)
    // Masalan: 15-15 dekabr = 15T00:00:00 dan 15T23:59:59 gacha
    const startAt = `${startDate}T00:00:00.000Z`;
    const endAt = `${endDate}T23:59:59.999Z`;

    await handleRequest({
      request: async () =>
        await createBooking({
          patient_id: selectedPatientId,
          room_id: selectedRoomId,
          corpus_id: corpusId,
          start_at: startAt,
          end_at: endAt,
          note: note || undefined,
        }).unwrap(),
      onSuccess: () => {
        toast.success("Бронь муваффақиятли яратилди");
        resetForm();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(
          data?.error?.msg || "Бронь яратишда хатолик юз берди"
        );
      },
    });
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setSelectedRoomId(roomId || "");
    setStartDate("");
    setEndDate("");
    setNote("");
    setSearchPatient("");
  };

  const selectedPatient = patientsData?.data.find(
    (p) => p._id === selectedPatientId
  );

  const selectedRoom = availableRoomsData?.data.find(
    (r) => r._id === selectedRoomId
  );

  // Handle patient created from quick add modal
  const handlePatientCreated = (patientId: string) => {
    setShowQuickAddPatient(false);
    
    if (patientId) {
      // Bemor ID ni o'rnatish
      setSelectedPatientId(patientId);
      // Patient popover ni yopish
      setOpenPatientPopover(false);
      toast.success("Бемор автоматик танланди, энди броньни давом эттиринг!");
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Янги Бронь Яратиш
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Беморни танлаб, хона ва саналарни белгиланг
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="patient" className="flex items-center gap-2 text-sm sm:text-base">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Бемор <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowQuickAddPatient(true);
                }}
                className="text-xs w-full sm:w-auto"
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Янги бемор қўшиш
              </Button>
            </div>
            <Popover open={openPatientPopover} onOpenChange={setOpenPatientPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
                >
                  {selectedPatient ? (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-semibold text-sm sm:text-base">
                        {selectedPatient.fullname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPhoneNumber(selectedPatient.phone)}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm sm:text-base">
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Беморни қидириш...
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full sm:w-[500px] p-0" align="start">
                <Command shouldFilter={false} className="w-full">
                  <CommandInput
                    placeholder="Исм, телефон орқали қидириш..."
                    value={searchPatient}
                    onValueChange={setSearchPatient}
                    className="text-sm sm:text-base"
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty className="text-sm sm:text-base py-6">
                      {patientsLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <span>Юкланмоқда...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <span>Бемор топилмади</span>
                        </div>
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {patientsData?.data.map((patient) => (
                        <CommandItem
                          key={patient._id}
                          value={patient._id}
                          onSelect={() => {
                            setSelectedPatientId(patient._id);
                            setOpenPatientPopover(false);
                          }}
                          className="py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex flex-col flex-1">
                              <span className="font-semibold text-sm sm:text-base">
                                {patient.fullname}
                              </span>
                              <span className="text-xs sm:text-sm text-muted-foreground">
                                {formatPhoneNumber(patient.phone)}
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm sm:text-base">
                Бошланиш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm sm:text-base">
                Тугаш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split("T")[0]}
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Room Selection */}
          {startDate && endDate && (
            <div className="space-y-2">
              <Label htmlFor="room" className="flex items-center gap-2 text-sm sm:text-base">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Хона <span className="text-red-500">*</span>
              </Label>
              {roomsLoading ? (
                <div className="p-3 sm:p-4 text-center">
                  <LoadingSpinner size="sm" text="Хоналар юкланмоқда..." />
                </div>
              ) : availableRoomsData?.data && availableRoomsData.data.length > 0 ? (
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId} disabled={!!roomId}>
                  <SelectTrigger className="text-sm sm:text-base h-10 sm:h-11">
                    <SelectValue placeholder="Хонани танланг" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomsData.data.map((room) => (
                      <SelectItem key={room._id} value={room._id} className="py-2 sm:py-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full">
                          <span className="font-semibold text-sm sm:text-base">{room.room_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                room.available_beds > 0
                                  ? "default"
                                  : "destructive"
                              }
                              className="text-xs"
                            >
                              {room.available_beds} бўш
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatNumber(room.room_price)} сўм
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert className="py-3">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <AlertDescription className="text-xs sm:text-sm">
                    Танланган вақт оралиғида бўш хоналар йўқ
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm sm:text-base">Изоҳ (ихтиёрий)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Махсус диета, аллергия ва бошқа маълумотлар..."
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
              disabled={isCreating}
              className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
            >
              Бекор қилиш
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating ||
                !selectedPatientId ||
                !selectedRoomId ||
                !startDate ||
                !endDate
              }
              className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
            >
              {isCreating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Сақлаш
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Quick Add Patient Modal */}
    <QuickAddPatientModal
      open={showQuickAddPatient}
      onOpenChange={setShowQuickAddPatient}
      onPatientCreated={handlePatientCreated}
    />
    </>
  );
};

export default BookingModal;
