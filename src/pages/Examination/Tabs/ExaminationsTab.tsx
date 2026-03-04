import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { getAllDiagnosisRes } from "@/app/api/diagnosisApi/types";
import { useUpdateExamMutation } from "@/app/api/examinationApi";
import { toast } from "sonner";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { ExamDataItem } from "@/app/api/examinationApi/types";
import { useTranslation } from "react-i18next";
import { EditForm } from "../types";

interface Props {
  isEditMode: boolean;
  editForm: EditForm;
  setEditForm: (val: EditForm) => void;
  accumulatedDiagnoses: getAllDiagnosisRes["data"];
  setAccumulatedDiagnoses: Dispatch<SetStateAction<getAllDiagnosisRes['data']>>;
  diagnosisSearch: string;
  setDiagnosisSearch: (val: string) => void;
  hasMoreDiagnoses: boolean;
  isFetchingDiagnosis: boolean;
  diagnosisPage: number;
  setDiagnosisPage: (val: SetStateAction<number>) => void;
	setIsEditMode:(val: SetStateAction<boolean>) => void;
	exam:ExamDataItem;
	examRefetch:() => void;
}

const ExaminationsTab = (prop: Props) => {
const { t } = useTranslation(["examinations", "common"]);
	const [openDiagnosisCombobox, setOpenDiagnosisCombobox] = useState(false);

  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation();
	const handleRequest = useHandleRequest();

  const handleDiagnosisScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isBottom && prop.hasMoreDiagnoses && !prop.isFetchingDiagnosis) {
      prop.setDiagnosisPage((prev) => prev + 1);
    }
  };

  const handleCancelEdit = () => {
    prop.setIsEditMode(false);
    const diagnosisIds = Array.isArray(prop.exam.diagnosis)
      ? prop.exam.diagnosis.map((d: any) => (typeof d === "object" ? d._id : d))
      : [];
    prop.setEditForm({
      complaints: prop.exam.complaints || "",
      description: prop.exam.description || "",
      diagnosis: diagnosisIds,
      treatment_type: prop.exam.treatment_type || "ambulator",
    });
  };

  const handleUpdate = async () => {
    if (!prop.editForm.complaints.trim()) {
      toast.error(t("examinations:detail.enterComplaint"));
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await updateExam({
          id: prop.exam._id,
          body: {
            patient_id: prop.exam.patient_id._id,
            diagnosis: prop.editForm.diagnosis,
            complaints: prop.editForm.complaints,
            description: prop.editForm.description,
            treatment_type: prop.editForm.treatment_type,
          },
        });
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.examUpdated"));
        prop.setIsEditMode(false);
        prop.examRefetch();
      },
      onError: (err) => {
        toast.error(err?.error?.msg || t("examinations:detail.errorOccurred"));
      },
    });
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <CardTitle>{t("examinations:detail.examInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          {prop.isEditMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("examinations:detail.complaint")}</Label>
                <Textarea
                  placeholder={t("examinations:detail.enterComplaint")}
                  value={prop.editForm.complaints}
                  onChange={(e) =>
                    prop.setEditForm({
                      ...prop.editForm,
                      complaints: e.target.value,
                    })
                  }
                  className="min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("detail.diagnosis")}</Label>
                <Popover
                  open={openDiagnosisCombobox}
                  onOpenChange={setOpenDiagnosisCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDiagnosisCombobox}
                      className="w-full justify-between font-normal h-auto"
                    >
                      <div className="flex flex-wrap gap-2 w-full">
                        {prop.editForm.diagnosis.length > 0
                          ? prop.accumulatedDiagnoses
                              .filter((d: getAllDiagnosisRes["data"][0]) =>
                                prop.editForm.diagnosis.includes(d._id),
                              )
                              .map((d: any) => (
                                <span
                                  key={d._id}
                                  className="inline-block bg-primary/20 text-primary px-2 py-1 rounded text-xs"
                                >
                                  {d.name}
                                </span>
                              ))
                          : t("detail.selectDiagnosis")}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder={t("detail.searchDiagnosis")}
                        value={prop.diagnosisSearch}
                        onValueChange={prop.setDiagnosisSearch}
                      />
                      <CommandList onScroll={handleDiagnosisScroll}>
                        <CommandEmpty>
                          {prop.isFetchingDiagnosis && prop.diagnosisPage === 1
                            ? t("common:loading")
                            : t("detail.noDiagnosisFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {prop.accumulatedDiagnoses.map((diagnosis: any) => {
                            const isSelected = prop.editForm.diagnosis.includes(
                              diagnosis._id,
                            );
                            return (
                              <CommandItem
                                key={diagnosis._id}
                                value={diagnosis._id}
                                onSelect={() => {
                                  const newDiagnosis = isSelected
                                    ? prop.editForm.diagnosis.filter(
                                        (id) => id !== diagnosis._id,
                                      )
                                    : [...prop.editForm.diagnosis, diagnosis._id];

                                  prop.setEditForm({
                                    ...prop.editForm,
                                    diagnosis: newDiagnosis,
                                  });
                                  prop.setDiagnosisSearch("");
                                }}
                                className={cn(
                                  isSelected && "bg-primary/10 hover:bg-primary/15",
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {diagnosis.name}
                              </CommandItem>
                            );
                          })}
                          {prop.hasMoreDiagnoses && (
                            <CommandItem
                              disabled
                              className="justify-center text-xs text-muted-foreground"
                            >
                              {prop.isFetchingDiagnosis
                                ? t("common:loading")
                                : t("detail.searchDiagnosis")}
                            </CommandItem>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>{t("detail.recommendation")}</Label>
                <Textarea
                  placeholder={t("detail.enterRecommendationPlaceholder")}
                  value={prop.editForm.description}
                  onChange={(e) =>
                    prop.setEditForm({
                      ...prop.editForm,
                      description: e.target.value,
                    })
                  }
                  className="min-h-24"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  {t("common:cancel")}
                </Button>
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? t("common:saving") : t("common:save")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">
                  {t("examinations:detail.complaint")}
                </Label>
                <p className="font-medium bg-muted p-3 rounded-md mt-1">
                  {prop.exam.complaints || t("examinations:detail.notEntered")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t("examinations:detail.diagnosis")}
                </Label>
                <p className="font-medium bg-muted p-3 rounded-md mt-1">
                  {Array.isArray(prop.exam.diagnosis) && prop.exam.diagnosis.length > 0
                    ? prop.exam.diagnosis
                        .map((d) => (typeof d === "object" ? d.name : d))
                        .join(", ")
                    : t("examinations:detail.notEntered")}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t("detail.recommendation")}
                </Label>
                <p className="font-medium bg-muted p-3 rounded-md mt-1">
                  {prop.exam.description || t("detail.notEntered")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Info Card */}
      {prop.exam.rooms && prop.exam.rooms.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("detail.roomInfo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prop.exam.rooms.map((room: ExamDataItem['rooms'][0],) => (
                <Card key={room._id} className="border border-primary/10">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          {t("detail.roomName")}
                        </Label>
                        <p className="font-medium mt-1">
                          {room.room_name || t("detail.unknown")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          {t("detail.floor")}
                        </Label>
                        <p className="font-medium mt-1">
                          {room.floor_number || t("detail.unknown")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          {t("detail.price")}
                        </Label>
                        <p className="font-medium mt-1">
                          {room.room_price
                            ? `${room.room_price.toLocaleString()} ${t(
                                "detail.sum",
                              )}`
                            : t("detail.unknown")}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          {t("detail.duration")}
                        </Label>
                        <p className="font-medium mt-1">
                          {room.start_date
                            ? new Date(room.start_date).toLocaleDateString(
                                "uz-UZ",
                              )
                            : t("detail.unknown")}
                          {room.end_date && (
                            <>
                              {" - "}
                              {new Date(room.end_date).toLocaleDateString(
                                "uz-UZ",
                              )}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </React.Fragment>
  );
};

export default ExaminationsTab;
