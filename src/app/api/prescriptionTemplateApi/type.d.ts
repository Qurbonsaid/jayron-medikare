type Template = {
  name: string;
  items: Array<{
    medication_id: string;
    addons: string;
    frequency: number;
    duration: number;
    instructions: string;
  }>;
};

type MutationResponse = {
  success: boolean;
  message?: string;
  error?: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
};

type GetAllParam = {
  page: number;
  limit: number;
  name: string;
};

type GetResponse = {
  _id: string;
  name: string;
  items: Array<{
    medication_id: {
      _id: string;
      name: string;
      form: string;
    } | null;
    addons: string;
    frequency: number;
    duration: number;
    instructions: string;
    _id: string;
  }>;
  created_at: Date;
  updated_at: Date;
};

type GetAllResponse = {
  data: Array<GetResponse>;
  page: number;
  limit: number;
  totalPages: number;
  totalDocs: number;
};

type UpdateRequest = {
  id: string;
  body: Template;
};
