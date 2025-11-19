export interface CreateBillingReq {
  examination_id: string;
  services: Array<{
    name: string;
    count: number;
    price: number;
  }>;
  payment: {
    payment_method: string;
    amount: number;
  };
}

export interface AllRes {
  success: boolean;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
  msg?: string;
}

export type GetOneBillingRes = {
  success: true;
  data: {
    _id: string;
    patient_id: {
      _id: string;
      patient_id: string;
      fullname: string;
      phone: string;
    };
    examination_id: {
      _id: string;
      diagnosis: string;
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
      }>;
      prescriptions: Array<{
        medication: string;
        dosage: number;
        frequency: number;
        duration: number;
        instructions: string;
        _id: string;
      }>;
      rooms: Array<{
        _id?: string;
        room_id: string;
        start_date: Date;
        end_date?: Date;
        room_price: number;
        room_name: string;
        floor_number?: number;
      }>;
    };
    status: string;
    total_amount: number;
    paid_amount: number;
    debt_amount: number;
    services: Array<{
      name: string;
      count: number;
      price: number;
      total_price: number;
      _id: string;
    }>;
    payments: Array<{
      payment_method: string;
      amount: number;
      payment_date: string;
      _id: string;
    }>;
    created_at: string;
    updated_at: string;
  };
};

export type status =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'deleted';

export interface GetAllBillingReq {
  page?: number;
  limit?: number;
  status?: status;
  patient_id?: string;
}

export interface GetAllBillingRes {
  success: boolean;
  data: Array<{
    _id: string;
    patient_id: {
      _id: string;
      fullname: string;
    };
    status: string;
    total_amount: number;
    paid_amount: number;
    debt_amount: number;
    created_at: Date;
  }>;
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
}

export interface UpdateService {
  id: string;
  body: {
    services: Array<{
      name: string;
      count: number;
      price: number;
    }>;
  };
}

export interface UpdatePayment {
  id: string;
  body: {
    payment: {
      payment_method: string;
      amount: number;
    };
  };
}

export interface MutationRes {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
}
