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
				console.log('🔍 Biometric API - sending files:', {
					count: images.length,
					sizes: images.map(img => img.size),
					types: images.map(img => img.type),
				})

				// Validate inputs
				if (!patientId || patientId.trim() === '') {
					throw new Error('Patient ID is required')
				}

				if (!images || images.length === 0) {
					throw new Error('At least one image is required')
				}

				if (images.length > 5) {
					throw new Error('Maximum 5 images allowed')
				}

				// Validate each image
				images.forEach((file, index) => {
					if (!(file instanceof File)) {
						throw new Error(`Image ${index + 1} is not a valid File`)
					}
					if (!file.type.startsWith('image/')) {
						throw new Error(`Image ${index + 1} is not an image`)
					}
					if (file.size === 0) {
						throw new Error(`Image ${index + 1} is empty`)
					}
				})

				// Create FormData like Swagger shows (multipart/form-data)
				const formData = new FormData()
				images.forEach(file => {
					formData.append('images', file)
				})

				console.log('✅ Validation passed, sending FormData')

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
				console.log('🔍 Biometric Confirm - sending file:', {
					name: image.name,
					size: image.size,
					type: image.type,
				})

				// Validate inputs
				if (!patientId || patientId.trim() === '') {
					throw new Error('Patient ID is required')
				}

				if (!image || !(image instanceof File)) {
					throw new Error('Valid image file is required')
				}

				if (!image.type.startsWith('image/')) {
					throw new Error('File must be an image')
				}

				if (image.size === 0) {
					throw new Error('Image file is empty')
				}

				if (image.size > 10 * 1024 * 1024) {
					throw new Error('Image too large (max 10MB)')
				}

				// Create FormData with patient_id and image (multipart/form-data)
				const formData = new FormData()
				formData.append('patient_id', patientId)
				formData.append('image', image)

				console.log('✅ Validation passed, FormData created:', {
					patient_id: patientId,
					image: image.name,
					imageSize: image.size,
				})

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
