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
import { cn } from "@/lib/utils";
import { CalendarDays, Check, ChevronsUpDown, Edit, Loader2, Plus, Repeat, Save, Trash2, X } from "lucide-react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { generateDays } from "../ExaminationDetail";
import {
  useAddServiceMutation,
  useUpdateExaminationServiceMutation,
} from "@/app/api/examinationApi";
import { toast } from "sonner";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { ExamDataItem, getOneServiceRes } from "@/app/api/examinationApi/types";
import { ServicesDownloadButton } from "@/components/PDF/ExaminationPDF";
import { Input } from "@/components/ui/input";
import { ServiceDay, ServiceItem } from "../types";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

interface Props {
  exam: ExamDataItem;
  patientServices: getOneServiceRes[];
  serviceDuration: number;
  setServiceDuration: (val: SetStateAction<number>) => void;
  serviceStartDate: Date;
  setServiceStartDate: (val: SetStateAction<Date>) => void;
  services: ServiceItem[];
  setServices: Dispatch<SetStateAction<ServiceItem[]>>;
  refetchPatientServices: () => void;
  setServiceSearch: Dispatch<SetStateAction<string>>;
  servicesData: getAllRes;
  selectedServicesCache: {[key: string]: {_id: string;name: string;price: number;};};
  serviceSearch: string;
  isFetchingServices:boolean
  setServicePage: Dispatch<SetStateAction<number>>
}

