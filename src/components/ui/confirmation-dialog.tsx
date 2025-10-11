import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "destructive";
  requireCheckbox?: boolean;
  checkboxLabel?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Тасдиқлаш",
  cancelText = "Бекор қилиш",
  onConfirm,
  variant = "default",
  requireCheckbox = false,
  checkboxLabel = "Мен тушунаман"
}: ConfirmationDialogProps) {
  const [checked, setChecked] = useState(false);
  const canConfirm = !requireCheckbox || checked;

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      setChecked(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>{description}</div>
            {requireCheckbox && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-checkbox"
                  checked={checked}
                  onCheckedChange={(checked) => setChecked(checked as boolean)}
                />
                <label
                  htmlFor="confirm-checkbox"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {checkboxLabel}
                </label>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
