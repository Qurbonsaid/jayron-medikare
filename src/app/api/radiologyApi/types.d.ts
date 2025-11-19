// ==================== IMAGING TYPE TYPES ====================

export type ImagingType = {
  _id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type ImagingTypeError = {
  statusCode: number;
  statusMsg: string;
  msg: string;
};

export type CreatedImagingTypeRequest = {
  name: string;
  description?: string;
};

export type CreatedImagingTypeResponse = {
  success: boolean;
  message: string;
  data: ImagingType;
  error?: ImagingTypeError;
};

export type GetAllImagingTypesParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type GetAllImagingTypesResponse = {
  success: boolean;
  data: ImagingType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    next: number | null;
    prev: number | null;
  };
};

export type GetOneImagingTypeResponse = {
  success: boolean;
  data: ImagingType;
  error?: ImagingTypeError;
};

export type UpdatedImagingTypeRequest = {
  body: {
    name?: string;
    description?: string;
  };
  id: string;
};

export type DeletedImagingTypeResponse = {
  success: boolean;
  message: string;
  error?: ImagingTypeError;
};

// ==================== MEDICAL IMAGE TYPES ====================

export type PatientInfo = {
  passport: {
    series: string;
    number: string;
  };
  _id: string;
  patient_id: string;
  fullname: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
  allergies: string[];
  regular_medications: [
    {
      medicine: string;
      schedule: string;
      _id: string;
    }
  ];
  diagnosis: {
    doctor_id: string;
    examination_id: string;
    diagnosis_id: null | string;
    _id: string;
  };
  is_deleted: boolean;
  email: string;
  created_at: string;
  updated_at: string;
};

export type ExaminationInfo = {
  _id: string;
  patient_id?: {
    _id: string;
    fullname: string;
    phone: string;
  };
  created_at: string;
};

export type ImagingTypeInfo = {
  _id: string;
  name: string;
  description: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
};

export type MedicalImage = {
  _id: string;
  patient_id: PatientInfo;
  examination_id: string | ExaminationInfo;
  imaging_type_id: ImagingTypeInfo;
  image_paths: string[];
  description?: string;
  body_part?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MedicalImageError = {
  statusCode: number;
  statusMsg: string;
  msg: string;
};

export type CreatedMedicalImageRequest = {
  patient_id?: string;
  examination_id: string;
  imaging_type_id: string;
  image_paths: string[];
  description?: string;
  body_part?: string;
};

export type CreatedMedicalImageResponse = {
  success: boolean;
  message: string;
  data: MedicalImage;
  error?: MedicalImageError;
};

export type GetAllMedicalImagesParams = {
  page?: number;
  limit?: number;
  patient_id?: string;
  examination_id?: string;
  imaging_type_id?: string;
  search?: string;
};

export type GetAllMedicalImagesResponse = {
  success: boolean;
  data: MedicalImage[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
    next: number | null;
    prev: number | null;
  };
};

export type GetOneMedicalImageResponse = {
  success: boolean;
  data: MedicalImage;
  error?: MedicalImageError;
};

export type UpdatedMedicalImageRequest = {
  body: {
    examination_id?: string;
    imaging_type_id?: string;
    image_paths?: string[];
    description?: string;
    body_part?: string;
  };
  id: string;
};

export type DeletedMedicalImageResponse = {
  success: boolean;
  message: string;
  error?: MedicalImageError;
};
