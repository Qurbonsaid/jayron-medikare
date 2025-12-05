import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGetAllPatientQuery } from "@/app/api/patientApi";
import { formatPhoneNumber } from "@/lib/utils";
import { Search, User, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface PatientSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientSelect: (patientId: string) => void;
}

export const PatientSearchModal = ({
  open,
  onOpenChange,
  onPatientSelect,
}: PatientSearchModalProps) => {
  const [searchPatient, setSearchPatient] = useState<string>("");

  // Fetch patients
  const { data: patientsData, isLoading: patientsLoading } =
    useGetAllPatientQuery({
      page: 1,
      limit: 100,
      search: searchPatient,
    });

  const handlePatientClick = (patientId: string) => {
    onPatientSelect(patientId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[400px] flex flex-col p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            Бемор Қидириш
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Беморни исми ёки телефон рақами орқали қидиринг
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          <Command shouldFilter={false} className="h-full w-full">
            <CommandInput
              placeholder="Исм, телефон орқали қидириш..."
              value={searchPatient}
              onValueChange={setSearchPatient}
              className="text-sm sm:text-base"
            />
            <CommandList className="max-h-full overflow-y-auto">
              <CommandEmpty className="text-sm sm:text-base py-8">
                {patientsLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <LoadingSpinner size="lg" />
                    <span className="text-muted-foreground">Беморлар юкланмоқда...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <User className="w-12 h-12 opacity-40" />
                    <div className="text-center">
                      <p className="font-semibold">Бемор топилмади</p>
                      <p className="text-xs mt-1">Бошқа исм ёки рақам билан қидириб кўринг</p>
                    </div>
                  </div>
                )}
              </CommandEmpty>
              <CommandGroup>
                {patientsData?.data.map((patient) => (
                  <CommandItem
                    key={patient._id}
                    value={patient._id}
                    onSelect={() => handlePatientClick(patient._id)}
                    className="py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold text-sm sm:text-base">
                          {patient.fullname}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatPhoneNumber(patient.phone)}
                        </span>
                      </div>
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchModal;
