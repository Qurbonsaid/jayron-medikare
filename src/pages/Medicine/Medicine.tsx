// import { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import {
// 	Accordion,
// 	AccordionContent,
// 	AccordionItem,
// 	AccordionTrigger,
// } from '@/components/ui/accordion'
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogHeader,
// 	DialogTitle,
// 	DialogFooter,
// } from '@/components/ui/dialog'
// import {
// 	Pagination,
// 	PaginationContent,
// 	PaginationItem,
// 	PaginationLink,
// 	PaginationNext,
// 	PaginationPrevious,
// } from '@/components/ui/pagination'
// import { Check, Loader2 } from 'lucide-react'
// import {
// 	useGetAllExamsQuery,
// 	useCreatePrescriptionDaysMutation,
// 	useTakeMedicineMutation,
// } from '@/app/api/examinationApi/examinationApi'
// import { toast } from 'sonner'
// import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'

// const Medicine = () => {
// 	const [currentPage, setCurrentPage] = useState(1)
// 	const [confirmModal, setConfirmModal] = useState<{
// 		open: boolean
// 		recordId: string | null
// 		prescriptionId: string | null
// 		day: string | null
// 	}>({
// 		open: false,
// 		recordId: null,
// 		prescriptionId: null,
// 		day: null,
// 	})
// 	const [processedPrescriptions, setProcessedPrescriptions] = useState<
// 		Set<string>
// 	>(new Set())

// 	const itemsPerPage = 10

// 	// RTK Query
// 	const { data, isLoading, isError } = useGetAllExamsQuery({
// 		page: currentPage,
// 		limit: itemsPerPage,
// 		status: 'pending',
// 		is_roomed: true,
// 	})

// 	const [createPrescriptionDays] = useCreatePrescriptionDaysMutation()
// 	const [takeMedicine, { isLoading: takingMedicine }] =
// 		useTakeMedicineMutation()
// 	const handleRequest = useHandleRequest()

// 	// Accordion ochilganda days yaratish
// 	const handleAccordionChange = async (recordId: string, prescription: any) => {
// 		if (
// 			prescription.days?.length > 0 ||
// 			processedPrescriptions.has(prescription._id)
// 		) {
// 			return
// 		}

// 		setProcessedPrescriptions(prev => new Set(prev).add(prescription._id))

// 		await handleRequest({
// 			request: () =>
// 				createPrescriptionDays({
// 					id: recordId,
// 					prescriptionId: prescription._id,
// 					data: {
// 						medication: prescription.medication,
// 						dosage: prescription.dosage,
// 						frequency: prescription.frequency,
// 						duration: prescription.duration,
// 						instructions: prescription.instructions,
// 					},
// 				}),
// 			onSuccess: () => {
// 				toast.success('Кунлар яратилди')
// 			},
// 		})
// 	}

// 	const openConfirmModal = (
// 		recordId: string,
// 		prescriptionId: string,
// 		day: string
// 	) => {
// 		setConfirmModal({ open: true, recordId, prescriptionId, day })
// 	}

// 	const handleConfirm = async () => {
// 		if (
// 			!confirmModal.recordId ||
// 			!confirmModal.prescriptionId ||
// 			!confirmModal.day
// 		) {
// 			return
// 		}

// 		await handleRequest({
// 			request: () =>
// 				takeMedicine({
// 					id: confirmModal.recordId!,
// 					prescriptionId: confirmModal.prescriptionId!,
// 					day: confirmModal.day!,
// 				}),
// 			onSuccess: () => {
// 				toast.success('Дори қабул қилинди ✓')
// 				setConfirmModal({
// 					open: false,
// 					recordId: null,
// 					prescriptionId: null,
// 					day: null,
// 				})
// 			},
// 		})
// 	}

// 	if (isLoading) {
// 		return (
// 			<div className='min-h-screen bg-background flex items-center justify-center'>
// 				<Loader2 className='w-8 h-8 animate-spin text-primary' />
// 			</div>
// 		)
// 	}

// 	if (isError || !data) {
// 		return (
// 			<div className='min-h-screen bg-background flex items-center justify-center'>
// 				<p className='text-red-500'>Маълумотларни юклашда хатолик!</p>
// 			</div>
// 		)
// 	}

// 	const { data: records, pagination } = data

