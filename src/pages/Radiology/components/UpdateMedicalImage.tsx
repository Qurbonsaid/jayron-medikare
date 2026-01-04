import { useUpdateMedicalImageMutation } from "@/app/api/radiologyApi";
import { useGetAllImagingTypesQuery } from "@/app/api/radiologyApi";
import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import { useUploadCreateMutation } from "@/app/api/upload/uploadApi";
import {
  MedicalImage,
  UpdatedMedicalImageRequest,
} from "@/app/api/radiologyApi/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, ImagePlus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { BodyPartConstants } from "@/constants/BodyPart";
import { useState, useEffect } from "react";

// Error type interface
interface UploadError {
  data?: {
    error?: {
      msg?: string;
    };
    message?: string;
  };
}

interface UploadResponseError {
  error?: {
    msg?: string;
  };
  message?: string;
}

// Helper type for the actual exam data structure returned by API
interface ExamData {
  _id: string;
  created_at: Date;
  patient_id: {
    _id: string;
    fullname: string;
  };
}

// Tana qismlari ro'yxati - keys for translation
const bodyPartKeys = [
  { value: BodyPartConstants.HEAD, key: "head" },
  { value: BodyPartConstants.NECK, key: "neck" },
  { value: BodyPartConstants.CHEST, key: "chestCage" },
  { value: BodyPartConstants.ABDOMEN, key: "abdomen" },
  { value: BodyPartConstants.PELVIS, key: "pelvis" },
  { value: BodyPartConstants.SPINE, key: "spine" },
  { value: BodyPartConstants.ARM, key: "arm" },
  { value: BodyPartConstants.LEG, key: "leg" },
  { value: BodyPartConstants.KNEE, key: "knee" },
  { value: BodyPartConstants.SHOULDER, key: "shoulder" },
  { value: BodyPartConstants.HAND, key: "hand" },
  { value: BodyPartConstants.FOOT, key: "foot" },
];

