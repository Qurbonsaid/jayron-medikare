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

export interface GetOneBillingRes {
  success: boolean;
  data: {
    _id: string;
    patient_id: {
      _id: string;
      patient_id: string;
      fullname: string;
      phone: string;
    };
    examination_id: string;
    status: string;
    total_amount: number;
    paid_amount: number;
    debt_amount: number;
    services: Array<{
      name: string;
      count: number;
      price: number;
      _id: string;
      total_price: number;
    }>;
    payments: Array<{
      payment_method: string;
      amount: number;
      payment_date: Date;
      _id: string;
    }>;
    created_at: Date;
    updated_at: Date;
  };
}

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