// 	return (
// 		<div className='min-h-screen bg-background p-2 sm:p-4 md:p-6 lg:p-8'>
// 			<div className='max-w-7xl mx-auto'>
// 				<Card className='shadow-md'>
// 					<CardHeader className='pb-3 sm:pb-6'>
// 						<CardTitle className='text-lg sm:text-xl md:text-2xl'>
// 							Дори Бериш Жадвали (MAR)
// 						</CardTitle>
// 					</CardHeader>
// 					<CardContent className='p-2 sm:p-4 md:p-6'>
// 						{/* Bemorlar ro'yxati - Accordion */}
// 						<Accordion
// 							type='single'
// 							collapsible
// 							className='w-full space-y-2 sm:space-y-3'
// 							onValueChange={value => {
// 								if (value) {
// 									const recordId = value.replace('record-', '')
// 									const record = records.find(r => r._id === recordId)

// 									if (record) {
// 										record.prescriptions.forEach(prescription => {
// 											handleAccordionChange(recordId, prescription)
// 										})
// 									}
// 								}
// 							}}
// 						>
// 							{records.map(record => (
// 								<AccordionItem
// 									key={record._id}
// 									value={`record-${record._id}`}
// 									className='border rounded-lg overflow-hidden bg-card'
// 								>
// 									<AccordionTrigger className='px-3 sm:px-4 py-2 sm:py-3 hover:bg-accent/50 hover:no-underline'>
// 										<div className='flex justify-between items-center w-full pr-2 sm:pr-4'>
// 											<div className='text-left'>
// 												<p className='font-semibold text-xs sm:text-sm md:text-base line-clamp-1'>
// 													{record.patient_id.fullname}
// 												</p>
// 												<p className='text-xs text-muted-foreground mt-0.5'>
// 													Ётоқ:{' '}
// 													{record.rooms[record.rooms.length - 1]?.room_name ||
// 														'N/A'}
// 												</p>
// 											</div>
// 										</div>
// 									</AccordionTrigger>

// 									<AccordionContent className='px-2 sm:px-4 pb-2 sm:pb-4'>
// 										{record.prescriptions.length === 0 ? (
// 											<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
// 												Дорилар топилмади
// 											</p>
// 										) : (
// 											<div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
// 												{record.prescriptions.map(prescription => {
// 													const isProcessing = processedPrescriptions.has(
// 														prescription._id
// 													)
// 													const hasDays =
// 														prescription.days && prescription.days.length > 0

// 													return (
// 														<Card
// 															key={prescription._id}
// 															className='border shadow-sm bg-card'
// 														>
// 															<CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
// 																<div className='flex justify-between items-start gap-2'>
// 																	<div className='flex-1 min-w-0'>
// 																		<h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
// 																			{prescription.medication}
// 																		</h4>
// 																		<p className='text-xs font-medium text-muted-foreground mt-0.9'>
// 																			КYРСАТМАЛАР: {prescription.instructions}
// 																		</p>
// 																		<p className='text-xs text-muted-foreground mt-0.5'>
// 																			Доза: {prescription.dosage}мг
// 																		</p>
// 																	</div>
// 																</div>
// 															</CardHeader>
// 															<CardContent className='px-3 sm:px-6 pb-3 sm:pb-6'>
// 																{/* Loading holati */}
// 																{isProcessing && !hasDays && (
// 																	<div className='flex items-center justify-center py-6 sm:py-8'>
// 																		<Loader2 className='w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary' />
// 																		<span className='ml-2 text-xs sm:text-sm text-muted-foreground'>
// 																			Кунлар яратилмоқда...
// 																		</span>
// 																	</div>
// 																)}

// 																{/* Days mavjud bo'lsa */}
// 																{hasDays && (
// 																	<>
// 																		{/* Desktop - 5 columns */}
// 																		<div className='hidden lg:grid lg:grid-cols-5 gap-2 xl:gap-3'>
// 																			{prescription.days.map(day => {
// 																				const taken = parseInt(day.times) || 0
// 																				const total = prescription.frequency
// 																				const isCompleted = taken >= total

