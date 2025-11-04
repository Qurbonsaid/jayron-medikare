import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { UploadResponse } from './types'

export const uploadApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		uploadCreate: builder.mutation<UploadResponse, FormData>({
			query: formData => ({
				url: PATHS.UPLOAD,
				method: 'POST',
				body: formData,
			}),
		}),
	}),
})

export const { useUploadCreateMutation } = uploadApi
