import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Activity } from 'lucide-react'
import {
	Area,
	AreaChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { DateRangeFilter } from './DateRangeFilter'

interface ExaminationChartProps {
	data: {
		_id: { year: number; month?: number; day?: number }
		totalExaminations: number
		totalAmount: number
	}[]
	isLoading: boolean
	interval: REPORT_DATE_FILTER
	onIntervalChange: (interval: REPORT_DATE_FILTER) => void
}

export const ExaminationChart = ({
	data,
	isLoading,
	interval,
	onIntervalChange,
}: ExaminationChartProps) => {
	const formatDate = (item: ExaminationChartProps['data'][0]) => {
		const { year, month, day } = item._id
		if (day) return `${day}.${month}.${year}`
		if (month) return `${month}.${year}`
		return `${year}`
	}

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' сўм'
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
		Кўриклар: item.totalExaminations,
		Сумма: item.totalAmount,
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
					<Activity className='w-5 h-5 text-purple-600' />
					Кўриклар статистикаси
				</h3>
				<div className='w-full sm:w-48'>
					<DateRangeFilter value={interval} onChange={onIntervalChange} />
				</div>
			</div>
			<ResponsiveContainer width='100%' height={350}>
				<AreaChart data={chartData}>
					<defs>
						<linearGradient id='colorExaminations' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.8} />
							<stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
						</linearGradient>
						<linearGradient id='colorAmount' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='5%' stopColor='#10b981' stopOpacity={0.8} />
							<stop offset='95%' stopColor='#10b981' stopOpacity={0} />
						</linearGradient>
					</defs>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='name' />
					<YAxis />
					<Tooltip
						formatter={(value, name) => {
							if (name === 'Сумма') {
								return formatCurrency(value as number)
							}
							return value
						}}
					/>
					<Legend />
					<Area
						type='monotone'
						dataKey='Кўриклар'
						stroke='#8b5cf6'
						fillOpacity={1}
						fill='url(#colorExaminations)'
					/>
					<Area
						type='monotone'
						dataKey='Сумма'
						stroke='#10b981'
						fillOpacity={1}
						fill='url(#colorAmount)'
					/>
				</AreaChart>
			</ResponsiveContainer>
		</Card>
	)
}
