// History API types

export interface HistoryItem {
  _id: string;
  examination_id: string;
  patient_info: string;
  diagnosis: string;
  prescriptions: string[];
  completed_date: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryPagination {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
}

export interface GetAllHistoryRequest {
  page?: number;
  limit?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface GetAllHistoryResponse {
  success: boolean;
  data: HistoryItem[];
  pagination: HistoryPagination;
}

export interface GetOneHistoryResponse {
  success: boolean;
  data: HistoryItem;
}
