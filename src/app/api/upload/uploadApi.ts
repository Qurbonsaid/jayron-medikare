import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { FilesUploadResponse, UploadResponse } from './types'

export const uploadApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		uploadCreate: builder.mutation<UploadResponse, FormData>({
			query: formData => ({
				url: PATHS.UPLOAD,
				method: 'POST',
				body: formData,
			}),
		}),
		uploadFiles: builder.mutation<FilesUploadResponse, FormData>({
			query: formData => ({
				url: PATHS.UPLOAD_FILES,
				method: 'POST',
				body: formData,
			}),
		}),
	}),
})

export const { useUploadCreateMutation, useUploadFilesMutation } = uploadApi
