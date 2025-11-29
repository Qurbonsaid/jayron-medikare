import { Pagination } from '../patientApi/types';

export type examCreateReq = {
  patient_id: string;
  doctor_id: string;
  description: string;
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
    analysis_parameter_type: {
      _id: string;
      analysis_id: string;
      parameter_code: string;
      parameter_name: string;
      unit: string;
      normal_range: {
        male: {
          min: number;
          max: number;
          value: string;
        };
        female: {
          min: number;
          max: number;
          value: string;
        };
        general: {
          min: number;
          max: number;
          value: string;
        };
      };
      value_type: string;
      gender_type: string;
      description: string;
      created_at: string;
      updated_at: string;
    };
    analysis_parameter_value: number;
    _id: string;
  }>;
  level: string;
  status: string;
  created_at: string;
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
  complaints: string;
  analyses: Array<Analysis> | null;
  billing_id: string | null;
  description: string;
  treatment_type:"stasionar"|"ambulator";
  images: Array<Image>;
  status: status;
  prescriptions: Array<{
    medication_id:
      | {
          _id: string;
          name: string;
          dosage: number;
          dosage_unit: string;
        }
      | string;
    frequency: number;
    duration: number;
    instructions: string;
    _id: string;
    days: Array<Day>;
  }>;
  services: Array<{
    service_type_id:{
          _id: string;
          name: string;
          price: number;
        };
    price: number;
    quantity: number;
    status: string;
    notes: string;
    _id: string;
  }>;
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

export const status =
  'active' | 'inactive' | 'pending' | 'completed' | 'deleted';

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
  search?: string;
};

// prescriptions
export type Day = {
  _id: string;
  date: string | null;
  day: number;
  times: number;
};

export type Prescription = {
  medication_id: string;
  frequency: number;
  instructions: string;
  duration: number;
};

export interface createPrescriptionReq {
  id: string;
  body: Prescription;
}

export interface updatePrescriptionReq extends createPrescriptionReq {
  prescription_id: string;
}
export interface deletePrescriptionReq {
  id: string;
  prescription_id: string;
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

export interface CreateService {
  id: string;
  body: {
    service_type_id: string;
    price: number;
    quantity: number;
    status: string;
    notes: string;
  };
}

export interface UpdateService extends CreateService {
  service_id: string;
}

export interface RemoveService {
  id: string;
  service_id: string;
}
