import { Pagination } from '../patientApi/types';

export type ExamResponse = {
  success: boolean;
  access_token: string;
  error: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
};

export type examCreateReq = {
  patient_id: string;
  doctor_id: string;
  description?: string;
  complaints: string;
  treatment_type: 'stasionar' | 'ambulator';
};

type Analysis = {
  _id: string;
  analysis_type: {
    _id: string;
    name: string;
    description: string;
  };
  patient: string;
  results: Array<{
    analysis_parameter_type: string;
    analysis_parameter_value: number;
    _id: string;
  }>;
  level: string;
  status: string;
  created_at: Date;
};

type CorpusId = {
  _id: string;
  name: string;
};

type Patient = {
  _id: string;
  fullname: string;
};

type Image = {
  _id: string;
  patient_id: string;
  imaging_type_id: {
    _id: string;
    name: string;
    description: string;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
  };
  image_paths: Array<string>;
  description: string;
  body_part: string;
  status: string;
  created_at: Date;
  updated_at: Date;
};

export type Day = {
  _id: string;
  date: string | null;
  day: number;
  times: number;
};

export type Room = {
  room_id: string;
  start_date: string;
  room_price: number;
  room_name: string;
  floor_number: number;
  _id: string;
  end_date?: string;
};

export type ExamDataItem = {
  _id: string;
  patient_id: {
    _id: string;
    fullname: string;
    phone: string;
  };
  doctor_id: {
    _id: string;
    fullname: string;
    phone: string;
  };
  diagnosis:
    | {
        _id: string;
        name: string;
      }
    | string
    | null;
  description: string;
  complaints: string;
  treatment_type: 'stasionar' | 'ambulator';
  analyses: Array<Analysis>;
  billing_id: string | null;
  images: Array<Image> | [];
  prescriptions?: Array<getOnePrescriptionRes> | null;
  service?: Array<getOneServiceRes> | null;
  status: status;
  neurological_status_id: string | null;
  daily_checkup_id: string | null;
  rooms: Array<Room>;
  created_at: Date;
  updated_at: Date;
};

export type AllExamRes = {
  success: boolean;
  data: Array<ExamDataItem>;
  pagination: Pagination;
};

export interface MutationRes {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
}

export type UpdateExamReq = {
  id: string;
  body: {
    patient_id: string;
    diagnosis: string;
    description: string;
    complaints: string;
  };
};

export type status =
  | 'active'
  | 'inactive'
  | 'completed'
  | 'deleted'
  | 'pending';

export type ExamRes = {
  success: boolean;
  data: ExamDataItem;
};
export type AllExamReq = {
  page?: number;
  limit?: number;
  doctor_id?: string;
  patient_id?: string;
  status?: status;
  is_roomed?: boolean;
  treatment_type?: 'stasionar' | 'ambulator';
  room_name?: string;
  search?: string;
};

// prescriptions

export type Prescription = {
  medication_id: string;
  frequency: number;
  instructions: string;
  addons?: string;
  duration: number;
};

export interface getAllPrescriptionReq {
  page?: number;
  limit?: number;
  patient_id?: string;
  doctor_id?: string;
  examination_status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  is_roomed?: boolean;
}

export interface getOnePrescriptionRes {
  _id: string;
  patient_id: {
    _id: string;
    patient_id: string;
    fullname: string;
    phone: string;
    gender: string;
    date_of_birth: Date;
    address: string;
  };
  doctor_id: {
    _id: string;
    fullname: string;
    username: string;
    phone: string;
    role: string;
    section: string;
    license_number: string;
  };
  examination_id: {
    _id: string;
    patient_id: string;
    doctor_id: string;
    diagnosis:
      | {
          _id: string;
          name: string;
        }
      | string
      | null;
    description: string;
    complaints: string;
    treatment_type: 'stasionar' | 'ambulator';
    status;
    rooms: Array<Room>;
    created_at: Date;
    updated_at: Date;
  };
  items: Array<{
    medication_id: {
      _id: string;
      name: string;
      form: string;
      dosage: string;
      is_active: true;
    };
    addons: Array<{
      medication_id: string;
      instructions: string;
      _id: string;
    }>;
    frequency: number;
    duration: number;
    instructions: string;
    days: Array<{
      day: number;
      times: number;
      date: Date | null;
      _id: string;
    }>;
    _id: string;
  }>;
  created_at: Date;
  updated_at: Date;
}

export interface getAllPrescriptionRes {
  success: boolean;
  data: Array<getOnePrescriptionRes>;
  pagination: Pagination;
}
export interface createPrescriptionReq {
  examination_id: string;
  items: Array<Prescription>;
}

export interface updatePrescriptionReq {
  id: string;
  body: {
    items: Array<Prescription & { _id: string }>;
  };
}

// images

export interface imageReq {
  id: string;
  body: {
    images: Array<string>;
  };
}

export interface addImagesRes extends MutationRes {
  addedImages: Array<string>;
}
export interface reomveimagesRes extends MutationRes {
  removedImages: Array<string>;
}

export interface createPrescriptionDays {
  id: string;
  prescriptionId: string;
  data: Prescription;
}

export interface takeMedicine {
  id: string;
  prescriptionId: string;
  day: string;
}

//  services

export interface getOneServiceRes extends getOnePrescriptionRes {
  duration: number;
  items: Array<{
    service_type_id: {
      _id: string;
      name: string;
      description: string;
      price: number;
    };
    notes: string;
    days: Array<{
      day: number;
      is_completed: boolean;
      date: Date | null;
      _id: string;
    }>;
    _id: string;
  }>;
}

export interface getAllServiceRes {
  success: boolean;
  data: Array<getOneServiceRes>;
  pagination: Pagination;
}
export interface createServiceDays {
  id: string;
  serviceId: string;
  data: {
    service_type_id: string;
    price: number;
    frequency: number;
    duration: number;
    status: status;
    notes: string;
  };
}

export interface takeService {
  id: string;
  serviceId: string;
  day: string;
}

export type Service = {
  service_type_id: string;
  days: Array<{
    day: number;
    date: Date | null;
  }>;
  notes: string;
};

export interface CreateService {
  examination_id: string;
  duration: number;
  items: Array<Service>;
}

export interface RemoveService {
  id: string;
  service_id: string;
}

export interface AddDailyCheckupReq {
  id: string;
  body: {
    blood_pressure: {
      systolic: number;
      diastolic: number;
    };
    notes: string;
  };
  checkup_id?: string;
}

export interface GetAlldailyCheckup {
  success: boolean;
  data: {
    date: string;
    blood_pressure: {
      systolic: number;
      diastolic: number;
    };
    notes: string;
    _id: string;
  }[];
}
