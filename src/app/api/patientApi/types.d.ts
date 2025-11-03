export type CreatePatientReq = {
  fullname: string;
  phone: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  address?: string;
  email?: string;
  allergies?: string[];
  regularMedications?: {
    medicine: string;
    schedule: string;
  }[];
  passport: {
    series: string;
    number: string;
  };
};

export type PatientRes = {
  success: boolean;
  message: string;
};

export type AllPatientRes = {
  success: boolean;
  data: {
    _id: string;
    fullname: string;
    gender: 'male' | 'female';
    patient_id: string;
    phone: string;
    diagnosis: string[];
  }[];
  pagination: Pagination;
};

export type AllPatientReq = {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  doctor_id?: string;
};

type Pagination = {
  limit: number;
  page: number;
  prev_page: number | null;
  next_page: number | null;
  total_items: number;
  total_pages: number;
};
