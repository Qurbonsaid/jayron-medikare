import { useUpdateImagingTypeMutation } from "@/app/api/radiologyApi";
import { ImagingType } from "@/app/api/radiologyApi/types";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const ImagingTypeSchema = z.object({
  name: z.string().min(2, "Номи камида 2 та белгидан иборат бўлиши керак"),
  description: z.string().optional(),
});

type ImagingTypeFormData = z.infer<typeof ImagingTypeSchema>;

interface UpdateImagingTypeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imagingType: ImagingType | null;
}

export const UpdateImagingType = ({
  open,
  onOpenChange,
  imagingType,
}: UpdateImagingTypeProps) => {
  const [updateImagingType, { isLoading }] = useUpdateImagingTypeMutation();
  const handleRequest = useHandleRequest();

  const form = useForm<ImagingTypeFormData>({
    resolver: zodResolver(ImagingTypeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (imagingType) {
      form.reset({
        name: imagingType.name,
        description: imagingType.description || "",
      });
    }
  }, [imagingType, form]);

  const onSubmit = async (data: ImagingTypeFormData) => {
    if (!imagingType?._id) return;

    await handleRequest({
      request: async () =>
        await updateImagingType({
          id: imagingType._id,
          body: data,
        }).unwrap(),
      onSuccess: () => {
        toast.success("Текшириш тури муваффақиятли янгиланди");
        form.reset();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Янгилашда хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-2xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            Текшириш турини таҳрирлаш
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(75vh-120px)] px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-4 px-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Номи <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="МРТ, КТ, Рентген..."
                        className="border-slate-400 border-2 w-full"
                        {...field}
                      />
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
                        placeholder="Текшириш тури ҳақида қисқача маълумот..."
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