// 																				return (
// 																					<div
// 																						key={day._id}
// 																						className='flex flex-col items-center p-2 xl:p-3 border rounded-lg hover:bg-accent/50 transition-colors'
// 																					>
// 																						<p className='text-xs font-medium mb-1.5 xl:mb-2 text-center line-clamp-1'>
// 																							{day.day}
// 																						</p>
// 																						<button
// 																							onClick={() =>
// 																								!isCompleted &&
// 																								openConfirmModal(
// 																									record._id,
// 																									prescription._id,
// 																									day.day
// 																								)
// 																							}
// 																							disabled={isCompleted}
// 																							className={`text-base xl:text-lg font-bold transition-all ${
// 																								isCompleted
// 																									? 'text-green-600 cursor-default'
// 																									: 'text-primary hover:scale-110 cursor-pointer active:scale-95'
// 																							}`}
// 																						>
// 																							{isCompleted ? (
// 																								<div className='flex items-center justify-center w-7 h-7 xl:w-8 xl:h-8 bg-green-500 rounded-full'>
// 																									<Check className='w-4 h-4 xl:w-5 xl:h-5 text-white' />
// 																								</div>
// 																							) : (
// 																								<span>
// 																									{taken}/{total}
// 																								</span>
// 																							)}
// 																						</button>
// 																					</div>
// 																				)
// 																			})}
// 																		</div>

// 																		{/* Tablet - 3 columns */}
// 																		<div className='hidden sm:grid lg:hidden sm:grid-cols-3 md:grid-cols-4 gap-2'>
// 																			{prescription.days.map(day => {
// 																				const taken = parseInt(day.times) || 0
// 																				const total = prescription.frequency
// 																				const isCompleted = taken >= total

// 																				return (
// 																					<div
// 																						key={day._id}
// 																						className='flex flex-col items-center p-2 border rounded-lg hover:bg-accent/50 transition-colors'
// 																					>
// 																						<p className='text-xs font-medium mb-1.5 text-center line-clamp-1'>
// 																							{day.day}
// 																						</p>
// 																						<button
// 																							onClick={() =>
// 																								!isCompleted &&
// 																								openConfirmModal(
// 																									record._id,
// 																									prescription._id,
// 																									day.day
// 																								)
// 																							}
// 																							disabled={isCompleted}
// 																							className={`text-base font-bold transition-all ${
// 																								isCompleted
// 																									? 'text-green-600 cursor-default'
// 																									: 'text-primary hover:scale-110 cursor-pointer active:scale-95'
// 																							}`}
// 																						>
// 																							{isCompleted ? (
// 																								<div className='flex items-center justify-center w-7 h-7 bg-green-500 rounded-full'>
// 																									<Check className='w-4 h-4 text-white' />
// 																								</div>
// 																							) : (
// 																								<span>
// 																									{taken}/{total}
// 																								</span>
// 																							)}
// 																						</button>
// 																					</div>
// 																				)
// 																			})}
// 																		</div>

// 																		{/* Mobile - 2 columns */}
// 																		<div className='grid grid-cols-2 gap-2 sm:hidden'>
// 																			{prescription.days.map(day => {
// 																				const taken = parseInt(day.times) || 0
// 																				const total = prescription.frequency
// 																				const isCompleted = taken >= total

// 																				return (
// 																					<div
// 																						key={day._id}
// 																						className='flex items-center justify-between p-2 border rounded-lg active:bg-accent/50 transition-colors'
// 																					>
// 																						<span className='text-xs font-medium line-clamp-1 flex-1 mr-2'>
// 																							{day.day}
// 																						</span>
// 																						<button
// 																							onClick={() =>
// 																								!isCompleted &&
// 																								openConfirmModal(
// 																									record._id,
// 																									prescription._id,
// 																									day.day
// 																								)
// 																							}
// 																							disabled={isCompleted}
// 																							className={`text-sm font-bold transition-all flex-shrink-0 ${
// 																								isCompleted
// 																									? 'text-green-600'
// 																									: 'text-primary active:scale-95'
// 																							}`}
// 																						>
// 																							{isCompleted ? (
// 																								<Check className='w-5 h-5 text-green-600' />
// 																							) : (
// 																								<span>
// 																									{taken}/{total}
// 																								</span>
// 																							)}
// 																						</button>
// 																					</div>
// 																				)
// 																			})}
// 																		</div>
// 																	</>
// 																)}

// 																{/* Days yo'q va processing ham yo'q */}
// 																{!hasDays && !isProcessing && (
// 																	<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
// 																		Кунлар юкланмоқда...
// 																	</p>
// 																)}
// 															</CardContent>
// 														</Card>
// 													)
// 												})}
// 											</div>
// 										)}
// 									</AccordionContent>
// 								</AccordionItem>
// 							))}
// 						</Accordion>

