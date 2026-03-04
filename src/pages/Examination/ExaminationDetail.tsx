import { useGetAllDiagnosisQuery } from "@/app/api/diagnosisApi/diagnosisApi";
import {
  useCompleteExamsMutation,
  useDeleteExamMutation,
  useGetManyServiceQuery,
  useGetOneExamQuery,
} from "@/app/api/examinationApi/examinationApi";
import { MedicalImage } from "@/app/api/radiologyApi/types";
import { useGetAllServiceQuery } from "@/app/api/serviceApi/serviceApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyPartConstants } from "@/constants/BodyPart";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { useRouteActions } from "@/hooks/RBS/useRoutePermission";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Edit,
  Eye,
  FilePlus,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ExaminationInfoDownloadButton,
} from "../../components/PDF/ExaminationPDF";
import { ViewMedicalImage } from "../Radiology/components";
import ExaminationsTab from "./Tabs/ExaminationsTab";
import { getAllDiagnosisRes } from "@/app/api/diagnosisApi/types";
import PrescriptionsTab from "./Tabs/PrescriptionsTab";
import ServiceTab from "./Tabs/ServiceTab";
import { EditForm, ServiceDay, ServiceItem } from "./types";
import NeurologyTab from "./Tabs/NeurologyTab";

// Body part labels will be loaded from translations
const getBodyPartLabels = (
  t: (key: string) => string,
): Record<string, string> => ({
  [BodyPartConstants.HEAD]: t("examinations:detail.bodyParts.head"),
  [BodyPartConstants.NECK]: t("examinations:detail.bodyParts.neck"),
  [BodyPartConstants.CHEST]: t("examinations:detail.bodyParts.chest"),
  [BodyPartConstants.ABDOMEN]: t("examinations:detail.bodyParts.abdomen"),
  [BodyPartConstants.PELVIS]: t("examinations:detail.bodyParts.pelvis"),
  [BodyPartConstants.SPINE]: t("examinations:detail.bodyParts.spine"),
  [BodyPartConstants.ARM]: t("examinations:detail.bodyParts.arm"),
  [BodyPartConstants.LEG]: t("examinations:detail.bodyParts.leg"),
  [BodyPartConstants.KNEE]: t("examinations:detail.bodyParts.knee"),
  [BodyPartConstants.SHOULDER]: t("examinations:detail.bodyParts.shoulder"),
  [BodyPartConstants.HAND]: t("examinations:detail.bodyParts.hand"),
  [BodyPartConstants.FOOT]: t("examinations:detail.bodyParts.foot"),
});

const getRoomType = (t: (key: string) => string) => ({
  stasionar: t("examinations:detail.roomTypes.stasionar"),
  ambulator: t("examinations:detail.roomTypes.ambulator"),
});

const getStatusMap = (
  t: (key: string) => string,
): Record<string, { label: string; bgColor: string }> => ({
  pending: {
    label: t("examinations:detail.statuses.pending"),
    bgColor: "bg-yellow-500",
  },
  active: {
    label: t("examinations:detail.statuses.active"),
    bgColor: "bg-blue-500",
  },
  completed: {
    label: t("examinations:detail.statuses.completed"),
    bgColor: "bg-green-500",
  },
});

export const generateDays = (
    duration: number,
    prevDays: ServiceDay[] = [],
    startDate: Date | null = null,
  ): ServiceDay[] => {
    const safeDuration = Math.max(0, Math.min(duration || 0, 60));
    const baseDate = startDate || new Date();
    return Array.from({ length: safeDuration }, (_, idx) => {
      const existing = prevDays[idx];
      if (existing) return existing;

      const dayDate = new Date(baseDate);
      dayDate.setDate(dayDate.getDate() + idx);
      return {
        day: idx + 1,
        date: dayDate,
      };
    });
  };

