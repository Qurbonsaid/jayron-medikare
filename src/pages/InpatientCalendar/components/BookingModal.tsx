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
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { Calendar, User, Home, Search, Save, AlertCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  const handleRequest = useHandleRequest();

  // Set default dates
  useEffect(() => {
    if (open && defaultStartDate) {
      const start = new Date(defaultStartDate);
      setStartDate(start.toISOString().split("T")[0]);
      
      const end = new Date(start);
      end.setDate(end.getDate() + 7); // Default 7 days
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

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Тугаш санаси бошланиш санасидан олдин бўлмаслиги керак");
      return;
    }

    await handleRequest({
      request: async () =>
        await createBooking({
          patient_id: selectedPatientId,
          room_id: selectedRoomId,
          corpus_id: corpusId,
          start_at: new Date(startDate).toISOString(),
          end_at: new Date(endDate).toISOString(),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Янги Бронь Яратиш
          </DialogTitle>
          <DialogDescription>
            Беморни танлаб, хона ва саналарни белгиланг
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Бемор <span className="text-red-500">*</span>
            </Label>
            <Popover open={openPatientPopover} onOpenChange={setOpenPatientPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-auto min-h-[56px]"
                >
                  {selectedPatient ? (
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {selectedPatient.fullname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedPatient.phone}
                      </span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Беморни қидириш...
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Исм, телефон орқали қидириш..."
                    value={searchPatient}
                    onValueChange={setSearchPatient}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {patientsLoading ? "Юкланмоқда..." : "Бемор топилмади"}
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
                          className="py-3"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {patient.fullname}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {patient.phone}
                            </span>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Бошланиш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">
                Тугаш санаси <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                min={startDate || new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          {/* Room Selection */}
          {startDate && endDate && (
            <div className="space-y-2">
              <Label htmlFor="room" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Хона <span className="text-red-500">*</span>
              </Label>
              {roomsLoading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" text="Хоналар юкланмоқда..." />
                </div>
              ) : availableRoomsData?.data && availableRoomsData.data.length > 0 ? (
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId} disabled={!!roomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Хонани танланг" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoomsData.data.map((room) => (
                      <SelectItem key={room._id} value={room._id}>
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold">{room.room_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                room.available_beds > 0
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {room.available_beds} бўш
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {room.room_price.toLocaleString()} сўм
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Танланган вақт оралиғида бўш хоналар йўқ
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Изоҳ (ихтиёрий)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Махсус диета, аллергия ва бошқа маълумотлар..."
              rows={3}
            />
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
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
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isCreating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сақлаш
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
