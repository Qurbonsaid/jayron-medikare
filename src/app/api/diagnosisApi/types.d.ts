interface getAllDiagnosisReq {
  page?: number;
  limit?: number;
  search?: string;
}

interface AllResponse {
  status: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    next: number | null;
    prev: number | null;
  };
}

interface getAllDiagnosisRes extends AllResponse {
  data: {
    _id: string;
    name: string;
    code: string;
    description: string;
    symptoms: Array<string>;
    causes: Array<string>;
    treatments: Array<string>;
    is_chronic: boolean;
    is_contagious: boolean;
    is_deleted: boolean;
    created_at: Date;
    updated_at: Date;
  }[];
}

export interface Disease {
  _id: string;
  code: string;
  name: string;
  description: string;
  symptoms: Array<string>;
  causes: Array<string>;
  treatments: Array<string>;
  is_chronic: boolean;
  is_contagious: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiseaseCreateRequest {
  code: string;
  name: string;
  description: string;
  symptoms: Array<string>;
  causes: Array<string>;
  treatments: Array<string>;
  is_chronic: boolean;
  is_contagious: boolean;
}

export type DiseaseUpdateRequest = Partial<DiseaseCreateRequest>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
