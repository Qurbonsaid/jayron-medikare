import { useGetAllPatientQuery } from "@/app/api/patientApi";
import { AllPatientRes } from "@/app/api/patientApi/types";
import { useAddPatientRoomMutation } from "@/app/api/roomApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { Save, Search, User } from "lucide-react";
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
  const [openPopover, setOpenPopover] = useState(false);
  const handleRequest = useHandleRequest();
  const { id: roomId } = useParams();
  const { data: patientsData, isLoading } = useGetAllPatientQuery({
    page: 1,
    limit: 100,
    search: searchQuery,
  });
  const [addPatientRoom, { isLoading: isAddPatientLoading }] =
    useAddPatientRoomMutation();

  const onSubmit = async () => {
    await handleRequest({
      request: async () =>
        await addPatientRoom({
          id: roomId,
          patient_id: selectedPatient._id,
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
                className="w-full justify-between h-12 sm:h-14 text-sm sm:text-base"
              >
                {selectedPatient ? (
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium text-sm sm:text-base text-primary">
                      {selectedPatient.fullname}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ID: {selectedPatient.patient_id} • {selectedPatient.phone}
                    </span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="truncate">Беморни қидириш...</span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[calc(100vw-2rem)] sm:w-[600px] md:w-[700px] lg:w-[910px] p-0"
              align="start"
              side="bottom"
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Исм, ID ёки телефон орқали қидириш..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="text-sm sm:text-base"
                />
                <CommandList>
                  <CommandEmpty className="p-4 text-sm sm:text-base">
                    Бемор топилмади
                  </CommandEmpty>
                  <CommandGroup>
                    {isLoading ? (
                      <CommandItem disabled className="py-3 justify-center">
                        Юкланмоқда...
                      </CommandItem>
                    ) : (
                      patientsData?.data.map((p) => (
                        <CommandItem
                          key={p._id}
                          value={p._id}
                          onSelect={() => {
                            setSelectedPatient(p);
                            setOpenPopover(false);
                          }}
                          className="py-3"
                        >
                          <div className="flex flex-col w-full">
                            <span className="font-medium text-sm sm:text-base">
                              {p.fullname}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              ID: {p.patient_id} • {p.phone}
                            </span>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
