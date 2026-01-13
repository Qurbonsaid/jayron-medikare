interface createServiceReq {
  code: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  requirements: Array<string>;
}

interface ServiceRes {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
}

interface getAllReq {
  page?: number;
  limit?: number;
  search?:string;
  code?:string;
  is_active?:boolean;
  min_price?:number;
  max_price?:number;
}

interface ServiceData {
  _id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  requirements: string[];
  created_at: string;
  updated_at: string;
}

interface getAllRes {
  success: boolean;
  data: Array<ServiceData>;
  pagination: Pagination;
}

interface getOneRes {
  success: boolean;
  data: ServiceData;
}

interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  next: number | null;
  prev: number | null;
}

interface updateServiceReq {
  id: string;
  body: {
    code: string;
    name: string;
    description: string;
    price: number;
    duration_minutes: number;
    is_active: boolean;
    requirements: Array<string>;
  };
}
