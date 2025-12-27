import { useBiometricPatientMutation } from '@/app/api/biometricApi'
import { useGetAllExamsQuery } from '@/app/api/examinationApi'
import { useAddPatientRoomMutation } from '@/app/api/roomApi'
import { useUploadFilesMutation } from '@/app/api/upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import { formatPhoneNumber } from '@/lib/utils'
import { Camera, Clock, Save, Search, User, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

interface RoomNewPatientProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const RoomNewPatient = ({ open, onOpenChange }: RoomNewPatientProps) => {
	const { t } = useTranslation('inpatient')
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedPatient, setSelectedPatient] = useState(null)
	const [estimatedLeaveTime, setEstimatedLeaveTime] = useState<string>('')
	const [openPopover, setOpenPopover] = useState(false)
	const [biometricImages, setBiometricImages] = useState<File[]>([])
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
	const [imageError, setImageError] = useState<string>('')
	const [isCameraActive, setIsCameraActive] = useState(false)
	const [isVideoReady, setIsVideoReady] = useState(false)
	const [captureCount, setCaptureCount] = useState(0)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const handleRequest = useHandleRequest()
	const { id: roomId } = useParams()
	const { data: examinations, isLoading } = useGetAllExamsQuery({
		page: 1,
		limit: 100,
		search: searchQuery || undefined,
		status: 'pending',
		is_roomed: false,
		treatment_type: 'stasionar',
	})

	const [addPatientRoom, { isLoading: isAddPatientLoading }] =
		useAddPatientRoomMutation()

	const [uploadFiles, { isLoading: isUploadLoading }] = useUploadFilesMutation()

	const startCamera = async () => {
		try {
			// Set camera active FIRST so video element renders in DOM
			setIsCameraActive(true)

			// Wait a bit for React to render the video element
			await new Promise(resolve => setTimeout(resolve, 100))

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user', width: 640, height: 480 },
			})

			streamRef.current = stream

			// Wait for video element to be available in DOM
			let attempts = 0
			while (!videoRef.current && attempts < 20) {
				await new Promise(resolve => setTimeout(resolve, 100))
				attempts++
			}

			if (!videoRef.current) {
				toast.error('Video element not ready')
				setIsCameraActive(false)
				return
			}

			if (videoRef.current) {
				videoRef.current.srcObject = stream
				videoRef.current.muted = true

				// Play video first
				try {
					await videoRef.current.play()
				} catch (playError) {
					console.error('Play error:', playError)
				}

				// Wait for video metadata with timeout
				await new Promise<void>((resolve, reject) => {
					const timeout = setTimeout(() => {
						reject(new Error('Video metadata timeout'))
					}, 10000)

					const checkReady = () => {
						if (
							videoRef.current &&
							videoRef.current.videoWidth > 0 &&
							videoRef.current.videoHeight > 0
						) {
							clearTimeout(timeout)
							console.log('📹 Video ready:', {
								width: videoRef.current.videoWidth,
								height: videoRef.current.videoHeight,
								readyState: videoRef.current.readyState,
							})
							setIsVideoReady(true)
							resolve()
						} else if (videoRef.current) {
							setTimeout(checkReady, 50)
						} else {
							clearTimeout(timeout)
							reject(new Error('Video ref lost'))
						}
					}
					checkReady()
				})
			}

			setImageError('')
			toast.success(t('cameraReady'))
		} catch (error) {
			console.error('Camera error:', error)
			toast.error(t('cameraOpenError'))
			setImageError(t('cameraPermissionDenied'))
			// Cleanup on error
			if (streamRef.current) {
				streamRef.current.getTracks().forEach(track => track.stop())
				streamRef.current = null
			}
		}
	}

	const stopCamera = () => {
		console.log('📹 RoomNewPatient - stopCamera called')
		if (streamRef.current) {
			console.log('🛑 Stopping camera stream...')
			streamRef.current.getTracks().forEach(track => track.stop())
			streamRef.current = null
		}
		if (videoRef.current) {
			console.log('🗑️ Clearing video source...')
			videoRef.current.srcObject = null
		}
		setIsCameraActive(false)
		setIsVideoReady(false)
		console.log('✅ Camera stopped and cleaned up')
	}

	const capturePhoto = () => {
		if (!videoRef.current || !canvasRef.current) {
			toast.error(t('cameraNotReady'))
			return
		}

		if (biometricImages.length >= 5) {
			toast.error(t('maxPhotosReached'))
			return
		}

		// Debug: Check video state
		console.log('🔍 Video state:', {
			videoWidth: videoRef.current.videoWidth,
			videoHeight: videoRef.current.videoHeight,
			readyState: videoRef.current.readyState,
			paused: videoRef.current.paused,
			ended: videoRef.current.ended,
		})

		// Check if video is ready and has valid dimensions
		if (
			videoRef.current.videoWidth === 0 ||
			videoRef.current.videoHeight === 0
		) {
			console.error('❌ Video not ready yet')
			toast.error(t('cameraNotReadyWait'))
			return
		}

		const context = canvasRef.current.getContext('2d')
		if (!context) {
			toast.error(t('canvasError'))
			return
		}

		// Set canvas size to match video
		canvasRef.current.width = videoRef.current.videoWidth
		canvasRef.current.height = videoRef.current.videoHeight

		// Draw current video frame to canvas
		context.drawImage(videoRef.current, 0, 0)

		// Convert canvas to blob then to File
		canvasRef.current.toBlob(
			blob => {
				if (!blob) {
					toast.error(t('imageSaveError'))
					return
				}

				const file = new File([blob], `biometric-${Date.now()}.jpg`, {
					type: 'image/jpeg',
				})

				const newImages = [...biometricImages, file]
				setBiometricImages(newImages)

				// Create preview
				const previewUrl = URL.createObjectURL(file)
				setImagePreviewUrls([...imagePreviewUrls, previewUrl])

				setCaptureCount(newImages.length)

				console.log(`📸 Photo ${newImages.length} captured`)
				toast.success(t('photoCaptured', { count: newImages.length }))

				// Stop camera if reached 5 images
				if (newImages.length >= 5) {
					stopCamera()
					toast.success(t('allPhotosCaptured'))
				}
			},
			'image/jpeg',
			0.95
		)
	}

	const onSubmit = async () => {
		// Validate patient selection
		if (!selectedPatient) {
			toast.error(t('selectPatient'))
			return
		}

		// Validate estimated leave time
		if (!estimatedLeaveTime) {
			toast.error(t('selectLeaveTime'))
			return
		}

		await handleRequest({
			request: async () => {
				// Second: Add patient to room ONLY if biometric succeeded
				await addPatientRoom({
					id: roomId,
					patient_id: selectedPatient._id,
					estimated_leave_time: estimatedLeaveTime,
				}).unwrap()

				console.log('✅ Patient added to room SUCCESS')
			},
			onSuccess: () => {
				toast.success(
					t('patientAddedSuccess')
				)
				// Clean up preview URLs
				imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))

				setSelectedPatient(null)
				setBiometricImages([])
				setImagePreviewUrls([])
				setEstimatedLeaveTime('')
				setImageError('')
				onOpenChange(false)
			},
			onError: ({ data }) => {
				toast.error(data?.error?.msg || t('addError'))
			},
		})
	}

	return (
		<Dialog
			open={open}
			onOpenChange={open => {
				console.log('🔄 RoomNewPatient modal open changed to:', open)
				if (!open) {
					console.log('🧹 Modal closing, cleaning up...')
					stopCamera()
					imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))

					// Clean up form fields
					setSelectedPatient(null)
					setSearchQuery('')
					setEstimatedLeaveTime('')
					setOpenPopover(false)

					// Clean up biometric data
					setBiometricImages([])
					setImagePreviewUrls([])
					setImageError('')
					setCaptureCount(0)

					console.log('✅ Cleanup completed (form + camera)')
				}
				onOpenChange(open)
			}}
		>
			<DialogContent className='max-w-[95vw] sm:max-w-[90vw] lg:max-w-2xl max-h-[85vh] p-0 border-2 border-primary/30 flex flex-col'>
				<DialogHeader className='p-4 sm:p-6 pb-3 m-0 flex-shrink-0'>
					<DialogTitle className='text-xl m-0 p-0'>
						{t('addNewPatientToRoom')}
					</DialogTitle>
				</DialogHeader>

				<div className='p-4 sm:p-6 pt-0 overflow-y-auto flex-1'>
					<div className='flex items-center gap-3 mb-4'>
						<User className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
						<h3 className='text-base font-bold'>{t('selectPatientLabel')}</h3>
					</div>

					<Button
						type='button'
						onClick={() => setOpenPopover(prev => !prev)}
						variant='outline'
						role='combobox'
						className='w-full justify-between h-auto min-h-[48px] sm:min-h-[56px] text-sm'
					>
						{selectedPatient ? (
							<div className='flex flex-col items-start gap-0.5'>
								<span className='font-semibold text-sm'>
									{selectedPatient.fullname}
								</span>
								<span className='text-xs text-muted-foreground'>
									{formatPhoneNumber(selectedPatient.phone || 0)}
								</span>
							</div>
						) : (
							<span className='flex items-center gap-2 text-sm'>
								<Search className='w-3 h-3 sm:w-4 sm:h-4  ' />
								{t('searchPatientPlaceholder')}
							</span>
						)}
					</Button>

					{openPopover && (
						<div
							className='w-full h-full fixed top-0 left-0 bg-black/10 z-20'
							onClick={() => setOpenPopover(false)}
						></div>
					)}

					<div className='w-full relative mt-2'>
						{openPopover && (
							<Card className='absolute top-0 left-0 w-full z-30 bg-white '>
								<Command shouldFilter={false}>
									<CommandInput
										placeholder={t('searchByNamePhone')}
										value={searchQuery}
										onValueChange={setSearchQuery}
										className='text-sm'
									/>
									<CommandList className='max-h-[210px] overflow-y-auto'>
										<CommandEmpty className='text-sm py-6'>
											{isLoading ? (
												<div className='flex flex-col items-center gap-2'>
													<span>{t('loading')}</span>
												</div>
											) : (
												<div className='flex flex-col items-center gap-2 text-muted-foreground'>
													<span>{t('patientNotFound')}</span>
												</div>
											)}
										</CommandEmpty>
										<CommandGroup>
											{!isLoading &&
												examinations?.data.map(exam => (
													<CommandItem
														key={exam._id}
														value={exam._id}
														onSelect={() => {
															setSelectedPatient(exam.patient_id)
															setOpenPopover(false)
														}}
														className='py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/20'
													>
														<div className='flex items-center gap-3 w-full'>
															<div className='flex flex-col flex-1 min-w-0'>
																<span className='font-semibold text-sm truncate'>
																	{exam.patient_id.fullname}
																</span>
																<span className='text-xs sm:text-xs text-muted-foreground truncate'>
																	{formatPhoneNumber(exam.patient_id.phone)}
																</span>
															</div>
														</div>
													</CommandItem>
												))}
										</CommandGroup>
									</CommandList>
								</Command>
							</Card>
						)}
					</div>

					<div className='flex items-center gap-3 my-4'>
						<Clock className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
						<h3 className='text-base font-bold'>{t('selectLeaveTimeLabel')}</h3>
					</div>
					<Input
						type='date'
						min={new Date().toISOString().split('T')[0]}
						className='mt-4 w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base'
						placeholder='Estimated Leave Time'
						value={estimatedLeaveTime}
						onChange={e => setEstimatedLeaveTime(e.target.value)}
					/>
				</div>

				<DialogFooter className='p-4 sm:p-6 pt-3 flex flex-col sm:flex-row gap-2 sm:gap-0 flex-shrink-0 border-t'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='w-full sm:w-auto order-2 sm:order-1'
					>
						{t('cancel')}
					</Button>
					<Button
						type='submit'
						disabled={isAddPatientLoading || isUploadLoading}
						onClick={onSubmit}
						className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
					>
						<Save className='w-4 h-4 mr-2' />
						{isAddPatientLoading || isUploadLoading
							? t('loading')
							: t('save')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
