import { useDeleteMedicalImageMutation } from "@/app/api/radiologyApi";
import { MedicalImage, PatientInfo } from "@/app/api/radiologyApi/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";

interface DeleteWarnMedicalImageProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalImage: MedicalImage | null;
}

export const DeleteWarnMedicalImage = ({
  open,
  onOpenChange,
  medicalImage,
}: DeleteWarnMedicalImageProps) => {
  const [deleteMedicalImage, { isLoading }] = useDeleteMedicalImageMutation();
  const handleRequest = useHandleRequest();

  const getPatientName = () => {
    if (!medicalImage) return "Номаълум";
    if (typeof medicalImage.patient_id === "string") return "Номаълум";
    return (medicalImage.patient_id as PatientInfo)?.fullname || "Номаълум";
  };

  const handleDelete = async () => {
    if (!medicalImage?._id) return;

    await handleRequest({
      request: async () =>
        await deleteMedicalImage({ id: medicalImage._id }).unwrap(),
      onSuccess: () => {
        toast.success("Тиббий таsvир муваффақиятли ўчирилди");
        onOpenChange(false);
      },
      onError: ({ data }) => {
        toast.error(data?.error?.msg || "Ўчиришда хатолик");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Тиббий тасвирни ўчириш</DialogTitle>
        <DialogDescription>
          Ростан ҳам <strong>{getPatientName()}</strong> беморнинг тиббий
          тасвирларини ўчирмоқчимисиз? Бу амални бекор қилиб бўлмайди.
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Бекор қилиш
          </Button>
          <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
            {isLoading ? "Ўчирилмоқда..." : "Ҳа, ўчирилсин"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
