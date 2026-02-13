import { useUpdateCorpusMutation } from "@/app/api/corpusApi";
import { Corpuses, UpdatedCorpusRequest } from "@/app/api/corpusApi/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const BuildingSchema = z.object({
  corpus_number: z.number(),
  description: z.string(),
  total_rooms: z.number(),
});

type BuildingFormData = z.infer<typeof BuildingSchema>;

interface UpdatedBuildingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oneCorpus: Corpuses;
}

export const UpdatedBuilding = ({
  open,
  onOpenChange,
  oneCorpus,
}: UpdatedBuildingProps) => {
  const { t } = useTranslation("inpatient");
  const [updatedCorpuses, { isLoading: isUpdatedLoading }] =
    useUpdateCorpusMutation();
  const handleRequest = useHandleRequest();
  const form = useForm<BuildingFormData>({
    resolver: zodResolver(BuildingSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      corpus_number: oneCorpus?.corpus_number,
      description: oneCorpus?.description,
      total_rooms: oneCorpus?.total_rooms,
    },
  });

  useEffect(() => {
    form.reset();
  }, [oneCorpus]);

  const onSubmit = async (data: BuildingFormData) => {
    const submitData = {
      body: {
        ...data,
      },
      id: oneCorpus?._id,
    };

    await handleRequest({
      request: async () =>
        await updatedCorpuses(submitData as UpdatedCorpusRequest).unwrap(),
      onSuccess: () => {
        toast.success(t("buildingUpdatedSuccess"));
        form.reset();
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || t("updateError"));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[75vh] p-0 border-2 border-primary/30" aria-describedby={undefined}>
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            {t("editBuilding")}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(75vh-120px)] px-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 pb-4 px-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="corpus_number"
                  defaultValue={oneCorpus.corpus_number}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("buildingNumber")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          className="border-slate-400 border-2 w-full"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                          onKeyDown={(e) =>
                            "eE.,-+ ".includes(e.key) && e.preventDefault()
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total_rooms"
                  defaultValue={oneCorpus.total_rooms}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("roomsCount")} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          className="border-slate-400 border-2 w-full"
                          {...field}
                          onChange={(e) => field.onChange(+e.target.value)}
                          onKeyDown={(e) =>
                            "eE.,-+ ".includes(e.key) && e.preventDefault()
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  defaultValue={oneCorpus.description}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2 lg:col-span-1">
                      <FormLabel>
                        {t("description")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("mainBuilding")}
                          className="border-slate-400 border-2 w-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isUpdatedLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="gradient-primary w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdatedLoading ? t("loading") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
