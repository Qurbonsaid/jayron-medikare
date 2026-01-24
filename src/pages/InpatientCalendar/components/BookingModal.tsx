import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
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
import { useCreateBookingMutation, useGetAvailableRoomsQuery } from "@/app/api/bookingApi";
import { formatPhoneNumber, formatNumber } from "@/lib/utils";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { Home, Search, Save, AlertCircle, UserPlus } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuickAddPatientModal } from "./QuickAddPatientModal";
import { Card } from "@/components/ui/card";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corpusId: string;
  roomId?: string | null;
  defaultStartDate?: string;
  defaultBedNumber?: number; // Katak bosilganda avtomatik tanlanadi
}

export const BookingModal = ({
  open,
  onOpenChange,
  corpusId,
  roomId,
  defaultStartDate,
  defaultBedNumber,
}: BookingModalProps) => {
  const { t } = useTranslation("inpatient");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>(roomId || "");
  const [selectedBedNumber, setSelectedBedNumber] = useState<number>(defaultBedNumber || 0);
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

  // Set default bed number
  useEffect(() => {
    if (open && defaultBedNumber) {
      setSelectedBedNumber(defaultBedNumber);
    }
  }, [open, defaultBedNumber]);

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
      toast.error(t("booking.selectPatient"));
      return;
    }

    if (!selectedRoomId) {
      toast.error(t("booking.selectRoom"));
      return;
    }

    if (!selectedBedNumber || selectedBedNumber < 1) {
      toast.error(t("booking.selectBedNumber"));
      return;
    }

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
      toast.error(t("booking.cannotBookPastDate"));
      return;
    }

    // Tugash sanasi boshlanish sanasidan oldin bo'lmasligi kerak
    if (endDate < startDate) {
      toast.error(t("booking.endDateBeforeStartDate"));
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
          bed_number: selectedBedNumber,
          note: note || undefined,
        }).unwrap(),
      onSuccess: () => {
        toast.success(t("booking.createSuccess"));
        resetForm();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(
          data?.error?.msg || t("booking.createError")
        );
      },
    });
  };

  const resetForm = () => {
    setSelectedPatientId("");
    setSelectedRoomId(roomId || "");
    setSelectedBedNumber(defaultBedNumber || 0);
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
      toast.success(t("booking.patientAutoSelected"));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              {t("booking.createNewBooking")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Patient Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {roomsLoading ? (
                <div className="animate-pulse space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 sm:w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 sm:w-28"></div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 w-full">
                  <span className="font-semibold text-sm sm:text-base">{availableRoomsData ? availableRoomsData.data[0]?.room_name : "noma'lum"}</span>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        availableRoomsData && availableRoomsData.data[0]?.available_beds > 0
                          ? "default"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {availableRoomsData ? availableRoomsData.data[0]?.available_beds : t("common.unknown")} {t("booking.available")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatNumber(availableRoomsData ? availableRoomsData.data[0]?.room_price : 0)} сўм
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowQuickAddPatient(true);
                }}
                className="text-xs w-full sm:w-auto"
              >
                <UserPlus className="w-2 h-2 mr-1" />
                {t("booking.addPatient")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient" className="flex items-center gap-2 text-sm">
                {t("booking.patient")} <span className="text-red-500">*</span>
              </Label>

              <div className="w-full">
                <Button
                  type="button"
                  onClick={() => setOpenPatientPopover(prev => !prev)}
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-[48px] sm:min-h-[56px] text-sm"
                >
                  {selectedPatient ? (
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-semibold text-sm">
                        {selectedPatient.fullname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPhoneNumber(selectedPatient.phone)}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      <Search className="w-3 h-3 sm:w-4 sm:h-4  " />
                      {t("booking.searchPatient")}
                    </span>
                  )}
                </Button>
                {openPatientPopover && <div className="w-full h-full fixed top-0 left-0 bg-black/10 z-20" onClick={() => setOpenPatientPopover(false)}></div>}
                <div className="w-full relative mt-2">
                  {openPatientPopover && <Card className="absolute top-0 left-0 w-full z-30 bg-white ">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t("booking.searchByNamePhone")}
                        value={searchPatient}
                        onValueChange={setSearchPatient}
                        className="text-sm"
                      />
                      <CommandList className="max-h-[210px] overflow-y-auto">
                        <CommandEmpty className="text-sm py-6">
                          {patientsLoading ? (
                            <div className="flex flex-col items-center gap-2">
                              <span>{t("common.loading")}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                              <span>{t("booking.patientNotFound")}</span>
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
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-semibold text-sm truncate">
                                    {patient.fullname}
                                  </span>
                                  <span className="text-xs sm:text-xs text-muted-foreground truncate">
                                    {formatPhoneNumber(patient.phone)}
                                  </span>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </Card>}
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm">
                  {t("booking.startDate")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="text-sm h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm">
                  {t("booking.endDate")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="text-sm h-10 sm:h-11"
                />
              </div>
            </div>

            {/* Bed Number Selection */}
            <div className="space-y-2">
              <Label htmlFor="bed_number" className="text-sm">
                {t("booking.bedNumber")} <span className="text-red-500">*</span>
              </Label>
              {roomsLoading ? (
                <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
              ) : availableRoomsData?.data?.[0]?.patient_capacity ? (
                <Select 
                  value={selectedBedNumber ? selectedBedNumber.toString() : ""} 
                  onValueChange={(value) => setSelectedBedNumber(parseInt(value, 10))}
                >
                  <SelectTrigger className="text-sm h-10 sm:h-11">
                    <SelectValue placeholder={t("booking.selectBedNumber")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: availableRoomsData.data[0].patient_capacity },
                      (_, i) => i + 1
                    ).map((bedNum) => {
                      // Availability ma'lumotlarini tekshirish
                      const bedAvailability = availableRoomsData.data[0].availability?.find(
                        (a) => a.bed === bedNum
                      );
                      const isAvailable = bedAvailability?.status === "available";
                      
                      return (
                        <SelectItem 
                          key={bedNum} 
                          value={bedNum.toString()} 
                          className="py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {bedNum}-{t("calendar.bed")}
                            </span>
                            <Badge 
                              variant={isAvailable ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {isAvailable ? t("calendar.free") : t("calendar.booked")}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded">
                  {t("booking.selectDatesFirst")}
                </div>
              )}
            </div>

            {/* Room Selection */}
            {/* {startDate && endDate && (
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
            )} */}

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
                disabled={isCreating}
                className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  isCreating ||
                  !selectedPatientId ||
                  !selectedRoomId ||
                  !selectedBedNumber ||
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
                    {t("common.save")}
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