const ExaminationDetail = () => {
  const { t } = useTranslation(["examinations", "common"]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Get translated labels
  const bodyPartLabels = getBodyPartLabels(t);
  const roomType = getRoomType(t);
  const statusMap = getStatusMap(t);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [activeTab, setActiveTab] = useState("examination");
  const [editForm, setEditForm] = useState<EditForm>({
    complaints: "",
    description: "",
    diagnosis: [] as string[],
    treatment_type: "ambulator" as "stasionar" | "ambulator",
  });

  const {
    canRead: canReadExamination,
    canUpdate,
    canDelete,
  } = useRouteActions("/examination/:id");
  const { canRead: canReadPrescription } = useRouteActions("/prescription");
  const { canRead: canReadServices } = useRouteActions("/service");
  const { canRead: canReadVisits } = useRouteActions("/lab-results");
  const { canRead: canReadImages } = useRouteActions("/radiology");
  const tabPermissions: Record<string, boolean> = {
    examination: canReadExamination,
    prescriptions: canReadPrescription,
    services: canReadServices,
    visits: canReadVisits,
    images: canReadImages,
    neurologic: canReadExamination,
  };

  

  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceStartDate, setServiceStartDate] = useState<Date>(new Date());
  const [serviceDuration, setServiceDuration] = useState(7); // Default 7, min 0
  const [serviceSearch, setServiceSearch] = useState("");
  const [debouncedServiceSearch, setDebouncedServiceSearch] = useState("");
  const [servicePage, setServicePage] = useState(1);

  // Refs for autofocus
  

  // Refs to track initialization
  const serviceInitializedRef = useRef(false);

  // Debounce service search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServiceSearch(serviceSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [serviceSearch]);

  // Prescription states
  

  // Diagnosis combobox state

  const [diagnosisSearch, setDiagnosisSearch] = useState("");
  const [debouncedDiagnosisSearch, setDebouncedDiagnosisSearch] = useState("");
  const [diagnosisPage, setDiagnosisPage] = useState(1);
  const [accumulatedDiagnoses, setAccumulatedDiagnoses] = useState<
    getAllDiagnosisRes["data"]
  >([]);
  const [hasMoreDiagnoses, setHasMoreDiagnoses] = useState(true);

  // Neurologic status states
  

  // Debounce diagnosis search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDiagnosisSearch(diagnosisSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [diagnosisSearch]);

  // Reset diagnosis pagination on search
  useEffect(() => {
    setDiagnosisPage(1);
    setAccumulatedDiagnoses([]);
    setHasMoreDiagnoses(true);
  }, [debouncedDiagnosisSearch]);

  // Fetch examination details
  const {
    data: examData,
    isLoading,
    refetch: examRefetch,
  } = useGetOneExamQuery(id || "", {
    skip: !id,
  });

  const exam = examData?.data;

  // Fetch diagnoses with server-side search
  const { data: diagnosisData, isFetching: isFetchingDiagnosis } =
    useGetAllDiagnosisQuery({
      page: diagnosisPage,
      limit: 20,
      search: debouncedDiagnosisSearch.trim() || undefined,
    });

  // Accumulate diagnoses for infinite scroll
  useEffect(() => {
    if (diagnosisData?.data) {
      if (diagnosisPage === 1) {
        setAccumulatedDiagnoses(diagnosisData.data);
      } else {
        setAccumulatedDiagnoses((prev) => {
          const newItems = diagnosisData.data.filter(
            (newItem: any) => !prev.some((item) => item._id === newItem._id),
          );
          return [...prev, ...newItems];
        });
      }
      const totalPages = diagnosisData.pagination?.pages || 1;
      setHasMoreDiagnoses(diagnosisPage < totalPages);
    }
  }, [diagnosisData, diagnosisPage]);

  // Fetch all service types with search and pagination
  const serviceQueryParams = {
    page: servicePage,
    limit: 20,
    search: debouncedServiceSearch.trim() || undefined,
    code: undefined,
    is_active: undefined,
    min_price: undefined,
    max_price: undefined,
  };
  const { data: servicesData, isFetching: isFetchingServices } =
    useGetAllServiceQuery(serviceQueryParams);

  const [selectedServicesCache, setSelectedServicesCache] = useState<{
    [key: string]: { _id: string; name: string; price: number };
  }>({});

  // Service types from API
  

  // Cache selected services for lookup
  useEffect(() => {
    if (servicesData?.data && servicesData.data.length > 0) {
      const newCacheItems: {
        [key: string]: { _id: string; name: string; price: number };
      } = {};
      servicesData.data.forEach(
        (service: { _id: string; name: string; price: number }) => {
          newCacheItems[service._id] = service;
        },
      );
      setSelectedServicesCache((prev) => ({ ...prev, ...newCacheItems }));
    }
  }, [servicesData?.data]);

  // Reset pagination when search changes
  useEffect(() => {
    setServicePage(1);
  }, [debouncedServiceSearch]);

  // Fetch services by patient_id
  const { data: patientServicesData, refetch: refetchPatientServices } =
    useGetManyServiceQuery(
      {
        page: 1,
        limit: 100,
        patient_id: exam?.patient_id?._id || "",
      },
      { skip: !exam?.patient_id?._id },
    );
  const patientServices = patientServicesData?.data || [];
  

  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation();
  const [completeExam, { isLoading: isCompleting }] =
    useCompleteExamsMutation();
  
  
  
  const handleRequest = useHandleRequest();

  // Update serviceDuration and serviceStartDate based on existing services when adding new services
  useEffect(() => {
    // Only initialize once when component mounts or patientServices first loads
    if (serviceInitializedRef.current || !patientServicesData) return;

    if (patientServices.length > 0) {
      const durations = patientServices
        .flatMap(
          (doc: { items?: Array<{ duration?: number; days?: unknown[] }> }) =>
            doc.items?.map((item) => item.duration || item.days?.length || 0) ||
            [],
        )
        .filter((d: number) => d > 0);
      if (durations.length > 0) {
        const maxDuration = Math.max(...durations);
        setServiceDuration(maxDuration);
      }

      // Get start date from existing services (first date found in days)
      const firstDate = patientServices
        .flatMap((doc: any) => doc.items || [])
        .flatMap((item: any) => item.days || [])
        .map((day: any) => day.date)
        .filter(
          (date: any): date is Date | string =>
            date !== null && date !== undefined,
        )
        .sort((a: any, b: any) => {
          const dateA = new Date(a).getTime();
          const dateB = new Date(b).getTime();
          return dateA - dateB;
        })[0];

      if (firstDate) {
        setServiceStartDate(new Date(firstDate));
      }
      serviceInitializedRef.current = true;
    } else if (patientServices.length === 0) {
      // Reset to default 7 if no existing services
      setServiceDuration(7);
      setServiceStartDate(new Date());
      serviceInitializedRef.current = true;
    }
  }, [patientServices, patientServicesData]);

  // Update form when exam changes
  useEffect(() => {
    if (exam) {
      const diagnosisIds = Array.isArray(exam.diagnosis)
        ? exam.diagnosis.map((d: any) => (typeof d === "object" ? d._id : d))
        : [];
      setEditForm({
        complaints: exam.complaints || "",
        description: exam.description || "",
        diagnosis: diagnosisIds,
        treatment_type: exam.treatment_type || "ambulator",
      });
    }
  }, [exam?._id]);

  const handleEdit = () => {
    setIsEditMode(true);
    setActiveTab("examination");
  };

  const handleDelete = async () => {
    await handleRequest({
      request: async () => {
        const res = await deleteExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.examDeleted"));
        navigate(-1);
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t("examinations:detail.errorOccurred"),
        );
      },
    });
  };

  const handleComplete = async () => {
    await handleRequest({
      request: async () => {
        const res = await completeExam(exam._id).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.examCompleted"));
        examRefetch();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg || t("examinations:detail.errorOccurred"),
        );
      },
    });
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("examinations:detail.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {t("examinations:detail.notFound")}
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("examinations:detail.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Patient Info Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("detail.patientInfo")}</CardTitle>
            <ExaminationInfoDownloadButton
              exam={exam}
              services={patientServices}
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">
                  {t("detail.name")}
                </Label>
                <p className="font-medium mt-1">{exam.patient_id?.fullname}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t("detail.phone")}
                </Label>
                <p className="font-medium mt-1">{exam.patient_id?.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t("detail.doctor")}
                </Label>
                <p className="font-medium mt-1">{exam.doctor_id?.fullname}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">
                  {t("detail.date")}
                </Label>
                <p className="font-medium mt-1">
                  {new Date(exam.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </div>
              <div className="flex items-center">
                <Label className="text-muted-foreground mr-5">
                  {t("type")} :
                </Label>
                {isEditMode ? (
                  <Select
                    value={editForm.treatment_type}
                    onValueChange={(value: "stasionar" | "ambulator") =>
                      setEditForm({
                        ...editForm,
                        treatment_type: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stasionar">
                        {roomType.stasionar}
                      </SelectItem>
                      <SelectItem value="ambulator">
                        {roomType.ambulator}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p
                    className={`font-medium mt-1 inline-block px-2 py-0.5 rounded ${
                      exam.treatment_type === "stasionar"
                        ? "bg-green-300 text-green-900"
                        : "bg-red-300 text-red-900"
                    }`}
                  >
                    {roomType[exam.treatment_type]}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground mr-5">
                  {t("status")} :
                </Label>
                <p
                  className={`font-medium mt-1 inline-block px-2 py-0.5 rounded text-white ${
                    statusMap[exam.status]?.bgColor || "bg-gray-500"
                  }`}
                >
                  {statusMap[exam.status]?.label || exam.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {canReadPrescription ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate("/prescription", {
                      state: { examinationId: exam._id },
                    });
                  }}
                >
                  <FilePlus className="w-4 h-4 mr-2" />
                  {t("detail.writePrescription")}
                </Button>
              ) : (
                ""
              )}
              {canUpdate ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEdit}
                  disabled={isEditMode}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {t("detail.editExam")}
                </Button>
              ) : (
                ""
              )}
              {canDelete ? (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => setIsDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t("detail.deleteExam")}
                </Button>
              ) : (
                ""
              )}
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleComplete}
                disabled={isCompleting || exam.status === "completed"}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isCompleting
                  ? t("examinations:detail.completing")
                  : exam.status === "completed"
                    ? t("examinations:detail.completed")
                    : t("examinations:detail.completeExam")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (!tabPermissions[value]) {
              toast.error(t("examinations:detail.noPermission"));
              return;
            }
            // Tahrirlash rejimida boshqa tablarga o'tishni bloklash
            if (isEditMode && value !== "examination") {
              toast.error(t("examinations:detail.tabLoadError"));
              return;
            }
            setActiveTab(value);
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto gap-1">
            {canReadExamination && (
              <TabsTrigger
                value="examination"
                className="py-2 sm:py-3 text-xs sm:text-sm"
              >
                {t("examinations:detail.tabs.examination")}
              </TabsTrigger>
            )}
            {canReadPrescription && (
              <TabsTrigger
                value="prescriptions"
                className="py-2 sm:py-3 text-xs sm:text-sm"
                disabled={isEditMode}
              >
                {t("examinations:detail.tabs.prescriptions")}
              </TabsTrigger>
            )}
            {canReadServices && (
              <TabsTrigger
                value="services"
                className="py-2 sm:py-3 text-xs sm:text-sm"
                disabled={isEditMode}
              >
                {t("examinations:detail.tabs.services")}
              </TabsTrigger>
            )}
            {canReadVisits && (
              <TabsTrigger
                value="visits"
                className="py-2 sm:py-3 text-xs sm:text-sm"
                disabled={isEditMode}
              >
                {t("examinations:detail.tabs.visits")}
              </TabsTrigger>
            )}
            {canReadImages && (
              <TabsTrigger
                value="images"
                className="py-2 sm:py-3 text-xs sm:text-sm"
                disabled={isEditMode}
              >
                {t("examinations:detail.tabs.images")}
              </TabsTrigger>
            )}
            {canReadExamination && (
              <TabsTrigger
                value="neurologic"
                className="py-2 sm:py-3 text-xs sm:text-sm"
                disabled={isEditMode}
              >
                {t("examinations:detail.tabs.neurologic")}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Examination Tab */}
          {canReadExamination && (
            <TabsContent value="examination">
              <ExaminationsTab
                isEditMode={isEditMode}
                editForm={editForm}
                setEditForm={setEditForm}
                accumulatedDiagnoses={accumulatedDiagnoses}
                setAccumulatedDiagnoses={setAccumulatedDiagnoses}
                diagnosisSearch={diagnosisSearch}
                setDiagnosisSearch={setDiagnosisSearch}
                hasMoreDiagnoses={hasMoreDiagnoses}
                isFetchingDiagnosis={isFetchingDiagnosis}
                diagnosisPage={diagnosisPage}
                setDiagnosisPage={setDiagnosisPage}
                setIsEditMode={setIsEditMode}
                exam={exam}
                examRefetch={examRefetch}
              />
            </TabsContent>
          )}

          {/* Prescriptions Tab */}
          {canReadPrescription && (
            <TabsContent value="prescriptions">
              <PrescriptionsTab
              exam={exam}
              />
            </TabsContent>
          )}

          {/* Services Tab */}
          {canReadServices && (
            <TabsContent value="services">
              <ServiceTab
                exam={exam}
                patientServices={patientServices}
                serviceDuration={serviceDuration}
                setServiceDuration={setServiceDuration}
                serviceStartDate={serviceStartDate}
                setServiceStartDate={setServiceStartDate}
                services={services}
                setServices={setServices}
                refetchPatientServices={refetchPatientServices}
                setServiceSearch={setServiceSearch}
                servicesData={servicesData}
                selectedServicesCache={selectedServicesCache}
                serviceSearch={serviceSearch}
                isFetchingServices={isFetchingServices}
                setServicePage={setServicePage}
              />
            </TabsContent>
          )}

          {/* Visits Tab */}
          {canReadVisits && (
            <TabsContent value="visits">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t("laboratory.title")}</span>
                    {exam.analyses && exam.analyses.length > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">
                        ({exam.analyses.length} {t("laboratory.count")})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exam.analyses && exam.analyses.length > 0 ? (
                    <div className="space-y-4">
                      {exam.analyses.map((analysis: any, index: number) => {
                        const paramType = analysis.analysis_parameter_type;
                        const paramValue = analysis.analysis_parameter_value;

                        // Check if this is new structure (single parameter per analysis)
                        const isNewStructure =
                          paramType && typeof paramType === "object";

                        if (isNewStructure) {
                          // NEW STRUCTURE: Single parameter with detailed info
                          const isAbnormal =
                            paramType?.normal_range &&
                            (() => {
                              const range =
                                paramType.normal_range.general ||
                                paramType.normal_range.male ||
                                paramType.normal_range.female;
                              if (range && typeof paramValue === "number") {
                                return (
                                  paramValue < range.min ||
                                  paramValue > range.max
                                );
                              }
                              return false;
                            })();

                          return (
                            <Card
                              key={analysis._id}
                              className={`border ${
                                isAbnormal
                                  ? "border-red-300 bg-red-50/30"
                                  : "border-primary/10 bg-primary/5"
                              }`}
                            >
                              <CardContent className="pt-4">
                                <div className="space-y-4">
                                  {/* Parameter Info */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Параметр номи
                                      </Label>
                                      <p className="font-bold text-base mt-1">
                                        {paramType.parameter_name}
                                      </p>
                                      {paramType.parameter_code && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Код: {paramType.parameter_code}
                                        </p>
                                      )}
                                    </div>

                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Натижа
                                      </Label>
                                      <div className="flex items-baseline gap-2 mt-1">
                                        <p
                                          className={`font-bold text-lg ${
                                            isAbnormal
                                              ? "text-red-600"
                                              : "text-green-600"
                                          }`}
                                        >
                                          {paramValue}
                                        </p>
                                        {paramType.unit && (
                                          <span className="text-sm text-muted-foreground">
                                            {paramType.unit}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Normal Range */}
                                  {paramType?.normal_range && (
                                    <div className="bg-white rounded border p-3">
                                      <Label className="text-xs text-muted-foreground block mb-2">
                                        Меъёрий қийматлар
                                      </Label>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                        {paramType.normal_range.general && (
                                          <div>
                                            <p className="text-xs text-muted-foreground">
                                              Умумий:
                                            </p>
                                            <p className="font-semibold">
                                              {
                                                paramType.normal_range.general
                                                  .min
                                              }{" "}
                                              -{" "}
                                              {
                                                paramType.normal_range.general
                                                  .max
                                              }
                                              {paramType.normal_range.general
                                                .value &&
                                                ` (${paramType.normal_range.general.value})`}
                                            </p>
                                          </div>
                                        )}
                                        {paramType.normal_range.male && (
                                          <div>
                                            <p className="text-xs text-muted-foreground">
                                              Эркаклар:
                                            </p>
                                            <p className="font-semibold">
                                              {paramType.normal_range.male.min}{" "}
                                              -{" "}
                                              {paramType.normal_range.male.max}
                                              {paramType.normal_range.male
                                                .value &&
                                                ` (${paramType.normal_range.male.value})`}
                                            </p>
                                          </div>
                                        )}
                                        {paramType.normal_range.female && (
                                          <div>
                                            <p className="text-xs text-muted-foreground">
                                              Аёллар:
                                            </p>
                                            <p className="font-semibold">
                                              {
                                                paramType.normal_range.female
                                                  .min
                                              }{" "}
                                              -{" "}
                                              {
                                                paramType.normal_range.female
                                                  .max
                                              }
                                              {paramType.normal_range.female
                                                .value &&
                                                ` (${paramType.normal_range.female.value})`}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Description */}
                                  {paramType?.description && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Таърифи
                                      </Label>
                                      <p className="text-sm mt-1 bg-blue-50 p-2 rounded border border-blue-200">
                                        {paramType.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Status Indicator */}
                                  {isAbnormal && (
                                    <div className="bg-red-100 border border-red-300 rounded p-3">
                                      <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Огоҳлантириш: Натижа меъёрий қийматдан
                                        ташқарида
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        } else {
                          // OLD STRUCTURE: Analysis with multiple results
                          return (
                            <Card
                              key={analysis._id}
                              className="border border-primary/10 bg-primary/5"
                            >
                              <CardContent className="pt-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <span className="text-sm font-medium text-primary">
                                      Таҳлил #{index + 1}
                                    </span>
                                    {analysis.created_at && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(
                                          analysis.created_at,
                                        ).toLocaleString("uz-UZ", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    )}
                                  </div>
                                  {analysis.status && (
                                    <div className="text-right">
                                      <span
                                        className={`inline-block px-3 py-1 rounded text-xs font-semibold ${
                                          analysis.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : analysis.status === "active"
                                              ? "bg-blue-100 text-blue-800"
                                              : analysis.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-200 text-gray-700"
                                        }`}
                                      >
                                        {analysis.status === "completed"
                                          ? t("detail.statuses.completed")
                                          : analysis.status === "active"
                                            ? t("detail.statuses.active")
                                            : analysis.status === "pending"
                                              ? t("detail.statuses.pending")
                                              : analysis.status}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  {analysis.analysis_type && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        {t("detail.analysisType")}
                                      </Label>
                                      <p className="font-semibold text-sm mt-1">
                                        {typeof analysis.analysis_type ===
                                        "object"
                                          ? analysis.analysis_type.name
                                          : analysis.analysis_type}
                                      </p>
                                    </div>
                                  )}

                                  {analysis.level && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        {t("detail.level")}
                                      </Label>
                                      <p className="font-semibold text-sm mt-1">
                                        {analysis.level}
                                      </p>
                                    </div>
                                  )}

                                  {typeof analysis.analysis_type === "object" &&
                                    analysis.analysis_type.description && (
                                      <div>
                                        <Label className="text-xs text-muted-foreground">
                                          Таърифи
                                        </Label>
                                        <p className="text-sm mt-1 bg-blue-50 p-2 rounded border border-blue-200">
                                          {analysis.analysis_type.description}
                                        </p>
                                      </div>
                                    )}

                                  {analysis.clinical_indications && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Клиник Кўрсатмалар
                                      </Label>
                                      <p className="text-sm mt-1 bg-white p-2 rounded border">
                                        {analysis.clinical_indications}
                                      </p>
                                    </div>
                                  )}

                                  {analysis.results &&
                                    analysis.results.length > 0 && (
                                      <div>
                                        <Label className="text-xs text-muted-foreground mb-2 block">
                                          Натижалар
                                        </Label>
                                        <div className="bg-white rounded border">
                                          <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                              <thead className="bg-muted/50">
                                                <tr>
                                                  <th className="text-left p-2 font-semibold">
                                                    Параметр
                                                  </th>
                                                  <th className="text-right p-2 font-semibold">
                                                    Қиймат
                                                  </th>
                                                  <th className="text-right p-2 font-semibold">
                                                    Меъёр
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {analysis.results.map(
                                                  (result: any) => {
                                                    const resParamType =
                                                      typeof result.analysis_parameter_type ===
                                                      "object"
                                                        ? result.analysis_parameter_type
                                                        : null;
                                                    const resValue =
                                                      result.analysis_parameter_value;

                                                    // Check if abnormal
                                                    const resIsAbnormal =
                                                      resParamType?.normal_range &&
                                                      (() => {
                                                        const range =
                                                          resParamType
                                                            .normal_range
                                                            .general ||
                                                          resParamType
                                                            .normal_range
                                                            .male ||
                                                          resParamType
                                                            .normal_range
                                                            .female;
                                                        if (
                                                          range &&
                                                          typeof resValue ===
                                                            "number"
                                                        ) {
                                                          return (
                                                            resValue <
                                                              range.min ||
                                                            resValue > range.max
                                                          );
                                                        }
                                                        return false;
                                                      })();

                                                    const normalRangeText =
                                                      resParamType?.normal_range &&
                                                      (() => {
                                                        const range =
                                                          resParamType
                                                            .normal_range
                                                            .general ||
                                                          resParamType
                                                            .normal_range
                                                            .male ||
                                                          resParamType
                                                            .normal_range
                                                            .female;
                                                        if (range) {
                                                          return `${range.min} - ${range.max}`;
                                                        }
                                                        return "-";
                                                      })();

                                                    return (
                                                      <tr
                                                        key={result._id}
                                                        className={`border-t ${
                                                          resIsAbnormal
                                                            ? "bg-red-50"
                                                            : ""
                                                        }`}
                                                      >
                                                        <td className="p-2">
                                                          {resParamType
                                                            ? resParamType.parameter_name
                                                            : result.analysis_parameter_type}
                                                        </td>
                                                        <td
                                                          className={`p-2 text-right font-medium ${
                                                            resIsAbnormal
                                                              ? "text-red-600 font-bold"
                                                              : "text-green-600"
                                                          }`}
                                                        >
                                                          {resValue}
                                                          {resParamType?.unit && (
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                              {
                                                                resParamType.unit
                                                              }
                                                            </span>
                                                          )}
                                                        </td>
                                                        <td className="p-2 text-right text-muted-foreground">
                                                          {normalRangeText ||
                                                            "-"}
                                                        </td>
                                                      </tr>
                                                    );
                                                  },
                                                )}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                  {analysis.comment && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Изоҳ
                                      </Label>
                                      <p className="text-sm mt-1 bg-yellow-50 p-2 rounded border border-yellow-200">
                                        {analysis.comment}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {t("laboratory.noAnalysesYet")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Images Tab */}
          {canReadImages && (
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t("radiology.title")}</span>
                    {exam.images &&
                      Array.isArray(exam.images) &&
                      exam.images.length > 0 &&
                      (() => {
                        const totalImagesCount = (exam.images as any[]).reduce(
                          (total: number, img: any) => {
                            if (
                              img?.image_paths &&
                              Array.isArray(img.image_paths)
                            ) {
                              return total + img.image_paths.length;
                            }
                            return total;
                          },
                          0,
                        );

                        return totalImagesCount > 0 ? (
                          <span className="text-sm font-normal text-muted-foreground">
                            ({totalImagesCount} та)
                          </span>
                        ) : null;
                      })()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exam.images && exam.images.length > 0 ? (
                    <div className="space-y-3">
                      {exam.images
                        .map((image: any, index: number) => {
                          if (
                            !image?.image_paths ||
                            !Array.isArray(image.image_paths) ||
                            image.image_paths.length === 0
                          ) {
                            return null;
                          }

                          const thumbnailPath = image.image_paths[0];
                          const bodyPartLabel =
                            bodyPartLabels[image.body_part] ||
                            image.body_part ||
                            t("detail.notSpecified");
                          const imagingTypeName =
                            image.imaging_type_id?.name || t("detail.unknown");
                          const imageDate = image.created_at
                            ? new Date(image.created_at).toLocaleDateString(
                                "uz-UZ",
                              )
                            : "";

                          return (
                            <Card
                              key={image._id || index}
                              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => {
                                setSelectedImage(image);
                                setShowViewModal(true);
                              }}
                            >
                              <div className="flex flex-col sm:flex-row">
                                <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                                  <img
                                    src={thumbnailPath}
                                    alt={
                                      image.description ||
                                      `${t("detail.image")} ${index + 1}`
                                    }
                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14"%3EТасвир топилмади%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  {image.image_paths.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                      +{image.image_paths.length - 1}
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center group">
                                    <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>

                                <div className="flex-1 p-4">
                                  <div className="space-y-2">
                                    <h4
                                      className="font-semibold text-base line-clamp-2"
                                      title={image.description}
                                    >
                                      {image.description ||
                                        t("detail.noDescription")}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-foreground">
                                          {imagingTypeName}
                                        </span>
                                      </div>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <span>{bodyPartLabel}</span>
                                      </div>
                                      <span>•</span>
                                      <div className="flex items-center gap-1">
                                        <span>
                                          {image.image_paths.length}{" "}
                                          {t("detail.imagesCount")}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {imageDate}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {t("radiology.noImagesYet")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Neurologic Status Tab */}
          {canReadExamination && (
            <TabsContent value="neurologic">
              <NeurologyTab 
                exam={exam}
                id={id}
              />
            </TabsContent>
          )}
        </Tabs>

        {/* View Medical Images Modal */}
        <ViewMedicalImage
          open={showViewModal}
          onOpenChange={setShowViewModal}
          medicalImage={selectedImage}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirm} onOpenChange={setIsDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Кўрикни ўчириш
              </DialogTitle>
              <DialogDescription>
                Сиз ҳақиқатан ҳам бу кўрикни ўчирмоқчимисиз? Бу амални қайтариб
                бўлмайди.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Бемор:</span>{" "}
                  {exam.patient_id?.fullname}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Шифокор:</span>{" "}
                  {exam.doctor_id?.fullname}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Сана:</span>{" "}
                  {new Date(exam.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirm(false)}
                disabled={isDeleting}
              >
                {t("detail.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? t("detail.deleting") : t("detail.deleteExam")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ExaminationDetail;
