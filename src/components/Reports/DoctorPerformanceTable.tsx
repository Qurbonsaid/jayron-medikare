import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Stethoscope } from 'lucide-react'
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
					<DateRangeFilter value={interval} onChange={onIntervalChange} />
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
						{sortedData.map((item, index) => (
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
		</Card>
	)
}
