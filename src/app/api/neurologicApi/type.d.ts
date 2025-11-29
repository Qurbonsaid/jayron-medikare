interface BodyNeurologicStatus {
  meningeal_symptoms: string;
  i_para_n_olfactorius: string;
  ii_para_n_opticus: string;
  iii_para_n_oculomotorius: string;
  iv_para_n_trochlearis: string;
  v_para_n_trigeminus: string;
  vi_para_n_abducens: string;
  vii_para_n_fascialis: string;
  viii_para_n_vestibulocochlearis: string;
  ix_para_n_glossopharyngeus: string;
  x_para_n_vagus: string;
  xi_para_n_accessorius: string;
  xii_para_n_hypoglossus: string;
  motor_system: string;
  sensory_sphere: string;
  coordination_sphere: string;
  higher_brain_functions: string;
  syndromic_diagnosis_justification: string;
  topical_diagnosis_justification: string;
}

interface CreateNeurologicStatusReq extends BodyNeurologicStatus{
    examination_id: string;
}
interface UpdateNeurologicStatusReq extends BodyNeurologicStatus{
    id: string;
}

interface NeurologicStatus {
  _id: string;
  examination_id: {
    _id: string;
    patient_id: {
      _id: string;
      fullname: string;
      phone: string;
    };
    doctor_id: {
      _id: string;
      fullname: string;
      phone: string;
    };
    complaints: string;
    status: string;
  };
  meningeal_symptoms: string;
  i_para_n_olfactorius: string;
  ii_para_n_opticus: string;
  iii_para_n_oculomotorius: string;
  iv_para_n_trochlearis: string;
  v_para_n_trigeminus: string;
  vi_para_n_abducens: string;
  vii_para_n_fascialis: string;
  viii_para_n_vestibulocochlearis: string;
  ix_para_n_glossopharyngeus: string;
  x_para_n_vagus: string;
  xi_para_n_accessorius: string;
  xii_para_n_hypoglossus: string;
  motor_system: string;
  sensory_sphere: string;
  coordination_sphere: string;
  higher_brain_functions: string;
  syndromic_diagnosis_justification: string;
  topical_diagnosis_justification: string;
  created_at: Date;
  updated_at: Date;
}


interface getAllNeurologicStatusRes {
  success: boolean;
  data: Array<NeurologicStatus>;
  pagination: Pagination;
}

interface getAllNeurologicStatusReq {
  page:number;
  limit:number;
  examination_id:string;
}