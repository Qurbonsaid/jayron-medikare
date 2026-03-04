import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Edit, Plus, Save, Trash2, X } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { ExamDataItem } from "@/app/api/examinationApi/types";
import { NeurologicStatusDownloadButton } from "@/components/PDF/ExaminationPDF";
import { useTranslation } from "react-i18next";
import {
  useCreateNeurologicStatusMutation,
  useDeleteNeurologicStatusMutation,
  useGetAllNeurologicStatusQuery,
  useUpdateNeurologicStatusMutation,
} from "@/app/api/neurologicApi/neurologicApi";

interface Props {
  exam: ExamDataItem
  id:string;
}

const NeurologyTab = (prop: Props) => {
  const { t } = useTranslation(["examinations", "common"]);
  const handleRequest = useHandleRequest();

  // ---------------------------------------------------------------------------------------

  const [isAddingNeurologic, setIsAddingNeurologic] = useState(false);
  const [editingNeurologicId, setEditingNeurologicId] = useState<string | null>(
    null,
  );
  const initialNeurologicForm = {
    meningeal_symptoms: "Yaxshi",
    i_para_n_olfactorius: "Yaxshi",
    ii_para_n_opticus: "Yaxshi",
    iii_para_n_oculomotorius: "Yaxshi",
    iv_para_n_trochlearis: "Yaxshi",
    v_para_n_trigeminus: "Yaxshi",
    vi_para_n_abducens: "Yaxshi",
    vii_para_n_fascialis: "Yaxshi",
    viii_para_n_vestibulocochlearis: "Yaxshi",
    ix_para_n_glossopharyngeus: "Yaxshi",
    x_para_n_vagus: "Yaxshi",
    xi_para_n_accessorius: "Yaxshi",
    xii_para_n_hypoglossus: "Yaxshi",
    motor_system: "Yaxshi",
    sensory_sphere: "Yaxshi",
    coordination_sphere: "Yaxshi",
    higher_brain_functions: "Yaxshi",
    syndromic_diagnosis_justification: "Yaxshi",
    topical_diagnosis_justification: "Yaxshi",
  };
  const [neurologicForm, setNeurologicForm] = useState(initialNeurologicForm);

  const { data: neurologicData, refetch: refetchNeurologic } =
    useGetAllNeurologicStatusQuery(
      {
        page: 1,
        limit: 100,
        examination_id: prop.id || "",
      },
      { skip: !prop.id },
    );

  const [createNeurologic, { isLoading: isCreatingNeurologic }] =
    useCreateNeurologicStatusMutation();
  const [updateNeurologic, { isLoading: isUpdatingNeurologic }] =
    useUpdateNeurologicStatusMutation();
  const [deleteNeurologic, { isLoading: isDeletingNeurologic }] =
    useDeleteNeurologicStatusMutation();
  const neurologicFieldLabels: Record<string, string> = {
    meningeal_symptoms: t("examinations:detail.neurologic.meningealSymptoms"),
    i_para_n_olfactorius: t("examinations:detail.neurologic.paraN1"),
    ii_para_n_opticus: t("examinations:detail.neurologic.paraN2"),
    iii_para_n_oculomotorius: t("examinations:detail.neurologic.paraN3_4_6"),
    iv_para_n_trochlearis: t("examinations:detail.neurologic.paraN5"),
    v_para_n_trigeminus: t("examinations:detail.neurologic.paraN7"),
    vi_para_n_abducens: t("examinations:detail.neurologic.paraN8"),
    vii_para_n_fascialis: t("examinations:detail.neurologic.paraN9_10"),
    viii_para_n_vestibulocochlearis: t(
      "examinations:detail.neurologic.paraN11",
    ),
    ix_para_n_glossopharyngeus: t("examinations:detail.neurologic.paraN12"),
    x_para_n_vagus: t("examinations:detail.neurologic.oralAutomatism"),
    xi_para_n_accessorius: t("examinations:detail.neurologic.motorSystem"),
    xii_para_n_hypoglossus: t("examinations:detail.neurologic.sensorySphere"),
    motor_system: t("examinations:detail.neurologic.coordinationSphere"),
    sensory_sphere: t("examinations:detail.neurologic.higherBrainFunctions"),
    coordination_sphere: t(
      "examinations:detail.neurologic.syndromicDiagnosisJustification",
    ),
    higher_brain_functions: t(
      "examinations:detail.neurologic.topicalDiagnosisJustification",
    ),
    syndromic_diagnosis_justification: t(
      "examinations:detail.neurologic.syndromicDiagnosis",
    ),
    topical_diagnosis_justification: t(
      "examinations:detail.neurologic.topicalDiagnosis",
    ),
  };

  const handleAddNeurologic = async () => {
    await handleRequest({
      request: async () => {
        const res = await createNeurologic({
          examination_id: prop.exam._id,
          ...neurologicForm,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.neurologicCreated"));
        setIsAddingNeurologic(false);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t("examinations:detail.neurologicAddError"),
        );
      },
    });
  };

  const handleUpdateNeurologic = async (neurologicId: string) => {
    await handleRequest({
      request: async () => {
        const res = await updateNeurologic({
          id: neurologicId,
          ...neurologicForm,
        }).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.neurologicUpdated"));
        setEditingNeurologicId(null);
        setNeurologicForm(initialNeurologicForm);
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t("examinations:detail.neurologicUpdateError"),
        );
      },
    });
  };

  const handleDeleteNeurologic = async (neurologicId: string) => {
    if (!window.confirm(t("examinations:detail.neurologicDeleteConfirm"))) {
      return;
    }

    await handleRequest({
      request: async () => {
        const res = await deleteNeurologic(neurologicId).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.neurologicDeleted"));
        refetchNeurologic();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t("examinations:detail.neurologicDeleteError"),
        );
      },
    });
  };

  const startEditNeurologic = (neurologic: any) => {
    setEditingNeurologicId(neurologic._id);
    setNeurologicForm({
      meningeal_symptoms: neurologic.meningeal_symptoms || "",
      i_para_n_olfactorius: neurologic.i_para_n_olfactorius || "",
      ii_para_n_opticus: neurologic.ii_para_n_opticus || "",
      iii_para_n_oculomotorius: neurologic.iii_para_n_oculomotorius || "",
      iv_para_n_trochlearis: neurologic.iv_para_n_trochlearis || "",
      v_para_n_trigeminus: neurologic.v_para_n_trigeminus || "",
      vi_para_n_abducens: neurologic.vi_para_n_abducens || "",
      vii_para_n_fascialis: neurologic.vii_para_n_fascialis || "",
      viii_para_n_vestibulocochlearis:
        neurologic.viii_para_n_vestibulocochlearis || "",
      ix_para_n_glossopharyngeus: neurologic.ix_para_n_glossopharyngeus || "",
      x_para_n_vagus: neurologic.x_para_n_vagus || "",
      xi_para_n_accessorius: neurologic.xi_para_n_accessorius || "",
      xii_para_n_hypoglossus: neurologic.xii_para_n_hypoglossus || "",
      motor_system: neurologic.motor_system || "",
      sensory_sphere: neurologic.sensory_sphere || "",
      coordination_sphere: neurologic.coordination_sphere || "",
      higher_brain_functions: neurologic.higher_brain_functions || "",
      syndromic_diagnosis_justification:
        neurologic.syndromic_diagnosis_justification || "",
      topical_diagnosis_justification:
        neurologic.topical_diagnosis_justification || "",
    });
  };

  const cancelEditNeurologic = () => {
    setEditingNeurologicId(null);
    setNeurologicForm(initialNeurologicForm);
  };

  const neurologicStatuses = neurologicData?.data || [];

  return (
    <Fragment>
      <Card>
        <CardHeader>
          <CardTitle>{t("neurologic.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6">
            {/* Add Neurologic Form */}
            {isAddingNeurologic && (
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-4">
                      {t("neurologic.newStatus")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(neurologicForm).map((field) => (
                        <div key={field} className="space-y-2">
                          <Label className="text-sm font-medium">
                            {neurologicFieldLabels[field] || field}
                          </Label>
                          <Textarea
                            placeholder={`${
                              neurologicFieldLabels[field] || field
                            } ${t("neurologic.enterField")}`}
                            value={
                              neurologicForm[
                                field as keyof typeof neurologicForm
                              ]
                            }
                            onChange={(e) =>
                              setNeurologicForm({
                                ...neurologicForm,
                                [field]: e.target.value,
                              })
                            }
                            className="min-h-20 resize-y"
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingNeurologic(false);
                          setNeurologicForm(initialNeurologicForm);
                        }}
                        disabled={isCreatingNeurologic}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t("detail.cancel")}
                      </Button>
                      <Button
                        onClick={handleAddNeurologic}
                        disabled={isCreatingNeurologic}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isCreatingNeurologic
                          ? t("detail.saving")
                          : t("detail.save")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Neurologic Status List */}
            {neurologicStatuses.length > 0
              ? neurologicStatuses.map((neurologic: any, index: number) => (
                  <Card
                    key={neurologic._id}
                    className="border border-primary/10"
                  >
                    <CardContent className="pt-4">
                      {editingNeurologicId === neurologic._id ? (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg mb-4">
                            {t("detail.editExam")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(neurologicForm).map((field) => (
                              <div key={field} className="space-y-2">
                                <Label className="text-sm font-medium">
                                  {neurologicFieldLabels[field] || field}
                                </Label>
                                <Textarea
                                  placeholder={`${
                                    neurologicFieldLabels[field] || field
                                  } ${t("neurologic.enterField")}`}
                                  value={
                                    neurologicForm[
                                      field as keyof typeof neurologicForm
                                    ]
                                  }
                                  onChange={(e) =>
                                    setNeurologicForm({
                                      ...neurologicForm,
                                      [field]: e.target.value,
                                    })
                                  }
                                  className="min-h-20 resize-y"
                                  rows={3}
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 justify-end pt-4">
                            <Button
                              variant="outline"
                              onClick={cancelEditNeurologic}
                              disabled={isUpdatingNeurologic}
                            >
                              <X className="w-4 h-4 mr-2" />
                              {t("detail.cancel")}
                            </Button>
                            <Button
                              onClick={() =>
                                handleUpdateNeurologic(neurologic._id)
                              }
                              disabled={isUpdatingNeurologic}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              {isUpdatingNeurologic
                                ? t("detail.saving")
                                : t("detail.save")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium text-primary">
                                {t("detail.neurologicStatusNumber")} #
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <NeurologicStatusDownloadButton
                                exam={prop.exam}
                                neurologic={neurologic}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditNeurologic(neurologic)}
                                disabled={editingNeurologicId !== null}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteNeurologic(neurologic._id)
                                }
                                disabled={isDeletingNeurologic}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(initialNeurologicForm).map((field) => {
                              const value = neurologic[field];
                              if (!value) return null;
                              return (
                                <div
                                  key={field}
                                  className="bg-muted/50 p-3 rounded-lg"
                                >
                                  <Label className="text-xs text-muted-foreground block mb-1">
                                    {neurologicFieldLabels[field] || field}
                                  </Label>
                                  <p className="text-sm font-medium whitespace-pre-wrap">
                                    {value}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                          {neurologic.created_at && (
                            <div className="mt-4 pt-3 border-t border-primary/10">
                              <p className="text-xs text-muted-foreground">
                                Яратилган:{" "}
                                {new Date(neurologic.created_at).toLocaleString(
                                  "uz-UZ",
                                )}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))
              : !isAddingNeurologic && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      {t("neurologic.noStatusYet")}
                    </p>
                    <Button onClick={() => setIsAddingNeurologic(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t("neurologic.addStatus")}
                    </Button>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default NeurologyTab;
