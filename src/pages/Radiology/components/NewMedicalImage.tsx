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
import { useState } from "react";

// Tana qismlari ro'yxati
const bodyPartOptions = [
  { value: BodyPartConstants.HEAD, label: "Бош" },
  { value: BodyPartConstants.NECK, label: "Бўйин" },
  { value: BodyPartConstants.CHEST, label: "Кўкрак" },
  { value: BodyPartConstants.ABDOMEN, label: "Қорин" },
  { value: BodyPartConstants.PELVIS, label: "Тос" },
  { value: BodyPartConstants.SPINE, label: "Умуртқа поғонаси" },
  { value: BodyPartConstants.ARM, label: "Қўл" },
  { value: BodyPartConstants.LEG, label: "Оёқ" },
  { value: BodyPartConstants.KNEE, label: "Тиззя" },
  { value: BodyPartConstants.SHOULDER, label: "Елка" },
  { value: BodyPartConstants.HAND, label: "Кафт" },
  { value: BodyPartConstants.FOOT, label: "Тобан" },
];

const MedicalImageSchema = z.object({
  examination_id: z.string().min(1, "Кўрикни танланг"),
  imaging_type_id: z.string().min(1, "Текшириш турини танланг"),
  image_paths: z.array(z.string()).min(1, "Камида 1 та таsvир юкланг"),
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

  // Rasm yuklash funksiyasi
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const currentPaths = form.getValues("image_paths");

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Faqat rasm fayllarini qabul qilish
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} rasm fayli emas`);
        continue;
      }

      setUploadingFiles((prev) => [...prev, file.name]);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await uploadImage(formData).unwrap();

        if (response.success && response.file_path) {
          form.setValue("image_paths", [...currentPaths, response.file_path]);
          toast.success(`${file.name} юкланди`);
        }
      } catch (error) {
        toast.error(`${file.name} юклашда хатолик`);
      } finally {
        setUploadingFiles((prev) => prev.filter((name) => name !== file.name));
      }
    }
  };

  const onSubmit = async (data: MedicalImageFormData) => {
    await handleRequest({
      request: async () =>
        await createMedicalImage(data as CreatedMedicalImageRequest).unwrap(),
      onSuccess: () => {
        toast.success("Тиббий таsvир муваффақиятли қўшилди");
        form.reset();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Қўшишда хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-3xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            Янги тиббий таsvир қўшиш
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(75vh-120px)] px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-4 px-2"
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
                            {isUploading ? "Юкланмоқда..." : "Рasm танланг"}
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

                        {/* Uploaded Images Preview */}
                        {field.value.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {field.value.map((path, index) => (
                              <div
                                key={index}
                                className="relative group border-2 border-slate-200 rounded-lg overflow-hidden aspect-square"
                              >
                                <img
                                  src={path}
                                  alt={`Rasm ${index + 1}`}
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
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                  {index + 1}
                                </div>
                              </div>
                            ))}
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

              <DialogFooter className="gap-2">
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    "Сақланмоқда..."
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
