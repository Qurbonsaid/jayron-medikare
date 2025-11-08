export type ExamResponse = {
  success: boolean;
  access_token: string;
  error: {
    statusCode: number;
    statusMsg: string;
    msg: string;
  };
};

export type CreateExamReq = {
  patient_id: string;
  doctor_id: string;
  description?: string;
  complaints: string;
};
