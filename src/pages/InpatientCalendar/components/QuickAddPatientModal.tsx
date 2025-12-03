import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePatientMutation } from "@/app/api/patientApi";
import { useHandleRequest } from "@/hooks/Handle_Request/useHandleRequest";
import { toast } from "sonner";
import { UserPlus, Save } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";

interface QuickAddPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated: (patientId: string) => void;
}

export const QuickAddPatientModal = ({
  open,
  onOpenChange,
  onPatientCreated,
}: QuickAddPatientModalProps) => {
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("+998");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [passportSeries, setPassportSeries] = useState("");
  const [passportNumber, setPassportNumber] = useState("");

  const handleRequest = useHandleRequest();
  const [createPatient, { isLoading }] = useCreatePatientMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullname.trim()) {
      toast.error("Исм-фамилия киритинг");
      return;
    }

    if (!phone || phone.length < 13) {
      toast.error("Телефон рақамини тўлиқ киритинг");
      return;
    }

    if (!gender) {
      toast.error("Жинсни танланг");
      return;
    }

    if (!dateOfBirth) {
      toast.error("Туғилган санани киритинг");
      return;
    }

    if (!address.trim()) {
      toast.error("Манзил киритинг");
      return;
    }

    if (!passportSeries || passportSeries.length !== 2) {
      toast.error("Паспорт сериясини киритинг (2 та ҳарф)");
      return;
    }

    if (!passportNumber || passportNumber.length !== 7) {
      toast.error("Паспорт рақамини киритинг (7 та рақам)");
      return;
    }

    const submitData = {
      fullname: fullname.trim(),
      phone: phone.replace(/\s/g, ""),
      gender: gender as "male" | "female",
      date_of_birth: dateOfBirth,
      address: address.trim(),
      passport: {
        series: passportSeries,
        number: passportNumber,
      },
    };

    try {
      const response = await createPatient(submitData).unwrap();
      
      // Backend muvaffaqiyatli javob qaytardi
      if (response.success && response.data?._id) {
        toast.success("Бемор муваффақиятли қўшилди!");
        onPatientCreated(response.data._id);
        resetForm();
        onOpenChange(false);
      } else {
        toast.error("Бемор қўшилди, лекин маълумот олишда хатолик");
      }
    } catch (error) {
      // Network yoki backend xatolari
      const err = error as { data?: { message?: string; error?: { msg?: string } }; message?: string };
      const errorMsg = err?.data?.message || err?.data?.error?.msg || err?.message || "Бемор қўшишда хатолик юз берди";
      toast.error(errorMsg);
      console.error("Patient creation error:", error);
    }
  };

  const resetForm = () => {
    setFullname("");
    setPhone("+998");
    setGender("");
    setDateOfBirth("");
    setAddress("");
    setPassportSeries("");
    setPassportNumber("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            Янги Бемор Қўшиш
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Тезкор бемор қўшиш - асосий маълумотлар
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-sm sm:text-base">
              Исм-фамилия <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullname"
              placeholder="Алиев Валий Собирович"
              value={fullname}
              onChange={(e) => {
                const value = e.target.value.replace(
                  /[^a-zA-Zа-яА-ЯўЎҚқҒғҲҳ\s'-]/g,
                  ""
                );
                setFullname(value);
              }}
              required
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm sm:text-base">
              Телефон <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="+998 90 123 45 67"
              value={phone.replace(
                /(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/,
                "$1 $2 $3 $4 $5"
              )}
              onFocus={(e) => {
                if (!phone || phone === "") {
                  setPhone("+998");
                }
              }}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d+]/g, "");
                if (!value.startsWith("+998")) {
                  value = "+998";
                }
                if (value.length > 13) {
                  value = value.slice(0, 13);
                }
                setPhone(value);
              }}
              required
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          {/* Gender and Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm sm:text-base">
                Жинси <span className="text-red-500">*</span>
              </Label>
              <Select value={gender} onValueChange={(value: "male" | "female") => setGender(value)}>
                <SelectTrigger className="text-sm sm:text-base h-10 sm:h-11">
                  <SelectValue placeholder="Жинсни танланг" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male" className="text-sm sm:text-base">Эркак</SelectItem>
                  <SelectItem value="female" className="text-sm sm:text-base">Аёл</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_of_birth" className="text-sm sm:text-base">
                Туғилган сана <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={format(new Date(), "yyyy-MM-dd")}
                required
                className="text-sm sm:text-base h-10 sm:h-11"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm sm:text-base">
              Манзил <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Кўча номи, уй рақами"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="text-sm sm:text-base h-10 sm:h-11"
            />
          </div>

          {/* Passport */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Паспорт маълумотлари <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-5 gap-2">
              <div className="col-span-2">
                <Input
                  placeholder="AA"
                  maxLength={2}
                  value={passportSeries}
                  onChange={(e) => {
                    const value = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "");
                    setPassportSeries(value);
                  }}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11 text-center font-semibold"
                />
              </div>
              <div className="col-span-3">
                <Input
                  placeholder="1234567"
                  maxLength={7}
                  value={passportNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setPassportNumber(value);
                  }}
                  required
                  className="text-sm sm:text-base h-10 sm:h-11 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
            >
              Бекор қилиш
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 w-full sm:w-auto text-sm sm:text-base h-10 sm:h-11"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  Сақлаш ва Давом Этиш
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddPatientModal;
