/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	useGetAllExamsQuery,
	useTakeServiceMutation,
} from '@/app/api/examinationApi'
import { useTranslation } from 'react-i18next'
import type {
	getOnePrescriptionRes,
	getOneServiceRes,
} from '@/app/api/examinationApi/types'
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
import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
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
		// Directly open confirmation modal without biometric
		setConfirmModal({
			open: true,
			recordId,
			prescriptionId,
			itemId,
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
							item_id: confirmModal.itemId!,
							day: confirmModal.day!,
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
												<TabsTrigger value='medicines'>{t('medicinesTab')}</TabsTrigger>
												<TabsTrigger value='services'>{t('servicesTab')}</TabsTrigger>
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
																						{t('note')}: {(service as any).notes}
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

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col p-2 border rounded-lg active:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record.service._id,
																										null,
																										service._id,
																										null,
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

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col items-center p-2 border rounded-lg hover:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record.service._id,
																										null,
																										service._id,
																										null,
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
																							</div>
																						)
																					})}
																				</div>

																				{/* Mobile - 2 columns */}
																				<div className='grid grid-cols-2 gap-2 sm:hidden'>
																					{service.days.map(day => {
																						const isCompleted = day.is_completed
																						const lastDate = formatDate(
																							String(day.date)
																						)

																						return (
																							<div
																								key={day._id}
																								className='flex flex-col p-2 border rounded-lg active:bg-accent/50 transition-colors'
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record.service._id,
																										null,
																										service._id,
																										null,
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
		</div>
	)
}

export default Medicine
