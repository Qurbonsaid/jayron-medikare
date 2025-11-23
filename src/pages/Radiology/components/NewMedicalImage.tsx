import { useCreateMedicalImageMutation } from "@/app/api/radiologyApi";
import { useGetAllImagingTypesQuery } from "@/app/api/radiologyApi";
import { useGetAllExamsQuery } from "@/app/api/examinationApi";
import { useUploadCreateMutation } from "@/app/api/upload/uploadApi";
import { CreatedMedicalImageRequest } from "@/app/api/radiologyApi/types";
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

// Helper type for the actual exam data structure returned by API
interface ExamData {
  _id: string;
  created_at: Date;
  patient_id: {
    _id: string;
    fullname: string;
  };
}
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
import { Save, Upload, X, ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
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

// Tana qismlari ro'yxati
const bodyPartOptions = [
  { value: BodyPartConstants.HEAD, label: "Бош" },
  { value: BodyPartConstants.NECK, label: "Бўйин" },
  { value: BodyPartConstants.CHEST, label: "Кўкрак қафаси" },
  { value: BodyPartConstants.ABDOMEN, label: "Қорин бўшлиғи" },
  { value: BodyPartConstants.PELVIS, label: "Тос суяги" },
  { value: BodyPartConstants.SPINE, label: "Умуртқа поғонаси" },
  { value: BodyPartConstants.ARM, label: "Қўл" },
  { value: BodyPartConstants.LEG, label: "Оёқ" },
  { value: BodyPartConstants.KNEE, label: "Тизза" },
  { value: BodyPartConstants.SHOULDER, label: "Елка" },
  { value: BodyPartConstants.HAND, label: "Кафт" },
  { value: BodyPartConstants.FOOT, label: "Оёқ табани" },
];

const MedicalImageSchema = z.object({
  examination_id: z.string().min(1, "Кўрикни танланг"),
  imaging_type_id: z.string().min(1, "Текшириш турини танланг"),
  image_paths: z.array(z.string()).min(1, "Камида 1 та тасвир юкланг"),
  body_part: z.string().optional(),
  description: z.string().optional(),
});

type MedicalImageFormData = z.infer<typeof MedicalImageSchema>;

interface NewMedicalImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewMedicalImage = ({
  open,
  onOpenChange,
}: NewMedicalImageProps) => {
  const [createMedicalImage, { isLoading }] = useCreateMedicalImageMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadCreateMutation();
  const { data: imagingTypes } = useGetAllImagingTypesQuery({ limit: 100 });
  const { data: examinations } = useGetAllExamsQuery({ limit: 100 });
  const handleRequest = useHandleRequest();
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

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

  // Modal yopilganda formni va state'larni tozalash
  useEffect(() => {
    if (!open) {
      form.reset();
      setUploadingFiles([]);
    }
  }, [open, form]);

  // Rasm yuklash funksiyasi
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Fayllarni array'ga o'tkazamiz
    const fileArray = Array.from(files);

    // Faqat rasm fayllarini filtrlash
    const imageFiles = fileArray.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.warning(`"${file.name}" расм файли эмас ва ўтказиб юборилди`);
        return false;
      }
      return true;
    });

    if (imageFiles.length === 0) {
      toast.error("Илтимос, расм файлларини танланг");
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
            toast.error(`"${file.name}" юклашда хатолик юз берди`);
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
          toast.error(`"${file.name}" юклашда хатолик юз берди`);
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
      toast.success(`${successCount} та расм муваффақиятли юкланди`);
    }
    if (duplicateCount > 0) {
      toast.warning(
        `${duplicateCount} та расм аллақачон мавжуд ва ўтказиб юборилди`
      );
    }
  };

  const onSubmit = async (data: MedicalImageFormData) => {
    await handleRequest({
      request: async () =>
        await createMedicalImage(data as CreatedMedicalImageRequest).unwrap(),
      onSuccess: () => {
        toast.success("Тиббий тасвир муваффақиятли қўшилди");
        form.reset();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        const errorMsg = data?.error?.msg || data?.message;
        if (errorMsg) {
          toast.error(errorMsg);
        } else {
          toast.error("Тиббий тасвир қўшишда хатолик юз берди");
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-3xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            Янги тиббий тасвир қўшиш
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
                      <FormLabel>
                        Кўрик <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-400 border-2">
                            <SelectValue placeholder="Кўрикни танланг..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {examinations?.data?.map((exam) => {
                            // Type assertion needed because AllExamRes.data contains unwrapped exam objects
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
                        Текшириш тури <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-slate-400 border-2">
                            <SelectValue placeholder="Турини танланг..." />
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
                    <FormLabel>Танасининг қисми</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-slate-400 border-2">
                          <SelectValue placeholder="Тана қисмини танланг..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bodyPartOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                      Тасвирлар <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {/* File Upload Button */}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full border-2 border-dashed border-primary/50 hover:border-primary"
                            onClick={() =>
                              document.getElementById("image-upload")?.click()
                            }
                            disabled={isUploading}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {isUploading ? "Юкланмоқда..." : "Расм танланг"}
                          </Button>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFileUpload(e.target.files)}
                          />
                        </div>

                        {/* Uploading Files Indicator */}
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
                                Юкланган тасвирлар: {field.value.length} та
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
                    <FormLabel>Тавсиф</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Қўшимча маълумот..."
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
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    onOpenChange(false);
                  }}
                  disabled={isLoading}
                >
                  Бекор қилиш
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Сақланмоқда...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Сақлаш
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
