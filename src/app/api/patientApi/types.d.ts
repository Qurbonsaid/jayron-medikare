export type CreatePatientReq = {
  fullname: string;
  phone: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  address?: string;
  email?: string;
  allergies?: string[];
  regular_medications?: {
    medicine?: string;
    schedule?: string;
  }[];
  passport: {
    series: string;
    number: string;
  };
};

export type PatientRes = {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
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

export type UpdateReq = {
  body: CreatePatientReq;
  id: string;
};

export type OnePatientRes = {
  success: true;
  data: {
    _id: string;
    patient_id: string;
    diagnosis: {
      doctor_id: string;
      description: string;
    }[];
    fullname: string;
    phone: string;
    gender: 'male' | 'female';
    date_of_birth: string;
    address?: string;
    email?: string;
    allergies?: string[];
    regular_medications?: {
      medicine: string;
      schedule: string;
      _id: string;
    }[];
    passport: {
      series: string;
      number: string;
    };
    created_at: Date;
    updated_at: Date;
  };
};

type Pagination = {
  limit: number;
  page: number;
  prev_page: number | null;
  next_page: number | null;
  total_items: number;
  total_pages: number;
};
