import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import { useAddPatientRoomMutation } from "@/app/api/roomApi";
import { Button } from "@/components/ui/button";
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
import { Card } from "@/components/ui/card";

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
          patient_id: selectedPatient._id,
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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-2xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0 m-0">
          <DialogTitle className="text-xl m-0 p-0">
            Xonaga yangi bemor qo'shish
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 sm:p-6 pt-0">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <h3 className="text-base font-bold">Беморни танланг</h3>
          </div>

          <Button
            type="button"
            onClick={() => setOpenPopover(prev => !prev)}
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
                  {formatPhoneNumber(selectedPatient.phone || 0)}
                </span>
              </div>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <Search className="w-3 h-3 sm:w-4 sm:h-4  " />
                Беморни қидириш...
              </span>
            )}
          </Button>

          {openPopover && <div className="w-full h-full fixed top-0 left-0 bg-black/10 z-20" onClick={() => setOpenPopover(false)}></div>}

          <div className="w-full relative mt-2">
            {openPopover && <Card className="absolute top-0 left-0 w-full z-30 bg-white ">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Исм, телефон орқали қидириш..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="text-sm"
                />
                <CommandList className="max-h-[210px] overflow-y-auto">
                  <CommandEmpty className="text-sm py-6">
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
                    {!isLoading && examinations?.data.map((exam) => (
                      <CommandItem
                        key={exam._id}
                        value={exam._id}
                        onSelect={() => {
                          setSelectedPatient(exam.patient_id);
                          setOpenPopover(false);
                        }}
                        className="py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-semibold text-sm truncate">
                              {exam.patient_id.fullname}
                            </span>
                            <span className="text-xs sm:text-xs text-muted-foreground truncate">
                              {formatPhoneNumber(exam.patient_id.phone)}
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


          <div className="flex items-center gap-3 my-4">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <h3 className="text-base font-bold">
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
