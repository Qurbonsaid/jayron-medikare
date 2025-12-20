/* eslint-disable @typescript-eslint/no-explicit-any */
import { useBiometricConfirmMutation } from '@/app/api/biometricApi'
import {
	useGetAllExamsQuery,
	useTakeServiceMutation,
	type getOnePrescriptionRes,
	type getOneServiceRes,
} from '@/app/api/examinationApi'
import { useTakePrescriptionMutation } from '@/app/api/prescription/prescriptionApi'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'
import PrescriptionCard from '@/pages/Medicine/components/PrescriptionCard'
import { Camera, Check, Loader2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface Day {
	_id: string
	date: string | null
	day: number
	times: number | string
}

interface Prescription {
	_id: string
	medication_id:
		| {
				_id: string
				name: string
				dosage: number
				dosage_unit: string
		  }
		| string
	frequency: number
	duration: number
	instructions: string
	days?: Day[]
}

interface Service {
	service_type_id:
		| {
				_id: string
				code: string
				name: string
				description: string
		  }
		| string
	price: number
	frequency: number
	duration: number
	status: string
	notes?: string
	days?: Day[]
	_id: string
}

interface Room {
	room_name: string
}

interface Patient {
	_id: string
	fullname: string
}

interface ExamRecord {
	_id: string
	patient_id: Patient
	rooms: Room[]
	prescription: getOnePrescriptionRes | null
	service: getOneServiceRes | null
}

const Medicine = () => {
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	const [roomSearch, setRoomSearch] = useState('')
	const [confirmModal, setConfirmModal] = useState<{
		open: boolean
		recordId: string | null
		prescriptionId: string | null
		serviceId: string | null
		day: string | null
		type: 'medicine' | 'service'
	}>({
		open: false,
		recordId: null,
		prescriptionId: null,
		serviceId: null,
		day: null,
		type: 'medicine',
	})
	const [processedServices, setProcessedServices] = useState<Set<string>>(
		new Set()
	)
	const [biometricModal, setBiometricModal] = useState<{
		open: boolean
		patientId: string | null
	}>({ open: false, patientId: null })
	const [biometricImages, setBiometricImages] = useState<File[]>([])
	const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
	const [imageError, setImageError] = useState<string>('')
	const [biometricToken, setBiometricToken] = useState<string | null>(null)
	const [isCameraActive, setIsCameraActive] = useState(false)
	const [isVideoReady, setIsVideoReady] = useState(false)
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const canvasRef = useRef<HTMLCanvasElement | null>(null)
	const streamRef = useRef<MediaStream | null>(null)

	// RTK Query with room search
	const { data, isLoading, isError } = useGetAllExamsQuery({
		page: currentPage,
		limit: itemsPerPage,
		status: 'pending',
		is_roomed: true,
		...(roomSearch && { room_name: roomSearch }),
	} as any)

	const [takePrescription, { isLoading: takingMedicine }] =
		useTakePrescriptionMutation()
	const [takeService, { isLoading: takingService }] = useTakeServiceMutation()
	const [biometricConfirm, { isLoading: isConfirmingBiometric }] =
		useBiometricConfirmMutation()
	const handleRequest = useHandleRequest()

	// Format date helper
	const formatDate = (dateString: string | null) => {
		if (!dateString) return null
		const date = new Date(dateString)
		return date.toLocaleDateString('uz-UZ', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	// Service accordion ochilganda days yaratish
	// const handleServiceAccordionChange = async (
	// 	recordId: string,
	// 	service: Service
	// ) => {
	// 	if (service.days?.length > 0 || processedServices.has(service._id)) {
	// 		return
	// 	}

	// 	setProcessedServices(prev => new Set(prev).add(service._id))

	// 	await handleRequest({
	// 		request: () =>
	// 			createServiceDays({
	// 				id: recordId,
	// 				serviceId: service._id,
	// 				data: {
	// 					service_type_id:
	// 						typeof service.service_type_id === 'string'
	// 							? service.service_type_id
	// 							: service.service_type_id._id,
	// 					price: service.price,
	// 					frequency: service.frequency,
	// 					duration: service.duration,
	// 					status: service.status as any,
	// 					notes: service.notes,
	// 				},
	// 			}),
	// 		onSuccess: () => {
	// 			toast.success('Хизмат кунлари яратилди')
	// 		},
	// 		onError: err => {
	// 			if (err?.data) {
	// 				toast.error(err?.data?.error?.msg)
	// 			} else {
	// 				toast.error(err?.error?.msg || 'Хатолик юз берди')
	// 			}
	// 		},
	// 	})
	// }

	// Auto-start camera when biometric modal opens
	useEffect(() => {
		if (biometricModal.open && !isCameraActive) {
			console.log('🔄 Modal opened, auto-starting camera...')
			// Small delay to ensure video element is in DOM
			const timer = setTimeout(() => {
				startCamera()
			}, 150)
			return () => clearTimeout(timer)
		}
	}, [biometricModal.open])

	const startCamera = async () => {
		console.log('🎬 startCamera called')
		try {
			// Set camera active FIRST so video element renders in DOM
			setIsCameraActive(true)
			console.log('✅ isCameraActive set to true')

			// Wait a bit for React to render the video element
			await new Promise(resolve => setTimeout(resolve, 100))

			console.log('📹 Requesting camera access...')
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user', width: 300, height: 400 },
			})
			console.log('✅ Camera access granted')

			streamRef.current = stream

			// Wait for video element to be available in DOM
			let attempts = 0
			while (!videoRef.current && attempts < 20) {
				console.log(`🔍 Attempt ${attempts + 1}: Waiting for video element...`)
				await new Promise(resolve => setTimeout(resolve, 100))
				attempts++
			}

			if (!videoRef.current) {
				console.error('❌ Video element not found after 2 seconds!')
				toast.error('Video element not ready')
				setIsCameraActive(false)
				return
			}

			console.log('✅ Video element found!')

			if (videoRef.current) {
				console.log('📺 Setting video source...')
				videoRef.current.srcObject = stream
				videoRef.current.muted = true

				// Play immediately
				try {
					console.log('▶️ Playing video...')
					await videoRef.current.play()
					console.log('▶️ Video playing started')
				} catch (playError) {
					console.error('❌ Play error:', playError)
				}

				// Wait for video metadata with shorter interval and timeout
				await new Promise<void>((resolve, reject) => {
					let checkCount = 0
					const timeout = setTimeout(() => {
						console.error(
							'⏱️ Video metadata timeout after',
							checkCount,
							'checks'
						)
						setIsVideoReady(false)
						reject(new Error('Video metadata timeout'))
					}, 10000) // Increased to 10 seconds

					const checkVideo = () => {
						checkCount++
						if (
							videoRef.current &&
							videoRef.current.videoWidth > 0 &&
							videoRef.current.videoHeight > 0
						) {
							clearTimeout(timeout)
							console.log('✅ Video ready after', checkCount, 'checks:', {
								width: videoRef.current.videoWidth,
								height: videoRef.current.videoHeight,
								readyState: videoRef.current.readyState,
							})
							setIsVideoReady(true)
							resolve()
						} else if (videoRef.current) {
							if (checkCount % 20 === 0) {
								console.log(`⏳ Still waiting... (check ${checkCount})`)
							}
							setTimeout(checkVideo, 50)
						} else {
							clearTimeout(timeout)
							console.error('❌ Video ref lost')
							setIsVideoReady(false)
							reject(new Error('Video ref lost'))
						}
					}
					checkVideo()
				})
			}

			setImageError('')
			toast.success('Kamera tayyor ✓')
		} catch (error: any) {
			console.error('Camera error:', error)
			setIsVideoReady(false)
			setIsCameraActive(false)

			if (error.message === 'Video metadata timeout') {
				toast.error("Kamera juda uzoq yuklanyapti, qayta urinib ko'ring")
				setImageError('Timeout: Kamera juda sekin')
			} else {
				toast.error('Kamerani ochishda xatolik')
				setImageError('Kamera ruxsati berilmadi')
			}

			// Cleanup on error
			if (streamRef.current) {
				streamRef.current.getTracks().forEach(track => track.stop())
				streamRef.current = null
			}
		}
	}

	const stopCamera = () => {
		console.log('📹 stopCamera called')
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

				setBiometricImages([file])

				// Create preview
				const previewUrl = URL.createObjectURL(file)
				setImagePreviewUrls([previewUrl])

				// Stop camera after capture
				stopCamera()

				console.log('📸 Photo captured:', file)
				toast.success('Rasm olindi')
			},
			'image/jpeg',
			0.95
		)
	}

	const removeImage = () => {
		if (imagePreviewUrls[0]) {
			URL.revokeObjectURL(imagePreviewUrls[0])
		}

		setBiometricImages([])
		setImagePreviewUrls([])
		setImageError('')

		// Restart camera if needed
		if (biometricModal.open && !isCameraActive) {
			startCamera()
		}
	}

	const handleBiometricConfirm = async () => {
		console.log('🔍 handleBiometricConfirm - biometricImages:', biometricImages)
		console.log(
			'🔍 handleBiometricConfirm - biometricImages[0]:',
			biometricImages[0]
		)
		console.log(
			'🔍 handleBiometricConfirm - biometricImages.length:',
			biometricImages.length
		)

		// Validate image exists
		if (biometricImages.length === 0) {
			setImageError('Rasm yuklang')
			toast.error('Rasm yuklang')
			return
		}

		// Validate patient ID
		if (!biometricModal.patientId) {
			toast.error('Bemor topilmadi')
			return
		}

		const image = biometricImages[0]

		// Validate image file
		if (!image || !(image instanceof File)) {
			setImageError('Rasm xato formatda')
			toast.error('Rasm xato formatda')
			return
		}

		if (!image.type.startsWith('image/')) {
			setImageError('Faqat rasm fayllarini yuklang')
			toast.error('Faqat rasm fayllarini yuklang')
			return
		}

		if (image.size === 0) {
			setImageError("Rasm bo'sh")
			toast.error("Rasm bo'sh")
			return
		}

		if (image.size > 10 * 1024 * 1024) {
			// Max 10MB
			setImageError('Rasm juda katta (max 10MB)')
			toast.error('Rasm juda katta (max 10MB)')
			return
		}

		try {
			console.log('📤 Sending biometric confirm request...', {
				patientId: biometricModal.patientId,
				imageSize: image.size,
				imageType: image.type,
				imageName: image.name,
			})

			const response = await biometricConfirm({
				patientId: biometricModal.patientId,
				image: image,
			}).unwrap()

			console.log('✅ Biometric confirm SUCCESS:', response)
			console.log('🔑 Token received:', response.token)

			setBiometricToken(response.token)
			console.log('💾 Token saved to state')

			toast.success('Biometrik tasdiqlandi ✓')

			// Clean up biometric modal
			console.log('🧹 Cleaning up biometric modal...')
			imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
			setBiometricImages([])
			setImagePreviewUrls([])

			console.log('🚪 Closing biometric modal...')
			setBiometricModal({ open: false, patientId: null })

			console.log('⏱️ Waiting 100ms before reopening confirm modal...')
			// Small delay to ensure modal closes properly
			setTimeout(() => {
				console.log('🔄 Reopening confirmation modal with token...')
				setConfirmModal(prev => ({ ...prev, open: true }))
				console.log('✅ Confirmation modal should be open now')
			}, 100)
		} catch (error: any) {
			console.error('❌ Biometric confirm FAILED:', error)
			console.error('❌ Error details:', {
				status: error?.status,
				data: error?.data,
				message: error?.message,
			})
			toast.error(error?.data?.error?.msg || 'Biometrik xatolik')
		}
	}

	const openConfirmModal = (
		recordId: string,
		prescriptionId: string | null,
		serviceId: string | null,
		day: string,
		type: 'medicine' | 'service' = 'medicine',
		patientId: string
	) => {
		// Show biometric modal
		setBiometricModal({ open: true, patientId })

		// Store confirm modal data
		setConfirmModal({
			open: false,
			recordId,
			prescriptionId,
			serviceId,
			day,
			type,
		})
	}

	const handleConfirm = async () => {
		if (!confirmModal.recordId || !confirmModal.day) {
			return
		}

		if (confirmModal.type === 'medicine' && confirmModal.prescriptionId) {
			await handleRequest({
				request: () =>
					takePrescription({
						id: confirmModal.prescriptionId!,
						body: {
							item_id: confirmModal.prescriptionId!,
							day: confirmModal.day!,
						},
						token: biometricToken || undefined,
					}),
				onSuccess: () => {
					toast.success('Дори қабул қилинди ✓')
					setBiometricToken(null)
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
				},
				onError: err => {
					if (err?.data) {
						toast.error(err?.data?.error?.msg)
					} else {
						toast.error(err?.error?.msg || 'Хатолик юз берди')
					}
				},
			})
		} else if (confirmModal.type === 'service' && confirmModal.serviceId) {
			await handleRequest({
				request: () =>
					takeService({
						id: confirmModal.recordId!,
						item_id: confirmModal.serviceId!,
						day: confirmModal.day!,
						token: biometricToken || undefined,
					}),
				onSuccess: () => {
					toast.success('Хизмат бажарилди ✓')
					setBiometricToken(null)
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
				},
				onError: err => {
					if (err?.data) {
						toast.error(err?.data?.error?.msg)
					} else {
						toast.error(err?.error?.msg || 'Хатолик юз берди')
					}
				},
			})
		}
	}

	// Room search handler
	const handleSearch = () => {
		setCurrentPage(1) // Reset to first page on search
	}

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin text-primary' />
			</div>
		)
	}

	if (isError || !data) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<p className='text-red-500'>Маълумотларни юклашда хатолик!</p>
			</div>
		)
	}

	const isToday = (dateStr: string) => {
		const today = new Date()
		const d = new Date(dateStr)

		return (
			d.getFullYear() === today.getFullYear() &&
			d.getMonth() === today.getMonth() &&
			d.getDate() === today.getDate()
		)
	}

	const { data: records, pagination } = data

	return (
		<div className='min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8'>
			<div className='max-w-7xl mx-auto'>
				<Card className='shadow-md'>
					<CardHeader className='pb-3 sm:pb-6'>
						<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3'>
							<CardTitle className='text-lg sm:text-xl md:text-2xl'>
								Дори Бериш Жадвали (MAR)
							</CardTitle>

							{/* Room Search */}
							<div className='flex gap-2 w-full sm:w-auto'>
								<Input
									placeholder='Xona raqami bilan qidiruv...'
									value={roomSearch}
									onChange={e => setRoomSearch(e.target.value)}
									onKeyDown={e => e.key === 'Enter' && handleSearch()}
									className='w-full sm:w-50 h-9 text-sm'
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className='p-2 sm:p-4 md:p-6'>
						{/* Bemorlar ro'yxati - Accordion */}
						<Accordion
							type='single'
							collapsible
							className='w-full space-y-2 sm:space-y-3'
						>
							{records.map(record => (
								<AccordionItem
									key={record._id}
									value={`record-${record._id}`}
									className='border rounded-lg overflow-hidden bg-card'
								>
									<AccordionTrigger className='px-3 sm:px-4 py-2 sm:py-3 hover:bg-accent/50 hover:no-underline'>
										<div className='flex justify-between items-center w-full pr-2 sm:pr-4'>
											<div className='text-left'>
												<p className='font-semibold text-xs sm:text-sm md:text-base line-clamp-1'>
													{record.patient_id.fullname}
												</p>
												<p className='text-xs text-muted-foreground mt-0.5'>
													Ётоқ:{' '}
													{record.rooms[record.rooms.length - 1]?.room_name ||
														'N/A'}
												</p>
											</div>
										</div>
									</AccordionTrigger>

									<AccordionContent className='px-2 sm:px-4 pb-2 sm:pb-4'>
										<Tabs defaultValue='medicines' className='w-full'>
											<TabsList className='grid w-full grid-cols-2 mb-4'>
												<TabsTrigger value='medicines'>Дорилар</TabsTrigger>
												<TabsTrigger value='services'>Хизматлар</TabsTrigger>
											</TabsList>{' '}
											<TabsContent value='medicines'>
												{!record.prescription ? (
													<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
														Дорилар топилмади
													</p>
												) : (
													<div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
														<PrescriptionCard
															key={record.prescription?._id}
															prescriptionId={record.prescription?._id || ''}
															recordId={record._id}
															onOpenModal={(recordId, prescId, day) =>
																openConfirmModal(
																	recordId,
																	prescId,
																	null,
																	day,
																	'medicine',
																	record.patient_id._id
																)
															}
															formatDate={formatDate}
															isToday={isToday}
														/>
													</div>
												)}
											</TabsContent>
											<TabsContent value='services'>
												{!record.service ||
												!record.service.items ||
												record.service.items.length === 0 ? (
													<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
														Хизматлар топилмади
													</p>
												) : (
													<div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
														{record.service.items.map(service => {
															const isProcessing = processedServices.has(
																service._id
															)
															const hasDays =
																service.days && service.days.length > 0

															return (
																<Card
																	key={service._id}
																	className='border shadow-sm bg-card'
																>
																	<CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
																		<div className='flex justify-between items-start gap-2'>
																			<div className='flex-1 min-w-0'>
																				<h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
																					{
																						(service.service_type_id as any)
																							.name
																					}
																				</h4>
																				{(service as any).notes && (
																					<p className='text-xs font-medium text-muted-foreground mt-1'>
																						ИЗОҲ: {(service as any).notes}
																					</p>
																				)}
																				<p className='text-xs text-muted-foreground mt-0.5'>
																					Нарх:{' '}
																					{service.price?.toLocaleString()} сўм
																				</p>
																			</div>
																		</div>
																	</CardHeader>
																	<CardContent className='px-3 sm:px-6 pb-3 sm:pb-6'>
																		{/* Loading holati */}
																		{isProcessing && !hasDays && (
																			<div className='flex items-center justify-center py-6 sm:py-8'>
																				<Loader2 className='w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary' />
																				<span className='ml-2 text-xs sm:text-sm text-muted-foreground'>
																					Кунлар яратилмоқда...
																				</span>
																			</div>
																		)}

																		{/* Days mavjud bo'lsa */}
																		{hasDays && (
																			<>
																				{/* Desktop - 5 columns */}
																				<div className='hidden lg:grid lg:grid-cols-5 gap-2 xl:gap-3'>
																					{service.days.map(day => {
																						const taken = Number(day.times) || 0
																						const total =
																							Number(service.frequency) || 0
																						const isCompleted =
																							taken === total && taken > 0
																						const lastDate = formatDate(
																							day.date
																						)

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col items-center p-2 xl:p-3 border rounded-lg hover:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record._id,
																										null,
																										service._id,
																										String(day.day),
																										'service',
																										record.patient_id._id
																									)
																								}
																							>
																								<p className='text-xs font-medium mb-1 text-center line-clamp-1'>
																									Кун {day.day}
																								</p>
																								{lastDate && (
																									<p className='text-[10px] text-black mb-1.5 text-center'>
																										{isToday(day.date)
																											? 'Bugun'
																											: lastDate}
																									</p>
																								)}
																								<button
																									disabled={isCompleted}
																									className={`text-base xl:text-lg font-bold transition-all ${
																										isCompleted
																											? 'text-green-600 cursor-default'
																											: 'text-primary hover:scale-110 cursor-pointer active:scale-95'
																									}`}
																								>
																									{isCompleted ? (
																										<div className='flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 bg-green-500 rounded-full'>
																											<Check className='w-4 h-4 xl:w-5 xl:h-5 text-white' />
																										</div>
																									) : (
																										<span>
																											{taken}/{total}
																										</span>
																									)}
																								</button>
																							</div>
																						)
																					})}
																				</div>

																				{/* Tablet - 3 columns */}
																				<div className='hidden sm:grid lg:hidden sm:grid-cols-3 md:grid-cols-4 gap-2'>
																					{service.days.map(day => {
																						const taken = day.times || 0
																						const total = service.frequency
																						const isCompleted =
																							taken === total && taken > 0
																						const displayTaken =
																							taken > 0 ? 1 : 0
																						const displayTotal = 1
																						const lastDate = formatDate(
																							day.date
																						)

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col items-center p-2 border rounded-lg hover:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record._id,
																										null,
																										service._id,
																										String(day.day),
																										'service',
																										record.patient_id._id
																									)
																								}
																							>
																								<p className='text-xs font-medium mb-0.5 text-center line-clamp-1'>
																									Кун {day.day}
																								</p>
																								{lastDate && (
																									<p className='text-[10px] text-black mb-1 text-center'>
																										{isToday(day.date)
																											? 'Bugun'
																											: lastDate}
																									</p>
																								)}
																								<button
																									disabled={isCompleted}
																									className={`text-base font-bold transition-all ${
																										isCompleted
																											? 'text-green-600 cursor-default'
																											: 'text-primary hover:scale-110 cursor-pointer active:scale-95'
																									}`}
																								>
																									{isCompleted ? (
																										<div className='flex items-center justify-center w-7 h-7 bg-green-500 rounded-full'>
																											<Check className='w-4 h-4 text-white' />
																										</div>
																									) : (
																										<span>
																											{displayTaken}/
																											{displayTotal}
																										</span>
																									)}
																								</button>
																								{!isCompleted && (
																									<p className='text-[9px] text-muted-foreground mt-0.5 text-center'>
																										{displayTaken}/
																										{displayTotal}
																									</p>
																								)}
																							</div>
																						)
																					})}
																				</div>

																				{/* Mobile - 2 columns */}
																				<div className='grid grid-cols-2 gap-2 sm:hidden'>
																					{service.days.map(day => {
																						const taken = day.times || 0
																						const total = service.frequency
																						const isCompleted =
																							taken === total && taken > 0
																						const displayTaken =
																							taken > 0 ? 1 : 0
																						const displayTotal = 1
																						const lastDate = formatDate(
																							day.date
																						)

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col p-2 border rounded-lg active:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record._id,
																										null,
																										service._id,
																										String(day.day),
																										'service',
																										record.patient_id._id
																									)
																								}
																							>
																								<div className='flex items-center justify-between mb-1'>
																									<span className='text-xs font-medium'>
																										Кун {day.day}
																									</span>
																									<button
																										disabled={isCompleted}
																										className={`text-sm font-bold transition-all flex-shrink-0 ${
																											isCompleted
																												? 'text-green-600'
																												: 'text-primary active:scale-95'
																										}`}
																									>
																										{isCompleted ? (
																											<Check className='w-5 h-5 text-green-600' />
																										) : (
																											<span>
																												{displayTaken}/
																												{displayTotal}
																											</span>
																										)}
																									</button>
																								</div>
																								{lastDate && (
																									<p className='text-[9px] text-black text-left'>
																										{isToday(day.date)
																											? 'Bugun'
																											: lastDate}
																									</p>
																								)}
																								{!isCompleted && (
																									<p className='text-[9px] text-muted-foreground mt-0.5 text-left'>
																										{displayTaken}/
																										{displayTotal}
																									</p>
																								)}
																							</div>
																						)
																					})}
																				</div>
																			</>
																		)}

																		{/* Days yo'q va processing ham yo'q */}
																		{!hasDays && !isProcessing && (
																			<p className='text-xs sm:text-sm text-black text-center py-4'>
																				Кунлар юкланмоқда...
																			</p>
																		)}
																	</CardContent>
																</Card>
															)
														})}
													</div>
												)}
											</TabsContent>
										</Tabs>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>

						{/* Empty state */}
						{records.length === 0 && (
							<div className='text-center py-8'>
								<p className='text-sm text-muted-foreground'>
									{roomSearch
										? `"${roomSearch}" хонада беморлар топилмади`
										: 'Беморлар топилмади'}
								</p>
							</div>
						)}

						{/* Pagination */}
						{pagination.total_pages > 1 && (
							<div className='mt-6 flex flex-col lg:flex-row items-center justify-between gap-4'>
								<div className='flex items-center gap-2'>
									<span className='text-sm text-muted-foreground'>
										Саҳифада:
									</span>
									<Select
										value={itemsPerPage.toString()}
										onValueChange={value => {
											setItemsPerPage(Number(value))
											setCurrentPage(1)
										}}
									>
										<SelectTrigger className='h-8 sm:h-10 text-sm sm:text-base w-24'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='10'>10</SelectItem>
											<SelectItem value='20'>20</SelectItem>
											<SelectItem value='50'>50</SelectItem>
											<SelectItem value='100'>100</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='flex justify-center w-full lg:w-auto'>
									<Pagination>
										<PaginationContent>
											<PaginationItem>
												<PaginationPrevious
													onClick={() =>
														setCurrentPage(prev => Math.max(prev - 1, 1))
													}
													className={
														currentPage === 1
															? 'pointer-events-none opacity-50'
															: 'cursor-pointer'
													}
												/>
											</PaginationItem>

											{/* First page */}
											{currentPage > 2 && (
												<PaginationItem>
													<PaginationLink
														onClick={() => setCurrentPage(1)}
														className='cursor-pointer'
													>
														1
													</PaginationLink>
												</PaginationItem>
											)}

											{/* Ellipsis before */}
											{currentPage > 3 && (
												<PaginationItem>
													<PaginationEllipsis />
												</PaginationItem>
											)}

											{/* Previous page */}
											{currentPage > 1 && (
												<PaginationItem>
													<PaginationLink
														onClick={() => setCurrentPage(currentPage - 1)}
														className='cursor-pointer'
													>
														{currentPage - 1}
													</PaginationLink>
												</PaginationItem>
											)}

											{/* Current page */}
											<PaginationItem>
												<PaginationLink isActive className='cursor-default'>
													{currentPage}
												</PaginationLink>
											</PaginationItem>

											{/* Next page */}
											{currentPage < (pagination?.total_pages || 1) && (
												<PaginationItem>
													<PaginationLink
														onClick={() => setCurrentPage(currentPage + 1)}
														className='cursor-pointer'
													>
														{currentPage + 1}
													</PaginationLink>
												</PaginationItem>
											)}

											{/* Ellipsis after */}
											{currentPage < (pagination?.total_pages || 1) - 2 && (
												<PaginationItem>
													<PaginationEllipsis />
												</PaginationItem>
											)}

											{/* Last page */}
											{currentPage < (pagination?.total_pages || 1) - 1 && (
												<PaginationItem>
													<PaginationLink
														onClick={() =>
															setCurrentPage(pagination?.total_pages || 1)
														}
														className='cursor-pointer'
													>
														{pagination?.total_pages || 1}
													</PaginationLink>
												</PaginationItem>
											)}

											<PaginationItem>
												<PaginationNext
													onClick={() =>
														setCurrentPage(prev =>
															Math.min(prev + 1, pagination?.total_pages || 1)
														)
													}
													className={
														currentPage === (pagination?.total_pages || 1)
															? 'pointer-events-none opacity-50'
															: 'cursor-pointer'
													}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								</div>

								<div className='text-sm text-muted-foreground lg:min-w-[180px] text-center lg:text-right'>
									Жами: {pagination?.total_items || 0} та
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>{' '}
			{/* Biometric Modal */}
			<Dialog
				open={biometricModal.open}
				onOpenChange={open => {
					console.log('🔄 Biometric modal open changed to:', open)
					if (!open) {
						console.log('🛑 Closing biometric modal, cleaning up...')
						stopCamera()
						imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
						setBiometricImages([])
						setImagePreviewUrls([])
						setImageError('')
						setBiometricModal({ open: false, patientId: null })
					}
				}}
			>
				<DialogContent className='max-w-[90vw] sm:max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-base sm:text-lg'>
							Biometrik Tasdiqlash
						</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						{/* Camera Preview or Captured Image */}
						<div className='flex flex-col items-center gap-3'>
							{isCameraActive && imagePreviewUrls.length === 0 ? (
								<div className='relative'>
									<video
										ref={videoRef}
										autoPlay
										playsInline
										className='w-full max-w-sm rounded-md border'
										style={{ aspectRatio: '3/4', objectFit: 'cover' }}
									/>
									<Button
										onClick={capturePhoto}
										disabled={!isVideoReady}
										className='absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 disabled:opacity-50'
									>
										{isVideoReady ? (
											<>
												<Camera className='w-4 h-4 mr-2' />
												Rasmga olish
											</>
										) : (
											<>
												<Loader2 className='w-4 h-4 mr-2 animate-spin' />
												Kuting...
											</>
										)}
									</Button>
								</div>
							) : imagePreviewUrls.length === 0 ? (
								<div className='text-center'>
									{isCameraActive ? (
										<Button
											disabled
											className='flex items-center gap-2 px-4 py-2'
										>
											<Loader2 className='w-4 h-4 mr-2 animate-spin' />
											Kamera yuklanmoqda...
										</Button>
									) : (
										<Button
											onClick={() => {
												console.log('🔘 Manual camera start clicked')
												startCamera()
											}}
											className='flex items-center gap-2 px-4 py-2'
										>
											<Camera className='w-4 h-4' />
											<span className='text-sm'>Kamerani yoqish</span>
										</Button>
									)}
								</div>
							) : null}{' '}
							<p className='text-xs text-muted-foreground text-center'>
								{isCameraActive && !isVideoReady
									? 'Kamera yuklanmoqda, biroz kuting...'
									: isCameraActive && isVideoReady
									? 'Yuzingizni kameraga qarating va rasmga oling ✓'
									: imagePreviewUrls.length === 0
									? 'Biometrik tasdiqlash uchun kamerani yoqing'
									: 'Rasm olindi, tasdiqlash uchun "Tasdiqlash" tugmasini bosing'}
							</p>
						</div>

						{/* Hidden canvas for photo capture */}
						<canvas ref={canvasRef} className='hidden' />

						{imageError && (
							<p className='text-sm text-red-500 text-center'>{imageError}</p>
						)}

						{imagePreviewUrls.length > 0 && (
							<div className='flex justify-center'>
								<div className='relative group'>
									<img
										src={imagePreviewUrls[0]}
										alt='Biometric Preview'
										className='w-64 object-cover rounded-md border'
										style={{ aspectRatio: '3/4' }}
									/>
									<button
										onClick={removeImage}
										className='absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
									>
										<X className='w-4 h-4' />
									</button>
								</div>
							</div>
						)}
					</div>

					<DialogFooter className='flex gap-2 sm:gap-3'>
						<Button
							variant='outline'
							onClick={() => {
								stopCamera()
								imagePreviewUrls.forEach(url => URL.revokeObjectURL(url))
								setBiometricImages([])
								setImagePreviewUrls([])
								setImageError('')
								setBiometricModal({ open: false, patientId: null })
							}}
							disabled={isConfirmingBiometric}
							className='flex-1 sm:flex-none text-sm'
						>
							Bekor qilish
						</Button>
						<Button
							onClick={handleBiometricConfirm}
							disabled={isConfirmingBiometric || biometricImages.length === 0}
							className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
						>
							{isConfirmingBiometric ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								<>
									<Check className='w-4 h-4 mr-1' />
									Tasdiqlash
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Confirm Modal */}
			<Dialog
				open={confirmModal.open}
				onOpenChange={open =>
					!open &&
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
				}
			>
				<DialogContent className='max-w-[90vw] sm:max-w-sm'>
					<DialogHeader>
						<DialogTitle className='text-base sm:text-lg'>
							Тасдиқлаш
						</DialogTitle>
					</DialogHeader>
					<p className='text-sm sm:text-base text-muted-foreground py-3 sm:py-4'>
						{confirmModal.type === 'medicine'
							? 'Бемор дорини ичдими?'
							: 'Хизмат бажарилдими?'}
					</p>
					<DialogFooter className='flex gap-2 sm:gap-3'>
						<Button
							variant='outline'
							onClick={() =>
								setConfirmModal({
									open: false,
									recordId: null,
									prescriptionId: null,
									serviceId: null,
									day: null,
									type: 'medicine',
								})
							}
							className='flex-1 sm:flex-none text-sm'
						>
							Йўқ
						</Button>
						<Button
							onClick={() => {
								console.log('🔘 "Ҳа" button clicked')
								console.log('📦 confirmModal:', confirmModal)
								console.log('📦 data:', data)

								// Close confirm modal and open biometric modal
								setConfirmModal({ ...confirmModal, open: false })
								// Get patient ID from stored data
								const patientRecord = data?.data?.find(
									r => r._id === confirmModal.recordId
								)
								console.log('👤 Found patient record:', patientRecord)

								if (patientRecord) {
									console.log(
										'✅ Opening biometric modal for patient:',
										patientRecord.patient_id._id
									)
									setBiometricModal({
										open: true,
										patientId: patientRecord.patient_id._id,
									})
								} else {
									console.error('❌ Patient record not found!')
								}
							}}
							className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
						>
							Ҳа
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Medicine
