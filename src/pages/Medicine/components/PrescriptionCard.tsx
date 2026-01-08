import { useGetOnePrescriptionQuery } from '@/app/api/prescription/prescriptionApi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Day {
	_id: string
	date: string | null
	day: number
	times: number | string
	images?: string[]
}

interface PrescriptionCardProps {
	prescriptionId: string
	recordId: string
	onOpenModal: (prescriptionId: string, itemId: string, day: number) => void
	onShowImages: (day: any, frequency: number, medicationName: string) => void
	formatDate: (dateString: string | null) => string | null
	isToday: (dateStr: string) => boolean
}

const PrescriptionCard = ({
	prescriptionId,
	recordId,
	onOpenModal,
	onShowImages,
	formatDate,
	isToday,
}: PrescriptionCardProps) => {
	const { t } = useTranslation('medication')
	// Fetch prescription data from PrescriptionApi
	const { data: prescriptionData, isLoading } =
		useGetOnePrescriptionQuery(prescriptionId)

	// items array dan birinchi elementni olamiz
	const prescriptionItem = prescriptionData?.data?.items?.[0]

	if (isLoading) {
		return (
			<Card className='border shadow-sm bg-card'>
				<CardContent className='pt-6 pb-6'>
					<div className='flex items-center justify-center py-6 sm:py-8'>
						<Loader2 className='w-5 h-5 sm:w-6 sm:h-6 animate-spin text-primary' />
						<span className='ml-2 text-xs sm:text-sm text-muted-foreground'>
							{t('loading')}
						</span>
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!prescriptionItem) {
		return (
			<Card className='border shadow-sm bg-card'>
				<CardContent className='pt-6 pb-6'>
					<p className='text-xs sm:text-sm text-muted-foreground text-center py-4'>
						{t('dataNotFound')}
					</p>
				</CardContent>
			</Card>
		)
	}

	const hasDays = prescriptionItem.days && prescriptionItem.days.length > 0

	return (
		<Card className='border shadow-sm bg-card'>
			<CardHeader className='pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6'>
				<div className='flex justify-between items-start gap-2'>
					<div className='flex-1 min-w-0'>
						<h4 className='font-semibold text-xs sm:text-sm md:text-base line-clamp-2'>
							{prescriptionItem.medication_id?.name || 'N/A'}
						</h4>
						<p className='text-xs font-medium text-muted-foreground mt-1'>
							{t('instructions')}: {prescriptionItem.instructions || '-'}
						</p>
						<p className='text-xs text-muted-foreground mt-0.5'>
							{t('dosage')}: {prescriptionItem.medication_id?.dosage || 'N/A'}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className='px-3 sm:px-6 pb-3 sm:pb-6'>
				{/* Days mavjud bo'lsa */}
				{hasDays ? (
					<>
						{/* Desktop - 5 columns */}
						<div className='hidden lg:grid lg:grid-cols-5 gap-2 xl:gap-3'>
							{prescriptionItem.days.map((day: Day) => {
								const taken = day.times || 0
								const total = prescriptionItem.frequency
								const isCompleted = taken >= total
								const lastDate = formatDate(day.date)
								const hasImages = day.images && day.images.length > 0

								return (
									<div
										key={day._id}
										className='flex flex-col items-center p-2 xl:p-3 border rounded-lg transition-colors relative'
										onClick={() =>
											!isCompleted &&
											onOpenModal(prescriptionId, prescriptionItem._id, day.day)
										}
									>
										<p className='text-xs font-medium mb-1 text-center line-clamp-1'>
											{t('day')} {day.day}
										</p>
										{lastDate && (
											<p className='text-[10px] text-black mb-1.5 text-center'>
												{isToday(day.date!) ? t('today') : lastDate}
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
										{hasImages && (
											<Button
												size='sm'
												variant='ghost'
												className='mt-1 h-6 px-2'
												onClick={() =>
													onShowImages(
														day,
														total,
														prescriptionItem.medication_id?.name || 'N/A'
													)
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
							{prescriptionItem.days.map((day: Day) => {
								const taken = day.times || 0
								const total = prescriptionItem.frequency
								const isCompleted = taken >= total
								const lastDate = formatDate(day.date)
								const hasImages = day.images && day.images.length > 0

								return (
									<div
										key={day._id}
										className='flex flex-col items-center p-2 border rounded-lg transition-colors relative'
										onClick={() =>
											!isCompleted &&
											onOpenModal(prescriptionId, prescriptionItem._id, day.day)
										}
									>
										<p className='text-xs font-medium mb-0.5 text-center line-clamp-1'>
											{t('day')} {day.day}
										</p>
										{lastDate && (
											<p className='text-[10px] text-black mb-1 text-center'>
												{isToday(day.date!) ? t('today') : lastDate}
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
													{taken}/{total}
												</span>
											)}
										</button>
										{hasImages && (
											<Button
												size='sm'
												variant='ghost'
												className='mt-1 h-6 px-2'
												onClick={() =>
													onShowImages(
														day,
														total,
														prescriptionItem.medication_id?.name || 'N/A'
													)
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
						<div className='grid grid-cols-2 gap-2 sm:hidden'>
							{prescriptionItem.days.map((day: Day) => {
								const taken = day.times || 0
								const total = prescriptionItem.frequency
								const isCompleted = taken >= total
								const lastDate = formatDate(day.date)
								const hasImages = day.images && day.images.length > 0

								return (
									<div
										key={day._id}
										className='flex flex-col p-2 border rounded-lg transition-colors'
										onClick={() =>
											!isCompleted &&
											onOpenModal(prescriptionId, prescriptionItem._id, day.day)
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
													<span>
														{taken}/{total}
													</span>
												)}
											</button>
										</div>
										{lastDate && (
											<p className='text-[9px] text-black text-left'>
												{isToday(day.date!) ? t('today') : lastDate}
											</p>
										)}
										{hasImages && (
											<Button
												size='sm'
												variant='ghost'
												className='mt-1 h-5 px-1 w-full'
												onClick={() =>
													onShowImages(
														day,
														total,
														prescriptionItem.medication_id?.name || 'N/A'
													)
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
				) : (
					<p className='text-xs sm:text-sm text-black text-center py-4'>
						{t('daysLoading')}
					</p>
				)}
			</CardContent>
		</Card>
	)
}

export default PrescriptionCard