// 						{/* Pagination */}
// 						{pagination.total_pages > 1 && (
// 							<div className='mt-4 sm:mt-6'>
// 								<Pagination>
// 									<PaginationContent className='flex-wrap gap-1'>
// 										<PaginationItem>
// 											<PaginationPrevious
// 												onClick={() =>
// 													setCurrentPage(prev => Math.max(prev - 1, 1))
// 												}
// 												className={`h-8 sm:h-10 text-xs sm:text-sm ${
// 													pagination.prev_page === null
// 														? 'pointer-events-none opacity-50'
// 														: 'cursor-pointer'
// 												}`}
// 											/>
// 										</PaginationItem>

// 										{Array.from(
// 											{ length: pagination.total_pages },
// 											(_, i) => i + 1
// 										).map(page => (
// 											<PaginationItem key={page}>
// 												<PaginationLink
// 													onClick={() => setCurrentPage(page)}
// 													isActive={currentPage === page}
// 													className='h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm cursor-pointer'
// 												>
// 													{page}
// 												</PaginationLink>
// 											</PaginationItem>
// 										))}

// 										<PaginationItem>
// 											<PaginationNext
// 												onClick={() =>
// 													setCurrentPage(prev =>
// 														Math.min(prev + 1, pagination.total_pages)
// 													)
// 												}
// 												className={`h-8 sm:h-10 text-xs sm:text-sm ${
// 													pagination.next_page === null
// 														? 'pointer-events-none opacity-50'
// 														: 'cursor-pointer'
// 												}`}
// 											/>
// 										</PaginationItem>
// 									</PaginationContent>
// 								</Pagination>
// 							</div>
// 						)}
// 					</CardContent>
// 				</Card>
// 			</div>

// 			{/* Confirm Modal */}
// 			<Dialog
// 				open={confirmModal.open}
// 				onOpenChange={open =>
// 					!open &&
// 					setConfirmModal({
// 						open: false,
// 						recordId: null,
// 						prescriptionId: null,
// 						day: null,
// 					})
// 				}
// 			>
// 				<DialogContent className='max-w-[90vw] sm:max-w-sm'>
// 					<DialogHeader>
// 						<DialogTitle className='text-base sm:text-lg'>
// 							Тасдиқлаш
// 						</DialogTitle>
// 					</DialogHeader>
// 					<p className='text-sm sm:text-base text-muted-foreground py-3 sm:py-4'>
// 						Бемор дорини ичдими?
// 					</p>
// 					<DialogFooter className='flex gap-2 sm:gap-3'>
// 						<Button
// 							variant='outline'
// 							onClick={() =>
// 								setConfirmModal({
// 									open: false,
// 									recordId: null,
// 									prescriptionId: null,
// 									day: null,
// 								})
// 							}
// 							disabled={takingMedicine}
// 							className='flex-1 sm:flex-none text-sm'
// 						>
// 							Йўқ
// 						</Button>
// 						<Button
// 							onClick={handleConfirm}
// 							disabled={takingMedicine}
// 							className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
// 						>
// 							{takingMedicine ? (
// 								<Loader2 className='w-4 h-4 animate-spin' />
// 							) : (
// 								'Ҳа'
// 							)}
// 						</Button>
// 					</DialogFooter>
// 				</DialogContent>
// 			</Dialog>
// 		</div>
// 	)
// }

// export default Medicine

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination'
import { Check, Loader2, Search } from 'lucide-react'
import {
	useGetAllExamsQuery,
	useCreatePrescriptionDaysMutation,
	useTakeMedicineMutation,
} from '@/app/api/examinationApi/examinationApi'
import { toast } from 'sonner'
import { useHandleRequest } from '@/hooks/Handle_Request/useHandleRequest'

interface Day {
	_id: string
	date: string | null
	day: number
	times: number | string
}

interface Prescription {
	_id: string
	medication: string
	dosage: number
	frequency: number
	duration: number
	instructions: string
	days?: Day[]
}

interface Room {
	room_name: string
}

interface Patient {
	fullname: string
}

interface ExamRecord {
	_id: string
	patient_id: Patient
	rooms: Room[]
	prescriptions: Prescription[]
}

