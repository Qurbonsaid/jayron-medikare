import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, FilePlus, Plus, Save, X } from "lucide-react";
import {Fragment, useRef, useState } from "react";
import { useGetManyPrescriptionQuery } from "@/app/api/examinationApi";
import { toast } from "sonner";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { ExamDataItem } from "@/app/api/examinationApi/types";
import AllPrescriptionsDownloadButton from "@/components/PDF/ExaminationPDF";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetAllMedicationsQuery } from "@/app/api/medication";
import { useUpdatePrescriptionMutation } from "@/app/api/prescription/prescriptionApi";
import { PrescriptionForm } from "../types";
import { useTranslation } from "react-i18next";

interface Props {
  exam: ExamDataItem;
}

const PrescriptionsTab = (prop: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["examinations", "common"]);
  const medicationSearchRef = useRef<HTMLInputElement>(null);
  const [medicationSearch, setMedicationSearch] = useState("");
  const { data: medicationsData } = useGetAllMedicationsQuery({
      page: 1,
      limit: 20,
      search: medicationSearch || undefined,
    });
  
    const handleRequest = useHandleRequest();
  
    const [updatePrescription, { isLoading: isUpdatingPrescription }] =
    useUpdatePrescriptionMutation();

    const { data: prescriptions, refetch: refetchPrescriptions } =
        useGetManyPrescriptionQuery(
          {
            page: 1,
            limit: 100,
            patient_id: prop.exam?.patient_id?._id || "",
          },
          { skip: !prop.exam?.patient_id?._id },
        );

    console.log(prescriptions)
  
    const [editingPrescriptionId, setEditingPrescriptionId] = useState<
        string | null
      >(null);
      const [editingPrescriptionDocId, setEditingPrescriptionDocId] = useState<
        string | null
      >(null);
      const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
        medication_id: "",
        frequency: "",
        duration: "",
        instructions: "",
        addons: "",
      });
  
    const cancelEditPrescription = () => {
      setEditingPrescriptionId(null);
      setEditingPrescriptionDocId(null);
      setPrescriptionForm({
        medication_id: "",
        frequency: "",
        duration: "",
        instructions: "",
        addons: "",
      });
      setMedicationSearch("");
    };
  
    const handleUpdatePrescription = async () => {
      if (!editingPrescriptionId || !editingPrescriptionDocId) {
        toast.error(t("examinations:detail.prescriptionDataNotFound"));
        return;
      }
  
      if (!prescriptionForm.medication_id.trim()) {
        toast.error(t("examinations:detail.selectMedicationError"));
        return;
      }
      if (
        !prescriptionForm.frequency ||
        parseInt(prescriptionForm.frequency) <= 0
      ) {
        toast.error(t("examinations:detail.frequencyError"));
        return;
      }
      if (
        !prescriptionForm.duration ||
        parseInt(prescriptionForm.duration) <= 0
      ) {
        toast.error(t("examinations:detail.durationError"));
        return;
      }
  
      await handleRequest({
        request: async () => {
          const res = await updatePrescription({
            id: editingPrescriptionDocId,
            body: {
              items: [
                {
                  _id: editingPrescriptionId,
                  medication_id: prescriptionForm.medication_id,
                  frequency: parseInt(prescriptionForm.frequency),
                  duration: parseInt(prescriptionForm.duration),
                  instructions: prescriptionForm.instructions,
                  addons: prescriptionForm.addons || "",
                },
              ],
            },
          }).unwrap();
          return res;
        },
        onSuccess: () => {
          toast.success(t("examinations:detail.prescriptionUpdated"));
          setEditingPrescriptionId(null);
          setEditingPrescriptionDocId(null);
          setPrescriptionForm({
            medication_id: "",
            frequency: "",
            duration: "",
            instructions: "",
            addons: "",
          });
          setMedicationSearch("");
          refetchPrescriptions();
        },
        onError: (error) => {
          toast.error(
            error?.data?.error?.msg ||
              t("examinations:detail.prescriptionUpdateError"),
          );
        },
      });
    };

    const startEditPrescription = (
    prescription: any,
    prescriptionDocId: string,
  ) => {
    setEditingPrescriptionId(prescription._id);
    setEditingPrescriptionDocId(prescriptionDocId);
    const medId =
      typeof prescription.medication_id === "object" &&
      prescription.medication_id !== null
        ? prescription.medication_id._id
        : prescription.medication_id || "";
    setPrescriptionForm({
      medication_id: medId,
      frequency: prescription.frequency?.toString() || "",
      duration: prescription.duration?.toString() || "",
      instructions: prescription.instructions || "",
      addons: prescription.addons || "",
    });
    setMedicationSearch("");
  };

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{t("detail.prescriptions")}</span>
              {prescriptions?.data?.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({prescriptions.data.length} {t("detail.items")})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {prescriptions?.data.length > 0 && (
                <AllPrescriptionsDownloadButton
                  exam={prop.exam}
                  prescriptions={prescriptions.data}
                />
              )}
              <Button
                size="sm"
                onClick={() => {
                  navigate("/prescription", {
                    state: { examinationId: prop.exam._id },
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("detail.addPrescription")}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prescriptions?.data.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.data.map((prescriptionDoc: any, docIndex: number) => (
                <Card
                  key={prescriptionDoc._id}
                  className="border border-primary/10 bg-primary/5"
                >
                  <CardContent className="pt-4">
                    <div className="mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          {t("detail.prescriptionNum")} #{docIndex + 1} -{" "}
                          {new Date(
                            prescriptionDoc.created_at,
                          ).toLocaleDateString("uz-UZ")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prescriptionDoc.doctor_id?.fullname}
                        </span>
                      </div>
                    </div>
                    {/* Prescription Items */}
                    <div className="space-y-3">
                      {prescriptionDoc.items?.map(
                        (item: any, itemIndex: number) => (
                          <div
                            key={item._id}
                            className="border rounded-lg p-3 bg-background"
                          >
                            {editingPrescriptionId === item._id ? (
                              // Edit mode
                              <div className="space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-semibold text-primary">
                                    {t("detail.editMedication")} #
                                    {itemIndex + 1}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  <div>
                                    <Label className="text-xs">
                                      {t("detail.medication")}
                                    </Label>
                                    <Select
                                      value={prescriptionForm.medication_id}
                                      onValueChange={(value) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          medication_id: value,
                                        })
                                      }
                                      onOpenChange={(open) => {
                                        if (open) {
                                          setTimeout(
                                            () =>
                                              medicationSearchRef.current?.focus(),
                                            0,
                                          );
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue
                                          placeholder={t(
                                            "detail.selectMedication",
                                          )}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className="p-2">
                                          <Input
                                            ref={medicationSearchRef}
                                            placeholder={t("detail.search")}
                                            value={medicationSearch}
                                            onChange={(e) =>
                                              setMedicationSearch(
                                                e.target.value,
                                              )
                                            }
                                            onKeyDown={(e) =>
                                              e.stopPropagation()
                                            }
                                            onFocus={(e) => {
                                              setTimeout(
                                                () => e.target.focus(),
                                                0,
                                              );
                                            }}
                                            className="mb-2"
                                          />
                                        </div>
                                        {medicationsData?.data?.map(
                                          (med: any) => (
                                            <SelectItem
                                              key={med._id}
                                              value={med._id}
                                            >
                                              {med.name}{" "}
                                              {med.dosage && `(${med.dosage})`}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      {t("detail.intakePerDay")}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={prescriptionForm.frequency}
                                      onChange={(e) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          frequency: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                      placeholder={t("detail.timesPerDay")}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      {t("detail.durationDays")}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={prescriptionForm.frequency}
                                      onChange={(e) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          frequency: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                      placeholder={t("detail.howManyDays")}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">
                                      {t("detail.instruction")}
                                    </Label>
                                    <Input
                                      value={prescriptionForm.frequency}
                                      onChange={(e) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          frequency: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                      placeholder={t(
                                        "detail.instructionPlaceholder",
                                      )}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    {t("detail.additional")}
                                  </Label>
                                  <Textarea
                                    value={prescriptionForm.frequency}
                                      onChange={(e) =>
                                        setPrescriptionForm({
                                          ...prescriptionForm,
                                          frequency: e.target.value,
                                        })
                                      }
                                    className="mt-1"
                                    placeholder={t("detail.additionalInfo")}
                                    rows={2}
                                  />
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditPrescription}
                                    disabled={isUpdatingPrescription}
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {t("detail.cancel")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={handleUpdatePrescription}
                                    disabled={isUpdatingPrescription}
                                  >
                                    <Save className="w-3 h-3 mr-1" />
                                    {isUpdatingPrescription
                                      ? t("detail.saving")
                                      : t("detail.save")}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // View mode
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    {t("detail.medication")} #{itemIndex + 1}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        startEditPrescription(
                                          item,
                                          prescriptionDoc._id,
                                        )
                                      }
                                      disabled={editingPrescriptionId !== null}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      {t("detail.medication")}
                                    </Label>
                                    <p className="font-semibold text-sm">
                                      {item.medication_id?.name ||
                                        t("detail.unknown")}{" "}
                                      {item.medication_id?.dosage &&
                                        `(${item.medication_id.dosage})`}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      {t("detail.duration")}
                                    </Label>
                                    <p className="font-semibold text-sm">
                                      {item.duration} {t("detail.days")}
                                    </p>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-muted-foreground">
                                      {t("detail.intake")}
                                    </Label>
                                    <p className="font-semibold text-sm">
                                      {t("detail.timesPerDayCount", {
                                        count: item.frequency,
                                      })}
                                    </p>
                                  </div>
                                  {item.instructions && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        {t("detail.instruction")}
                                      </Label>
                                      <p className="text-sm">
                                        {item.instructions}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {/* Days grid */}
                                {item.days && item.days.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <Label className="text-xs text-muted-foreground mb-1 block">
                                      {t("detail.intakeDays")}
                                    </Label>
                                    <div className="flex flex-wrap gap-1">
                                      {item.days.map((day: any) => (
                                        <div
                                          key={day._id || day.day}
                                          className={`text-xs px-2 py-1 rounded ${
                                            day.date
                                              ? "bg-green-100 text-green-800"
                                              : "bg-gray-100 text-gray-500"
                                          }`}
                                        >
                                          {day.day}
                                          {day.date && (
                                            <span className="ml-1">
                                              (
                                              {new Date(
                                                day.date,
                                              ).toLocaleDateString("uz-UZ", {
                                                day: "2-digit",
                                                month: "2-digit",
                                              })}
                                              )
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {t("detail.noPrescriptions")}
              </p>
              <Button
                onClick={() => {
                  navigate("/prescription", {
                    state: { examinationId: prop.exam._id },
                  });
                }}
              >
                <FilePlus className="w-4 h-4 mr-2" />
                {t("detail.writePrescription")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default PrescriptionsTab;
