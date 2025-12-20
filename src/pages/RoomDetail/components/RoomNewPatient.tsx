import { useBiometricPatientMutation } from '@/app/api/biometricApi'
import { useGetAllExamsQuery } from '@/app/api/examinationApi'
import { useAddPatientRoomMutation } from '@/app/api/roomApi'
import { useUploadFilesMutation } from '@/app/api/upload'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

	const [biometricPatient, { isLoading: isBiometricLoading }] =
		useBiometricPatientMutation()

	const [uploadFiles, { isLoading: isUploadLoading }] = useUploadFilesMutation()

	const startCamera = async () => {
		try {
			// Set camera active FIRST so video element renders in DOM
			setIsCameraActive(true)

			// Wait a bit for React to render the video element
			await new Promise(resolve => setTimeout(resolve, 100))

			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user', width: 300, height: 400 },
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
			toast.success('Kamera tayyor ✓')
		} catch (error) {
			console.error('Camera error:', error)
			toast.error('Kamerani ochishda xatolik')
			setImageError('Kamera ruxsati berilmadi')
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
			toast.error('Kamera tayyor emas')
			return
		}

		if (biometricImages.length >= 5) {
			toast.error("Ko'pi bilan 5 ta rasm olish mumkin")
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
			toast.error('Kamera hali tayyor emas, biroz kuting')
			return
		}

		const context = canvasRef.current.getContext('2d')
		if (!context) {
			toast.error('Canvas xatosi')
			return
		}

		// Set canvas size to 3:4 aspect ratio (450x600) - width smaller than height
		const targetWidth = 450
		const targetHeight = 600
		canvasRef.current.width = targetWidth
		canvasRef.current.height = targetHeight

		// Calculate crop dimensions to maintain 3:4 aspect ratio from center of video
		const videoWidth = videoRef.current.videoWidth
		const videoHeight = videoRef.current.videoHeight
		const videoAspect = videoWidth / videoHeight
		const targetAspect = targetWidth / targetHeight

		// Zoom factor for closer face view
		const zoomFactor = 1.5

		let sourceWidth = videoWidth / zoomFactor
		let sourceHeight = videoHeight / zoomFactor
		let sourceX = 0
		let sourceY = 0

		if (videoAspect > targetAspect) {
			// Video is wider, crop sides
			sourceWidth = (videoHeight / zoomFactor) * targetAspect
			sourceX = (videoWidth - sourceWidth) / 2
			sourceY = (videoHeight - videoHeight / zoomFactor) / 2
		} else {
			// Video is taller, crop top/bottom
			sourceHeight = videoWidth / zoomFactor / targetAspect
			sourceX = (videoWidth - videoWidth / zoomFactor) / 2
			sourceY = (videoHeight - sourceHeight) / 2
		}

		// Draw cropped and resized video frame to canvas
		context.drawImage(
			videoRef.current,
			sourceX,
			sourceY,
			sourceWidth,
			sourceHeight,
			0,
			0,
			targetWidth,
			targetHeight
		)

		// Convert canvas to blob then to File
		canvasRef.current.toBlob(
			blob => {
				if (!blob) {
					toast.error('Rasmni saqlashda xatolik')
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
				toast.success(`Rasm ${newImages.length}/5 olindi`)

				// Stop camera if reached 5 images
				if (newImages.length >= 5) {
					stopCamera()
					toast.success('5 ta rasm olindi ✓')
				}
			},
			'image/jpeg',
			0.95
		)
	}

	const removeImage = (index: number) => {
		// Revoke old preview URL
		if (imagePreviewUrls[index]) {
			URL.revokeObjectURL(imagePreviewUrls[index])
		}

		const newImages = biometricImages.filter((_, i) => i !== index)
		const newPreviews = imagePreviewUrls.filter((_, i) => i !== index)
		setBiometricImages(newImages)
		setImagePreviewUrls(newPreviews)
		setCaptureCount(newImages.length)

		if (newImages.length < 2 && newImages.length > 0) {
			setImageError('Kamida 2 ta rasm yuklang')
		} else {
			setImageError('')
		}
	}

	const onSubmit = async () => {
		// Validate patient selection
		if (!selectedPatient) {
			toast.error('Bemorni tanlang')
			return
		}

		// Validate estimated leave time
		if (!estimatedLeaveTime) {
			toast.error('Ketish vaqtini tanlang')
			return
		}

		// Validate biometric images
		if (biometricImages.length < 1) {
			setImageError('Kamida 2 ta bemor suratini yuklang')
			toast.error('Kamida 2 ta bemor suratini yuklang')
			return
		}

		if (biometricImages.length > 5) {
			setImageError("Ko'pi bilan 5 ta rasm yuklash mumkin")
			toast.error("Ko'pi bilan 5 ta rasm yuklash mumkin")
			return
		}

		// Validate each image file
		for (let i = 0; i < biometricImages.length; i++) {
			const image = biometricImages[i]
			if (!image || !(image instanceof File)) {
				setImageError(`Rasm ${i + 1} xato formatda`)
				toast.error(`Rasm ${i + 1} xato formatda`)
				return
			}
			if (!image.type.startsWith('image/')) {
				setImageError(`Rasm ${i + 1} rasm fayli emas`)
				toast.error(`Rasm ${i + 1} rasm fayli emas`)
				return
			}
			if (image.size === 0) {
				setImageError(`Rasm ${i + 1} bo'sh`)
				toast.error(`Rasm ${i + 1} bo'sh`)
				return
			}
			if (image.size > 10 * 1024 * 1024) {
				// Max 10MB
				setImageError(`Rasm ${i + 1} juda katta (max 10MB)`)
				toast.error(`Rasm ${i + 1} juda katta (max 10MB)`)
				return
			}
		}

		await handleRequest({
			request: async () => {
				console.log('📤 Sending biometric images first:', {
					count: biometricImages.length,
					sizes: biometricImages.map(img => img.size),
					types: biometricImages.map(img => img.type),
					names: biometricImages.map(img => img.name),
				})
				console.log('📤 Patient ID:', selectedPatient._id)

				// First: Send biometric data (multipart/form-data)
				await biometricPatient({
					patientId: selectedPatient._id,
					images: biometricImages,
				}).unwrap()

				console.log('✅ Biometric registration SUCCESS')
				console.log('📝 Now adding patient to room...')

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
					'Бемор муваффақиятли қўшилди ва биометрик маълумотлар сақланди'
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
				toast.error(data?.error?.msg || 'Қўшишда хатолик')
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
						Xonaga yangi bemor qo'shish
					</DialogTitle>
				</DialogHeader>

				<div className='p-4 sm:p-6 pt-0 overflow-y-auto flex-1'>
					<div className='flex items-center gap-3 mb-4'>
						<User className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
						<h3 className='text-base font-bold'>Беморни танланг</h3>
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
								Беморни қидириш...
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
										placeholder='Исм, телефон орқали қидириш...'
										value={searchQuery}
										onValueChange={setSearchQuery}
										className='text-sm'
									/>
									<CommandList className='max-h-[210px] overflow-y-auto'>
										<CommandEmpty className='text-sm py-6'>
											{isLoading ? (
												<div className='flex flex-col items-center gap-2'>
													<span>Юкланмоқда...</span>
												</div>
											) : (
												<div className='flex flex-col items-center gap-2 text-muted-foreground'>
													<span>Бемор топилмади</span>
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
						<h3 className='text-base font-bold'>Ketish vaqtini tanlang</h3>
					</div>
					<Input
						type='date'
						min={new Date().toISOString().split('T')[0]}
						className='mt-4 w-full border border-gray-300 rounded-md p-2 text-sm sm:text-base'
						placeholder='Estimated Leave Time'
						value={estimatedLeaveTime}
						onChange={e => setEstimatedLeaveTime(e.target.value)}
					/>

					{/* Biometric Image Upload Section */}
					<div className='flex items-center gap-3 my-4'>
						<Camera className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
						<h3 className='text-base font-bold'>Bemor suratlarini yuklash</h3>
					</div>

					<div className='space-y-3'>
						{/* Camera Preview or Start Button */}
						{isCameraActive && biometricImages.length < 5 ? (
							<div className='relative'>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									className='w-full rounded-md border'
									style={{ aspectRatio: '3/4', objectFit: 'cover' }}
								/>
								{!isVideoReady && (
									<div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-md'>
										<div className='text-center text-white'>
											<div className='mb-2'>Kamera yuklanmoqda...</div>
											<div className='text-sm'>Biroz kuting</div>
										</div>
									</div>
								)}
								<div className='absolute bottom-4 left-0 right-0 flex justify-center gap-3'>
									<Button
										onClick={capturePhoto}
										disabled={!isVideoReady}
										className='bg-green-600 hover:bg-green-700 disabled:opacity-50'
									>
										<Camera className='w-4 h-4 mr-2' />
										{isVideoReady
											? `Rasmga olish (${biometricImages.length}/5)`
											: 'Kuting...'}
									</Button>
									<Button onClick={stopCamera} variant='destructive'>
										To'xtatish
									</Button>
								</div>
							</div>
						) : biometricImages.length === 0 ? (
							<Button onClick={startCamera} className='w-full'>
								<Camera className='w-4 h-4 mr-2' />
								Kamerani yoqish
							</Button>
						) : biometricImages.length < 5 ? (
							<Button
								onClick={startCamera}
								className='w-full'
								variant='outline'
							>
								<Camera className='w-4 h-4 mr-2' />
								Yana rasm olish ({biometricImages.length}/5)
							</Button>
						) : null}
						<canvas ref={canvasRef} className='hidden' />
						<p className='text-xs text-muted-foreground text-center'>
							{isCameraActive
								? `Turli burchaklardan rasmga oling (${biometricImages.length}/5)`
								: biometricImages.length === 0
								? '2-5 ta rasm oling (turli burchaklardan)'
								: `${biometricImages.length} ta rasm olindi${
										biometricImages.length < 2 ? ' (kamida 2 ta kerak)' : ' ✓'
								  }`}
						</p>
						{imageError && (
							<p className='text-sm text-red-500 font-medium'>{imageError}</p>
						)}{' '}
						{imagePreviewUrls.length > 0 && (
							<div className='grid grid-cols-2 sm:grid-cols-5 gap-3'>
								{imagePreviewUrls.map((previewUrl, index) => (
									<div key={index} className='relative group'>
										<img
											src={previewUrl}
											alt={`Bemor surati ${index + 1}`}
											className='w-full object-cover rounded-md border-2 border-gray-200'
											style={{ aspectRatio: '3/4' }}
										/>
										<button
											type='button'
											onClick={() => removeImage(index)}
											className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
										>
											<X className='w-3 h-3' />
										</button>
										<span className='absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded'>
											{index + 1}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<DialogFooter className='p-4 sm:p-6 pt-3 flex flex-col sm:flex-row gap-2 sm:gap-0 flex-shrink-0 border-t'>
					<Button
						type='button'
						variant='outline'
						onClick={() => onOpenChange(false)}
						className='w-full sm:w-auto order-2 sm:order-1'
					>
						Бекор қилиш
					</Button>
					<Button
						type='submit'
						disabled={
							isAddPatientLoading || isBiometricLoading || isUploadLoading
						}
						onClick={onSubmit}
						className='gradient-primary w-full sm:w-auto order-1 sm:order-2'
					>
						<Save className='w-4 h-4 mr-2' />
						{isAddPatientLoading || isBiometricLoading || isUploadLoading
							? 'Юкланмоқда...'
							: 'Сақлаш'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