const ServiceTab = (prop: Props) => {
  const [addServiceMutation, { isLoading: isAddingServiceMutation }] =
    useAddServiceMutation();
  const [updateService, { isLoading: isUpdatingService }] =
    useUpdateExaminationServiceMutation();
  const handleRequest = useHandleRequest();
  const { t } = useTranslation(["examinations", "common"]);

  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [openServiceCombobox, setOpenServiceCombobox] = useState<string>("");
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(
    null,
  );

  const serviceSearchRef = useRef<HTMLInputElement>(null);
  const serviceTypes = prop.servicesData?.data || [];
  const serviceHasMoreData = prop.servicesData?.data?.length === 20;

  const getServiceById = (serviceId: string) => {
    return (
      prop.servicesData?.data.find((s: any) => s._id === serviceId) ||
      prop.selectedServicesCache[serviceId]
    );
  };

  const addService = () => {
    // Use serviceDuration from input directly (minimum 1)
    const duration = Math.max(prop.serviceDuration, 1);
    const newService: ServiceItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      service_type_id: "",
      duration: duration,
      notes: "",
      days: generateDays(duration, [], prop.serviceStartDate),
    };
    prop.setServices([...prop.services, newService]);
  };

  const removeService = (serviceId: string) => {
    prop.setServices(prop.services.filter((s) => s.id !== serviceId));
  };

  const markEveryDayForService = (serviceId: string) => {
    prop.setServices(
      prop.services.map((srv) => {
        if (srv.id === serviceId) {
          const updatedDays = srv.days.map((day, idx) => {
            const dayDate = new Date(prop.serviceStartDate);
            dayDate.setDate(dayDate.getDate() + idx);
            return { ...day, date: dayDate };
          });
          return { ...srv, days: updatedDays };
        }
        return srv;
      }),
    );
  };

  const markEveryDay = () => {
    prop.setServices(
      prop.services.map((srv) => {
        const updatedDays = srv.days.map((day, idx) => {
          const dayDate = new Date(prop.serviceStartDate);
          dayDate.setDate(dayDate.getDate() + idx);
          return { ...day, date: dayDate };
        });
        return { ...srv, days: updatedDays };
      }),
    );
  };

  const markEveryOtherDay = () => {
    prop.setServices(
      prop.services.map((srv) => {
        const everyOtherDay = Array.from(
          { length: prop.serviceDuration },
          (_, i) => i + 1,
        ).filter((day) => day % 2 === 1);

        const updatedDays = srv.days.map((day, idx) => {
          if (everyOtherDay.includes(day.day)) {
            const dayDate = new Date(prop.serviceStartDate);
            dayDate.setDate(dayDate.getDate() + idx);
            return { ...day, date: dayDate };
          }
          return { ...day, date: null };
        });

        return { ...srv, days: updatedDays };
      }),
    );
  };

  // Mark every other day for a specific service
  const markEveryOtherDayForService = (serviceId: string) => {
    prop.setServices(
      prop.services.map((srv) => {
        if (srv.id === serviceId) {
          const duration = srv.days.length || prop.serviceDuration;
          const everyOtherDay = Array.from(
            { length: duration },
            (_, i) => i + 1,
          ).filter((day) => day % 2 === 1);

          const updatedDays = srv.days.map((day, idx) => {
            if (everyOtherDay.includes(day.day)) {
              const dayDate = new Date(prop.serviceStartDate);
              dayDate.setDate(dayDate.getDate() + idx);
              return { ...day, date: dayDate };
            }
            return { ...day, date: null };
          });

          return { ...srv, days: updatedDays };
        }
        return srv;
      }),
    );
  };

  const handleSaveService = async () => {
    if (prop.services.length === 0) {
      toast.error(t("examinations:detail.addServiceError"));
      return;
    }

    const invalidService = prop.services.find((s) => !s.service_type_id);
    if (invalidService) {
      toast.error(t("examinations:detail.selectServiceTypeError"));
      return;
    }

    const isEdit = Boolean(editingServiceId);
    const hasExistingServices = prop.patientServices.length > 0;

    // Prepare items array
    let itemsToSave = prop.services.map((srv) => ({
      _id: srv.id.startsWith("temp-") ? undefined : srv.id, // New items don't have _id
      service_type_id: srv.service_type_id,
      days: srv.days.map((day) => ({
        day: day.day,
        date: day.date ? format(day.date, "yyyy-MM-dd") : null,
      })),
      notes: srv.notes,
    }));

    // If editing, preserve other items from the same service document
    if (isEdit && editingServiceId) {
      // Find the service document that contains the item being edited
      const serviceDoc = prop.patientServices.find((doc: any) =>
        doc.items?.some((item: any) => item._id === editingServiceId),
      );

      if (serviceDoc && serviceDoc.items) {
        // Get all items from the service document except the one being edited
        // and ensure all items' days arrays match the new duration
        const otherItems = serviceDoc.items
          .filter((item: any) => item._id !== editingServiceId)
          .map((item: any) => {
            const existingDays = (item.days || []).map((day: any) => ({
              day: day.day,
              date: day.date
                ? typeof day.date === "string"
                  ? day.date
                  : format(new Date(day.date), "yyyy-MM-dd")
                : null,
            })) as Array<{ day: number; date: string | null }>;

            // Always ensure days array length equals current serviceDuration
            // If duration changed or days array is shorter/longer, adjust to match new duration
            const daysMap = new Map(
              existingDays.map(
                (d) => [d.day, d.date] as [number, string | null],
              ),
            );

            // Generate days array matching the new duration
            const paddedDays: Array<{ day: number; date: string | null }> =
              Array.from({ length: prop.serviceDuration }, (_, i) => {
                const dayNumber = i + 1;
                // If day exists in existing days, use its date, otherwise null
                return {
                  day: dayNumber,
                  date: daysMap.get(dayNumber) ?? null,
                };
              });

            return {
              _id: item._id,
              service_type_id:
                typeof item.service_type_id === "object"
                  ? item.service_type_id._id
                  : item.service_type_id,
              days: paddedDays,
              notes: item.notes || "",
            };
          });

        // Combine edited item with other existing items (all with updated duration)
        itemsToSave = [...itemsToSave, ...otherItems];
      }
    } else if (hasExistingServices && !isEdit) {
      // If adding new items to existing service document, preserve all existing items
      // and ensure all items' days arrays match the new duration
      const existingServiceDoc = prop.patientServices[0]; // Use first service document
      if (existingServiceDoc && existingServiceDoc.items) {
        // Update all existing items to match the new duration
        // This ensures all items' days arrays are synchronized with the current serviceDuration
        const existingItems = existingServiceDoc.items.map((item: any) => {
          const existingDays = (item.days || []).map((day: any) => ({
            day: day.day,
            date: day.date
              ? typeof day.date === "string"
                ? day.date
                : format(new Date(day.date), "yyyy-MM-dd")
              : null,
          })) as Array<{ day: number; date: string | null }>;

          // Always ensure days array length equals current serviceDuration
          // If duration changed or days array is shorter/longer, adjust to match new duration
          const daysMap = new Map(
            existingDays.map((d) => [d.day, d.date] as [number, string | null]),
          );

          // Generate days array matching the new duration
          const paddedDays: Array<{ day: number; date: string | null }> =
            Array.from({ length: prop.serviceDuration }, (_, i) => {
              const dayNumber = i + 1;
              // If day exists in existing days, use its date, otherwise null
              return {
                day: dayNumber,
                date: daysMap.get(dayNumber) ?? null,
              };
            });

          return {
            _id: item._id,
            service_type_id:
              typeof item.service_type_id === "object"
                ? item.service_type_id._id
                : item.service_type_id,
            days: paddedDays,
            notes: item.notes || "",
          };
        });

        // Combine new items with existing items (all with updated duration)
        itemsToSave = [...existingItems, ...itemsToSave];
      }
    }

    const payload = {
      examination_id: prop.exam._id,
      duration: prop.serviceDuration,
      items: itemsToSave,
    };

    await handleRequest({
      request: async () => {
        // If existing services exist or editing, use update
        // Otherwise, use create
        if (hasExistingServices || isEdit) {
          // Update service document
          const serviceDocId = isEdit
            ? prop.patientServices.find((doc: any) =>
                doc.items?.some(
                  (item: any) => item._id === editingServiceId,
                ),
              )?._id
            : prop.patientServices[0]?._id;

          if (!serviceDocId) {
            throw new Error("Xizmat hujjati topilmadi");
          }

          payload.examination_id = serviceDocId;
          const res = await updateService(payload).unwrap();
          return res;
        }
        const res = await addServiceMutation(payload).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(
          isEdit
            ? t("examinations:detail.serviceUpdated")
            : t("examinations:detail.serviceAdded"),
        );
        setIsAddingService(false);
        setEditingServiceId(null);
        prop.setServices([]);
        prop.setServiceDuration(7);
        prop.setServiceStartDate(new Date());
        prop.refetchPatientServices();
      },
      onError: (error) => {
        console.error("Service save error:", error);
        toast.error(
          error?.data?.error?.msg ||
            (isEdit
              ? t("examinations:detail.serviceDeleteError")
              : t("examinations:detail.errorOccurred")),
        );
      },
    });
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!serviceId) {
      toast.error(t("examinations:detail.serviceDataNotFound"));
      return;
    }

    // Find the service document that contains the item to delete
    const serviceDoc = prop.patientServices.find((doc: any) =>
      doc.items?.some((item: any) => item._id === serviceId),
    );

    if (!serviceDoc || !serviceDoc.items) {
      toast.error(t("examinations:detail.serviceNotFoundError"));
      return;
    }

    // Get all items except the one being deleted
    const remainingItems = serviceDoc.items
      .filter((item: any) => item._id !== serviceId)
      .map((item: any) => ({
        _id: item._id,
        service_type_id:
          typeof item.service_type_id === "object"
            ? item.service_type_id._id
            : item.service_type_id,
        days: (item.days || []).map((day: any) => ({
          day: day.day,
          date: day.date
            ? typeof day.date === "string"
              ? day.date
              : format(new Date(day.date), "yyyy-MM-dd")
            : null,
        })),
        notes: item.notes || "",
      }));

    // If no items remain, we might want to handle this differently
    // For now, we'll update with empty items array
    const payload = {
      examination_id: serviceDoc._id,
      duration: serviceDoc.duration || 7,
      items: remainingItems,
    };

    setDeletingServiceId(serviceId);

    await handleRequest({
      request: async () => {
        const res = await updateService(payload).unwrap();
        return res;
      },
      onSuccess: () => {
        toast.success(t("examinations:detail.serviceDeleted"));
        setDeletingServiceId(null);
        prop.refetchPatientServices();
      },
      onError: (error) => {
        toast.error(
          error?.data?.error?.msg ||
            t("examinations:detail.serviceDeleteError"),
        );
        setDeletingServiceId(null);
      },
    });
  };

  const startEditService = (service: any) => {
    const duration = service.duration || service.days?.length || 0;
    const firstDate =
      service.days?.find((d: any) => d?.date)?.date || new Date();

    setIsAddingService(true);
    setEditingServiceId(service._id);
    prop.setServiceDuration(duration || 7);
    prop.setServiceStartDate(firstDate ? new Date(firstDate) : new Date());

    const normalizedDays =
      service.days?.map((day: any, idx: number) => ({
        day: day?.day || idx + 1,
        date: day?.date ? new Date(day.date) : null,
      })) || [];

    prop.setServices([
      {
        id: service._id,
        service_type_id:
          typeof service.service_type_id === "object"
            ? service.service_type_id?._id || ""
            : service.service_type_id || "",
        duration: duration || normalizedDays.length || 7,
        notes: service.notes || "",
        days:
          normalizedDays.length > 0
            ? normalizedDays
            : generateDays(duration || 7, [], new Date(firstDate)),
      },
    ]);
  };

  const updateServiceField = (
    serviceId: string,
    field: keyof ServiceItem,
    value: any,
  ) => {
    prop.setServices(
      prop.services.map((srv) =>
        srv.id === serviceId ? { ...srv, [field]: value } : srv,
      ),
    );
  };

  const toggleDayMark = (serviceId: string, dayNumber: number) => {
    prop.setServices(
      prop.services.map((srv) => {
        if (srv.id !== serviceId) return srv;
        const dayIndex = dayNumber - 1;
        const updatedDays = [...srv.days];
        if (updatedDays[dayIndex]) {
          updatedDays[dayIndex] = {
            ...updatedDays[dayIndex],
            date: updatedDays[dayIndex].date
              ? null
              : new Date(
                  prop.serviceStartDate.getTime() + dayIndex * 24 * 60 * 60 * 1000,
                ),
          };
        }
        return { ...srv, days: updatedDays };
      }),
    );
  };

  return (
    <React.Fragment>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{t("detail.services")}</span>
              {prop.patientServices.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({prop.patientServices.length} {t("detail.items")})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {prop.patientServices.length > 0 && (
                <ServicesDownloadButton
                  exam={prop.exam}
                  services={prop.patientServices}
                />
              )}
              <Button
                size="sm"
                onClick={() => {
                  setIsAddingService(true);
                  // Ensure duration is set from existing services if available
                  if (prop.serviceDuration === 0 || !prop.serviceDuration) {
                    let maxDuration = 7; // Default
                    if (prop.patientServices.length > 0) {
                      const durations = prop.patientServices
                        .flatMap(
                          (doc: any) =>
                            doc.items?.map(
                              (item: any) =>
                                item.duration || item.days?.length || 0,
                            ) || [],
                        )
                        .filter((d: number) => d > 0);
                      if (durations.length > 0) {
                        maxDuration = Math.max(...durations);
                      }
                    }
                    prop.setServiceDuration(maxDuration);
                  }
                  // Ensure start date is set from existing services if available
                  if (prop.patientServices.length > 0) {
                    const firstDate = prop.patientServices
                      .flatMap((doc: any) => doc.items || [])
                      .flatMap((item: any) => item.days || [])
                      .map((day: any) => day.date)
                      .filter(
                        (date: any) => date !== null && date !== undefined,
                      )
                      .sort((a: any, b: any) => {
                        const dateA = new Date(a).getTime();
                        const dateB = new Date(b).getTime();
                        return dateA - dateB;
                      })[0];
                    if (firstDate) {
                      prop.setServiceStartDate(new Date(firstDate));
                    }
                  }
                  if (prop.services.length === 0) {
                    addService();
                  }
                }}
                disabled={isAddingService}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("detail.addService")}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Unified Services Table - Show if services exist or adding/editing */}
            {(prop.patientServices.length > 0 ||
              isAddingService ||
              editingServiceId) && (
              <Card className="border border-primary/10 mb-4">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold">
                      {t("detail.servicesTable")}
                    </Label>
                    {/* Show form controls if adding or editing */}
                    {(isAddingService || editingServiceId) && (
                      <div className="flex items-end gap-2">
                        <div className="w-32">
                          <Label className="text-xs">
                            {t("detail.durationDays")}
                          </Label>
                          <Input
                            type="number"
                            value={
                              prop.serviceDuration === 0
                                ? ""
                                : prop.serviceDuration
                            }
                            min={0}
                            max={60}
                            onChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === "") {
                                prop.setServiceDuration(0);
                                return;
                              }
                              const newDuration = parseInt(inputValue) || 0;
                              if (newDuration < 0) {
                                prop.setServiceDuration(0);
                                return;
                              }
                              prop.setServiceDuration(newDuration);
                              if (newDuration > 0) {
                                prop.setServices(
                                  prop.services.map((srv) => {
                                    const currentDays = srv.days || [];

                                    // If all previous days were marked (all have dates), mark all new days too
                                    if (currentDays.length > 0) {
                                      const allDaysMarked = currentDays.every(
                                        (day) => day.date !== null,
                                      );
                                      const currentMaxDay = currentDays.length;

                                      if (
                                        allDaysMarked &&
                                        newDuration > currentMaxDay
                                      ) {
                                        // All previous days were marked, so mark all new days too
                                        const newDays: ServiceDay[] =
                                          Array.from(
                                            { length: newDuration },
                                            (_, idx) => {
                                              if (idx < currentMaxDay) {
                                                return currentDays[idx];
                                              }
                                              const dayDate = new Date(
                                                prop.serviceStartDate,
                                              );
                                              dayDate.setDate(
                                                dayDate.getDate() + idx,
                                              );
                                              return {
                                                day: idx + 1,
                                                date: dayDate,
                                              };
                                            },
                                          );
                                        return {
                                          ...srv,
                                          duration: newDuration,
                                          days: newDays,
                                        };
                                      }
                                    }

                                    // Otherwise, extend days but keep existing ones
                                    const newDays: ServiceDay[] = Array.from(
                                      { length: newDuration },
                                      (_, idx) => {
                                        const existingDay = currentDays[idx];
                                        if (existingDay) {
                                          return existingDay;
                                        }
                                        return {
                                          day: idx + 1,
                                          date: null,
                                        };
                                      },
                                    );
                                    return {
                                      ...srv,
                                      duration: newDuration,
                                      days: newDays,
                                    };
                                  }),
                                );
                              } else {
                                prop.setServices(
                                  prop.services.map((srv) => ({
                                    ...srv,
                                    duration: 0,
                                    days: [],
                                  })),
                                );
                              }
                            }}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">
                            {t("detail.startDate")}
                          </Label>
                          <Input
                            type="date"
                            value={
                              prop.serviceStartDate.toISOString().split("T")[0]
                            }
                            onChange={(e) => {
                              const newDate = new Date(e.target.value);
                              prop.setServiceStartDate(newDate);
                              prop.setServices(
                                prop.services.map((srv) => ({
                                  ...srv,
                                  days: generateDays(
                                    prop.serviceDuration,
                                    [],
                                    newDate,
                                  ),
                                })),
                              );
                            }}
                            className="mt-1 h-8 text-sm"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={markEveryDay}
                          disabled={prop.services.length === 0}
                          className="h-8"
                        >
                          {t("detail.everyDay")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={markEveryOtherDay}
                          disabled={prop.services.length === 0}
                          className="h-8"
                        >
                          {t("detail.everyOtherDay")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingService(true);
                            // Ensure duration is set from existing services if available
                            if (
                              prop.serviceDuration === 0 ||
                              !prop.serviceDuration
                            ) {
                              let maxDuration = 7; // Default
                              if (prop.patientServices.length > 0) {
                                const durations = prop.patientServices
                                  .flatMap(
                                    (doc: any) =>
                                      doc.items?.map(
                                        (item: any) =>
                                          item.duration ||
                                          item.days?.length ||
                                          0,
                                      ) || [],
                                  )
                                  .filter((d: number) => d > 0);
                                if (durations.length > 0) {
                                  maxDuration = Math.max(...durations);
                                }
                              }
                              prop.setServiceDuration(maxDuration);
                            }
                            // Ensure start date is set from existing services if available
                            if (prop.patientServices.length > 0) {
                              const firstDate = prop.patientServices
                                .flatMap((doc: any) => doc.items || [])
                                .flatMap((item: any) => item.days || [])
                                .map((day: any) => day.date)
                                .filter(
                                  (date: any) =>
                                    date !== null && date !== undefined,
                                )
                                .sort((a: any, b: any) => {
                                  const dateA = new Date(a).getTime();
                                  const dateB = new Date(b).getTime();
                                  return dateA - dateB;
                                })[0];
                              if (firstDate) {
                                prop.setServiceStartDate(new Date(firstDate));
                              }
                            }
                            addService();
                          }}
                          className="h-8 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t("detail.add")}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                      <thead>
                        {(() => {
                          // Determine the number of days to show in header
                          // If adding new services, use serviceDuration
                          // If only existing services, find max duration
                          let daysToShow = 8; // Default to 8

                          if (prop.services.length > 0 || isAddingService) {
                            // If adding new services, use serviceDuration (minimum 1)
                            // Also consider existing services' duration
                            let maxExistingDuration = 0;
                            if (prop.patientServices.length > 0) {
                              maxExistingDuration = prop.patientServices.reduce(
                                (max: number, doc: any) => {
                                  const docMax =
                                    doc.items?.reduce(
                                      (itemMax: number, item: any) => {
                                        const itemDuration =
                                          item.duration ||
                                          item.days?.length ||
                                          0;
                                        return Math.max(itemMax, itemDuration);
                                      },
                                      0,
                                    ) || 0;
                                  return Math.max(max, docMax);
                                },
                                0,
                              );
                            }
                            daysToShow = Math.max(
                              prop.serviceDuration,
                              maxExistingDuration,
                              1,
                            );
                          } else if (prop.patientServices.length > 0) {
                            // If only existing services, find max duration
                            const maxDuration = prop.patientServices.reduce(
                              (max: number, doc: any) => {
                                const docMax =
                                  doc.items?.reduce(
                                    (itemMax: number, item: any) => {
                                      const itemDuration =
                                        item.duration || item.days?.length || 0;
                                      return Math.max(itemMax, itemDuration);
                                    },
                                    0,
                                  ) || 0;
                                return Math.max(max, docMax);
                              },
                              0,
                            );
                            daysToShow = maxDuration > 0 ? maxDuration : 8;
                          }

                          // Split days into chunks of 8 for multiple rows
                          const daysPerRow = 8;
                          const headerChunks: number[][] = [];
                          for (let i = 0; i < daysToShow; i += daysPerRow) {
                            const chunk = [];
                            for (
                              let j = i;
                              j < Math.min(i + daysPerRow, daysToShow);
                              j++
                            ) {
                              chunk.push(j + 1);
                            }
                            headerChunks.push(chunk);
                          }

                          // If no chunks, create at least one empty chunk
                          if (headerChunks.length === 0) {
                            headerChunks.push([]);
                          }

                          return headerChunks.map((chunk, chunkIndex) => (
                            <tr
                              key={`header-${chunkIndex}`}
                              className="bg-muted/50"
                            >
                              {chunkIndex === 0 && (
                                <th
                                  className="border px-3 py-2 text-left font-semibold min-w-[150px]"
                                  rowSpan={headerChunks.length}
                                >
                                  {t("detail.serviceName")}
                                </th>
                              )}
                              {chunk.map((dayNum) => (
                                <th
                                  key={dayNum}
                                  className="border px-2 py-2 text-center font-semibold min-w-[70px]"
                                ></th>
                              ))}
                              {chunk.length < daysPerRow &&
                                Array.from(
                                  {
                                    length: daysPerRow - chunk.length,
                                  },
                                  (_, i) => (
                                    <th
                                      key={`empty-${i}`}
                                      className="border px-2 py-2"
                                    ></th>
                                  ),
                                )}
                              {chunkIndex === 0 && (
                                <th
                                  className="border px-2 py-2 text-center font-semibold w-12"
                                  rowSpan={headerChunks.length}
                                >
                                  {t("detail.actions")}
                                </th>
                              )}
                            </tr>
                          ));
                        })()}
                      </thead>
                      <tbody>
                        {/* Existing services - show in their original position, editable if being edited */}
                        {prop.patientServices.map((serviceDoc: any) =>
                          serviceDoc.items?.map((service: any) => {
                            // Check if this service is being edited
                            const isBeingEdited =
                              editingServiceId &&
                              service._id === editingServiceId;

                            // If being edited, use data from services array, otherwise use original data
                            const editingService = isBeingEdited
                              ? prop.services.find((s) => s.id === service._id)
                              : null;

                            const serviceDays = editingService
                              ? editingService.days || []
                              : service.days || [];
                            const originalDuration = editingService
                              ? editingService.duration ||
                                serviceDays.length ||
                                0
                              : service.duration || serviceDays.length || 0;

                            // If new services are being added, use the maximum of serviceDuration and original duration
                            const totalDays =
                              prop.services.length > 0 && !isBeingEdited
                                ? Math.max(
                                    prop.serviceDuration,
                                    originalDuration,
                                  )
                                : originalDuration;

                            // Split days into chunks of 8
                            const dayChunks: Array<Array<any>> = [];
                            for (let i = 0; i < totalDays; i += 8) {
                              const chunk = [];
                              for (
                                let j = i;
                                j < Math.min(i + 8, totalDays);
                                j++
                              ) {
                                const dayData = serviceDays[j];
                                chunk.push({
                                  dayNumber: j + 1,
                                  dayData: dayData || null,
                                });
                              }
                              dayChunks.push(chunk);
                            }

                            // If no days, show at least one row
                            if (dayChunks.length === 0) {
                              dayChunks.push([]);
                            }

                            return dayChunks.map((chunk, chunkIndex) => (
                              <tr
                                key={`${service._id}-chunk-${chunkIndex}`}
                                className={`hover:bg-muted/30 ${
                                  isBeingEdited ? "bg-primary/5" : ""
                                }`}
                              >
                                {chunkIndex === 0 ? (
                                  <td
                                    className="border px-3 py-2 font-medium"
                                    rowSpan={dayChunks.length}
                                  >
                                    {isBeingEdited ? (
                                      <Popover
                                        open={
                                          openServiceCombobox ===
                                          editingService?.id
                                        }
                                        onOpenChange={(open) => {
                                          setOpenServiceCombobox(
                                            open
                                              ? editingService?.id || ""
                                              : "",
                                          );
                                          if (open) {
                                            prop.setServiceSearch("");
                                            setTimeout(
                                              () =>
                                                serviceSearchRef.current?.focus(),
                                              0,
                                            );
                                          }
                                        }}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                            size="sm"
                                          >
                                            {editingService?.service_type_id
                                              ? getServiceById(
                                                  editingService.service_type_id,
                                                )?.name || t("detail.select")
                                              : t("detail.select")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                          <Command shouldFilter={false}>
                                            <CommandInput
                                              ref={serviceSearchRef}
                                              placeholder={t(
                                                "detail.searchService",
                                              )}
                                              value={prop.serviceSearch}
                                              onValueChange={prop.setServiceSearch}
                                              onKeyDown={(e) =>
                                                e.stopPropagation()
                                              }
                                            />
                                            <CommandList
                                              onScroll={(e: any) => {
                                                const bottom =
                                                  e.target.scrollHeight -
                                                    e.target.scrollTop ===
                                                  e.target.clientHeight;
                                                if (
                                                  bottom &&
                                                  prop.servicesData?.pagination.next &&
                                                  !prop.isFetchingServices
                                                ) {
                                                  prop.setServicePage(
                                                    (prev) => prev + 1,
                                                  );
                                                }
                                              }}
                                            >
                                              {prop.isFetchingServices &&
                                              serviceTypes.length === 0 ? (
                                                <div className="flex items-center justify-center py-4">
                                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                  <span className="text-sm text-muted-foreground">
                                                    {t("detail.loading")}
                                                  </span>
                                                </div>
                                              ) : serviceTypes.length === 0 ? (
                                                <CommandEmpty>
                                                  {t("detail.serviceNotFound")}
                                                </CommandEmpty>
                                              ) : (
                                                <CommandGroup>
                                                  {(() => {
                                                    // Get list of already selected service IDs (excluding current editing service)
                                                    const selectedServiceIds =
                                                      prop.services
                                                        .filter(
                                                          (s) =>
                                                            s.service_type_id &&
                                                            s.id !==
                                                              editingService?.id,
                                                        )
                                                        .map(
                                                          (s) =>
                                                            s.service_type_id,
                                                        );

                                                    // Also include services from patientServices that are not being edited
                                                    const existingServiceIds =
                                                      prop.patientServices
                                                        .flatMap(
                                                          (doc: any) =>
                                                            doc.items || [],
                                                        )
                                                        .filter(
                                                          (item: any) =>
                                                            item._id !==
                                                            editingServiceId,
                                                        )
                                                        .map(
                                                          (item: any) =>
                                                            item.service_type_id
                                                              ?._id ||
                                                            item.service_type_id,
                                                        )
                                                        .filter(Boolean);

                                                    const allSelectedIds = [
                                                      ...new Set([
                                                        ...selectedServiceIds,
                                                        ...existingServiceIds,
                                                      ]),
                                                    ];

                                                    return serviceTypes
                                                      .filter(
                                                        (serviceType: any) =>
                                                          !allSelectedIds.includes(
                                                            serviceType._id,
                                                          ),
                                                      )
                                                      .map(
                                                        (serviceType: any) => (
                                                          <CommandItem
                                                            key={
                                                              serviceType._id
                                                            }
                                                            value={
                                                              serviceType._id
                                                            }
                                                            keywords={[
                                                              serviceType.name,
                                                              serviceType._id,
                                                            ]}
                                                            onSelect={() => {
                                                              if (
                                                                editingService
                                                              ) {
                                                                updateServiceField(
                                                                  editingService.id,
                                                                  "service_type_id",
                                                                  serviceType._id,
                                                                );
                                                              }
                                                              setOpenServiceCombobox(
                                                                "",
                                                              );
                                                              prop.setServiceSearch(
                                                                "",
                                                              );
                                                              prop.setServicePage(1);
                                                            }}
                                                          >
                                                            <Check
                                                              className={cn(
                                                                "mr-2 h-4 w-4",
                                                                editingService?.service_type_id ===
                                                                  serviceType._id
                                                                  ? "opacity-100"
                                                                  : "opacity-0",
                                                              )}
                                                            />
                                                            {serviceType.name}
                                                          </CommandItem>
                                                        ),
                                                      );
                                                  })()}
                                                  {prop.isFetchingServices && (
                                                    <div className="flex items-center justify-center py-2">
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                  )}
                                                </CommandGroup>
                                              )}
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    ) : (
                                      service.service_type_id?.name ||
                                      t("detail.unknown")
                                    )}
                                  </td>
                                ) : null}
                                {chunk.map((dayItem, idx) => (
                                  <td
                                    key={idx}
                                    className={`border px-1 py-1 text-center group relative ${
                                      isBeingEdited
                                        ? "cursor-pointer hover:bg-muted/50"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (isBeingEdited && editingService) {
                                        toggleDayMark(
                                          editingService.id,
                                          dayItem.dayNumber,
                                        );
                                      }
                                    }}
                                  >
                                    <span className="font-bold text-xs block">
                                      {dayItem.dayNumber}-{t("detail.day")}
                                    </span>
                                    {dayItem.dayData?.date ? (
                                      <div className="flex items-center justify-center">
                                        <span className="text-xs text-primary">
                                          {format(
                                            dayItem.dayData.date,
                                            "dd/MM",
                                          )}
                                        </span>
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                          {new Date(
                                            dayItem.dayData.date,
                                          ).toLocaleDateString("uz-UZ")}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        —
                                      </span>
                                    )}
                                  </td>
                                ))}
                                {/* Fill empty cells if chunk is less than 8 */}
                                {chunk.length < 8 &&
                                  Array.from(
                                    { length: 8 - chunk.length },
                                    (_, i) => (
                                      <td
                                        key={`empty-${i}`}
                                        className="border px-1 py-1"
                                      ></td>
                                    ),
                                  )}
                                {chunkIndex === 0 ? (
                                  <td
                                    className="border px-1 py-2 text-center w-12"
                                    rowSpan={dayChunks.length}
                                  >
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="flex gap-1">
                                        {isBeingEdited && (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                markEveryDayForService(
                                                  editingService?.id || "",
                                                )
                                              }
                                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                              disabled={
                                                !editingService?.service_type_id
                                              }
                                              title={t("detail.everyDay")}
                                            >
                                              <CalendarDays className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                markEveryOtherDayForService(
                                                  editingService?.id || "",
                                                )
                                              }
                                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                              disabled={
                                                !editingService?.service_type_id
                                              }
                                              title={t("detail.everyOtherDay")}
                                            >
                                              <Repeat className="w-3 h-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            startEditService(service)
                                          }
                                          className="h-6 w-6 p-0"
                                          disabled={
                                            deletingServiceId === service._id
                                          }
                                          title={t("detail.editExam")}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteService(service._id)
                                          }
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                          disabled={
                                            deletingServiceId === service._id ||
                                            isAddingService
                                          }
                                          title={t("detail.deleteExam")}
                                        >
                                          {deletingServiceId === service._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </td>
                                ) : null}
                              </tr>
                            ));
                          }),
                        )}
                        {/* Services being added (new services only, not edited ones) - show as rows in table */}
                        {(isAddingService || editingServiceId) &&
                          prop.services
                            .filter(
                              (service) =>
                                !editingServiceId ||
                                service.id !== editingServiceId,
                            )
                            .map((service) => {
                              // Split days into chunks of 8
                              const dayChunks: Array<typeof service.days> = [];
                              for (let i = 0; i < service.days.length; i += 8) {
                                dayChunks.push(service.days.slice(i, i + 8));
                              }

                              return dayChunks.map((chunk, chunkIndex) => (
                                <tr
                                  key={`new-${service.id}-chunk-${chunkIndex}`}
                                  className="hover:bg-muted/30 bg-primary/5"
                                >
                                  {chunkIndex === 0 ? (
                                    <td
                                      className="border px-3 py-2"
                                      rowSpan={dayChunks.length}
                                    >
                                      <Popover
                                        open={
                                          openServiceCombobox === service.id
                                        }
                                        onOpenChange={(open) => {
                                          setOpenServiceCombobox(
                                            open ? service.id : "",
                                          );
                                          if (open) {
                                            prop.setServiceSearch("");
                                            setTimeout(
                                              () =>
                                                serviceSearchRef.current?.focus(),
                                              0,
                                            );
                                          }
                                        }}
                                      >
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            className="w-full justify-between"
                                            size="sm"
                                          >
                                            {service.service_type_id
                                              ? getServiceById(
                                                  service.service_type_id,
                                                )?.name || t("detail.select")
                                              : t("detail.select")}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[400px] p-0">
                                          <Command shouldFilter={false}>
                                            <CommandInput
                                              ref={serviceSearchRef}
                                              placeholder={t(
                                                "detail.searchService",
                                              )}
                                              value={prop.serviceSearch}
                                              onValueChange={prop.setServiceSearch}
                                              onKeyDown={(e) =>
                                                e.stopPropagation()
                                              }
                                            />
                                            <CommandList
                                              onScroll={(e: any) => {
                                                const bottom =
                                                  e.target.scrollHeight -
                                                    e.target.scrollTop ===
                                                  e.target.clientHeight;
                                                if (
                                                  bottom &&
                                                  serviceHasMoreData &&
                                                  !prop.isFetchingServices
                                                ) {
                                                  prop.setServicePage(
                                                    (prev) => prev + 1,
                                                  );
                                                }
                                              }}
                                            >
                                              {prop.isFetchingServices &&
                                              serviceTypes.length === 0 ? (
                                                <div className="flex items-center justify-center py-4">
                                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                  <span className="text-sm text-muted-foreground">
                                                    {t("common:loading")}
                                                  </span>
                                                </div>
                                              ) : serviceTypes.length === 0 ? (
                                                <CommandEmpty>
                                                  {t(
                                                    "services.serviceNotFound",
                                                  )}
                                                </CommandEmpty>
                                              ) : (
                                                <CommandGroup>
                                                  {(() => {
                                                    // Get list of already selected service IDs (excluding current service)
                                                    const selectedServiceIds =
                                                      prop.services
                                                        .filter(
                                                          (s) =>
                                                            s.service_type_id &&
                                                            s.id !== service.id,
                                                        )
                                                        .map(
                                                          (s) =>
                                                            s.service_type_id,
                                                        );

                                                    // Also include services from patientServices that are not being edited
                                                    const existingServiceIds =
                                                      prop.patientServices
                                                        .flatMap(
                                                          (doc: any) =>
                                                            doc.items || [],
                                                        )
                                                        .filter(
                                                          (item: any) =>
                                                            item._id !==
                                                            service.id,
                                                        )
                                                        .map(
                                                          (item: any) =>
                                                            item.service_type_id
                                                              ?._id ||
                                                            item.service_type_id,
                                                        )
                                                        .filter(Boolean);

                                                    const allSelectedIds = [
                                                      ...new Set([
                                                        ...selectedServiceIds,
                                                        ...existingServiceIds,
                                                      ]),
                                                    ];

                                                    return serviceTypes
                                                      .filter(
                                                        (serviceType: any) =>
                                                          !allSelectedIds.includes(
                                                            serviceType._id,
                                                          ),
                                                      )
                                                      .map(
                                                        (serviceType: any) => (
                                                          <CommandItem
                                                            key={
                                                              serviceType._id
                                                            }
                                                            value={
                                                              serviceType._id
                                                            }
                                                            keywords={[
                                                              serviceType.name,
                                                              serviceType._id,
                                                            ]}
                                                            onSelect={() => {
                                                              updateServiceField(
                                                                service.id,
                                                                "service_type_id",
                                                                serviceType._id,
                                                              );
                                                              setOpenServiceCombobox(
                                                                "",
                                                              );
                                                              prop.setServiceSearch(
                                                                "",
                                                              );
                                                              prop.setServicePage(1);
                                                            }}
                                                          >
                                                            <Check
                                                              className={cn(
                                                                "mr-2 h-4 w-4",
                                                                service.service_type_id ===
                                                                  serviceType._id
                                                                  ? "opacity-100"
                                                                  : "opacity-0",
                                                              )}
                                                            />
                                                            {serviceType.name}
                                                          </CommandItem>
                                                        ),
                                                      );
                                                  })()}
                                                  {prop.isFetchingServices && (
                                                    <div className="flex items-center justify-center py-2">
                                                      <Loader2 className="h-4 w-4 animate-spin" />
                                                    </div>
                                                  )}
                                                </CommandGroup>
                                              )}
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </td>
                                  ) : null}
                                  {chunk.map((day) => (
                                    <td
                                      key={day.day}
                                      className="border px-1 py-1 text-center cursor-pointer hover:bg-muted/50"
                                      onClick={() =>
                                        toggleDayMark(service.id, day.day)
                                      }
                                    >
                                      <span className="font-bold text-xs block">
                                        {day.day}-{t("detail.day")}
                                      </span>
                                      {day.date ? (
                                        <div className="text-xs font-medium text-primary">
                                          {new Date(
                                            day.date,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                          })}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">
                                          -
                                        </span>
                                      )}
                                    </td>
                                  ))}
                                  {/* Fill empty cells if chunk is less than 8 */}
                                  {chunk.length < 8 &&
                                    Array.from(
                                      { length: 8 - chunk.length },
                                      (_, i) => (
                                        <td
                                          key={`empty-${i}`}
                                          className="border px-1 py-1"
                                        ></td>
                                      ),
                                    )}
                                  {chunkIndex === 0 ? (
                                    <td
                                      className="border px-1 py-2 text-center w-12"
                                      rowSpan={dayChunks.length}
                                    >
                                      <div className="flex flex-col items-center gap-1">
                                        <div className="flex gap-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              markEveryDayForService(service.id)
                                            }
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                            disabled={!service.service_type_id}
                                            title={t("detail.everyDay")}
                                          >
                                            <CalendarDays className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              markEveryOtherDayForService(
                                                service.id,
                                              )
                                            }
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                                            disabled={!service.service_type_id}
                                            title={t("detail.everyOtherDay")}
                                          >
                                            <Repeat className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeService(service.id)
                                          }
                                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                          title={t("detail.deleteExam")}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  ) : null}
                                </tr>
                              ));
                            })}
                      </tbody>
                    </table>
                  </div>
                  {/* Action buttons when adding or editing */}
                  {(isAddingService || editingServiceId) && (
                    <div className="flex gap-2 justify-end mt-4 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddingService(false);
                          prop.setServices([]);
                          prop.setServiceDuration(7);
                          prop.setServiceStartDate(new Date());
                          setEditingServiceId(null);
                        }}
                        disabled={isAddingServiceMutation || isUpdatingService}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Бекор қилиш
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveService}
                        disabled={
                          isAddingServiceMutation ||
                          isUpdatingService ||
                          prop.services.length === 0
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {editingServiceId
                          ? isUpdatingService
                            ? t("detail.updating")
                            : t("detail.update")
                          : isAddingServiceMutation
                            ? t("detail.saving")
                            : t("detail.save")}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {prop.patientServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  {t("detail.noServices")}
                </p>
                {!isAddingService && (
                  <Button
                    onClick={() => {
                      setIsAddingService(true);
                      // Ensure duration is set from existing services if available
                      if (prop.serviceDuration === 0 || !prop.serviceDuration) {
                        let maxDuration = 7; // Default
                        if (prop.patientServices.length > 0) {
                          const durations = prop.patientServices
                            .flatMap(
                              (doc: any) =>
                                doc.items?.map(
                                  (item: any) =>
                                    item.duration || item.days?.length || 0,
                                ) || [],
                            )
                            .filter((d: number) => d > 0);
                          if (durations.length > 0) {
                            maxDuration = Math.max(...durations);
                          }
                        }
                        prop.setServiceDuration(maxDuration);
                      }
                      // Ensure start date is set from existing services if available
                      if (prop.patientServices.length > 0) {
                        const firstDate = prop.patientServices
                          .flatMap((doc: any) => doc.items || [])
                          .flatMap((item: any) => item.days || [])
                          .map((day: any) => day.date)
                          .filter(
                            (date: any) => date !== null && date !== undefined,
                          )
                          .sort((a: any, b: any) => {
                            const dateA = new Date(a).getTime();
                            const dateB = new Date(b).getTime();
                            return dateA - dateB;
                          })[0];
                        if (firstDate) {
                          prop.setServiceStartDate(new Date(firstDate));
                        }
                      }
                      // Add default one row
                      if (prop.services.length === 0) {
                        addService();
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("detail.addService")}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};

export default ServiceTab;
