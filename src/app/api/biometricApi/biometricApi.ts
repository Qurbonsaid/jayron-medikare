import { API_TAGS } from '@/constants/apiTags'
import { baseApi } from '../baseApi'
import { PATHS } from './path'
import { BiometricConfirmResponse } from './types'

export const biometricApi = baseApi.injectEndpoints({
	endpoints: builder => ({
		biometricPatient: builder.mutation<
			void,
			{ patientId: string; images: File[] }
		>({
			query: ({ patientId, images }) => {
				console.log('🔍 Biometric API - sending files:', images)
				console.log('🔍 Biometric API - files count:', images.length)

				// Create FormData like Swagger shows (multipart/form-data)
				const formData = new FormData()
				images.forEach(file => {
					formData.append('images', file)
				})

				return {
					url: `${PATHS.BIOMETRIC}patient/${patientId}/face-register`,
					method: 'POST',
					body: formData,
				}
			},
			invalidatesTags: [API_TAGS.BIOMETRIC],
		}),
		biometricConfirm: builder.mutation<
			BiometricConfirmResponse,
			{ patientId: string; image: File }
		>({
			query: ({ patientId, image }) => {
				console.log('🔍 Biometric Confirm - patient ID:', patientId)
				console.log('🔍 Biometric Confirm - sending file:', image)

				// Create FormData with patient_id and image (multipart/form-data)
				const formData = new FormData()
				formData.append('patient_id', patientId)
				formData.append('image', image)

				return {
					url: `${PATHS.BIOMETRIC}confirm`,
					method: 'POST',
					body: formData,
				}
			},
			invalidatesTags: [API_TAGS.BIOMETRIC],
		}),
	}),
})

export const { useBiometricPatientMutation, useBiometricConfirmMutation } =
	biometricApi
