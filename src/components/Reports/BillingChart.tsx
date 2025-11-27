import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DollarSign } from 'lucide-react'
import { DateRangeFilter } from './DateRangeFilter'
import { REPORT_DATE_FILTER } from '@/app/api/report/types'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

interface BillingChartProps {
	data: {
		_id: { year: number; month?: number; day?: number }
		totalAmount: number
		paidAmount: number
		debtAmount: number
	}[]
	isLoading: boolean
	interval: REPORT_DATE_FILTER
	onIntervalChange: (interval: REPORT_DATE_FILTER) => void
}

export const BillingChart = ({ data, isLoading, interval, onIntervalChange }: BillingChartProps) => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('uz-UZ').format(value) + ' сўм'
	}

	const formatDate = (item: BillingChartProps['data'][0]) => {
		const { year, month, day } = item._id
		if (day) return `${day}.${month}.${year}`
		if (month) return `${month}.${year}`
		return `${year}`
	}

	const chartData = data.map(item => ({
		name: formatDate(item),
		Жами: item.totalAmount,
		Тўланган: item.paidAmount,
		Қарз: item.debtAmount,
	}))

	if (isLoading) {
		return (
			<Card className='p-6 flex items-center justify-center h-[400px]'>
				<LoadingSpinner size='lg' />
			</Card>
		)
	}

	return (
		<Card className="p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
				<h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
					<DollarSign className="w-5 h-5 text-green-600" />
					Молиявий ҳисобот
				</h3>
				<div className="w-full sm:w-48">
					<DateRangeFilter value={interval} onChange={onIntervalChange} />
				</div>
			</div>
			<ResponsiveContainer width='100%' height={350}>
				<BarChart data={chartData}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis dataKey='name' />
					<YAxis />
					<Tooltip formatter={value => formatCurrency(value as number)} />
					<Legend />
					<Bar dataKey='Жами' fill='#3b82f6' />
					<Bar dataKey='Тўланган' fill='#10b981' />
					<Bar dataKey='Қарз' fill='#ef4444' />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	)
}
