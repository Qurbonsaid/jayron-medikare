export type Corpuses = {
  _id: string;
  corpus_number: 0;
  description: string;
  total_rooms: 0;
  status: string;
  created_at: string;
  updated_at: string;
};

export type UpdateCorpusError = {
  statusCode: number;
  statusMsg: string;
  msg: message;
};

export type CreatedCorpusResponse = {
  success: boolean;
  message: string;
  data: Corpuses;
  error?: UpdateCorpusError;
};

export type CreatedCorpusRequest = {
  corpus_number: number;
  description?: string;
  total_rooms: number;
};

export type CorpusesGetAllResponse = {
  success: boolean;
  data: Corpuses[];
  pagination: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
    next_page: boolean | null;
    prev_page: boolean | null;
  };
};

export type GetONeCorpusResponse = {
  success: boolean;
  data: Corpuses;
  error?: UpdateCorpusError;
};

export type UpdatedCorpusRequest = {
  body: {
    corpus_number?: number;
    description?: string;
    total_rooms?: number;
  };
  id: string;
};

export type DeletedCorpusResponse = {
  success: boolean;
  message: string;
  error?: UpdateCorpusError;
};
