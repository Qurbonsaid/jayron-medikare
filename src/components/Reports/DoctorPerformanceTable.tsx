import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { DateRangeFilter } from './DateRangeFilter'

interface DoctorPerformanceTableProps {
	data: {
		_id: {
			doctor_id: string
			year: number
			month: number
			day: number
		}
		totalExaminations: number
		doctor_id: string
		doctor_name: string
		doctor_phone: string
		doctor_email: string
	}[]
	isLoading: boolean
	interval: REPORT_DATE_FILTER
	onIntervalChange: (interval: REPORT_DATE_FILTER) => void
}

export const DoctorPerformanceTable = ({
	data,
	isLoading,
	interval,
	onIntervalChange,
}: DoctorPerformanceTableProps) => {
	const [currentPage, setCurrentPage] = useState(1)
	const itemsPerPage = 10

	const formatDate = (year: number, month?: number, day?: number) => {
		if (day) return `${day}.${month}.${year}`
		if (month) return `${month}.${year}`
		return `${year}`
	}

	// Group by date and doctor - show each date separately
	const formattedData = data.map(item => ({
		...item,
		dateKey: formatDate(item._id.year, item._id.month, item._id.day),
	}))

	// Sort by date (newest first) and then by examinations
	const sortedData = formattedData.sort((a, b) => {
		// Sort by year, month, day descending
		if (a._id.year !== b._id.year) return b._id.year - a._id.year
		if (a._id.month !== b._id.month)
			return (b._id.month || 0) - (a._id.month || 0)
		if (a._id.day !== b._id.day) return (b._id.day || 0) - (a._id.day || 0)
		return b.totalExaminations - a.totalExaminations
	})

	// Calculate pagination
	const totalPages = Math.ceil(sortedData.length / itemsPerPage)
	const startIndex = (currentPage - 1) * itemsPerPage
	const endIndex = startIndex + itemsPerPage
	const paginatedData = sortedData.slice(startIndex, endIndex)

	// Reset to page 1 when data changes
	const handleIntervalChange = (newInterval: REPORT_DATE_FILTER) => {
		setCurrentPage(1)
		onIntervalChange(newInterval)
	}

	if (isLoading) {
		return (
			<Card className='p-6 flex items-center justify-center h-[400px]'>
				<LoadingSpinner size='lg' />
			</Card>
		)
	}

	return (
		<Card className='p-4 sm:p-6'>
			<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
				<h3 className='text-base sm:text-lg font-semibold flex items-center gap-2'>
					<Stethoscope className='w-5 h-5 text-blue-600' />
					Шифокорлар фаолияти
				</h3>
				<div className='w-full sm:w-48'>
					<DateRangeFilter value={interval} onChange={handleIntervalChange} />
				</div>
			</div>
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead>
						<tr className='border-b'>
							<th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>
								Сана
							</th>
							<th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground'>
								Шифокор
							</th>
							<th className='text-left py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell'>
								Телефон
							</th>
							<th className='text-center py-3 px-2 text-sm font-medium text-muted-foreground'>
								Кўриклар
							</th>
						</tr>
					</thead>
					<tbody>
						{paginatedData.map((item, index) => (
							<tr
								key={index}
								className='border-b hover:bg-muted/50 transition-colors'
							>
								<td className='py-3 px-2'>
									<Badge variant='secondary' className='font-medium text-xs'>
										{item.dateKey}
									</Badge>
								</td>
								<td className='py-3 px-2'>
									<div>
										<p className='font-medium text-sm'>{item.doctor_name}</p>
										<p className='text-xs text-muted-foreground sm:hidden'>
											{item.doctor_phone}
										</p>
									</div>
								</td>
								<td className='py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell'>
									{item.doctor_phone}
								</td>
								<td className='py-3 px-2 text-center'>
									<Badge variant='outline' className='font-semibold'>
										{item.totalExaminations}
									</Badge>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{sortedData.length === 0 && (
					<div className='text-center py-8 text-muted-foreground'>
						Маълумот топилмади
					</div>
				)}
			</div>

			{/* Pagination Controls */}
			{sortedData.length > 0 && totalPages > 1 && (
				<div className='flex items-center justify-between mt-4 pt-4 border-t'>
					<p className='text-sm text-muted-foreground'>
						Жами: {sortedData.length} та шифокор
					</p>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							size='sm'
							onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className='w-4 h-4' />
						</Button>
						<span className='text-sm font-medium'>
							{currentPage} / {totalPages}
						</span>
						<Button
							variant='outline'
							size='sm'
							onClick={() =>
								setCurrentPage(prev => Math.min(totalPages, prev + 1))
							}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className='w-4 h-4' />
						</Button>
					</div>
				</div>
			)}
			
		</Card>
	)
}