export const UpdateMedicalImage = ({
  open,
  onOpenChange,
  medicalImage,
}: UpdateMedicalImageProps) => {
  const { t } = useTranslation("radiology");
  const [updateMedicalImage, { isLoading }] = useUpdateMedicalImageMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadCreateMutation();
  const { data: imagingTypes } = useGetAllImagingTypesQuery({ limit: 100 });
  const { data: examinations } = useGetAllExamsQuery({ limit: 100 });
  const handleRequest = useHandleRequest();
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const MedicalImageSchema = z.object({
    examination_id: z.string().optional(),
    imaging_type_id: z.string().min(1, t("updateMedicalImage.selectImagingType")),
    image_paths: z.array(z.string()).min(1, t("updateMedicalImage.atLeastOneImage")),
    body_part: z.string().optional(),
    description: z.string().optional(),
  });

  type MedicalImageFormData = z.infer<typeof MedicalImageSchema>;

  const form = useForm<MedicalImageFormData>({
    resolver: zodResolver(MedicalImageSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      examination_id: "",
      imaging_type_id: "",
      image_paths: [],
      body_part: "",
      description: "",
    },
  });

  // Update form when medicalImage changes
  useEffect(() => {
    if (medicalImage && open) {
      form.reset({
        examination_id:
          typeof medicalImage.examination_id === "string"
            ? medicalImage.examination_id
            : medicalImage.examination_id?._id || "",
        imaging_type_id:
          typeof medicalImage.imaging_type_id === "string"
            ? medicalImage.imaging_type_id
            : medicalImage.imaging_type_id?._id || "",
        image_paths: medicalImage.image_paths || [],
        body_part: medicalImage.body_part || "",
        description: medicalImage.description || "",
      });
    }
  }, [medicalImage, open, form]);

  // Modal yopilganda uploadingFiles tozalash
  useEffect(() => {
    if (!open) {
      setUploadingFiles([]);
    }
  }, [open]);

  // Rasm yuklash funksiyasi
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Fayllarni array'ga o'tkazamiz
    const fileArray = Array.from(files);

    // Faqat rasm fayllarini filtrlash
    const imageFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning(t("updateMedicalImage.notImageFile", { fileName: file.name }));
        return false;
      }
      return true;
    });

    if (imageFiles.length === 0) {
      toast.error(t("updateMedicalImage.selectImageFiles"));
      return;
    }

    // Barcha fayllarni uploading holatiga qo'shamiz
    setUploadingFiles((prev) => [...prev, ...imageFiles.map((f) => f.name)]);

    let successCount = 0;
    let errorCount = 0;

    // Barcha fayllarni parallel yuklash
    const uploadPromises = imageFiles.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await uploadImage(formData).unwrap();

        if (response.success && response.file_path) {
          successCount++;
          return response.file_path;
        } else {
          errorCount++;
          const resp = response as unknown as UploadResponseError;
          const errorMsg = resp?.error?.msg || resp?.message;
          if (errorMsg) {
            toast.error(`"${file.name}": ${errorMsg}`);
          } else {
            toast.error(t("updateMedicalImage.uploadError", { fileName: file.name }));
          }
          return null;
        }
      } catch (error: unknown) {
        errorCount++;
        const err = error as UploadError;
        const errorMsg = err?.data?.error?.msg || err?.data?.message;
        if (errorMsg) {
          toast.error(`"${file.name}": ${errorMsg}`);
        } else {
          toast.error(t("updateMedicalImage.uploadError", { fileName: file.name }));
        }
        return null;
      } finally {
        setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      }
    });

    // Barcha yuklashlar tugashini kutamiz
    const uploadedPaths = await Promise.all(uploadPromises);
    const validPaths = uploadedPaths.filter(
      (path): path is string => path !== null
    );

    // Duplicate detection - mavjud rasmlarni tekshirish
    const currentPaths = form.getValues("image_paths");
    const newUniquePaths = validPaths.filter(
      (path) => !currentPaths.includes(path)
    );
    const duplicateCount = validPaths.length - newUniquePaths.length;

    // Barcha yangi yo'llarni bir vaqtning o'zida qo'shamiz
    if (newUniquePaths.length > 0) {
      form.setValue("image_paths", [...currentPaths, ...newUniquePaths], {
        shouldValidate: true,
      });
    }

    // Success va error xabarlari
    if (successCount > 0) {
      toast.success(t("updateMedicalImage.imagesUploaded", { count: successCount }));
    }
    if (duplicateCount > 0) {
      toast.warning(
        t("updateMedicalImage.imagesAlreadyExist", { count: duplicateCount })
      );
    }
  };

  const onSubmit = async (data: MedicalImageFormData) => {
    if (!medicalImage) {
      toast.error(t("updateMedicalImage.imageNotFound"));
      return;
    }

    await handleRequest({
      request: async () =>
        await updateMedicalImage({
          id: medicalImage._id,
          body: {
            examination_id: data.examination_id,
            imaging_type_id: data.imaging_type_id,
            image_paths: data.image_paths,
            body_part: data.body_part,
            description: data.description,
          },
        }).unwrap(),
      onSuccess: () => {
        toast.success(t("updateMedicalImage.updatedSuccess"));
        onOpenChange(false);
      },
      onError: ({ data }) => {
        const errorMsg = data?.error?.msg || data?.message;
        if (errorMsg) {
          toast.error(errorMsg);
        } else {
          toast.error(t("updateMedicalImage.updateError"));
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-3xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            {t("updateMedicalImage.title")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(75vh-120px)]">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 sm:p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="examination_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("updateMedicalImage.examination")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-300 border-2 bg-slate-50 cursor-not-allowed">
                            <SelectValue placeholder={t("updateMedicalImage.selectExamination")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examinations?.data?.map((exam) => {
                            const examData = exam as unknown as ExamData;
                            return (
                              <SelectItem
                                key={examData._id}
                                value={examData._id}
                              >
                                {examData.patient_id.fullname}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imaging_type_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("updateMedicalImage.imagingType")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-400 border-2">
                            <SelectValue placeholder={t("updateMedicalImage.selectImagingType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {imagingTypes?.data?.map((type) => (
                            <SelectItem key={type._id} value={type._id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="body_part"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("updateMedicalImage.bodyPart")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-slate-400 border-2">
                          <SelectValue placeholder={t("updateMedicalImage.selectBodyPart")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyPartKeys.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {t(`bodyParts.${option.key}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_paths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("updateMedicalImage.images")} <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-2 border-dashed border-primary/50 hover:border-primary"
                            onClick={() =>
                              document
                                .getElementById("update-image-upload")
                                ?.click()
                            }
                            disabled={isUploading}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {isUploading ? t("updateMedicalImage.uploading") : t("updateMedicalImage.addImage")}
                          </Button>
                          <input
                            id="update-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files)}
                          />
                        </div>

                        {uploadingFiles.length > 0 && (
                          <div className="space-y-1">
                            {uploadingFiles.map((fileName) => (
                              <div
                                key={fileName}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                {fileName}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Uploaded Images Preview - Horizontal Scroll Carousel */}
                        {field.value.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-muted-foreground">
                                {t("updateMedicalImage.uploadedImages")}: {field.value.length} {t("updateMedicalImage.items")}
                              </p>
                            </div>
                            <div className="relative max-w-[85vw] sm:max-w-[80vw] lg:max-w-2xl overflow-hidden mx-auto">
                              <div className="overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40 w-full">
                                <div className="flex gap-3">
                                  {field.value.map((path, index) => (
                                    <div
                                      key={index}
                                      className="relative group flex-shrink-0 w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 border-2 border-slate-200 rounded-lg overflow-hidden hover:border-primary transition-all"
                                    >
                                      <img
                                        src={path}
                                        alt={`Расм ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newPaths = field.value.filter(
                                            (_, i) => i !== index
                                          );
                                          field.onChange(newPaths);
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                        title="О'chirish"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs py-1.5 px-2 text-center font-medium">
                                        #{index + 1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("updateMedicalImage.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("updateMedicalImage.descriptionPlaceholder")}
                        className="border-slate-400 border-2 w-full min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="p-4 sm:p-6 pt-0 gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("updateMedicalImage.saving")}
                    </div>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t("updateMedicalImage.save")}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
