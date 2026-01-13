export type ServiceTemplate = {
  name: string;
  duration: number;
  items: Array<{
    service_type_id: string;
  }>;
};

export type ServiceMutationResponse = {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
};

export type GetAllServiceParam = {
  page: number;
  limit: number;
  search: string;
};

export type GetServiceResponse = {
  _id: string;
  name: string;
  duration: number;
  items: Array<{
    service_type_id: {
      _id: string;
      name: string;
      price: number;
    } | null;
    _id: string;
  }>;
  created_at: Date;
  updated_at: Date;
};

export type GetAllServiceResponse = {
  data: Array<GetServiceResponse>;
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
};

export type ServiceUpdateRequest = {
  id: string;
  body: ServiceTemplate;
};
