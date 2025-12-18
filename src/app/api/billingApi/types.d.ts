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
    examination_id: {
      _id: string;
      doctor_id: {
        _id: string;
        fullname: string;
        phone: string;
      };
      diagnosis: {
        _id: string;
        name: string;
        code: string;
        description: string;
      };
      analyses: Array<{
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
            parameter_name: string;
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
          };
          analysis_parameter_value: number;
          _id: string;
        }>;
        level: string;
        status: string;
        created_at: string;
      }>;
      images: Array<{
        _id: string;
        patient_id: string;
        imaging_type_id: {
          _id: string;
          name: string;
          description: string;
        };
        image_paths: string[];
        description: string;
        body_part: string;
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
        days: Array<{
          day: number;
          times: number;
          date: string | null;
          _id: string;
        }>;
        _id: string;
      }>;
      service: {
        _id: string;
        patient_id: string;
        doctor_id: string;
        examination_id: string;
        duration: number;
        items: Array<
          {
            service_type_id: {
              _id: string;
              name: string;
              description: string;
            };
            notes: string;
            days: Array<
              {
                day: number;
                is_completed: boolean;
                date: Date | null;
                _id: string;
              }
            >;
            _id: string;
          }
        >;
        created_at: '2025-12-17T04:27:34.001Z';
        updated_at: '2025-12-17T04:27:34.001Z';
      };
      rooms: Array<{
        room_id: string;
        start_date: string;
        room_price: number;
        room_name: string;
        floor_number: number;
        _id: string;
        end_date?: string;
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
