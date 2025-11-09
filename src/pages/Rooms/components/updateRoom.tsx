import { useUpdateRoomMutation } from "@/app/api/roomApi";
import {
  CreatedRoomRequest,
  Room,
  UpdatedRoomRequest,
} from "@/app/api/roomApi/types";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

const RoomSchema = z.object({
  room_name: z
    .string()
    .min(3, "Xona nomi kamida 3 ta belgidan iborat bo'lishi kerak"),
  room_price: z.number().min(1, "Xona narxi kiritilishi kerak"),
  corpus_id: z.string().min(1, "Korpus ID kiritilishi kerak"),
  patient_capacity: z.number().min(1, "Bemor sig'imi kamida 1 bo'lishi kerak"),
  floor_number: z.number().min(0, "Qavat raqami kiritilishi kerak").optional(),
  description: z
    .string()
    .min(5, "Izoh kamida 5 ta belgidan iborat bo'lishi kerak")
    .optional(),
});

type RoomFormData = z.infer<typeof RoomSchema>;

interface UpdateRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
}

export const UpdateRoom = ({ open, onOpenChange, room }: UpdateRoomProps) => {
  const [updatedRooms, { isLoading: isCreatedLoading }] =
    useUpdateRoomMutation();
  const handleRequest = useHandleRequest();
  const { id: corpusId } = useParams<{ id: string }>();
  const form = useForm<RoomFormData>({
    resolver: zodResolver(RoomSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      room_name: room?.room_name,
      room_price: room?.room_price,
      corpus_id: corpusId,
      patient_capacity: room?.patient_capacity,
      floor_number: room?.floor_number,
      description: room?.description,
    },
  });

  useEffect(() => {
    form.reset();
  }, [room]);

  const onSubmit = async (data: RoomFormData) => {
    const submitData = {
      body: {
        ...data,
      },
      id: room?._id,
    };

    await handleRequest({
      request: async () =>
        await updatedRooms(submitData as UpdatedRoomRequest).unwrap(),
      onSuccess: () => {
        toast.success("Xona муваффақиятли янгиланди");
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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[75vh] p-0 border-2 border-primary/30">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <DialogTitle className="text-xl sm:text-2xl">
            Хона маълумотларини янгилаш
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
                  name="room_name"
                  defaultValue={room?.room_name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Xona nomi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="101-xona"
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
                  name="room_price"
                  defaultValue={room?.room_price}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Xona narxi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="150000"
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
                  name="patient_capacity"
                  defaultValue={room?.patient_capacity}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Xona sig'imi <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4"
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
                  name="floor_number"
                  defaultValue={room?.floor_number}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Xona qavati <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="4"
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
                  defaultValue={room?.description}
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Izoh</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Асосий корпус"
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
            Бекор қилиш
          </Button>
          <Button
            type="submit"
            disabled={isCreatedLoading}
            onClick={form.handleSubmit(onSubmit)}
            className="gradient-primary w-full sm:w-auto order-1 sm:order-2"
          >
            <Save className="w-4 h-4 mr-2" />
            {isCreatedLoading ? "Loading..." : "Сақлаш"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
