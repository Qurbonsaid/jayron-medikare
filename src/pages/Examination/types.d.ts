export interface EditForm {
  complaints: string;
  description: string;
  diagnosis: string[];
  treatment_type: "ambulator" | "stasionar";
}

export interface PrescriptionForm {
  medication_id: string;
  frequency: string;
  duration: string;
  instructions: string;
  addons: string;
}

// Service states
export type ServiceDay = { day: number; date: Date | null };
export type ServiceItem = {
  id: string;
  service_type_id: string;
  duration: number;
  notes: string;
  days: ServiceDay[];
};