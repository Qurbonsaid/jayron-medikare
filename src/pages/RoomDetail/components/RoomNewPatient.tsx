import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import { useGetAllPatientQuery } from "@/app/api/patientApi";
import { AllPatientRes } from "@/app/api/patientApi/types";
import { useAddPatientRoomMutation } from "@/app/api/roomApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPhoneNumber } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { Clock, Save, Search, User } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

interface RoomNewPatientProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoomNewPatient = ({ open, onOpenChange }: RoomNewPatientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [estimatedLeaveTime, setEstimatedLeaveTime] = useState<string>("");
  const [openPopover, setOpenPopover] = useState(false);
  const handleRequest = useHandleRequest();
  const { id: roomId } = useParams();
  const { data: examinations, isLoading } = useGetAllExamsQuery({
    page: 1,
    limit: 100,
    search: searchQuery || undefined,
    status: "pending",
    is_roomed: false,
    treatment_type: "stasionar",
  });

  const [addPatientRoom, { isLoading: isAddPatientLoading }] =
    useAddPatientRoomMutation();

  const onSubmit = async () => {
    await handleRequest({
      request: async () =>
        await addPatientRoom({
          id: roomId,
          patient_id: selectedPatient.patient_id._id,
          estimated_leave_time: estimatedLeaveTime,
        }).unwrap(),
      onSuccess: () => {
        toast.success("Бемор муваффақиятли қўшилди");
        setSelectedPatient(null);
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Қўшишда хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            Xonaga yangi bemor qo'shish
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <h3 className="text-base sm:text-lg font-bold">Беморни танланг</h3>
          </div>
          <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPopover}
                className="w-full justify-between h-auto min-h-[48px] sm:min-h-[56px] text-sm sm:text-base"
              >
                {selectedPatient ? (
                  <div className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold text-sm sm:text-base">
                      {selectedPatient.patient_id.fullname}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatPhoneNumber(selectedPatient.patient_id.phone)}
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
                  placeholder="Исм, ID ёки телефон орқали қидириш..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="text-sm sm:text-base"
                />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty className="text-sm sm:text-base py-6">
                    {isLoading ? (
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
                    {!isLoading && examinations?.data.map((e) => (
                      <CommandItem
                        key={e._id}
                        value={e._id}
                        onSelect={() => {
                          setSelectedPatient(e);
                          setOpenPopover(false);
                        }}
                        className="py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex flex-col flex-1">
                            <span className="font-semibold text-sm sm:text-base">
                              {e.patient_id.fullname}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {formatPhoneNumber(e.patient_id.phone)}
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
          <div className="flex items-center gap-3 my-4">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-bold">
              Ketish vaqtini tanlang
            </h3>
          </div>
          <Input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            className="mt-4 w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base"
            placeholder="Estimated Leave Time"
            value={estimatedLeaveTime}
            onChange={(e) => setEstimatedLeaveTime(e.target.value)}
          />
        </div>

        <DialogFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Бекор қилиш
          </Button>
          <Button
            type="submit"
            disabled={isAddPatientLoading}
            onClick={onSubmit}
            className="gradient-primary w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isAddPatientLoading ? "Loading..." : "Сақлаш"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
