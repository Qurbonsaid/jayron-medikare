import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Users } from 'lucide-react'
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { DateRangeFilter } from './DateRangeFilter'

interface PatientChartProps {
	data: {
		_id: { year: number; month?: number; day?: number }
		totalPatients: number
		activePatients: number
		inactivePatients: number
	}[]
	isLoading: boolean
	interval: REPORT_DATE_FILTER
	onIntervalChange: (interval: REPORT_DATE_FILTER) => void
}

export const PatientChart = ({
	data,
	isLoading,
	interval,
	onIntervalChange,
}: PatientChartProps) => {
	const formatDate = (item: PatientChartProps['data'][0]) => {
		const { year, month, day } = item._id
		if (day) return `${day}.${month}.${year}`
		if (month) return `${month}.${year}`
		return `${year}`
	}

	const chartData = data.map(item => ({
		name: formatDate(item),
		Жами: item.totalPatients,
		Актив: item.activePatients,
		Ноактив: item.inactivePatients,
	}))

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
					<Users className='w-5 h-5 text-blue-600' />
					Беморлар статистикаси
				</h3>
				<div className='w-full sm:w-48'>
					<DateRangeFilter value={interval} onChange={onIntervalChange} />
				</div>
			</div>
			<ResponsiveContainer width='100%' height={350}>
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='name' />
					<YAxis />
					<Tooltip />
					<Legend />
					<Line
						type='monotone'
						dataKey='Жами'
						stroke='#3b82f6'
						strokeWidth={2}
					/>
					<Line
						type='monotone'
						dataKey='Актив'
						stroke='#10b981'
						strokeWidth={2}
					/>
					<Line
						type='monotone'
						dataKey='Ноактив'
						stroke='#ef4444'
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	)
}
