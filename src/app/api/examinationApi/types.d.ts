import { Pagination } from '../patientApi/types';

export type examCreateReq = {
  patient_id: string;
  doctor_id: string;
  description: string;
  complaints: string;
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
  description: string;
  complaints: string;
  analyses: Array<{
    _id: string;
    analysis_type: string;
    patient: string;
    results: Array<{
      analysis_parameter_type: string;
      analysis_parameter_value: number | string;
      _id: string;
    }>;
    level: string;
    clinical_indications: string;
    comment: string;
    status: string;
    created_at: string;
    updated_at: string;
  }> | null;
  billing_id: string | null;
  images: Array<string>;
  status;
  diagnosis?:
    | {
        _id: string;
        name: string;
      }
    | string;
  prescriptions: Array<{
    medication: string;
    dosage: number;
    frequency: number;
    duration: number;
    instructions: string;
    _id: string;
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
  rooms: Array<{
    room_name: string;
    room_price: number;
    corpus_id: string | CorpusId;
    patient_capacity: number;
    patient_occupied: number;
    patients: Patient[];
    floor_number: number;
    description: string;
    status: string;
    _id: string;
    created_at: string;
    updated_at: string;
  }>;
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
};

// prescriptions

export type Prescription = {
  medication: string;
  dosage: number;
  frequency: number;
  duration: number;
  instructions: string;
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
