import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { formatPhoneNumber } from "@/lib/utils";
import { Search, User, Calendar } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";
import { ExamDataItem } from "@/app/api/examinationApi/types";
import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import { Card } from "@/components/ui/card";

interface PatientSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PatientSearchModal = ({
  open,
  onOpenChange,
}: PatientSearchModalProps) => {
  const { t } = useTranslation("inpatient");
  const [searchExamsQuery, setSearchExamsQuery] = useState<string>("");
  const navigate = useNavigate();

  const { data: examinations, isLoading: isExaminationsLoading } =
    useGetAllExamsQuery({
      page: 1,
      limit: 100,
      search: searchExamsQuery || undefined,
      status: "pending",
      is_roomed: true,
      treatment_type: "stasionar",
    });

  const handlePatientClick = (selExam: ExamDataItem) => {
    onOpenChange(false);
    setSearchExamsQuery("")
    const { rooms } = selExam as ExamDataItem;
    const roomId = rooms[rooms.length - 1]?.room_id;
    if (roomId) navigate(`/room/${roomId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl flex flex-col p-4 sm:p-6" aria-describedby={undefined}>
        <DialogHeader className="space-y-2 sm:space-y-3 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            {t("searchPatient")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0">
          <Card>

            <Command shouldFilter={false} className="h-full w-full">
              <CommandInput
                placeholder={t("searchByNameOrPhone")}
                value={searchExamsQuery}
                onValueChange={setSearchExamsQuery}
                className="text-sm sm:text-base"
              />
              <CommandList className="max-h-full overflow-y-auto">
                <CommandEmpty className="text-sm sm:text-base py-8">
                  {isExaminationsLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <LoadingSpinner size="lg" />
                      <span className="text-muted-foreground">{t("patientsLoading")}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <User className="w-12 h-12 opacity-40" />
                      <div className="text-center">
                        <p className="font-semibold">{t("patientNotFound")}</p>
                        <p className="text-xs mt-1">{t("tryDifferentSearch")}</p>
                      </div>
                    </div>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {!isExaminationsLoading && examinations?.data.map((exam) => (
                    <CommandItem
                      key={exam._id}
                      value={exam._id}
                      onSelect={() => handlePatientClick(exam)}
                      className="py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-sm sm:text-base">
                            {exam.patient_id.fullname}
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {formatPhoneNumber(exam.patient_id.phone)}
                          </span>
                          <span className="text-xs sm:text-sm font-medium">
                            {exam.rooms[exam.rooms.length - 1]?.floor_number || 0}-{t("floor")},{" "}
                            {exam.rooms[exam.rooms.length - 1]?.room_name || t("unknown")}
                          </span>
                        </div>
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSearchModal;
