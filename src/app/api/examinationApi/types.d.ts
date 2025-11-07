import { Pagination } from '../patientApi/types';

export type examCreateReq = {
  patient_id: string;
  doctor_id: string;
  description: string;
  complaints: string;
};
export type AllExamRes = {
  success: boolean;
  data: Array<ExamRes>;
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
};

export type UpdateExamReq = {
  id: string;
  body: {
  patient_id: string;
  diagnosis: string;
  description: string;
  complaints: string;
};
};

type status = 'active' | 'inactive' | 'completed' | 'deleted';

export type ExamRes = {
  success:boolean;
  data:{
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
  analyses: Array | null;
  billing_id: string | null;
  images: Array<string>;
  status: status;
  prescriptions: Array<{
    medication: string;
    dosage: number;
    frequency: number;
    duration: number;
    instructions: string;
    _id: string;
  }>;
  rooms: Array;
  created_at: Date;
  updated_at: Date;
}
};
export type AllExamReq = {
  page?: number;
  limit?: number;
  doctor_id?: string;
  patient_id?: string;
  status?: status;
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
};

export interface updatePrescriptionReq extends createPrescriptionReq{
  prescription_id:string
}
export interface deletePrescriptionReq {
  id:string;
  prescription_id:string
}

// images

export interface imageReq {
  id: string;
  body:{
    images: Array<string>
  }
}

export interface addImagesRes extends MutationRes {
  addedImages : Array<string>
}
export interface reomveimagesRes extends MutationRes {
  removedImages : Array<string>
}