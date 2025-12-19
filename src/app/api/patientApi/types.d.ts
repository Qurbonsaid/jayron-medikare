import { Analysis, Room } from "../examinationApi/types";

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
  data: {
    _id: string;
    patient_id: string;
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
    diagnosis: {
      doctor_id: {
        _id: string;
        fullname: string;
      };
      examination_id: {
        _id: string;
        patient_id: string;
        doctor_id: string;
        diagnosis: string;
        complaints: string;
        analyses:  Array<Analysis>;
        billing_id: string | null;
        images: Array<string>;
        status: string;
        status: status;
					prescriptions: Array<{
						medication: string;
						dosage: number;
						frequency: number;
						duration: number;
						instructions: string;
						_id: string;
						days: Day[];
					}>;
					services: Array<{
						service_type_id:
							| {
									_id: string;
									name: string;
									price: number;
								}
							| string;
						price: number;
						quantity: number;
						status: string;
						notes: string;
						_id: string;
					}>;
					rooms: Array<Room>;
					created_at: Date;
					updated_at: Date;
        description: string;
      };
      diagnosis_id: {
        _id: string;
        name: string;
        code: string;
        description: string;
      };
    };
  }[];
  pagination: Pagination;
};

export type AllPatientReq = {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  doctor_id?: string;
  is_diagnosis?: boolean;
  has_examination?:boolean;
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
      doctor_id: {
        _id: string;
        fullname: string;
        email: string;
        phone: string;
      };
      examination_id: string;
      diagnosis_id: {
        _id: string;
        name: string;
        code: string;
        description: string;
      };
      _id: string;
    };
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

export type Pagination = {
  limit: number;
  page: number;
  prev_page: number | null;
  next_page: number | null;
  total_items: number;
  total_pages: number;
};