const Medicine = () => {
	const [currentPage, setCurrentPage] = useState(1)
	const [roomSearch, setRoomSearch] = useState('')
	const [confirmModal, setConfirmModal] = useState<{
		open: boolean
		recordId: string | null
		prescriptionId: string | null
		day: string | null
	}>({
		open: false,
		recordId: null,
		prescriptionId: null,
		day: null,
	})
	const [processedPrescriptions, setProcessedPrescriptions] = useState<
		Set<string>
	>(new Set())

	const itemsPerPage = 10

	// RTK Query with room search
	const { data, isLoading, isError } = useGetAllExamsQuery({
		page: currentPage,
		limit: itemsPerPage,
		status: 'pending',
		is_roomed: true,
		...(roomSearch && { room_name: roomSearch }),
	})

	const [createPrescriptionDays] = useCreatePrescriptionDaysMutation()
	const [takeMedicine, { isLoading: takingMedicine }] =
		useTakeMedicineMutation()
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

	// Accordion ochilganda days yaratish
	const handleAccordionChange = async (
		recordId: string,
		prescription: Prescription
	) => {
		if (
			prescription.days?.length > 0 ||
			processedPrescriptions.has(prescription._id)
		) {
			return
		}

		setProcessedPrescriptions(prev => new Set(prev).add(prescription._id))

		await handleRequest({
			request: () =>
				createPrescriptionDays({
					id: recordId,
					prescriptionId: prescription._id,
					data: {
						medication: prescription.medication,
						dosage: prescription.dosage,
						frequency: prescription.frequency,
						duration: prescription.duration,
						instructions: prescription.instructions,
					},
				}),
			onSuccess: () => {
				toast.success('Кунлар яратилди')
			},
		})
	}

	const openConfirmModal = (
		recordId: string,
		prescriptionId: string,
		day: number
	) => {
		setConfirmModal({ open: true, recordId, prescriptionId, day })
	}

	const handleConfirm = async () => {
		if (
			!confirmModal.recordId ||
			!confirmModal.prescriptionId ||
			!confirmModal.day
		) {
			return
		}

		await handleRequest({
			request: () =>
				takeMedicine({
					id: confirmModal.recordId!,
					prescriptionId: confirmModal.prescriptionId!,
					day: confirmModal.day!,
				}),
			onSuccess: () => {
				toast.success('Дори қабул қилинди ✓')
				setConfirmModal({
					open: false,
					recordId: null,
					prescriptionId: null,
					day: null,
				})
			},
		})
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
							onValueChange={value => {
								if (value) {
									const recordId = value.replace('record-', '')
									const record = records.find(r => r._id === recordId)

									if (record) {
										record.prescriptions.forEach(prescription => {
											handleAccordionChange(recordId, prescription)
										})
									}
								}
							}}
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
										{record.prescriptions.length === 0 ? (
											<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
												Дорилар топилмади
											</p>
										) : (
											<div className='space-y-2 sm:space-y-4 pt-2 sm:pt-3'>
												{record.prescriptions.map(prescription => {
													const isProcessing = processedPrescriptions.has(
														prescription._id
													)
													const hasDays =
														prescription.days && prescription.days.length > 0

													return (
														<Card
															key={prescription._id}
															className='border shadow-sm bg-card'
														>
															<CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
																<div className='flex justify-between items-start gap-2'>
																	<div className='flex-1 min-w-0'>
																		<h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
																			{prescription.medication}
																		</h4>
																		<p className='text-xs font-medium text-muted-foreground mt-1'>
																			КЎРСАТМАЛАР: {prescription.instructions}
																		</p>
																		<p className='text-xs text-muted-foreground mt-0.5'>
																			Доза: {prescription.dosage}мг
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
																			{prescription.days.map(day => {
																				const taken = day.times || 0
																				const total = prescription.frequency
																				const isCompleted = taken >= total
																				const lastDate = formatDate(day.date)

																				return (
																					<div
																						key={day._id}
																						className='flex flex-col items-center p-2 xl:p-3 border rounded-lg hover:bg-accent/50 transition-colors'
																						onClick={() =>
																							!isCompleted &&
																							openConfirmModal(
																								record._id,
																								prescription._id,
																								day.day
																							)
																						}
																					>
																						<p className='text-xs font-medium mb-1 text-center line-clamp-1'>
																							Кун {day.day}
																						</p>
																						{lastDate && (
																							<p className='text-[10px] text-muted-foreground mb-1.5 text-center'>
																								{lastDate}
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
																			{prescription.days.map(day => {
																				const taken = day.times || 0
																				const total = prescription.frequency
																				const isCompleted = taken >= total
																				const lastDate = formatDate(day.date)

																				return (
																					<div
																						key={day._id}
																						className='flex flex-col items-center p-2 border rounded-lg hover:bg-accent/50 transition-colors'
																					>
																						<p className='text-xs font-medium mb-0.5 text-center line-clamp-1'>
																							Кун {day.day}
																						</p>
																						{lastDate && (
																							<p className='text-[10px] text-muted-foreground mb-1 text-center'>
																							{isToday(day.date) ? "Bugun" : lastDate}	
																							</p>
																						)}
																						<button
																							onClick={() =>
																								!isCompleted &&
																								openConfirmModal(
																									record._id,
																									prescription._id,
																									day.day
																								)
																							}
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
																									{taken}/{total}
																								</span>
																							)}
																						</button>
																					</div>
																				)
																			})}
																		</div>

																		{/* Mobile - 2 columns */}
																		<div className='grid grid-cols-2 gap-2 sm:hidden'>
																			{prescription.days.map(day => {
																				const taken = day.times || 0
																				const total = prescription.frequency
																				const isCompleted = taken >= total
																				const lastDate = formatDate(day.date)

																				return (
																					<div
																						key={day._id}
																						className='flex flex-col p-2 border rounded-lg active:bg-accent/50 transition-colors'
																					>
																						<div className='flex items-center justify-between mb-1'>
																							<span className='text-xs font-medium'>
																								Кун {day.day}
																							</span>
																							<button
																								onClick={() =>
																									!isCompleted &&
																									openConfirmModal(
																										record._id,
																										prescription._id,
																										day.day
																									)
																								}
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
																										{taken}/{total}
																									</span>
																								)}
																							</button>
																						</div>
																						{lastDate && (
																							<p className='text-[9px] text-muted-foreground text-left'>
																								{lastDate}
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
																	<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
																		Кунлар юкланмоқда...
																	</p>
																)}
															</CardContent>
														</Card>
													)
												})}
											</div>
										)}
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
							<div className='mt-4 sm:mt-6'>
								<Pagination>
									<PaginationContent className='flex-wrap gap-1'>
										<PaginationItem>
											<PaginationPrevious
												onClick={() =>
													setCurrentPage(prev => Math.max(prev - 1, 1))
												}
												className={`h-8 sm:h-10 text-xs sm:text-sm ${
													pagination.prev_page === null
														? 'pointer-events-none opacity-50'
														: 'cursor-pointer'
												}`}
											/>
										</PaginationItem>

										{Array.from(
											{ length: pagination.total_pages },
											(_, i) => i + 1
										).map(page => (
											<PaginationItem key={page}>
												<PaginationLink
													onClick={() => setCurrentPage(page)}
													isActive={currentPage === page}
													className='h-8 w-8 sm:h-10 sm:w-10 text-xs sm:text-sm cursor-pointer'
												>
													{page}
												</PaginationLink>
											</PaginationItem>
										))}

										<PaginationItem>
											<PaginationNext
												onClick={() =>
													setCurrentPage(prev =>
														Math.min(prev + 1, pagination.total_pages)
													)
												}
												className={`h-8 sm:h-10 text-xs sm:text-sm ${
													pagination.next_page === null
														? 'pointer-events-none opacity-50'
														: 'cursor-pointer'
												}`}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
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
						day: null,
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
						Бемор дорини ичдими?
					</p>
					<DialogFooter className='flex gap-2 sm:gap-3'>
						<Button
							variant='outline'
							onClick={() =>
								setConfirmModal({
									open: false,
									recordId: null,
									prescriptionId: null,
									day: null,
								})
							}
							disabled={takingMedicine}
							className='flex-1 sm:flex-none text-sm'
						>
							Йўқ
						</Button>
						<Button
							onClick={handleConfirm}
							disabled={takingMedicine}
							className='flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm'
						>
							{takingMedicine ? (
								<Loader2 className='w-4 h-4 animate-spin' />
							) : (
								'Ҳа'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default Medicine
