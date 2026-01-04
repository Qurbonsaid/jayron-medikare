import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
	const { t } = useTranslation('reports')
	const formatDate = (item: PatientChartProps['data'][0]) => {
		const { year, month, day } = item._id
		if (day) return `${day}.${month}.${year}`
		if (month) return `${month}.${year}`
		return `${year}`
	}

	// Sort data by date (oldest to newest)
	const sortedData = [...data].sort((a, b) => {
		const aYear = a._id.year
		const aMonth = a._id.month || 1
		const aDay = a._id.day || 1
		const bYear = b._id.year
		const bMonth = b._id.month || 1
		const bDay = b._id.day || 1
		return (
			new Date(aYear, aMonth - 1, aDay).getTime() -
			new Date(bYear, bMonth - 1, bDay).getTime()
		)
	})

	const chartData = sortedData.map(item => ({
		name: formatDate(item),
		[t('total')]: item.totalPatients,
		[t('active')]: item.activePatients,
		[t('inactive')]: item.inactivePatients,
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
					{t('patientsStatistics')}
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
						dataKey={t('total')}
						stroke='#3b82f6'
						strokeWidth={2}
					/>
					<Line
						type='monotone'
						dataKey={t('active')}
						stroke='#10b981'
						strokeWidth={2}
					/>
					<Line
						type='monotone'
						dataKey={t('inactive')}
						stroke='#ef4444'
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</Card>
	)
}
