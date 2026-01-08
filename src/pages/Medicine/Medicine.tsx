/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	useGetAllExamsQuery,
	useTakeServiceMutation,
} from '@/app/api/examinationApi'
import type {
	getOnePrescriptionRes,
	getOneServiceRes,
} from '@/app/api/examinationApi/types'
import { useTakePrescriptionMutation } from '@/app/api/prescription/prescriptionApi'
import { useUploadCreateMutation } from '@/app/api/upload'
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
import { Camera, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

interface Day {
	_id: string
	date: string | null
	day: number
	times: number | string
	images?: {
		image_url: string
		date: string | null
		_id: string
	}[]
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
	const { t } = useTranslation('medication')
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(10)
	const [roomSearch, setRoomSearch] = useState('')
	const [confirmModal, setConfirmModal] = useState<{
		open: boolean
		recordId: string | null
		prescriptionId: string | null
		itemId: string | null
		serviceId: string | null
		day: number | null
		type: 'medicine' | 'service'
	}>({
		open: false,
		recordId: null,
		prescriptionId: null,
		itemId: null,
		serviceId: null,
		day: null,
		type: 'medicine',
	})
	const [cameraModal, setCameraModal] = useState(false)
	const [capturedImage, setCapturedImage] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const [imagesModal, setImagesModal] = useState<{
		open: boolean
		day: any
		frequency: number
		type: 'medicine' | 'service'
		medicationName?: string
		serviceName?: string
	}>({
		open: false,
		day: null,
		frequency: 0,
		type: 'medicine',
	})
	const videoRef = useRef<HTMLVideoElement>(null)
	const streamRef = useRef<MediaStream | null>(null)
	const [processedServices, setProcessedServices] = useState<Set<string>>(
		new Set()
	)

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
	const [uploadImage] = useUploadCreateMutation()
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

	// Camera functions
	const startCamera = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user' },
			})
			if (videoRef.current) {
				videoRef.current.srcObject = stream
				streamRef.current = stream
			}
		} catch (error) {
			console.error('Error accessing camera:', error)
			toast.error(t('cameraAccessError'))
		}
	}

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(track => track.stop())
			streamRef.current = null
		}
	}

	const capturePhoto = () => {
		if (videoRef.current) {
			const canvas = document.createElement('canvas')
			canvas.width = videoRef.current.videoWidth
			canvas.height = videoRef.current.videoHeight
			const ctx = canvas.getContext('2d')
			if (ctx) {
				ctx.drawImage(videoRef.current, 0, 0)
				const imageDataUrl = canvas.toDataURL('image/jpeg')
				setCapturedImage(imageDataUrl)
				stopCamera()
			}
		}
	}

	const uploadCapturedImage = async (): Promise<string | null> => {
		if (!capturedImage) return null

		setIsUploading(true)
		try {
			// Convert base64 to blob
			const blob = await fetch(capturedImage).then(res => res.blob())
			const formData = new FormData()
			formData.append('file', blob, 'patient-photo.jpg')

			const response = await uploadImage(formData).unwrap()
			setIsUploading(false)
			return response.file_path
		} catch (error) {
			console.error('Upload error:', error)
			toast.error(t('uploadError'))
			setIsUploading(false)
			return null
		}
	}

	const retakePhoto = () => {
		setCapturedImage(null)
		startCamera()
	}

	const closeCameraModal = () => {
		stopCamera()
		setCameraModal(false)
		setCapturedImage(null)
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
	// 				serviceId: typeof service.service_type_id === 'string' ? service.service_type_id : service.service_type_id._id,
	// 				data: {
	// 					service_type_id:
	// 						typeof service.service_type_id === 'string'
	// 							? service.service_type_id
	// 							: service.service_type_id._id,
	// 					price: service.service_type_id.price,
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

	const openConfirmModal = (
		recordId: string,
		prescriptionId: string | null,
		itemId: string | null,
		serviceId: string | null,
		day: number,
		type: 'medicine' | 'service'
	) => {
		// Open camera modal first
		setConfirmModal({
			open: false,
			recordId,
			prescriptionId,
			itemId,
			serviceId,
			day,
			type,
		})
		setCameraModal(true)
		// Start camera when modal opens
		setTimeout(() => startCamera(), 100)
	}

	const handleConfirm = async () => {
		if (!confirmModal.recordId || !confirmModal.day) {
			return
		}

		// Upload image first
		const imageUrl = await uploadCapturedImage()
		if (!imageUrl) {
			toast.error(t('imageUploadRequired'))
			return
		}

		if (confirmModal.type === 'medicine' && confirmModal.prescriptionId) {
			await handleRequest({
				request: () =>
					takePrescription({
						id: confirmModal.prescriptionId!,
						body: {
							item_id: confirmModal.itemId!,
							day: confirmModal.day!,
							image_url: imageUrl,
						},
					}),
				onSuccess: () => {
					toast.success(t('medicineTaken'))
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						itemId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
					closeCameraModal()
				},
				onError: err => {
					if (err?.data) {
						toast.error(err?.data?.error?.msg)
					} else {
						toast.error(err?.error?.msg || t('errorOccurred'))
					}
				},
			})
		} else if (confirmModal.type === 'service' && confirmModal.itemId) {
			await handleRequest({
				request: () =>
					takeService({
						id: confirmModal.recordId!,
						body: {
							item_id: confirmModal.itemId!,
							day: confirmModal.day!,
							image_url: imageUrl,
						},
					}),
				onSuccess: () => {
					toast.success(t('serviceCompleted'))
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						itemId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
					closeCameraModal()
				},
				onError: err => {
					if (err?.data) {
						toast.error(err?.data?.error?.msg)
					} else {
						toast.error(err?.error?.msg || t('errorOccurred'))
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
				<p className='text-red-500'>{t('loadingError')}</p>
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
								{t('marTitle')}
							</CardTitle>

							{/* Room Search */}
							<div className='flex gap-2 w-full sm:w-auto'>
								<Input
									placeholder={t('searchByRoom')}
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
													{t('bed')}:{' '}
													{record.rooms[record.rooms.length - 1]?.room_name ||
														'N/A'}
												</p>
											</div>
										</div>
									</AccordionTrigger>

									<AccordionContent className='px-2 sm:px-4 pb-2 sm:pb-4'>
										<Tabs defaultValue='medicines' className='w-full'>
											<TabsList className='grid w-full grid-cols-2 mb-4'>
												<TabsTrigger value='medicines'>
													{t('medicinesTab')}
												</TabsTrigger>
												<TabsTrigger value='services'>
													{t('servicesTab')}
												</TabsTrigger>
											</TabsList>{' '}
											<TabsContent value='medicines'>
												{!record.prescription ? (
													<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
														{t('medicinesNotFound')}
													</p>
												) : (
													<div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
														<PrescriptionCard
															key={record.prescription?._id}
															prescriptionId={record.prescription?._id || ''}
															recordId={record._id}
															onOpenModal={(prescriptionId, itemId, day) =>
																openConfirmModal(
																	record._id,
																	prescriptionId,
																	itemId,
																	null,
																	day,
																	'medicine'
																)
															}
															onShowImages={(day, frequency, medicationName) =>
																setImagesModal({
																	open: true,
																	day,
																	frequency,
																	type: 'medicine',
																	medicationName,
																})
															}
															formatDate={formatDate}
															isToday={isToday}
														/>
													</div>
												)}
											</TabsContent>
											<TabsContent value='services'>
												{!record.service ||
												record.service.items.length === 0 ? (
													<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
														{t('servicesNotFound')}
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
																						{t('note')}:{' '}
																						{(service as any).notes}
																					</p>
																				)}
																				<p className='text-xs text-muted-foreground mt-0.5'>
																					{t('price')}:{' '}
																					{service.service_type_id.price?.toLocaleString()}{' '}
																					{t('sum')}
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
																					{t('daysBeingCreated')}
																				</span>
																			</div>
																		)}

																		{/* Days mavjud bo'lsa */}
																		{hasDays && (
																			<>
																				{/* Desktop - 5 columns */}
																				<div className='hidden lg:grid lg:grid-cols-5 gap-2 xl:gap-3'>
																					{service.days.map(day => {
																						const isCompleted = day.is_completed
																						const lastDate = formatDate(
																							String(day.date)
																						)
																						const hasImages =
																							day.images &&
																							day.images.length > 0

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col p-2 border rounded-lg transition-colors relative'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										service._id,
																										null,
																										service.service_type_id._id,
																										record.service._id,
																										day.day,
																										'service'
																									)
																								}
																							>
																								<p className='text-xs font-medium mb-1 text-center line-clamp-1'>
																									{t('day')} {day.day}
																								</p>
																								{lastDate && (
																									<p className='text-[10px] text-black mb-1.5 text-center'>
																										{isToday(String(day.date))
																											? t('today')
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
																										<span className='text-xs'>
																											{t('notCompleted')}
																										</span>
																									)}
																								</button>
																								{hasImages && (
																									<Button
																										size='sm'
																										variant='ghost'
																										className='mt-1 h-6 px-2'
																										onClick={() =>
																											setImagesModal({
																												open: true,
																												images:
																													day.images || [],
																												frequency: 1,
																												type: 'service',
																											})
																										}
																									>
																										<ImageIcon className='w-3 h-3' />
																									</Button>
																								)}
																							</div>
																						)
																					})}
																				</div>
																				{/* Tablet - 3 columns */}
																				<div className='hidden sm:grid lg:hidden sm:grid-cols-3 md:grid-cols-4 gap-2'>
																					{service.days.map(day => {
																						const isCompleted = day.is_completed
																						const lastDate = formatDate(
																							String(day.date)
																						)
																						const hasImages =
																							day.images &&
																							day.images.length > 0

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col items-center p-2 border rounded-lg transition-colors relative'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										service._id,
																										null,
																										service.service_type_id._id,
																										record.service._id,
																										day.day,
																										'service'
																									)
																								}
																							>
																								<p className='text-xs font-medium mb-0.5 text-center line-clamp-1'>
																									{t('day')} {day.day}
																								</p>
																								{lastDate && (
																									<p className='text-[10px] text-black mb-1 text-center'>
																										{isToday(String(day.date))
																											? t('today')
																											: lastDate}
																									</p>
																								)}
																								<button
																									disabled={isCompleted}
																									className={`text-sm font-bold transition-all ${
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
																										<span className='text-xs'>
																											{t('notCompleted')}
																										</span>
																									)}
																								</button>
																								{hasImages && (
																									<Button
																										size='sm'
																										variant='ghost'
																										className='mt-1 h-6 px-2'
																										onClick={() =>
																											setImagesModal({
																												open: true,
																												day,
																												frequency: 1,
																												type: 'service',
																												serviceName: (
																													service.service_type_id as any
																												).name,
																											})
																										}
																									>
																										<ImageIcon className='w-3 h-3' />
																									</Button>
																								)}
																							</div>
																						)
																					})}
																				</div>{' '}
																				{/* Mobile - 2 columns */}
																				<div className='grid grid-cols-2 gap-2 sm:hidden'>
																					{service.days.map(day => {
																						const isCompleted = day.is_completed
																						const lastDate = formatDate(
																							String(day.date)
																						)
																						const hasImages =
																							day.images &&
																							day.images.length > 0

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col p-2 border rounded-lg transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										service._id,
																										null,
																										service.service_type_id._id,
																										record.service._id,
																										day.day,
																										'service'
																									)
																								}
																							>
																								<div className='flex items-center justify-between mb-1'>
																									<span className='text-xs font-medium'>
																										{t('day')} {day.day}
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
																											<span className='text-xs'>
																												0/1
																											</span>
																										)}
																									</button>
																								</div>
																								{lastDate && (
																									<p className='text-[9px] text-black text-left'>
																										{isToday(String(day.date))
																											? t('today')
																											: lastDate}
																									</p>
																								)}
																								{hasImages && (
																									<Button
																										size='sm'
																										variant='ghost'
																										className='mt-1 h-5 px-1 w-full'
																										onClick={() =>
																											setImagesModal({
																												open: true,
																												day,
																												frequency: 1,
																												type: 'service',
																												serviceName: (
																													service.service_type_id as any
																												).name,
																											})
																										}
																									>
																										<ImageIcon className='w-3 h-3' />
																									</Button>
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
																				{t('daysLoading')}
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
										? t('noPatientsInRoom', { room: roomSearch })
										: t('noPatientsFound')}
								</p>
							</div>
						)}

						{/* Pagination */}
						{pagination.total_pages > 1 && (
							<div className='mt-6 flex flex-col lg:flex-row items-center justify-between gap-4'>
								<div className='flex items-center gap-2'>
									<span className='text-sm text-muted-foreground'>
										{t('perPage')}:
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
			</div>
			{/* Confirm Modal */}
			<Dialog
				open={confirmModal.open}
				onOpenChange={open =>
					!open &&
					setConfirmModal({
						open: false,
						recordId: null,
						prescriptionId: null,
						itemId: null,
						serviceId: null,
						day: null,
						type: 'medicine',
					})
				}
			>
				<DialogContent className='max-w-[90vw] sm:max-w-sm'>
					<DialogHeader>
						<DialogTitle className='text-base sm:text-lg'>
							{t('confirmation')}
						</DialogTitle>
					</DialogHeader>
					<p className='text-sm sm:text-base text-muted-foreground py-3 sm:py-4'>
						{confirmModal.type === 'medicine'
							? t('patientTookMedicine')
							: t('serviceCompleted')}
					</p>
					<DialogFooter className='flex gap-2 sm:gap-3'>
						<Button
							variant='outline'
							onClick={() =>
								setConfirmModal({
									open: false,
									recordId: null,
									prescriptionId: null,
									itemId: null,
									serviceId: null,
									day: null,
									type: 'medicine',
								})
							}
							className='flex-1 sm:flex-none text-sm'
						>
							{t('no')}
						</Button>
						<Button
							onClick={handleConfirm}
							className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
						>
							{t('yes')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Camera Modal */}
			<Dialog open={cameraModal} onOpenChange={closeCameraModal}>
				<DialogContent className='max-w-[90vw] sm:max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-base sm:text-lg'>
							{capturedImage ? t('Suratni tasdiqlash') : t('Suratga olish')}
						</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col items-center gap-4'>
						{!capturedImage ? (
							<>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									className='w-full h-auto rounded-lg border'
								/>
								<Button
									onClick={capturePhoto}
									className='w-full bg-blue-600 hover:bg-blue-700'
								>
									<Camera className='w-4 h-4 mr-2' />
									{t('Suratga olish')}
								</Button>
							</>
						) : (
							<>
								<img
									src={capturedImage}
									alt='Captured'
									className='w-full h-auto rounded-lg border'
								/>
								<div className='flex gap-2 w-full'>
									<Button
										onClick={retakePhoto}
										variant='outline'
										className='flex-1'
									>
										{t('Qaytadan olish')}
									</Button>
									<Button
										onClick={handleConfirm}
										disabled={isUploading || takingMedicine || takingService}
										className='flex-1 bg-green-600 hover:bg-green-700'
									>
										{isUploading || takingMedicine || takingService ? (
											<>
												<Loader2 className='w-4 h-4 mr-2 animate-spin' />
												{t('Jarayon davom etmoqda')}
											</>
										) : (
											t('Tasdiqlash')
										)}
									</Button>
								</div>
							</>
						)}
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={closeCameraModal}
							className='w-full text-sm'
						>
							{t('cancel')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Images Display Modal */}
			<Dialog
				open={imagesModal.open}
				onOpenChange={open =>
					!open &&
					setImagesModal({
						open: false,
						day: null,
						frequency: 0,
						type: 'medicine',
					})
				}
			>
				<DialogContent className='max-w-[90vw] sm:max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='text-base sm:text-lg'>
							{imagesModal.type === 'medicine'
								? imagesModal.medicationName || t('medicationHistory')
								: imagesModal.serviceName || t('serviceHistory')}
						</DialogTitle>
						<p className='text-sm text-muted-foreground mt-1'>
							{/* {imagesModal.day?.date &&
								new Date(imagesModal.day.date).toLocaleDateString('uz-UZ')} */}

							{isToday(String(imagesModal.day?.date))
								? t('today')
								: imagesModal.day?.date}
						</p>
					</DialogHeader>
					<div className='space-y-3 max-h-[60vh] overflow-y-auto'>
						{Array.from({ length: imagesModal.frequency }).map((_, index) => {
							const imageData = imagesModal.day?.images?.[index]
							const imageUrl = imageData?.image_url
							const imageDate = imageData?.date
							const isTaken = !!imageUrl

							return (
								<div
									key={index}
									className={`border rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start ${
										isTaken ? 'bg-green-50 border-green-200' : 'bg-gray-50'
									}`}
								>
									{isTaken ? (
										<>
											<img
												src={imageUrl}
												alt={`${imagesModal.type} ${index + 1}`}
												className='w-full sm:w-32 h-auto rounded-lg object-cover'
											/>
											<div className='flex-1'>
												<p className='text-sm font-medium text-green-700'>
													{imagesModal.type === 'medicine'
														? `${index + 1}-doza`
														: `${index + 1}-xizmat`}
												</p>
												<p className='text-xs text-green-600 mt-1'>
													✓ Qabul qilindi
												</p>
												{imageDate && (
													<p className='text-xs text-muted-foreground mt-1'>
														{new Date(imageDate).toLocaleTimeString('uz-UZ', {
															hour: '2-digit',
															minute: '2-digit',
														})}
													</p>
												)}
											</div>
										</>
									) : (
										<div className='flex-1'>
											<p className='text-sm font-medium text-gray-600'>
												{imagesModal.type === 'medicine'
													? `${index + 1}-doza`
													: `${index + 1}-xizmat`}
											</p>
											<p className='text-xs text-gray-500 mt-1'>
												⏳ Hali qabul qilinmadi
											</p>
										</div>
									)}
								</div>
							)
						})}
					</div>
					<DialogFooter>
						<Button
							variant='outline'
							onClick={() =>
								setImagesModal({
									open: false,
									day: null,
									frequency: 0,
									type: 'medicine',
								})
							}
							className='w-full text-sm'
						>
							{t('close')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Medicine
