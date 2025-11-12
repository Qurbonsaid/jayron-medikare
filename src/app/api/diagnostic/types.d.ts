export type NormalRange = {
	male: { min: number | string; max: number | string; value: string }
	female: { min: number | string; max: number | string; value: string }
	general: { min: number | string; max: number | string; value: string }
}


// 🔹 Har bir tahlil parametri
export type AnalysisParameter = {
	_id: string
	parameter_code: string
	parameter_name: string
	unit: string
	normal_range: NormalRange
	description: string
	value_type: number | string,
  gender_type: GENERAL | MALE_FEMALE,
}

// 🔹 Asosiy tahlil obyekt
export type AnalysisItem =  {
	_id: string
	code: string
	name: string
	description: string
	analysis_parameters: AnalysisParameter[]
	created_at: string
	updated_at: string
}

// 🔹 GetAll response tipi
export type AnalysisResponse = {
	success: boolean
	data: AnalysisItem[]
	pagination: {
		page: number
		limit: number
		total_items: number
		total_pages: number
		next_page: number | null
		prev_page: number | null
	}
}

// 🔹 CREATE request va UpdateAnalysisRequest
export type CreateAnalysisRequest = {
	code: string
	name: string
	description: string
}

export type CreateAnalysisResponse = {
	success: boolean
	message: string
	data: AnalysisItem
}

export type UpdateAnalysisResponse = {
  success: boolean
  message: string
  data: {
    _id: string
    code: string
    name: string
    analysis_parameters: string[]
    description: string
    created_at: string
    updated_at: string
  }
}

export type AnalysisByIdResponse = {
  success: boolean
  data: {
    _id: string
    code: string
    name: string
    description: string
    created_at: string
    updated_at: string
    analysis_parameters: AnalysisParameter[]
  }
}


export type AnalysisParamCreateRequest = {
  analysis_id: string
  parameter_code: string
  parameter_name: string
  unit: string
  normal_range: NormalRange
  description?: string
  value_type: 'NUMBER' | 'STRING'
  gender_type: 'GENERAL' | 'MALE_FEMALE'
}
